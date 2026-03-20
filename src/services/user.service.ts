import argon2 from 'argon2';
import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';
import { RoleRepository } from 'src/repositories/role.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { UserTokenRepository } from 'src/repositories/userToken.repository';
import { generateAccessToken } from 'src/utils/jwt';

interface CreateUserDTO {
  email: string;
  password: string;
  phoneNumber?: string;
  cpf?: string;
  roleName: string;
}

const RESEND_COOLDOWN_SEC = 60;
const RESEND_LIMIT = 5;
const RESEND_WINDOW_MIN = 30;
const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_BLOCK_WINDOW_MS = 30 * 60 * 1000;

export class UserService {
  private userRepository = new UserRepository();
  private userTokenRepository = new UserTokenRepository();
  private roleRepository = new RoleRepository();

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError(ErrorMessages.INVALID_CREDENTIALS);

    if (!user.isActive) throw new AppError(ErrorMessages.ACCOUNT_DISABLED);

    if (
      user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS &&
      user.lastFailedLoginAt &&
      Date.now() - user.lastFailedLoginAt.getTime() < LOGIN_BLOCK_WINDOW_MS
    ) {
      throw new AppError(ErrorMessages.TOO_MANY_LOGIN_ATTEMPTS);
    }

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      const now = new Date();
      await this.userRepository.updateById(user.id, {
        failedLoginAttempts: user.failedLoginAttempts + 1,
        lastFailedLoginAt: now,
      });

