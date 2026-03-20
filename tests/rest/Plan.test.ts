import { Plan } from 'src/models/plan.model';
import { TestBase } from 'tests/utils/TestBase';

class PlanTest extends TestBase {
  private planData = {
    name: 'Plano Básico',
    description: 'Plano básico para testes',
    price: 299.9,
    durationMonths: 12,
  };

  private createdPlanId: string | null = null;
  private adminToken: string | null = null;

  public run(): void {
    describe('Plan API', () => {
      this.setupGlobalHooks();

      beforeAll(async () => {
        this.adminToken = await this.loginAsAdmin();
      });

      it('deve criar um novo plano', async () => {
        const res = await this.client
          .post('/api/plans')
          .set('Authorization', `Bearer ${this.adminToken}`)
          .send(this.planData);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('status', 'CREATED');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.name).toBe(this.planData.name);
        this.createdPlanId = res.body.data.id;
      });

      it('deve encontrar o plano criado no banco', async () => {
        if (!this.createdPlanId)
          throw new Error('Plano não foi criado no teste anterior');

        const planInDb = await Plan.findOne({
          where: { id: this.createdPlanId },
        });
        expect(planInDb).not.toBeNull();
        expect(planInDb!.name).toBe(this.planData.name);
      });
    });
  }
}

new PlanTest().run();
