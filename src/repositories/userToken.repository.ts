// userToken.repository.ts
import { UserToken } from '../models/userToken.model';
import { Op } from 'sequelize';

export class UserTokenRepository {
  async create(data: any) {
    return UserToken.create(data);
  }

  async findValidToken(
    userId: string,
    code: string,
    type: 'email_verification' | 'password_reset',
  ) {
    return UserToken.findOne({
      where: {
        user_id: userId,
        token: code,
        type,
        used_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    });
  }

  async markAsUsed(id: number) {
    return UserToken.update({ used_at: new Date() }, { where: { id } });
  }

  async findTokenByUserIdAndType(userId: string, type: string) {
    return UserToken.findOne({
      where: { user_id: userId, type },
    });
  }

  async updateById(id: number, token: string, expiresAt: Date) {
    return UserToken.update(
      { token, expires_at: expiresAt, used_at: null },
      { where: { id } },
    );
  }

  async updateResendStats(
    id: number,
    resendCount: number,
    when: Date,
  ): Promise<void> {
    await UserToken.update(
      { resend_count: resendCount, last_resend_at: when },
      { where: { id } },
    );
  }
}
