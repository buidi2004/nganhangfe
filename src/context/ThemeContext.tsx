import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  lightColors,
  ThemeColors,
  ThemeMode,
  ThemeColorId,
  getThemeColors,
  setActiveThemeColors,
  THEME_OPTIONS,
  ThemeOption,
} from '../theme';

const THEME_MODE_STORAGE_KEY = '@app_theme_mode';
const THEME_COLOR_STORAGE_KEY = '@app_theme_color';

interface ThemeContextType {
  themeMode: ThemeMode;
  themeColor: ThemeColorId;
  isDark: boolean;
  colors: ThemeColors;
  themeOptions: ThemeOption[];
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setThemeColor: (color: ThemeColorId) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  themeColor: 'lotus',
  isDark: false,
  colors: lightColors,
  themeOptions: THEME_OPTIONS,
  setThemeMode: async () => {},
  setThemeColor: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [themeColor, setThemeColorState] = useState<ThemeColorId>('lotus');
  const [isLoaded, setIsLoaded] = useState(false);

  // Nạp cấu hình theme và màu sắc đã lưu trong AsyncStorage
  useEffect(() => {
    let isMounted = true;
    const loadSavedPreferences = async () => {
      try {
        const [savedMode, savedColor] = await Promise.all([
          AsyncStorage.getItem(THEME_MODE_STORAGE_KEY),
          AsyncStorage.getItem(THEME_COLOR_STORAGE_KEY),
        ]);

        if (isMounted) {
          if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
            setThemeModeState(savedMode as ThemeMode);
          }
          if (
            savedColor &&
            (savedColor === 'lotus' ||
              savedColor === 'emerald' ||
              savedColor === 'ocean' ||
              savedColor === 'amber' ||
              savedColor === 'purple')
          ) {
            setThemeColorState(savedColor as ThemeColorId);
          }
        }
      } catch (err) {
        console.warn('Failed to load theme preference from AsyncStorage', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    };

    loadSavedPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Failed to save theme mode preference to AsyncStorage', err);
    }
  };

  const setThemeColor = async (color: ThemeColorId) => {
    setThemeColorState(color);
    try {
      await AsyncStorage.setItem(THEME_COLOR_STORAGE_KEY, color);
    } catch (err) {
      console.warn('Failed to save theme color preference to AsyncStorage', err);
    }
  };

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemScheme === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    const c = getThemeColors(themeColor, isDark);
    setActiveThemeColors(c);
    return c;
  }, [themeColor, isDark]);

  const value = useMemo(
    () => ({
      themeMode,
      themeColor,
      isDark,
      colors,
      themeOptions: THEME_OPTIONS,
      setThemeMode,
      setThemeColor,
    }),
    [themeMode, themeColor, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
