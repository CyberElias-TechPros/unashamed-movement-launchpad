import { api } from './client';

export interface Event {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  type: 'conference' | 'workshop' | 'meetup' | 'online';
  upcoming?: boolean;
  imageUrl?: string;
  registrationUrl?: string;
  createdAt?: string;
}

export interface EventRegistration {
  eventId: number | string;
  attendeeEmail?: string;
  attendeeName?: string;
}

export const eventsApi = {
  getAll: (type?: string) => {
    const query = type ? `?type=${type}` : '';
    return api.get<Event[]>(`/events${query}`);
  },
  
  getById: (id: string) => api.get<Event>(`/events/${id}`),
  
  create: (data: Omit<Event, 'id' | 'createdAt'>) => api.post<Event>('/events', data),
  
  update: (id: string, data: Partial<Event>) => api.put<Event>(`/events/${id}`, data),
  
  delete: (id: string) => api.delete(`/events/${id}`),
  
  register: (data: EventRegistration) => api.post<{ success: boolean; message: string }>('/events/register', {
    eventId: data.eventId,
    attendeeEmail: data.attendeeEmail || '',
    attendeeName: data.attendeeName || '',
    email: data.attendeeEmail || '',
    name: data.attendeeName || data.attendeeEmail?.split('@')[0] || 'Attendee',
  }),
  
  getRegistrationCount: (eventId: string) => api.get<{ count: number }>(`/events/${eventId}/registrations`),
};

export default eventsApi;