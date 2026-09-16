import { useEffect } from 'react';
import { API_BASE_URL } from './api-client';

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}


export const trackEvent = async (event: AnalyticsEvent): Promise<void> => {
  // Forward to GA4 when it's loaded (see src/main.tsx).
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", `${event.category}_${event.action}`, {
        event_label: event.label,
        value: event.value,
      });
    }
  } catch {
    /* never let analytics break the app */
  }
  try {
    await fetch(`${API_BASE_URL}/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

export const useAnalytics = () => {
  const track = (event: AnalyticsEvent) => {
    trackEvent(event);
  };

  return { track };
};

export const trackPageView = (pageName: string) => {
  trackEvent({
    category: 'page',
    action: 'view',
    label: pageName,
  });
};

export const trackCTAClick = (buttonName: string, location: string) => {
  trackEvent({
    category: 'navigation',
    action: 'click',
    label: `${buttonName}_${location}`,
  });
};

export const trackFormSubmit = (formName: string) => {
  trackEvent({
    category: 'engagement',
    action: 'submit',
    label: formName,
  });
};

export const trackAddToCart = (productId: string, productName: string) => {
  trackEvent({
    category: 'ecommerce',
    action: 'add',
    label: productName,
    value: productId ? 1 : 0,
  });
};

export const trackPurchase = (orderId: string, value: number) => {
  trackEvent({
    category: 'ecommerce',
    action: 'purchase',
    label: orderId,
    value,
  });
};

export const trackDownload = (resourceId: string, resourceTitle: string) => {
  trackEvent({
    category: 'engagement',
    action: 'download',
    label: resourceTitle,
    value: resourceId ? 1 : 0,
  });
};

export const trackVideoPlay = (videoId: string, videoTitle: string) => {
  trackEvent({
    category: 'engagement',
    action: 'play',
    label: videoTitle,
    value: videoId ? 1 : 0,
  });
};

export const trackEventRegistration = (eventId: string, eventName: string) => {
  trackEvent({
    category: 'engagement',
    action: 'register',
    label: eventName,
    value: eventId ? 1 : 0,
  });
};
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
