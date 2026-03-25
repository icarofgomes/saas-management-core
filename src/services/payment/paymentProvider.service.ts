import { PaymentProvider } from 'src/types/payment/interfaces/paymentProvider.interface';
import { CreatePaymentDTO } from 'src/types/payment/dto/createPayment.dto';
import { PaymentResponse } from 'src/types/payment/interfaces/paymentResponse.interface';

import { MockProvider } from './providers/mock.provider';
import { AltMockProvider } from './providers/altMock.provider';

export class PaymentProviderService {
  private providers: Record<string, PaymentProvider>;

  constructor() {
    this.providers = {
      mock: new MockProvider(),
      altMock: new AltMockProvider(),
    };
  }

  private getDefaultProvider(): PaymentProvider {
    const provider = process.env.DEFAULT_PAYMENT_PROVIDER || 'mock';

    const resolvedProvider = this.providers[provider];

    if (!resolvedProvider) {
      throw new Error(`Payment provider not found: ${provider}`);
    }

    return resolvedProvider;
  }

  private getFallbackProvider(): PaymentProvider | null {
    const fallback = process.env.FALLBACK_PAYMENT_PROVIDER;

    if (!fallback) return null;

    return this.providers[fallback] || null;
  }

  async createPayment(data: CreatePaymentDTO): Promise<PaymentResponse> {
    const defaultProvider = this.getDefaultProvider();
    const fallbackProvider = this.getFallbackProvider();

    try {
      const response = await defaultProvider.createPayment(data);

      if (response.success) {
        return response;
      }

      throw new Error('Primary provider failed');
    } catch (error) {
      if (!fallbackProvider) {
        throw error;
      }

      const fallbackResponse = await fallbackProvider.createPayment(data);

      return fallbackResponse;
    }
  }

  async resendPayment(providerName: string, externalId: string): Promise<void> {
    const provider = this.providers[providerName];

    if (!provider || !provider.resendPayment) {
      throw new Error(`Provider ${providerName} does not support resend`);
    }

    await provider.resendPayment(externalId);
  }

  async cancelPayment(providerName: string, externalId: string): Promise<void> {
    const provider = this.providers[providerName];

    if (!provider || !provider.cancelPayment) {
      throw new Error(`Provider ${providerName} does not support cancel`);
    }

    await provider.cancelPayment(externalId);
  }
}
