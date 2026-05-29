import { api } from './client';

export interface FlutterwavePaymentData {
  email: string;
  amount: number;
  name?: string;
  tx_ref?: string;
  redirect_url?: string;
}

export interface FlutterwaveResult {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    flw_ref: string;
    transaction_id: number;
  };
}

export const flutterwaveApi = {
  initialize: (data: FlutterwavePaymentData) => 
    api.post<FlutterwaveResult>('/payments/flutterwave/initialize', data),
  
  verify: (transactionId: number) => 
    api.get<FlutterwaveResult>(`/payments/flutterwave/verify/${transactionId}`),
  
  webhook: (signature: string, body: string) => {
    return api.post('/payments/flutterwave/webhook', { signature, body });
  },
};

export default flutterwaveApi;