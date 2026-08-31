import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/context/AppContext';
import LotusIntroAnimation from './src/components/LotusIntroAnimation';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    // Ẩn splash tĩnh NGAY khi JS bundle sẵn sàng
    await SplashScreen.hideAsync().catch(console.warn);
  }, []);

  useEffect(() => { 
    onLayoutRootView(); 
  }, [onLayoutRootView]);

  if (!introDone) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <LotusIntroAnimation
          logoSource={require('./assets/sen-hong-logo.png')}
          onFinish={() => setIntroDone(true)}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}