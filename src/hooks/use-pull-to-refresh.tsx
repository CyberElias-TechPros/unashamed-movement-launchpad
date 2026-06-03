import { useRef, useEffect, useState, useCallback } from "react";
import { useIsMobile } from "./use-mobile";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile || refreshing) return;
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      setPulling(true);
    }
  }, [isMobile, refreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling) return;
    const touch = e.touches[0];
    const distance = touch.clientY - (e.target as Element).getBoundingClientRect().top;
    if (distance > 0 && distance < threshold * 2) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold));
    }
  }, [pulling, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPulling(false);
    setPullDistance(0);
  }, [pulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (isMobile && containerRef.current) {
      const container = containerRef.current;
      container.addEventListener("touchstart", handleTouchStart, { passive: false });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
      container.addEventListener("touchend", handleTouchEnd);
      
      return () => {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef, pulling, refreshing, pullDistance };
}