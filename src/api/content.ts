import { api } from './client';

export interface SiteContent {
  _id?: string;
  key: string;
  title: string;
  content: string;
  type: 'hero' | 'about' | 'values' | 'cta' | 'stats' | 'mission' | 'featured';
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export const contentApi = {
  getAll: () => api.get<SiteContent[]>('/content'),
  getByKey: (key: string) => api.get<SiteContent>(`/content/${key}`),
  upsert: (data: SiteContent) => api.post<SiteContent>('/content', data),
  remove: (key: string) => api.delete(`/content/${key}`),
};

export default contentApi;
