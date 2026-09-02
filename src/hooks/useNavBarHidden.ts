import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { subscribeNavBarHidden } from '../components/GlassNavBarBridge';

/** Tracks bottom navbar hidden state + app foreground for pausing heavy animations. */
export function useNavBarHidden() {
  const [navHidden, setNavHidden] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  useEffect(() => { subscribeNavBarHidden(setNavHidden); }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      setAppActive(next === 'active');
    });
    return () => sub.remove();
  }, []);

  return { navHidden, appActive, pauseAnimations: navHidden || !appActive };
}
