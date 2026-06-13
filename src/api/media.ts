import { api } from './client';

export interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  filename: string;
  createdAt: string;
}

export const mediaApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ url: string; filename: string }>('/uploads/cloudinary', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get<MediaItem[]>('/uploads/cloudinary'),
};

export default mediaApi;
