export interface PaymentResponse {
  success: boolean;
  externalId?: string;
  paymentUrl?: string;
  provider?: string;
  raw?: any;
}
