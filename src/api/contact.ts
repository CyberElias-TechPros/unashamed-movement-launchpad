import { api } from './client';

export interface ContactData {
  name: string;
  email: string;
  message: string;
  /** Honeypot field — bots fill it, humans never see it. */
  website?: string;
}

export interface ContactMessage {
  id: string;
  _id?: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactListResponse {
  success: boolean;
  data: ContactMessage[];
  pagination: { page: number; totalPages: number; totalCount: number };
  unreadCount: number;
}

export const contactApi = {
  submit: (data: ContactData) => api.post<{ message: string }>(`/contact`, data),

  checkSpam: (data: { ip: string; userAgent: string }) =>
    api.post<{ isSpam: boolean }>(`/contact/spam-check`, data),

  // --- Admin inbox ---
  list: (params?: { page?: number; limit?: number; search?: string; isRead?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.isRead) q.set('isRead', params.isRead);
    const query = q.toString();
    return api.get<ContactListResponse>(`/contact${query ? `?${query}` : ''}`);
  },

  markRead: (id: string, isRead: boolean) =>
    api.patch<ContactMessage>(`/contact/${id}/read`, { isRead }),

  remove: (id: string) => api.delete<{ message: string }>(`/contact/${id}`),

  reply: (id: string, reply: string) =>
    api.post<{ message: string }>(`/contact/${id}/reply`, { reply }),
};

export default contactApi;