import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  DeviceEventEmitter,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme';
import { AppIcon } from './icons/AppIcon';
import AnimatedRainbowPill from './AnimatedRainbowPill';

// --- WIGGLING NOTIFICATION BELL BUTTON ---
const WigglingBellButton = ({
  onPress,
  isFocused = true,
}: {
  onPress: () => void;
  isFocused?: boolean;
}) => {
  const bellRotateAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFocused) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      bellRotateAnim.stopAnimation();
      bellRotateAnim.setValue(0);
      return;
    }

    let isMounted = true;

    const runWiggle = () => {
      if (!isMounted) return;

      // Mô phỏng chuông thật bị gõ nhẹ rồi tắt dần (damped oscillation):
      // 0° → 14° → -10° → 6° → -3° → 0°
      Animated.sequence([
        Animated.timing(bellRotateAnim, {
          toValue: 14,
          duration: 75,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: -10,
          duration: 75,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 6,
          duration: 75,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: -3,
          duration: 70,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 0,
          duration: 85,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMounted) return;

        // Khoảng cách giữa các lần rung: NGẪU NHIÊN từ 4 đến 9 giây
        const nextDelay = 4000 + Math.random() * 5000;
        timeoutRef.current = setTimeout(runWiggle, nextDelay);
      });
    };

    // Lần rung đầu tiên ngẫu nhiên sau 2.5 - 4.5 giây khi vào màn hình
    const initialDelay = 2500 + Math.random() * 2000;
    timeoutRef.current = setTimeout(runWiggle, initialDelay);

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      bellRotateAnim.stopAnimation();
      bellRotateAnim.setValue(0);
    };
  }, [isFocused, bellRotateAnim]);

  const rotateInterpolated = bellRotateAnim.interpolate({
    inputRange: [-15, 0, 15],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <TouchableOpacity
      style={styles.glassHeaderBtn}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ rotate: rotateInterpolated }] }}>
        <AppIcon name="notification" size="sm" color={Colors.white} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export interface StickyCurvedHeaderProps {
  navigation: any;
  onPressMenu?: () => void;
  onPressNotifications?: () => void;
  onPressPill?: () => void;
  pillTitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function StickyCurvedHeader({
  navigation,
  onPressMenu,
  onPressNotifications,
  onPressPill,
  pillTitle = 'Dán chuyển tiền AI',
  containerStyle,
}: StickyCurvedHeaderProps) {
  const { colors } = useTheme();
  const isFocused = useIsFocused();

  const handleMenuPress = () => {
    if (onPressMenu) {
      onPressMenu();
    } else {
      DeviceEventEmitter.emit('openSideMenu');
    }
  };

  const handleNotifPress = () => {
    if (onPressNotifications) {
      onPressNotifications();
    } else {
      navigation.navigate('Notifications');
    }
  };

  const handlePillPress = () => {
    if (onPressPill) {
      onPressPill();
    } else {
      navigation.navigate('Search');
    }
  };

  return (
    <View style={[styles.stickyHeaderContainer, containerStyle]}>
      {/* 1. Lớp đổ bóng ảo (cách điệu) nằm dưới kính, thu nhỏ một chút để không lẹm viền */}
      <View style={styles.stickyHeaderShadow} />

      {/* 2. Khối kính viền cong Sen Hồng đặc trưng (bo cong sâu 48px bên TRÁI) */}
      <View style={styles.stickyHeaderWrapper}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
        
        {/* Dải màu Gradient chuẩn theo theme hiện tại */}
        <LinearGradient
          colors={colors.stickyGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Vùng phát quang uốn lượn kính mờ ở góc dưới bên trái */}
        <View style={styles.stickyLeftAura} />

        <SafeAreaView edges={['top']}>
          <View style={styles.stickyHeaderContent}>
            {/* 1. Ô Dán chuyển tiền AI dạng viên thuốc viền 7 màu chạy động */}
            <AnimatedRainbowPill
              title={pillTitle}
              height={38}
              style={{ flex: 1, marginLeft: 6 }}
              onPress={handlePillPress}
            />

            {/* 2. Cụm Icon: Chuông 🔔 rung lắc tự nhiên + 3 Gạch ☰ */}
            <View style={styles.stickyHeaderActions}>
              <WigglingBellButton
                isFocused={isFocused}
                onPress={handleNotifPress}
              />

              <TouchableOpacity
                style={styles.glassHeaderBtn}
                activeOpacity={0.7}
                onPress={handleMenuPress}
              >
                <AppIcon name="menu" size="sm" color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeaderContainer: {
    zIndex: 99,
  },
  stickyHeaderShadow: {
    position: 'absolute',
    top: 0,
    bottom: 2,
    left: 2,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderBottomLeftRadius: 46,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 16,
  },
  stickyHeaderWrapper: {
    overflow: 'hidden',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  stickyLeftAura: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 180,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: Platform.OS === 'android' ? 6 : 2,
    paddingBottom: 16,
    gap: 12,
  },
  stickyHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glassHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});
