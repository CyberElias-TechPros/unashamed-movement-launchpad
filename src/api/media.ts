import { api } from './client';

export interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  createdAt: string;
}

export const mediaApi = {
  uploadToCloudinary: (file: File | null, url?: string) => {
    const form = new FormData();
    if (file) form.append('file', file);
    if (url) form.append('url', url);
    return api.post<{ url: string; publicId: string }>('/uploads/cloudinary', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: () => api.get<MediaItem[]>('/uploads/cloudinary')
};

export default mediaApi;
