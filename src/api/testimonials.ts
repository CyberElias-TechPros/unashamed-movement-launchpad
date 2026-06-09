import { api } from './client';

export interface Testimonial {
  id?: string;
  _id?: string;
  name: string;
  location: string;
  text: string;
  category: string;
  image?: string;
  avatar?: string;
  isApproved?: boolean;
  isFeatured?: boolean;
  rating?: number;
  createdAt?: string;
}

export const testimonialsApi = {
  getAll: () => api.get<Testimonial[]>('/testimonies'),

  getAllForAdmin: () => api.get<Testimonial[]>('/testimonies/manage/all'),
  
  getById: (id: string) => api.get<Testimonial>(`/testimonies/${id}`),
  
  submit: (data: Omit<Testimonial, 'id' | 'isApproved' | 'isFeatured' | 'createdAt'>) => 
    api.post<Testimonial>('/testimonies', data),
  
  update: (id: string, data: Partial<Testimonial>) => 
    api.put<Testimonial>(`/testimonies/${id}`, data),
  
  delete: (id: string) => api.delete(`/testimonies/${id}`),
};

export default testimonialsApi;