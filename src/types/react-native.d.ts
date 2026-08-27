import 'react-native';

declare module 'react-native' {
  export interface StatusBarProps {
    backgroundColor?: string;
    translucent?: boolean;
    barStyle?: 'default' | 'light-content' | 'dark-content';
    hidden?: boolean;
    animated?: boolean;
    networkActivityIndicatorVisible?: boolean;
    showHideTransition?: 'fade' | 'slide' | 'none';
  }
}