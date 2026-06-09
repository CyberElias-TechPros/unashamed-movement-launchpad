import { api, PaginationParams } from '../lib/api-client';

export interface NewsletterSubscriber {
  id?: string;
  _id?: string;
  email: string;
  subscribedAt?: string;
  createdAt?: string;
  active: boolean;
}

export interface SubscribeData {
  email: string;
}

export interface NewsletterFilters extends PaginationParams {
  active?: boolean;
  search?: string;
}

export const newsletterApi = {
  // Paginated endpoints
  getSubscribers: (filters?: NewsletterFilters) => 
    api.getPaginated<NewsletterSubscriber>('/newsletter', filters || {}),
  
  subscribe: (data: SubscribeData) => api.post<{ message: string }>('/newsletter/subscribe', data),
  
  unsubscribe: (email: string) => api.delete<{ message: string }>(`/newsletter/unsubscribe/${email}`),
  
  importSubscribers: (data: { subscribers: { email: string; name?: string }[] }) => 
    api.post<{ imported: number }>('/newsletter/import', data),
  
  // Bulk operations
  bulkUnsubscribe: (emails: string[]) => api.post('/newsletter/bulk-unsubscribe', { emails }),
};

export default newsletterApi;
