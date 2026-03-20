import { TestBase } from 'tests/utils/TestBase';
import models from 'src/models';

class UnitTest extends TestBase {
  // Helper para gerar payloads de unidade
  private generateUnitPayload(overrides = {}) {
    return {
      name: 'Unidade Teste ' + Date.now(),
      email: this.generateUniqueEmail('unit.test'),
      password: 'senhaForte123',
      phoneNumber: this.generateRandomPhoneNumber(),
      cpf: this.generateRandomCPF(),
      maxRooms: 5,
      ...overrides,
    };
  }

  public run(): void {
    describe('Unit API', () => {
      this.setupGlobalHooks();

      it('deve criar uma nova unidade com usuário e token de verificação', async () => {
        const payload = this.generateUnitPayload({
          name: 'Santa Marcelina 2',
        });

        const res = await this.client.post('/api/units').send(payload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('data.token');
        expect(res.body).toHaveProperty('data.userId');
        expect(res.body).toHaveProperty('data.unitId');

        const { userId, unitId } = res.body.data;

        // Valida unidade criada
        const unit = await models.Unit.findByPk(unitId);
        expect(unit).not.toBeNull();
        expect(unit!.name).toBe(payload.name);
        expect(unit!.slug).toBe('santa-marcelina-2');

        // Valida usuário criado
        const user = await models.User.findByPk(userId);
        expect(user).not.toBeNull();
        expect(user!.email).toBe(payload.email);
        expect(user!.roleId).toBeDefined();
        expect(user!.emailVerified).toBe(false);

        // Valida token de verificação
        const userToken = await models.UserToken.findOne({
          where: {
            user_id: userId,
            type: 'email_verification',
            used_at: null,
          },
        });

        expect(userToken).not.toBeNull();
        expect(userToken!.token).toHaveLength(6);
      });

      it('não deve permitir criar unidade com nome/slug duplicado', async () => {
        // Cria a primeira unidade
        const firstPayload = this.generateUnitPayload({
          name: 'Unidade Duplicada Teste',
          email: this.generateUniqueEmail('unit.duplicada'),
        });

        const firstRes = await this.client
          .post('/api/units')
          .send(firstPayload);
        expect(firstRes.status).toBe(201);

        // Tenta criar outra com o mesmo nome (slug duplicado)
        const secondPayload = this.generateUnitPayload({
          name: 'Unidade Duplicada Teste', // mesmo nome = slug igual
          email: this.generateUniqueEmail('unit.duplicada2'),
        });

        const secondRes = await this.client
          .post('/api/units')
          .send(secondPayload);

        expect(secondRes.status).toBe(409);
        expect(secondRes.body).toHaveProperty('error');
        expect(secondRes.body.error).toMatch(/unidade.*já existe/i);
      });
    });
  }
}

new UnitTest().run();
