import { api } from './client';

export interface StripePaymentResult {
  status: boolean;
  message: string;
  clientSecret?: string;
  sessionId?: string;
}

export interface StripeInitialize {
  email: string;
  amount: number;
  name?: string;
  orderId?: string;
}

export const stripeApi = {
  initialize: (data: StripeInitialize) => 
    api.post<StripePaymentResult>('/payments/stripe/initialize', data),
  
  createSession: (data: {
    email: string;
    items: { productId: string; quantity: number }[];
    successUrl?: string;
    cancelUrl?: string;
    currency?: string;
    orderId?: string;
  }) => 
    api.post<{ sessionId: string; url: string; message?: string }>('/payments/stripe/create-session', data, { maxRetries: 5 }),
  
  webhook: (payload: { id: string; type: string; data: unknown }) => {
    return api.post('/payments/stripe/webhook', payload);
  },
};

export default stripeApi;