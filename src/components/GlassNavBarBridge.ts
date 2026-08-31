import { Animated } from 'react-native';

// Global animated value for bottom navbar translation
export const navBarTranslateY = new Animated.Value(0);

let isHidden = false;

export const showNavBar = () => {
  if (!isHidden) return;
  isHidden = false;
  Animated.timing(navBarTranslateY, {
    toValue: 0,
    useNativeDriver: true,
    duration: 250,
  }).start();
};

export const hideNavBar = () => {
  if (isHidden) return;
  isHidden = true;
  Animated.timing(navBarTranslateY, {
    toValue: 120, // push it down out of view
    useNativeDriver: true,
    duration: 250,
  }).start();
};
