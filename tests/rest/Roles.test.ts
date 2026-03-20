import { Role } from 'src/models/role.model';
import { TestBase } from 'tests/utils/TestBase';

class RoleTest extends TestBase {
  private roleData = {
    role: 'test',
  };

  private createdRoleId: string | null = null;
  private adminToken: string | null = null;

  public run(): void {
    describe('Role API', () => {
      this.setupGlobalHooks();

      beforeAll(async () => {
        this.adminToken = await this.loginAsAdmin();
      });

      it('deve criar uma nova role', async () => {
        const res = await this.client
          .post('/api/roles')
          .set('Authorization', `Bearer ${this.adminToken}`)
          .send(this.roleData);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        this.createdRoleId = res.body.id;
      });

      it('deve buscar a role criada', async () => {
        if (!this.createdRoleId)
          throw new Error('Role não foi criada no teste anterior');

        const roleInDb = await Role.findOne({
          where: { id: this.createdRoleId! },
        });
        expect(roleInDb).not.toBeNull();
        expect(roleInDb!.role).toBe(this.roleData.role);
      });

      it('deve listar as roles existentes', async () => {
        const res = await this.client.get('/api/roles');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        const roles = res.body.map((role: any) => role.role);
        expect(roles).toContain(this.roleData.role);
      });

      it('deve retornar 404 quando role não for encontrada', async () => {
        const res = await this.client.get('/api/roles/9999');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Role not found');
      });

      it('não deve permitir criar uma role com usuário comum', async () => {
        const regularToken = await this.loginAsRegularUser();

        const res = await this.client
          .post('/api/roles')
          .set('Authorization', `Bearer ${regularToken}`)
          .send({ role: 'invasor' });

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message.toLowerCase()).toContain(
          'acesso não autorizado',
        );
      });
    });
  }
}

new RoleTest().run();
