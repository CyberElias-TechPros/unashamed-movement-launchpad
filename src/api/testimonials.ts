import { api, PaginationParams } from '../lib/api-client';

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

export interface TestimonialFilters extends PaginationParams {
  category?: string;
  search?: string;
}

export interface TestimonialAdminFilters extends PaginationParams {
  category?: string;
  isApproved?: boolean;
  search?: string;
}

export const testimonialsApi = {
  // Public paginated endpoints
  getAll: (filters?: TestimonialFilters) => 
    api.getPaginated<Testimonial>('/testimonies', filters || {}),

  // Admin paginated endpoints
  getAllForAdmin: (filters?: TestimonialAdminFilters) => 
    api.getPaginated<Testimonial>('/testimonies/manage/all', filters || {}),
  
  getById: (id: string) => api.get<Testimonial>(`/testimonies/${id}`),
  
  submit: (data: Omit<Testimonial, 'id' | 'isApproved' | 'isFeatured' | 'createdAt'>) => 
    api.post<Testimonial>('/testimonies', data),
  
  update: (id: string, data: Partial<Testimonial>) => 
    api.put<Testimonial>(`/testimonies/${id}`, data),
  
  delete: (id: string) => api.delete(`/testimonies/${id}`),
  
  // Bulk operations
  bulkApprove: (ids: string[]) => api.post('/testimonies/bulk-approve', { ids }),
  bulkReject: (ids: string[]) => api.post('/testimonies/bulk-reject', { ids }),
  // There is no bulk-delete endpoint — fan out to the single DELETE.
  bulkDelete: async (ids: string[]) => {
    const results = await Promise.allSettled(ids.map((id) => api.delete(`/testimonies/${id}`)));
    return results.filter((r) => r.status === 'fulfilled').length;
  },
};

export default testimonialsApi;
