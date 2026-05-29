import { api } from './client';

export interface Donation {
  id?: string;
  _id?: string;
  amount: number;
  donor?: string;
  email?: string;
  message?: string;
  status: 'pending' | 'completed' | 'failed';
  paymentIntentId?: string;
  createdAt?: string;
}

export interface DonationCreate {
  amount: number;
  donor?: string;
  email?: string;
  message?: string;
}

export const donationsApi = {
  getAll: () => api.get<Donation[]>('/donations'),
  
  getById: (id: string) => api.get<Donation>(`/donations/${id}`),
  
  create: (data: DonationCreate) => api.post<Donation>('/donations', data),
  
  createCheckoutSession: (amount: number, email?: string) => 
    api.post<{ sessionId: string; url: string }>('/donations/checkout', { amount, email }),
  
  verify: (paymentIntentId: string) => 
    api.get<{ status: string; amount: number }>(`/donations/verify/${paymentIntentId}`),
};

export default donationsApi;