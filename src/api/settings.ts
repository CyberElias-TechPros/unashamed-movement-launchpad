import { api } from './client';

export interface SiteSettings {
  _id?: string;
  siteName: string;
  tagline: string;
  siteUrl: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeMode?: 'default' | 'bw-purple' | 'minimal';
  primaryColor?: string;
  accentColor?: string;
  allowNewsletter?: boolean;
  allowRegistration?: boolean;
  moderateReviews?: boolean;
  moderateTestimonials?: boolean;
  maintenanceMode?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  emailFrom?: string;
  smtpHost?: string;
  smtpPort?: string;
  paymentMethods?: {
    stripe?: boolean;
    paypal?: boolean;
    paystack?: boolean;
    flutterwave?: boolean;
  };
  updatedAt?: string;
}

export const settingsApi = {
  getAll: () => api.get<SiteSettings | null>('/settings'),
  save: (data: Partial<SiteSettings>) => api.put<SiteSettings>('/settings', data),
};

export default settingsApi;
