import { api } from './client';

export interface Resource {
  id?: string;
  _id?: string;
  title: string;
  author: string;
  description: string;
  type: 'book' | 'devotional' | 'guide' | 'article' | 'podcast';
  downloadUrl: string;
  free: boolean;
  category: string;
  downloadCount?: number;
}

export const resourcesApi = {
  getAll: (category?: string) => {
    const query = category && category !== 'All' ? `?category=${category}` : '';
    return api.get<Resource[]>(`/resources${query}`);
  },

  getById: (id: string) => api.get<Resource>(`/resources/${id}`),

  download: (resourceId: string) => 
    api.post<{ downloadUrl: string; message: string }>(`/resources/${resourceId}/download`),

  create: (data: Omit<Resource, 'id' | '_id'>) => api.post<Resource>('/resources', data),

  update: (id: string, data: Partial<Resource>) => api.put<Resource>(`/resources/${id}`, data),

  delete: (id: string) => api.delete(`/resources/${id}`),
};

export default resourcesApi;