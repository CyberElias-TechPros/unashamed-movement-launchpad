import { api, PaginationParams } from '../lib/api-client';

export interface Review {
  _id?: string;
  product: string;
  name?: string;
  email?: string;
  rating: number;
  title?: string;
  body?: string;
  approved?: boolean;
  rejected?: boolean;
  createdAt?: string;
}

export interface ReviewFilters extends PaginationParams {
  approved?: boolean;
  product?: string;
  rating?: number;
}

export const reviewsApi = {
  // Public paginated endpoints
  getByProduct: (productId: string, params?: PaginationParams) => 
    api.getPaginated<Review>(`/reviews/product/${productId}`, params || {}),
  
  create: (productId: string, data: Partial<Review>) => 
    api.post<Review>(`/reviews/product/${productId}`, data),
  
  // Admin paginated endpoints
  getAll: (filters?: ReviewFilters) => 
    api.getPaginated<Review>('/reviews', filters || {}),
  
  approve: (id: string) => api.post(`/reviews/${id}/approve`, {}),
  reject: (id: string) => api.post(`/reviews/${id}/reject`, {}),
  remove: (id: string) => api.delete(`/reviews/${id}`),
  
  // Bulk operations
  bulkApprove: (ids: string[]) => api.post('/reviews/bulk-approve', { ids }),
  bulkReject: (ids: string[]) => api.post('/reviews/bulk-reject', { ids }),
};

export default reviewsApi;
