import { useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { showNavBar, hideNavBar } from '../components/GlassNavBarBridge';

export function useHideOnScroll() {
  const lastScrollY = useRef(0);
  const scrollOffset = useRef(0);

  // Auto show navbar when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      showNavBar();
    }, [])
  );

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
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

  return { onScroll };
}
