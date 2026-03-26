import { TestBase } from 'tests/utils/TestBase';
import models from 'src/models';

class InvoiceTest extends TestBase {
  private unitId!: string;
  private planId!: string;

  public run(): void {
    describe('Invoice API', () => {
      this.setupGlobalHooks();

      beforeAll(async () => {
        this.unitId = await this.createDefaultUnitIfNotExists();
        this.planId = await this.createDefaultPlanIfNotExists();
      });

      const createParent = async (unitId: string) => {
        const parentRes = await this.client.post('/api/parents').send({
          firstName: 'ParentInvoice',
          lastName: 'Test',
          email: this.generateUniqueEmail('parent.invoice'),
          password: 'senhaForte123',
          phoneNumber: this.generateRandomPhoneNumber(),
          cpf: this.generateRandomCPF(),
          street: 'Rua Teste',
          number: 123,
          neighborhood: 'Bairro Teste',
          zip: '12345-678',
          city: 'Cidade',
          acronym: 'CT',
          unitId,
        });

        expect(parentRes.status).toBe(201);

        const parentUserId = parentRes.body.data.userId;

        const parent = await models.Parent.findOne({
          where: { userId: parentUserId },
        });

        return parent!.id;
      };

      const createSale = async (
        unitId: string,
        planId: string,
        parentId: string,
      ) => {
        const startMonth = new Date();
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 1);

        return await this.client.post('/api/sales').send({
          unitId,
          planId,
          parentId,
          startMonth: startMonth.toISOString(),
          dueDate: dueDate.toISOString(),
        });
      };

      it('deve retornar invoices por parentId', async () => {
        const parentId = await createParent(this.unitId);

        const saleRes = await createSale(this.unitId, this.planId, parentId);

        expect(saleRes.status).toBe(201);

        const response = await this.client
          .get(`/api/invoices/parent/${parentId}`)
          .send();

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('deve retornar invoices com estrutura correta', async () => {
        const parentId = await createParent(this.unitId);

        const saleRes = await createSale(this.unitId, this.planId, parentId);

        expect(saleRes.status).toBe(201);

        const response = await this.client
          .get(`/api/invoices/parent/${parentId}`)
          .send();

        const invoice = response.body.data[0];

        expect(invoice).toHaveProperty('id');
        expect(invoice).toHaveProperty('amount');
        expect(invoice).toHaveProperty('status');
        expect(invoice).toHaveProperty('dueDate');

        expect(invoice).toHaveProperty('sale');
        expect(invoice.sale).toHaveProperty('id');

        expect(invoice.sale).toHaveProperty('plan');
        expect(invoice.sale.plan).toHaveProperty('name');
      });

      it('deve retornar array vazio se parent não tiver invoices', async () => {
        const response = await this.client
          .get('/api/invoices/parent/non-existent-id')
          .send();

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
      });

      it('deve criar invoices com status pending', async () => {
        const parentId = await createParent(this.unitId);

        const saleRes = await createSale(this.unitId, this.planId, parentId);

        expect(saleRes.status).toBe(201);

        const invoices = await models.Invoice.findAll({
          where: { parentId },
        });

        expect(invoices.length).toBeGreaterThan(0);

        invoices.forEach((invoice) => {
          expect(invoice.status).toBe('pending');
        });
      });
    });
  }
}

new InvoiceTest().run();
