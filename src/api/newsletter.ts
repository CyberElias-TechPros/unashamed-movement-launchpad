import { api } from './client';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export interface SubscribeData {
  email: string;
}

export const newsletterApi = {
  getSubscribers: () => api.get<NewsletterSubscriber[]>('/newsletter'),
  
  subscribe: (data: SubscribeData) => api.post<{ message: string }>('/newsletter/subscribe', data),
  
  unsubscribe: (email: string) => api.delete<{ message: string }>(`/newsletter/unsubscribe/${email}`),
};

export default newsletterApi;