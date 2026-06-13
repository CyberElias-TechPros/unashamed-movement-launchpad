import { api, PaginationParams } from '../lib/api-client';

export interface Video {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  youtubeUrl: string;
  url?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  duration?: string;
  episode?: string;
  category?: string;
  isActive?: boolean;
  isPublished?: boolean;
  order?: number;
  createdAt?: string;
}

export interface VideoFilters extends PaginationParams {
  search?: string;
}

export interface VideoAdminFilters extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

export const videosApi = {
  // Public paginated endpoints
  getAll: (filters?: VideoFilters) => 
    api.getPaginated<Video>('/videos', filters || {}),
  
  // Admin paginated endpoints
  getAllAdmin: (filters?: VideoAdminFilters) => 
    api.getPaginated<Video>('/videos/admin/all', filters || {}),
  
  getById: (id: string) => api.get<Video>(`/videos/${id}`),
  
  getByFeed: () => api.get<Video[]>('/videos/feed'),
  
  create: (data: Omit<Video, 'id' | 'createdAt'>) => api.post<Video>('/videos', data),
  
  update: (id: string, data: Partial<Video>) => api.put<Video>(`/videos/${id}`, data),
  
  delete: (id: string) => api.delete(`/videos/${id}`),
  
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<Video>('/videos/upload', formData);
  },
  
  // Bulk operations
  bulkDelete: (ids: string[]) => api.post('/videos/bulk-delete', { ids }),
  bulkUpdateStatus: (ids: string[], isActive: boolean) => 
    api.post('/videos/bulk-update-status', { ids, isActive }),
};

export default videosApi;
