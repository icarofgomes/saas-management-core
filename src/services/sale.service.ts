import { SaleRepository } from 'src/repositories/sale.repository';
import { InvoiceRepository } from 'src/repositories/invoice.repository';
import { PlanRepository } from 'src/repositories/plan.repository';
import { sequelize } from 'src/database/sequelize';
import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';

interface CreateSaleDTO {
  parentId: string;
  planId: string;
  unitId: string;
  startMonth: Date; // mês inicial (ex: 2025-05-01)
  dueDate: Date; // data de vencimento mensal das invoices (ex: todo dia 10)
}

export class SaleService {
  private saleRepository = new SaleRepository();
  private invoiceRepository = new InvoiceRepository();
  private planRepository = new PlanRepository();

  async createSale(data: CreateSaleDTO) {
    const transaction = await sequelize.transaction();

    try {
      // Busca o plano pra pegar preço e duração
      const plan = await this.planRepository.findById(data.planId);
      if (!plan) {
        throw new AppError(ErrorMessages.PLAN_NOT_FOUND);
      }

      // Calcula endMonth: último mês do ano corrente (31/12 do ano do startMonth)
      const startYear = new Date(data.startMonth).getFullYear();
      const endMonth = new Date(startYear, 11, 1); // Dezembro do mesmo ano

      // Quantidade de meses entre startMonth e endMonth (inclusive)
      const monthsCount = 12 - new Date(data.startMonth).getMonth(); // exemplo: maio (4) -> 12 - 4 = 8 meses (mai a dez)

      // Total da venda (multiplicando meses pelo preço do plano)
      const totalAmount = Number(plan.price) * monthsCount;

      // Cria a venda
      const sale = await this.saleRepository.create(
        {
          parentId: data.parentId,
          planId: data.planId,
          unitId: data.unitId,
          startMonth: data.startMonth,
          endMonth,
          totalAmount,
        },
        transaction,
      );

      // Cria as invoices para cada mês
      for (let i = 0; i < monthsCount; i++) {
        const invoiceMonth = new Date(
          startYear,
          new Date(data.startMonth).getMonth() + i,
          1, // Primeiro dia do mês
        );

        // Extraímos o dia de vencimento (por exemplo, 20, de 20/01/2025)
        const dueDay = new Date(data.dueDate).getDate(); // Dia do vencimento

        // Ajustamos o dueDate para o mês correto mantendo o mesmo dia
        const dueDate = new Date(invoiceMonth.setDate(dueDay));

        // Caso o dia do vencimento seja maior que o último dia do mês, ajusta para o último dia do mês
        if (dueDate.getMonth() !== invoiceMonth.getMonth()) {
          dueDate.setMonth(invoiceMonth.getMonth());
          dueDate.setDate(0); // Coloca a data para o último dia do mês
        }

        // Criação da fatura com o dueDate ajustado
        await this.invoiceRepository.create(
          {
            saleId: sale.id,
            parentId: data.parentId,
            month: invoiceMonth,
            amount: Number(plan.price),
            status: 'pending',
            dueDate: dueDate, // A data de vencimento agora está ajustada
            paidDate: null,
          },
          transaction,
        );
      }

      await transaction.commit();

      return { status: 'CREATED', data: sale };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
