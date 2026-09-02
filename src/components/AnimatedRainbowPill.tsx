import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './typography/AppText';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedRainbowPillProps {
  onPress?: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  height?: number;
  showIcon?: boolean;
}

// 7 sắc cầu vồng rực rỡ lặp lại tuần hoàn để tạo vòng lặp vô tận liền mạch (Seamless infinite loop)
const RAINBOW_COLORS: readonly [string, string, ...string[]] = [
  '#FF1A75', // Đỏ hồng
  '#FF7A00', // Cam
  '#FFD600', // Vàng
  '#00E575', // Lục
  '#00C2FF', // Lam
  '#4F46E5', // Chàm
  '#9333EA', // Tím
  '#FF1A75', // Vòng 2 lặp lại
  '#FF7A00',
  '#FFD600',
  '#00E575',
  '#00C2FF',
  '#4F46E5',
  '#9333EA',
  '#FF1A75', // Khớp chuẩn điểm đầu
];

const CYCLE_WIDTH = 320;

export default function AnimatedRainbowPill({
  onPress,
  title = 'Dán chuyển tiền AI',
  style,
  height = 40,
  showIcon = false,
}: AnimatedRainbowPillProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Chạy vô tận từ 0 đến 1, dải màu dịch chuyển từ trái sang phải liên tục
    const animation = Animated.loop(
      Animated.timing(animValue, {
        toValue: 1,
        duration: 2800, // Tốc độ trôi mượt mà, sống động
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [animValue]);

  // Chuyển động từ -CYCLE_WIDTH đến 0 (Dải gradient trôi từ TRÁI sang PHẢI liên tục)
  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-CYCLE_WIDTH, 0],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.outerContainer, { height, borderRadius: height / 2 }, style]}
    >
      {/* Lớp nền dải 7 màu chuyển động liên tục từ trái sang phải */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.animatedGradientWrap,
            {
              width: CYCLE_WIDTH * 2.5,
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={RAINBOW_COLORS}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* Lớp ruột trắng dạng viên thuốc (để lộ đúng 1.8px đường viền 7 màu chạy xung quanh) */}
      <View style={[styles.innerPill, { borderRadius: (height - 3.6) / 2 }]}>
        <AppText style={styles.pillText}>{title}</AppText>
        {showIcon && (
          <Ionicons name="sparkles" size={16} color="#D2519D" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'hidden',
    padding: 1.8, // Độ dày của viền 7 màu
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  animatedGradientWrap: {
    position: 'absolute',
    top: -50,
    bottom: -50,
    left: 0,
  },
  innerPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pillText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
