import { InvoiceRepository } from 'src/repositories/invoice.repository';
import { AppError } from 'src/errors/AppError';
import { ErrorMessages } from 'src/errors/ErrorMessages';

export class InvoiceService {
  private invoiceRepository = new InvoiceRepository();

  // Método para buscar todas as invoices de um parentId
  async getAllByParentId(parentId: string) {
    try {
      // Verifica se o parentId foi fornecido
      if (!parentId) {
        throw new AppError(ErrorMessages.PARENT_ID_REQUIRED);
      }

      // Buscando todas as invoices relacionadas ao parentId
      const invoices = await this.invoiceRepository.findAllByParentId(parentId);

      return { status: 'SUCCESS', data: invoices || [] };
    } catch (error) {
      throw error;
    }
  }
}
