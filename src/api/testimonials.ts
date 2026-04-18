import { api } from './client';

export interface Testimonial {
  id?: string;
  name: string;
  location: string;
  content: string;
  videoUrl?: string;
  approved?: boolean;
  createdAt?: string;
}

export const testimonialsApi = {
  getAll: () => api.get<Testimonial[]>('/testimonies'),
  
  getById: (id: string) => api.get<Testimonial>(`/testimonies/${id}`),
  
  submit: (data: Omit<Testimonial, 'id' | 'approved' | 'createdAt'>) => 
    api.post<Testimonial>('/testimonies', data),
  
  update: (id: string, data: Partial<Testimonial>) => 
    api.put<Testimonial>(`/testimonies/${id}`, data),
  
  delete: (id: string) => api.delete(`/testimonies/${id}`),
};

export default testimonialsApi;