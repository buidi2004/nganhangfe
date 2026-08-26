import React, { useState, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
  InteractionManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpoLiquidGlassNativeView } from 'expo-liquid-glass-native';
import { Typography } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ScanQRScreen from '../screens/ScanQRScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// 🌟 Custom Liquid Glass Tab Bar (Đảm bảo 100% không gián đoạn thị giác và an toàn lifecycle)
function CustomLiquidGlassTabBar({ state, descriptors, navigation }: any) {
  const [isReady, setIsReady] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // 1. Đăng ký lắng nghe sự kiện transitionEnd của React Navigation
    const unsubscribeTransition = navigation.addListener
      ? navigation.addListener('transitionEnd', () => {
          if (isMountedRef.current) {
            setIsReady(true);
          }
        })
      : null;

    // 2. Kết hợp InteractionManager để kích hoạt ngay sau khi tương tác/animation hoàn tất
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setIsReady(true);
        }
      }, 150);
      return () => clearTimeout(timer);
    });

    return () => {
      isMountedRef.current = false;
      unsubscribeTransition?.();
      interactionTask.cancel();
    };
  }, [navigation]);

  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  if (focusedOptions.tabBarStyle?.display === 'none') {
    return null;
  }

  // Nội dung 5 Icons và Nút Quét QR (Luôn hiển thị và bấm được 100% ngay từ frame đầu tiên)
  const tabContent = (
    <View style={styles.tabBarInner}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Nút Quét QR kính màu trung tâm
        if (route.name === 'QR') {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.qrTabButton}
              onPress={onPress}
              activeOpacity={0.85}
            >
              <View style={styles.qrOuterGlass}>
                <LinearGradient
                  colors={['#D2519D', '#700F43']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.qrInnerGradient}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={26} color="#FFFFFF" />
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        }

        // 4 Tab thông thường
        let IconComponent: any = Ionicons;
        let iconName = 'home';
        let label = options.title || route.name;

        if (route.name === 'HomeTab') {
          IconComponent = Ionicons;
          iconName = isFocused ? 'home' : 'home-outline';
          label = 'Trang chủ';
        } else if (route.name === 'Card') {
          IconComponent = MaterialCommunityIcons;
          iconName = isFocused ? 'credit-card-multiple' : 'credit-card-multiple-outline';
          label = 'Lịch sử';
        } else if (route.name === 'Gift') {
          IconComponent = Ionicons;
          iconName = isFocused ? 'gift' : 'gift-outline';
          label = 'Ưu đãi';
        } else if (route.name === 'More') {
          IconComponent = MaterialCommunityIcons;
          iconName = isFocused ? 'account' : 'account-outline';
          label = 'Cá nhân';
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
              <IconComponent
                name={iconName}
                size={22}
                color={isFocused ? '#700F43' : 'rgba(112, 15, 67, 0.65)'}
              />
            </View>
            <Text
              style={[
                styles.tabBarLabel,
                {
                  color: isFocused ? '#700F43' : 'rgba(112, 15, 67, 0.65)',
                  fontWeight: isFocused ? '800' : '600',
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  console.log('[DEBUG_ISREADY] isReady:', isReady);

  return (
    <View pointerEvents="box-none" style={styles.tabBarContainer}>
      {isReady ? (
        // 🌟 GIAI ĐOẠN 2: Khi màn hình đã ổn định hoàn toàn -> Dùng Native Liquid Glass
        <ExpoLiquidGlassNativeView
          tint="#FFFFFF"
          surfaceColor="rgba(255, 255, 255, 0.60)"
          blurRadius={6}
          lensX={16}
          lensY={32}
          cornerRadius={34}
          useRealtimeCapture={true}
          style={styles.glassView}
        >
          {tabContent}
        </ExpoLiquidGlassNativeView>
      ) : (
        // 🌟 GIAI ĐOẠN 1: Trong tích tắc chuyển màn -> Dùng nền BlurView kính mờ tương đương 100%
        <View style={styles.fallbackGlassView}>
          <View style={styles.backdropBase} />
          <BlurView
            intensity={Platform.OS === 'ios' ? 85 : 95}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.85)',
              'rgba(253, 242, 248, 0.65)',
              'rgba(255, 255, 255, 0.90)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {tabContent}
        </View>
      )}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomLiquidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Card" component={HistoryScreen} options={{ title: 'Lịch sử' }} />
      <Tab.Screen name="QR" component={ScanQRScreen} options={{ tabBarStyle: { display: 'none' } }} />
      <Tab.Screen name="Gift" component={PromotionsScreen} options={{ title: 'Ưu đãi' }} />
      <Tab.Screen name="More" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // 🌟 ĐIỀU CHỈNH VỊ TRÍ NAVBAR Ở ĐÂY:
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 16 : 2, 
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 34,
  },
  glassView: {
    width: '100%',
    height: 68,
    borderRadius: 34,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  fallbackGlassView: {
    width: '100%',
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  backdropBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(210, 81, 157, 0.18)',
  },
  tabBarLabel: {
    fontSize: 10.5,
    fontFamily: Typography.captionSm.fontFamily,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  qrTabButton: {
    top: -12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  qrOuterGlass: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  qrInnerGradient: {
    flex: 1,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});