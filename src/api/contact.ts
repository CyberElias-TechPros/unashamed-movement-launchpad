import { api } from './client';

export interface ContactData {
  name: string;
  email: string;
  message: string;
}

export const contactApi = {
  submit: (data: ContactData) => api.post<{ message: string }>(`/contact`, data),
  
  checkSpam: (data: { ip: string; userAgent: string }) => 
    api.post<{ isSpam: boolean }>(`/contact/spam-check`, data),
};

export default contactApi;