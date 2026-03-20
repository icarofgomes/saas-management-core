import { User } from 'src/models/user.model';
import { TestBase } from 'tests/utils/TestBase';
import { UserToken } from 'src/models/userToken.model';
import { ErrorMessages } from 'src/errors/ErrorMessages';

class UsersTest extends TestBase {
  private userData = {
    email: 'test@example.com',
    password: '123456',
    phoneNumber: '1234567890',
    cpf: '12345678901',
    roleName: 'user',
  };

  private createdUserId: string | null = null;
  private passwordResetToken: string | null = null;

  public run(): void {
    describe('Users API', () => {
      this.setupGlobalHooks();

      it('deve criar um novo usuário', async () => {
        const res = await this.client.post('/api/users').send(this.userData);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        this.createdUserId = res.body.id;
      });

      it('deve gerar um token de verificação para o usuário criado', async () => {
        if (!this.createdUserId)
          throw new Error('Usuário não foi criado no teste anterior');

        const tokenRecord = await UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'email_verification',
            used_at: null,
          },
        });

        expect(tokenRecord).not.toBeNull();
        expect(tokenRecord!.expires_at.getTime()).toBeGreaterThan(Date.now());
        expect(tokenRecord!.token).toHaveLength(6); // nosso código gerado tem 6 dígitos
      });

