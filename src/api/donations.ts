import { api } from './client';

export interface Donation {
  id?: string;
  _id?: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  currency?: string;
  type?: 'one-time' | 'monthly';
  message?: string;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  isAnonymous?: boolean;
  createdAt?: string;
}

export interface DonationCreate {
  amount: number;
  donorName: string;
  donorEmail: string;
  type: 'one-time' | 'monthly';
  message?: string;
  paymentMethod?: string;
  isAnonymous?: boolean;
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