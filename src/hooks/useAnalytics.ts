import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

interface PageViewData {
  path: string;
  title?: string;
}

const ANALYTICS_KEY = "ttin_analytics";

interface AnalyticsData {
  events: AnalyticsEvent[];
  pageViews: PageViewData[];
  lastUpdated: string;
}

const getAnalyticsData = (): AnalyticsData => {
  const data = localStorage.getItem(ANALYTICS_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return {
    events: [],
    pageViews: [],
    lastUpdated: new Date().toISOString(),
  };
};

const saveAnalyticsData = (data: AnalyticsData) => {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
};

export const useAnalytics = () => {
  const location = useLocation();

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const data = getAnalyticsData();
    
    data.events.push({
      ...event,
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
    });
    
    data.lastUpdated = new Date().toISOString();
    saveAnalyticsData(data);
    
    if (import.meta.env.DEV) {
      console.log("[Analytics] Event:", event);
    }
  }, []);

  const trackPageView = useCallback((pageData: PageViewData) => {
    const data = getAnalyticsData();
    
    data.pageViews.push({
      path: pageData.path,
      title: pageData.title,
    });
    
    data.lastUpdated = new Date().toISOString();
    saveAnalyticsData(data);
    
    if (import.meta.env.DEV) {
      console.log("[Analytics] Page View:", pageData);
    }
  }, []);

  const trackVideoPlay = useCallback((videoId: string, videoTitle?: string) => {
    trackEvent({
      category: "video",
      action: "play",
      label: videoTitle || videoId,
    });
  }, [trackEvent]);

  const trackDownload = useCallback((resourceId: string, resourceTitle?: string) => {
    trackEvent({
      category: "download",
      action: "start",
      label: resourceTitle || resourceId,
    });
  }, [trackEvent]);

  const trackNewsletterSignup = useCallback((email: string) => {
    trackEvent({
      category: "newsletter",
      action: "signup",
      label: email,
    });
  }, [trackEvent]);

  const trackTestimonialSubmit = useCallback(() => {
    trackEvent({
      category: "testimonial",
      action: "submit",
    });
  }, [trackEvent]);

  useEffect(() => {
    trackPageView({
      path: location.pathname,
    });
  }, [location.pathname, trackPageView]);

  return {
    trackEvent,
    trackPageView,
    trackVideoPlay,
    trackDownload,
    trackNewsletterSignup,
    trackTestimonialSubmit,
  };
};

export const getAnalyticsSummary = () => {
  const data = getAnalyticsData();
  
  const eventCounts = data.events.reduce((acc, event) => {
    const key = `${event.category}:${event.action}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pageViewCounts = data.pageViews.reduce((acc, pv) => {
    acc[pv.path] = (acc[pv.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEvents: data.events.length,
    totalPageViews: data.pageViews.length,
    eventCounts,
    pageViewCounts,
    lastUpdated: data.lastUpdated,
  };
};

export default useAnalytics;