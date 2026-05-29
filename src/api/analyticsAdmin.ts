import { api } from './client';

export interface DashboardStats {
  totalViews: number;
  totalSubscribers: number;
  totalTestimonials: number;
  totalDownloads: number;
}

export interface TimeseriesPoint {
  date: string;
  count: number;
}

export const analyticsAdminApi = {
  dashboard: () => api.get<DashboardStats>('/analytics/dashboard'),
  timeseries: (days = 30) => api.get<TimeseriesPoint[]>(`/analytics/timeseries?days=${days}`),
};

export default analyticsAdminApi;
