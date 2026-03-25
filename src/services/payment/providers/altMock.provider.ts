import { PaymentProvider } from 'src/types/payment/interfaces/paymentProvider.interface';
import { CreatePaymentDTO } from 'src/types/payment/dto/createPayment.dto';
import { PaymentResponse } from 'src/types/payment/interfaces/paymentResponse.interface';

export class AltMockProvider implements PaymentProvider {
  async createPayment(data: CreatePaymentDTO): Promise<PaymentResponse> {
    // Simula pequeno delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      externalId: `altmock_${Date.now()}`,
      paymentUrl: `https://altmock-payment.com/pay/${Date.now()}`,
      provider: 'mock',
      raw: {
        provider: 'altMock',
        data,
      },
    };
  }

  async resendPayment(externalId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return;
  }

  async cancelPayment(externalId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return;
  }
}
