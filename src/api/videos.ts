import { api } from './client';

export interface Video {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  category?: string;
  isPublished?: boolean;
  createdAt?: string;
}

export const videosApi = {
  getAll: () => api.get<Video[]>('/videos'),
  
  getById: (id: string) => api.get<Video>(`/videos/${id}`),
  
  getByFeed: () => api.get<Video[]>('/videos/feed'),
  
  create: (data: Omit<Video, 'id' | 'createdAt'>) => api.post<Video>('/videos', data),
  
  update: (id: string, data: Partial<Video>) => api.put<Video>(`/videos/${id}`, data),
  
  delete: (id: string) => api.delete(`/videos/${id}`),
  
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post<Video>('/videos/upload', formData);
  },
};

export default videosApi;