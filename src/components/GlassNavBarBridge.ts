import { Animated } from 'react-native';

// Global animated value for bottom navbar translation
export const navBarTranslateY = new Animated.Value(0);

let isHidden = false;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

type NavBarHiddenListener = (hidden: boolean) => void;
const hiddenListeners = new Set<NavBarHiddenListener>();

function notifyHidden(hidden: boolean) {
  hiddenListeners.forEach((fn) => fn(hidden));
}

export function subscribeNavBarHidden(listener: NavBarHiddenListener) {
  hiddenListeners.add(listener);
  listener(isHidden);
  return () => hiddenListeners.delete(listener);
}

export const showNavBar = () => {
  if (!isHidden) return;
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    if (!isHidden) return;
    isHidden = false;
    notifyHidden(false);
    Animated.timing(navBarTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      duration: 250,
    }).start();
  }, 16);
};

export const hideNavBar = () => {
  if (isHidden) return;
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    if (isHidden) return;
    isHidden = true;
    notifyHidden(true);
    Animated.timing(navBarTranslateY, {
      toValue: 120, // push it down out of view
      useNativeDriver: true,
      duration: 250,
    }).start();
  }, 16);
};