      throw new AppError(ErrorMessages.INVALID_CREDENTIALS);
    }

    await this.userRepository.updateById(user.id, {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
    });

    const role = await this.roleRepository.findById(user.roleId);
    if (!role) throw new AppError(ErrorMessages.ROLE_NOT_FOUND);

    const token = generateAccessToken(user.email, role.role, user.id);
    return { token, userId: user.id };
  }

  async createUser(data: CreateUserDTO) {
    if (data.roleName === 'admin') {
      throw new AppError(ErrorMessages.FORBIDDEN_ACTION);
    }

    const [existingEmail, existingPhone, existingCpf] = await Promise.all([
      this.userRepository.findByEmail(data.email),
      data.phoneNumber
        ? this.userRepository.findByPhoneNumber(data.phoneNumber)
        : null,
      data.cpf ? this.userRepository.findByCpf(data.cpf) : null,
    ]);

    if (existingEmail) throw new AppError(ErrorMessages.EMAIL_EXISTS);
    if (existingPhone) throw new AppError(ErrorMessages.PHONE_EXISTS);
    if (existingCpf) throw new AppError(ErrorMessages.CPF_EXISTS);

    const role = await this.roleRepository.findByName(data.roleName);
    if (!role) throw new AppError(ErrorMessages.ROLE_NOT_FOUND);

    const hashedPassword = await argon2.hash(data.password);

    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      cpf: data.cpf,
      roleId: role.id,
      isActive: true,
    });

    const token = generateAccessToken(user.email, data.roleName, user.id);

    return { token, id: user.id };
  }

  async createUserWithVerificationToken(data: CreateUserDTO) {
    const user = await this.createUser(data);

    const verificationCode = this.generateVerificationCode();

    await this.userTokenRepository.create({
      user_id: user.id,
      token: verificationCode,
      type: 'email_verification',
      expires_at: new Date(Date.now() + 1000 * 60 * 60), // 1 hora de validade
      used_at: null,
    });

    return user;
  }

  async getUser(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(ErrorMessages.USER_NOT_FOUND);
    return user;
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async verifyEmailCode(userId: string, code: string): Promise<boolean> {
    const token = await this.userTokenRepository.findValidToken(
      userId,
      code,
      'email_verification',
    );

    if (!token) {
      throw new AppError(ErrorMessages.TOKEN_INVALID_OR_EXPIRED);
    }

    await this.userTokenRepository.markAsUsed(token.id);
    await this.userRepository.markEmailAsVerified(userId);

    return true;
  }

  async resetVerificationToken(userId: string): Promise<string> {
    const tokenRecord = await this.userTokenRepository.findTokenByUserIdAndType(
      userId,
      'email_verification',
    );

    if (!tokenRecord) {
      throw new AppError(ErrorMessages.TOKEN_INVALID_OR_EXPIRED);
    }

    const newToken = this.generateVerificationCode();
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await this.userTokenRepository.updateById(
      tokenRecord.id,
      newToken,
      newExpiresAt,
    );

    return newToken;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public async validateUser({
    userId,
    userEmail,
  }: {
    userId: string;
    userEmail: string;
  }) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError(ErrorMessages.USER_NOT_FOUND);

    if (user.email !== userEmail)
      throw new AppError(ErrorMessages.FORBIDDEN_ACTION);
  }

  async deactivateUser(id: string, roleName: string) {
    return this.setActiveStatus(id, roleName, false);
  }

  async activateUser(id: string, roleName: string) {
    return this.setActiveStatus(id, roleName, true);
  }

  private async setActiveStatus(id: string, roleName: string, status: boolean) {
    if (roleName !== 'admin') {
      throw new AppError(ErrorMessages.FORBIDDEN_ADMIN_ONLY);
    }

    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(ErrorMessages.USER_NOT_FOUND);

    if (user.isActive === status) {
      throw new AppError(ErrorMessages.INVALID_ACTION);
    }

    await this.userRepository.updateById(id, { isActive: status });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError(ErrorMessages.EMAIL_NOT_FOUND);

    const resetCode = this.generateVerificationCode();

    await this.userTokenRepository.create({
      user_id: user.id,
      token: resetCode,
      type: 'password_reset',
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      used_at: null,
    });

    // Aqui plugaria o serviço de e‑mail.
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError(ErrorMessages.EMAIL_NOT_FOUND);

    const token = await this.userTokenRepository.findValidToken(
      user.id,
      code,
      'password_reset',
    );
    if (!token) throw new AppError(ErrorMessages.PASSWORD_RESET_TOKEN_INVALID);

    const hashed = await argon2.hash(newPassword);
    await this.userRepository.updateById(user.id, { password: hashed });
    await this.userTokenRepository.markAsUsed(token.id);
  }

  private async resendToken(
    email: string,
    type: 'email_verification' | 'password_reset',
  ): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AppError(ErrorMessages.EMAIL_NOT_FOUND);

    const token = await this.userTokenRepository.findTokenByUserIdAndType(
      user.id,
      type,
    );

    if (!token || token.used_at || token.expires_at < new Date()) {
      throw new AppError(ErrorMessages.TOKEN_INVALID_OR_EXPIRED);
    }

    const now = new Date();

    if (
      token.last_resend_at &&
      (now.getTime() - token.last_resend_at.getTime()) / 1000 <
        RESEND_COOLDOWN_SEC
    ) {
      throw new AppError(ErrorMessages.RESEND_TOO_FREQUENT);
    }

    const minutesSinceFirst = token.createdAt
      ? (now.getTime() - token.createdAt.getTime()) / 60000
      : RESEND_WINDOW_MIN + 1;

    if (
      token.resend_count >= RESEND_LIMIT &&
      minutesSinceFirst < RESEND_WINDOW_MIN
    ) {
      throw new AppError(ErrorMessages.RESEND_LIMIT_REACHED);
    }

    const newCount =
      minutesSinceFirst >= RESEND_WINDOW_MIN
        ? 1
        : (token.resend_count ?? 0) + 1;

    await this.userTokenRepository.updateResendStats(token.id, newCount, now);

    // Aqui plugaria o serviço de e‑mail.
  }

  async resendVerificationToken(email: string) {
    await this.resendToken(email, 'email_verification');
  }

  async resendPasswordResetToken(email: string) {
    await this.resendToken(email, 'password_reset');
  }
}
