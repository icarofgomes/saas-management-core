export interface CreatePaymentDTO {
  invoiceId: string;
  amount: number;
  dueDate: string;
  customer: {
    name: string;
    email?: string;
  };
}
