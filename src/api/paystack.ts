import { api } from './client';

export interface PaymentResult {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackInitialize {
  email: string;
  amount: number;
  name?: string;
  ref?: string;
  callback_url?: string;
  orderId?: string;
}

export const paystackApi = {
  initialize: (data: PaystackInitialize) => 
    api.post<PaymentResult>('/payments/paystack/initialize', data, { maxRetries: 5 }),
  
  verify: (reference: string) => 
    api.get<PaymentResult>(`/payments/paystack/verify/${reference}`),
  
  webhook: (signature: string, body: string) => {
    return api.post('/payments/paystack/webhook', { signature, body });
  },
};

export default paystackApi;