import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeColors, ThemeMode } from '../theme';

const THEME_STORAGE_KEY = '@app_theme_mode';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDark: false,
  colors: lightColors,
  setThemeMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Nạp cấu hình theme đã lưu trong AsyncStorage
  useEffect(() => {
    let isMounted = true;
    const loadSavedTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (err) {
        console.warn('Failed to load theme preference from AsyncStorage', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    };
    loadSavedTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Failed to save theme preference to AsyncStorage', err);
    }
  };

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemScheme === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const value = useMemo(() => ({
    themeMode,
    isDark,
    colors,
    setThemeMode,
  }), [themeMode, isDark, colors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
