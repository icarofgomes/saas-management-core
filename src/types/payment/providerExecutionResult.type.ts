import { PaymentResponse } from './interfaces/paymentResponse.interface';

export type ProviderExecutionResult = {
  provider: string;
  response: PaymentResponse;
};