      it('deve reenviar o token de verificação de e‑mail (1ª vez OK)', async () => {
        const res = await this.client
          .post('/api/users/resend-verification-token')
          .send({ email: this.userData.email });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'message',
          'Se o e-mail existir, reenviamos o código.',
        );

        const tokenRecord = await UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'email_verification',
            used_at: null,
          },
        });

        expect(tokenRecord).not.toBeNull();
        expect(tokenRecord!.resend_count).toBe(1);
      });

      it('não deve permitir reenviar token de e-mail antes de 60s', async () => {
        const res = await this.client
          .post('/api/users/resend-verification-token')
          .send({ email: this.userData.email });

        expect(res.status).toBe(ErrorMessages.RESEND_TOO_FREQUENT.statusCode);
        expect(res.body).toHaveProperty(
          'error',
          ErrorMessages.RESEND_TOO_FREQUENT.message,
        );

        const tokenRecord = await UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'email_verification',
            used_at: null,
          },
        });
        expect(tokenRecord!.resend_count).toBe(1);
      });

      it('deve resetar o token de verificação de email', async () => {
        if (!this.createdUserId)
          throw new Error('Usuário não foi criado no teste anterior');

        const oldTokenRecord = await UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'email_verification',
            used_at: null,
          },
        });
        expect(oldTokenRecord).not.toBeNull();

        const res = await this.client
          .post('/api/users/reset-verification-token')
          .send({
            userId: this.createdUserId,
          });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'message',
          'Token de verificação renovado com sucesso',
        );
        expect(res.body).not.toHaveProperty('token');

        const newTokenRecord = await UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'email_verification',
            used_at: null,
          },
        });
        expect(newTokenRecord).not.toBeNull();

        expect(newTokenRecord!.token).not.toBe(oldTokenRecord!.token);

        expect(newTokenRecord!.expires_at.getTime()).toBeGreaterThanOrEqual(
          oldTokenRecord!.expires_at.getTime(),
        );
      });

      it('deve buscar o usuário criado', async () => {
        if (!this.createdUserId)
          throw new Error('Usuário não foi criado no teste anterior');

        const userInDb = await User.findOne({
          where: { id: this.createdUserId! },
        });
        expect(userInDb).not.toBeNull();
        expect(userInDb!.email).toBe(this.userData.email);
      });

      it('deve desativar o usuário', async () => {
        if (!this.createdUserId) throw new Error('Usuário não foi criado');

        const adminToken = await this.loginAsAdmin();

        const res = await this.client
          .patch(`/api/users/${this.createdUserId}/deactivate`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(204);

        const user = await User.findByPk(this.createdUserId);
        expect(user).not.toBeNull();
        expect(user!.isActive).toBe(false);
      });

      it('não deve permitir login com usuário desativado', async () => {
        const res = await this.client.post('/api/login').send({
          email: this.userData.email,
          password: this.userData.password,
        });

        expect(res.status).toBe(ErrorMessages.ACCOUNT_DISABLED.statusCode);
        expect(res.body).toHaveProperty(
          'error',
          ErrorMessages.ACCOUNT_DISABLED.message,
        );
      });

      it('deve reativar o usuário', async () => {
        if (!this.createdUserId) throw new Error('Usuário não foi criado');

        const adminToken = await this.loginAsAdmin();

        const res = await this.client
          .patch(`/api/users/${this.createdUserId}/activate`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(204);

        const user = await User.findByPk(this.createdUserId);
        expect(user).not.toBeNull();
        expect(user!.isActive).toBe(true);
      });

      it('deve permitir login com usuário reativado', async () => {
        const res = await this.client.post('/api/login').send({
          email: this.userData.email,
          password: this.userData.password,
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('userId');
      });

      it('deve listar os usuários existentes', async () => {
        if (!this.createdUserId)
          throw new Error('Usuário não foi criado no teste anterior');

        const token = await this.loginAndGetToken(
          this.userData.email,
          this.userData.password,
        );

        const res = await this.client
          .get('/api/users')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        const emails = res.body.map((user: any) => user.email);
        expect(emails).toContain(this.userData.email);
      });

      it('deve retornar 404 quando usuário não for encontrado', async () => {
        const res = await this.client.get('/api/users/9999');
        expect(res.status).toBe(ErrorMessages.USER_NOT_FOUND.statusCode);
        expect(res.body).toHaveProperty(
          'error',
          ErrorMessages.USER_NOT_FOUND.message,
        );
      });

      it('deve validar o código de verificação de e-mail', async () => {
        if (!this.createdUserId)
          throw new Error('Usuário não foi criado no teste anterior');

        const tokenRecord = await UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'email_verification',
            used_at: null,
          },
        });

        expect(tokenRecord).not.toBeNull();

        const res = await this.client
          .post('/api/users/verify-email-code')
          .send({
            userId: this.createdUserId,
            code: tokenRecord!.token,
          });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'message',
          'Código verificado com sucesso',
        );

        // Buscar o usuário no banco para validar se emailVerified ficou true
        const updatedUser = await User.findByPk(this.createdUserId);
        expect(updatedUser).not.toBeNull();
        expect(updatedUser!.emailVerified).toBe(true);
      });

      it('deve solicitar reset de senha e gerar token', async () => {
        const res = await this.client
          .post('/api/users/forgot-password')
          .send({ email: this.userData.email });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'message',
          'Se o e‑mail existir, enviaremos instruções.',
        );

        const tokenRecord = await UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'password_reset',
            used_at: null,
          },
        });

        expect(tokenRecord).not.toBeNull();
        expect(tokenRecord!.token).toHaveLength(6);
        expect(tokenRecord!.expires_at.getTime()).toBeGreaterThan(Date.now());

        this.passwordResetToken = tokenRecord!.token;
      });

      it('deve reenviar o token de reset de senha (1ª vez OK)', async () => {
        const res = await this.client
          .post('/api/users/resend-password-reset-token')
          .send({ email: this.userData.email });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'message',
          'Se o e-mail existir, reenviamos o token.',
        );

        const tokenRecord = await UserToken.findOne({
          where: {
            user_id: this.createdUserId,
            type: 'password_reset',
            used_at: null,
          },
        });

        expect(tokenRecord).not.toBeNull();
        expect(tokenRecord!.resend_count).toBe(1);
      });

      it('deve redefinir a senha usando token válido', async () => {
        if (!this.passwordResetToken)
          throw new Error('Token não gerado no teste anterior');

        const newPassword = 'novaSenha456';

        const res = await this.client.post('/api/users/reset-password').send({
          email: this.userData.email,
          code: this.passwordResetToken,
          newPassword,
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'message',
          'Senha redefinida com sucesso',
        );

        const usedToken = await UserToken.findOne({
          where: { token: this.passwordResetToken },
        });
        expect(usedToken!.used_at).not.toBeNull();

        const oldLogin = await this.client.post('/api/login').send({
          email: this.userData.email,
          password: this.userData.password,
        });
        expect(oldLogin.status).toBe(
          ErrorMessages.INVALID_CREDENTIALS.statusCode,
        );

        const newLogin = await this.client.post('/api/login').send({
          email: this.userData.email,
          password: newPassword,
        });
        expect(newLogin.status).toBe(200);
        expect(newLogin.body).toHaveProperty('token');
      });

      it('não deve permitir reutilizar token já usado ou expirado', async () => {
        const res = await this.client.post('/api/users/reset-password').send({
          email: this.userData.email,
          code: this.passwordResetToken,
          newPassword: 'qualquer123',
        });

        expect(res.status).toBe(
          ErrorMessages.PASSWORD_RESET_TOKEN_INVALID.statusCode,
        );
        expect(res.body).toHaveProperty(
          'error',
          ErrorMessages.PASSWORD_RESET_TOKEN_INVALID.message,
        );
      });

      it('bloqueia login após 3 tentativas de senha errada', async () => {
        for (let i = 0; i < 3; i++) {
          const res = await this.client.post('/api/login').send({
            email: this.userData.email,
            password: 'senhaErrada',
          });
          expect(res.status).toBe(ErrorMessages.INVALID_CREDENTIALS.statusCode);
        }

        const blocked = await this.client.post('/api/login').send({
          email: this.userData.email,
          password: 'senhaErrada',
        });

        expect(blocked.status).toBe(
          ErrorMessages.TOO_MANY_LOGIN_ATTEMPTS.statusCode,
        );
        expect(blocked.body).toHaveProperty(
          'error',
          ErrorMessages.TOO_MANY_LOGIN_ATTEMPTS.message,
        );

        const user = await User.findOne({
          where: { email: this.userData.email },
        });
        expect(user!.failedLoginAttempts).toBe(3);

        await User.update(
          { failed_login_attempts: 0, last_failed_login_at: null },
          { where: { id: this.createdUserId } },
        );
      });
    });
  }
}

new UsersTest().run();
