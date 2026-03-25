import { PaymentProvider } from 'src/types/payment/interfaces/paymentProvider.interface';
import { CreatePaymentDTO } from 'src/types/payment/dto/createPayment.dto';
import { PaymentResponse } from 'src/types/payment/interfaces/paymentResponse.interface';

export class MockProvider implements PaymentProvider {
  async createPayment(data: CreatePaymentDTO): Promise<PaymentResponse> {
    // Simula pequeno delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 30% chance de falhar (pra testar fallback)
    const shouldFail = Math.random() < 0.3;

    if (shouldFail) {
      return {
        success: false,
        raw: {
          error: 'Simulated provider failure',
        },
      };
    }

    return {
      success: true,
      externalId: `mock_${Date.now()}`,
      paymentUrl: `https://mock-payment.com/pay/${Date.now()}`,
      provider: 'mock',
      raw: {
        provider: 'mock',
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
