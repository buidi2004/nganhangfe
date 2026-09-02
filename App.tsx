import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeContext';
import './src/services/notificationService';
import { setupNotificationListeners } from './src/services/notificationService';
import LotusIntroAnimation from './src/components/LotusIntroAnimation';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const unsubscribe = setupNotificationListeners();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  const handleIntroReady = useCallback(async () => {
    // Ẩn splash tĩnh NGAY KHI animation JS đã mount xong, ngăn lỗi màn đen
    await SplashScreen.hideAsync().catch(console.warn);
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      </SafeAreaProvider>

      {!introDone && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 9999, elevation: 9999 }]}>
          <LotusIntroAnimation
            logoSource={require('./assets/sen-hong-logo.png')}
            onReady={handleIntroReady}
            onFinish={() => setIntroDone(true)}
          />
        </View>
      )}
    </ThemeProvider>
  );
}