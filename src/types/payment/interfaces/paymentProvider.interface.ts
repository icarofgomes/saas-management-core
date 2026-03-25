import { CreatePaymentDTO } from '../dto/createPayment.dto';
import { PaymentResponse } from './paymentResponse.interface';

export interface PaymentProvider {
  createPayment(data: CreatePaymentDTO): Promise<PaymentResponse>;

  resendPayment?(externalId: string): Promise<void>;

  cancelPayment?(externalId: string): Promise<void>;
}
