import { TestBase } from 'tests/utils/TestBase';
import models from 'src/models';
import { Invoice } from 'src/models/invoice.model';

class SaleTest extends TestBase {
  private unitId!: string;
  private planId!: string;

  public run(): void {
    describe('Sale & Invoice API', () => {
      this.setupGlobalHooks();

      beforeAll(async () => {
        // Usa a unidade padrão do TestBase
        this.unitId = await this.createDefaultUnitIfNotExists();

        // Cria plano padrão isolado
        this.planId = await this.createDefaultPlanIfNotExists();
      });

      // Helper para criar parent (responsável)
      const createParent = async (unitId: string) => {
        const parentRes = await this.client.post('/api/parents').send({
          firstName: 'ParentTest',
          lastName: 'Test',
          email: this.generateUniqueEmail('parent.sale'),
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
        const token = parentRes.body.data.token;

        const parent = await models.Parent.findOne({
          where: { userId: parentUserId },
        });
        return { parentId: parent!.id, token };
      };

      // Helper para criar sale via API
      const createSale = async (
        unitId: string,
        planId: string,
        parentId: string,
        startDate?: Date,
      ) => {
        const startMonth = startDate ?? new Date();
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

      it('deve criar uma nova venda com sucesso', async () => {
        const { parentId } = await createParent(this.unitId);

        const res = await createSale(this.unitId, this.planId, parentId);

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.planId).toBe(this.planId);
        expect(res.body.data.unitId).toBe(this.unitId);
        expect(res.body.data.parentId).toBe(parentId);
      });

      it('deve criar faturas correspondentes à venda', async () => {
        const { parentId } = await createParent(this.unitId);
        const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);

        const res = await createSale(
          this.unitId,
          this.planId,
          parentId,
          firstDayOfYear,
        );
        expect(res.status).toBe(201);

        const saleId = res.body.data.id;

        // Busca todas as invoices relacionadas a essa venda
        const invoices = await models.Invoice.findAll({
          where: {
            saleId,
            parentId,
          },
        });

        // Quantidade de faturas esperada: 12
        expect(invoices.length).toBe(12);

        // Verifica se cada fatura tem os campos corretos
        invoices.forEach((invoice) => {
          expect(invoice.saleId).toBe(saleId);
          expect(invoice.parentId).toBe(parentId);
        });
      });

      // Novo teste para verificar a consulta de faturas por parentId
      it('deve retornar todas as faturas de um parentId', async () => {
        const { parentId } = await createParent(this.unitId);
        const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);

        // Cria a venda, que gerará invoices
        const res = await createSale(
          this.unitId,
          this.planId,
          parentId,
          firstDayOfYear,
        );
        expect(res.status).toBe(201);

        const saleId = res.body.data.id;

        // Agora consulta as faturas para esse parentId
        const invoicesRes = await this.client
          .get(`/api/invoices/parent/${parentId}`)
          .send();

        expect(invoicesRes.status).toBe(200);
        expect(invoicesRes.body.data.length).toBe(12); // Deveria ter 12 faturas
      });

      // Teste para garantir que, se não houver faturas, a resposta seja um array vazio
      it('deve retornar um array vazio se não houver faturas para o parentId', async () => {
        // Caso de teste sem vendas ou faturas
        const nonExistentParentId = 'nonexistent-parent-id';

        const invoicesRes = await this.client
          .get(`/api/invoices/parent/${nonExistentParentId}`)
          .send();

        expect(invoicesRes.status).toBe(200);
        expect(invoicesRes.body.data).toEqual([]); // A resposta deve ser um array vazio
      });
    });
  }
}

new SaleTest().run();
