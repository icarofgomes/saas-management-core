import { TestBase } from 'tests/utils/TestBase';
import models from 'src/models';

class PaymentTest extends TestBase {
  private unitId!: string;
  private planId!: string;

  public run(): void {
    describe('Payment API', () => {
      this.setupGlobalHooks();

      beforeAll(async () => {
        this.unitId = await this.createDefaultUnitIfNotExists();
        this.planId = await this.createDefaultPlanIfNotExists();
      });

      const createParent = async (unitId: string) => {
        const parentRes = await this.client.post('/api/parents').send({
          firstName: 'ParentPayment',
          lastName: 'Test',
          email: this.generateUniqueEmail('parent.payment'),
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

      it('deve criar payments automaticamente', async () => {
        const parentId = await createParent(this.unitId);

        const saleRes = await createSale(this.unitId, this.planId, parentId);

        expect(saleRes.status).toBe(201);

        const invoices = await models.Invoice.findAll({
          where: { parentId },
        });

        const payments = await models.Payment.findAll({
          where: {
            invoiceId: invoices.map((i) => i.id),
          },
        });

        expect(payments.length).toBe(invoices.length);
      });

      it('deve buscar payments por invoiceId', async () => {
        const parentId = await createParent(this.unitId);

        await createSale(this.unitId, this.planId, parentId);

        const invoice = await models.Invoice.findOne({
          where: { parentId },
        });

        const response = await this.client
          .get(`/api/payments/invoice/${invoice!.id}`)
          .send();

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('deve reenviar payment', async () => {
        const parentId = await createParent(this.unitId);

        await createSale(this.unitId, this.planId, parentId);

        const invoice = await models.Invoice.findOne({
          where: { parentId },
        });

        const response = await this.client
          .post(`/api/payments/resend/${invoice!.id}`)
          .send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('invoiceId');
      });

      it('deve atualizar invoice para paid via callback', async () => {
        const parentId = await createParent(this.unitId);

        await createSale(this.unitId, this.planId, parentId);

        const invoice = await models.Invoice.findOne({
          where: { parentId },
        });

        const payment = await models.Payment.findOne({
          where: { invoiceId: invoice!.id },
        });

        const response = await this.client.post('/api/webhooks/payment').send({
          externalId: payment!.externalId,
          status: 'paid',
        });

        expect(response.status).toBe(200);

        const updatedInvoice = await models.Invoice.findByPk(invoice!.id);

        expect(updatedInvoice!.status).toBe('paid');
        expect(updatedInvoice!.paidDate).toBeTruthy();
      });

      it('deve ser idempotente ao receber callback duplicado (não alterar paidDate)', async () => {
        const parentId = await createParent(this.unitId);

        await createSale(this.unitId, this.planId, parentId);

        const invoice = await models.Invoice.findOne({
          where: { parentId },
        });

        const payment = await models.Payment.findOne({
          where: { invoiceId: invoice!.id },
        });

        // Primeiro callback
        await this.client.post('/api/webhooks/payment').send({
          externalId: payment!.externalId,
          status: 'paid',
        });

        const firstInvoice = await models.Invoice.findByPk(invoice!.id);
        const firstPaidDate = firstInvoice!.paidDate;

        // Segundo callback duplicado
        await this.client.post('/api/webhooks/payment').send({
          externalId: payment!.externalId,
          status: 'paid',
        });

        const secondInvoice = await models.Invoice.findByPk(invoice!.id);

        expect(secondInvoice!.status).toBe('paid');
        expect(secondInvoice!.paidDate).toEqual(firstPaidDate);
      });

      it('não deve regredir status de paid para failed', async () => {
        const parentId = await createParent(this.unitId);

        await createSale(this.unitId, this.planId, parentId);

        const invoice = await models.Invoice.findOne({ where: { parentId } });

        const payment = await models.Payment.findOne({
          where: { invoiceId: invoice!.id },
        });

        // paid
        await this.client.post('/api/webhooks/payment').send({
          externalId: payment!.externalId,
          status: 'paid',
        });

        // tentativa de regressão
        await this.client.post('/api/webhooks/payment').send({
          externalId: payment!.externalId,
          status: 'failed',
        });

        const updatedPayment = await models.Payment.findByPk(payment!.id);
        const updatedInvoice = await models.Invoice.findByPk(invoice!.id);

        expect(updatedPayment!.status).toBe('paid');
        expect(updatedInvoice!.status).toBe('paid');
      });

      it('deve permitir transição de failed para paid', async () => {
        const parentId = await createParent(this.unitId);

        await createSale(this.unitId, this.planId, parentId);

        const invoice = await models.Invoice.findOne({ where: { parentId } });

        const payment = await models.Payment.findOne({
          where: { invoiceId: invoice!.id },
        });

        // failed primeiro
        await this.client.post('/api/webhooks/payment').send({
          externalId: payment!.externalId,
          status: 'failed',
        });

        // depois paid
        await this.client.post('/api/webhooks/payment').send({
          externalId: payment!.externalId,
          status: 'paid',
        });

        const updatedInvoice = await models.Invoice.findByPk(invoice!.id);

        expect(updatedInvoice!.status).toBe('paid');
        expect(updatedInvoice!.paidDate).toBeTruthy();
      });

      it('deve ser consistente sob concorrência (race condition)', async () => {
        const parentId = await createParent(this.unitId);

        await createSale(this.unitId, this.planId, parentId);

        const invoice = await models.Invoice.findOne({ where: { parentId } });

        const payment = await models.Payment.findOne({
          where: { invoiceId: invoice!.id },
        });

        await Promise.all([
          this.client.post('/api/webhooks/payment').send({
            externalId: payment!.externalId,
            status: 'paid',
          }),
          this.client.post('/api/webhooks/payment').send({
            externalId: payment!.externalId,
            status: 'paid',
          }),
        ]);

        const updatedInvoice = await models.Invoice.findByPk(invoice!.id);

        expect(updatedInvoice!.status).toBe('paid');
        expect(updatedInvoice!.paidDate).toBeTruthy();
      });
    });
  }
}

new PaymentTest().run();
