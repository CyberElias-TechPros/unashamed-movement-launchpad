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

export interface DonationCheckoutPayload {
  amount: number;
  email?: string;
  donorName?: string;
  currency?: string;
  paymentMethod?: 'stripe' | 'paystack' | 'flutterwave';
  message?: string;
  isAnonymous?: boolean;
}

export interface DonationStats {
  raisedTotal: number;
  raisedThisMonth: number;
  donationCount: number;
  donorCount: number;
  pendingCount: number;
}

export const donationsApi = {
  getAll: () => api.get<Donation[]>('/donations'),

  getById: (id: string) => api.get<Donation>(`/donations/${id}`),

  create: (data: DonationCreate) => api.post<Donation>('/donations', data),

  checkout: (payload: DonationCheckoutPayload) =>
    api.post<{ sessionId: string; url: string; donationId: string; devMode?: boolean }>('/donations/checkout', payload),

  verify: (paymentIntentId: string) =>
    api.get<{ status: string; amount: number }>(`/donations/verify/${paymentIntentId}`),

  // --- Admin ---
  stats: () => api.get<DonationStats>('/donations/stats/summary'),

  updateStatus: (id: string, status: 'pending' | 'completed' | 'failed') =>
    api.patch<Donation>(`/donations/${id}/status`, { status }),
};

export default donationsApi;