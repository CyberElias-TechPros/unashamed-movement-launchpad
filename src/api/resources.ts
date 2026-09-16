import { api, PaginationParams } from '../lib/api-client';

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
  imageUrl?: string;
  isActive?: boolean;
}

export interface ResourceFilters extends PaginationParams {
  type?: string;
  category?: string;
  search?: string;
  free?: boolean;
}

export interface ResourceAdminFilters extends PaginationParams {
  type?: string;
  category?: string;
  search?: string;
  isActive?: boolean;
}

export const resourcesApi = {
  // Public paginated endpoints
  getAll: (filters?: ResourceFilters) => 
    api.getPaginated<Resource>('/resources', filters || {}),

  // Admin paginated endpoints
  getAllAdmin: (filters?: ResourceAdminFilters) => 
    api.getPaginated<Resource>('/resources/admin/all', filters || {}),

  getById: (id: string) => api.get<Resource>(`/resources/${id}`),

  getPdfUrl: (id: string) => api.get<{ pdfUrl: string }>(`/resources/${id}/pdf-url`),

  getDownloadUrl: (id: string) => api.post<{ downloadUrl: string }>(`/resources/${id}/download`, {}),
  download: (id: string) => api.post<{ downloadUrl: string }>(`/resources/${id}/download`, {}),

  create: (data: Omit<Resource, 'id' | '_id'>) => api.post<Resource>('/resources', data),

  update: (id: string, data: Partial<Resource>) => api.put<Resource>(`/resources/${id}`, data),

  delete: (id: string) => api.delete(`/resources/${id}`),
  
  // Bulk operations
  bulkDelete: (ids: string[]) => api.post('/resources/bulk-delete', { ids }),
  bulkUpdateStatus: (ids: string[], isActive: boolean) => 
    api.post('/resources/bulk-update-status', { ids, isActive }),
};

export default resourcesApi;
