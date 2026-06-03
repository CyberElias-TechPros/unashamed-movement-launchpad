import { api } from './client';

export interface Review {
  _id?: string;
  product: string;
  name?: string;
  email?: string;
  rating: number;
  title?: string;
  body?: string;
  approved?: boolean;
  createdAt?: string;
}

export const reviewsApi = {
  getByProduct: (productId: string) => api.get<Review[]>(`/reviews/product/${productId}`),
  create: (productId: string, data: Partial<Review>) => api.post<Review>(`/reviews/product/${productId}`, data),
  getAll: () => api.get<Review[]>('/reviews'),
  approve: (id: string) => api.post(`/reviews/${id}/approve`),
  remove: (id: string) => api.delete(`/reviews/${id}`),
};

export default reviewsApi;
