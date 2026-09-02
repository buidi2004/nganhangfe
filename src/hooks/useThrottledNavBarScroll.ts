import { useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { hideNavBar, showNavBar } from '../components/GlassNavBarBridge';

const THROTTLE_MS = 80;

/**
 * Throttled scroll handler for hide/show bottom navbar.
 * Same thresholds as HomeScreen — no UX change.
 */
export function useThrottledNavBarScroll() {
  const lastScrollY = useRef(0);
  const scrollOffset = useRef(0);
  const lastRunAt = useRef(0);

  return useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const now = Date.now();
    if (now - lastRunAt.current < THROTTLE_MS) return;
    lastRunAt.current = now;

    const value = event.nativeEvent.contentOffset.y;
    const diff = value - lastScrollY.current;
    scrollOffset.current += diff;

    if (diff > 0 && scrollOffset.current < 0) scrollOffset.current = 0;
    if (diff < 0 && scrollOffset.current > 0) scrollOffset.current = 0;

    if (scrollOffset.current > 25 && value > 100) {
      hideNavBar();
    } else if (scrollOffset.current < -25 || value <= 100) {
      showNavBar();
    }

    lastScrollY.current = value;
  }, []);
}
