import { PaymentProvider } from 'src/types/payment/interfaces/paymentProvider.interface';
import { CreatePaymentDTO } from 'src/types/payment/dto/createPayment.dto';
import { ProviderExecutionResult } from 'src/types/payment/providerExecutionResult.type';

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
    const fallback = process.env.FALLBACK_PAYMENT_PROVIDER || 'altMock';

    if (!fallback) return null;

    return this.providers[fallback] || null;
  }

  async createPayment(
    data: CreatePaymentDTO,
  ): Promise<ProviderExecutionResult> {
    const defaultProviderName = process.env.DEFAULT_PAYMENT_PROVIDER || 'mock';

    const fallbackProviderName =
      process.env.FALLBACK_PAYMENT_PROVIDER || 'altMock';

    const defaultProvider = this.providers[defaultProviderName];
    const fallbackProvider = this.providers[fallbackProviderName];

    try {
      const response = await defaultProvider.createPayment(data);

      if (response.success) {
        return {
          provider: defaultProviderName,
          response,
        };
      }

      throw new Error('Primary provider failed');
    } catch (error) {
      if (!fallbackProvider) {
        throw error;
      }

      const fallbackResponse = await fallbackProvider.createPayment(data);

      return {
        provider: fallbackProviderName,
        response: fallbackResponse,
      };
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
