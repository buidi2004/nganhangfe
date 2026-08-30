import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

/**
 * AISearchIcon
 * ------------
 * Icon kính lúp "AI" hoạt hình lặp vòng:
 *  - Vòng tròn kính lúp bị hở 1 đoạn nhỏ (như chữ C) + tay cầm chéo.
 *  - Bên trong luân phiên: ngôi sao lấp lánh (nhấp nháy phóng to) <-> chữ "AI" (mờ dần hiện/biến mất).
 *
 * Cần cài: react-native-svg
 *   npx expo install react-native-svg
 *
 * Cách dùng:
 *   <AISearchIcon size={20} color="#64748B" />
 */

type Props = {
  size?: number;
  color?: string;
  /** Thời gian ngôi sao hoặc chữ AI "đứng yên" trước khi đổi (ms) */
  holdDuration?: number;
};

export default function AISearchIcon({
  size = 22,
  color = '#64748B',
  holdDuration = 1100,
}: Props) {
  const starOpacity = useRef(new Animated.Value(1)).current;
  const starScale = useRef(new Animated.Value(1)).current;
  const aiOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        // 1. Ngôi sao "lấp lánh" — phóng to rồi thu lại
        Animated.sequence([
          Animated.timing(starScale, {
            toValue: 1.35,
            duration: 260,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(starScale, {
            toValue: 1,
            duration: 260,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(holdDuration),
        // 2. Sao mờ dần đi, chữ "AI" hiện ra
        Animated.parallel([
          Animated.timing(starOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(aiOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(holdDuration),
        // 3. Chữ "AI" mờ dần đi, sao hiện lại — quay vòng lặp
        Animated.parallel([
          Animated.timing(aiOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(starOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [holdDuration]);

  // --- Hình học vòng tròn kính lúp (SVG) ---
  const VB = 24; // viewBox chuẩn 24x24, tự scale theo `size`
  const stroke = 2;
  const cx = VB / 2 - 1.5;
  const cy = VB / 2 - 1.5;
  const radius = VB / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const gapRatio = 0.35; // Hở rộng hơn (35%) để lấy chỗ cho ngôi sao

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
        {/* Vòng tròn kính lúp — hở 1 đoạn để giống chữ C, xoay để chỗ hở nằm ở góc trên-phải */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference * (1 - gapRatio)}, ${circumference * gapRatio}`}
          rotation={30} // Xoay để khe hở nằm đúng góc trên bên phải
          origin={`${cx}, ${cy}`}
        />
        {/* Tay cầm kính lúp (ngắn lại) */}
        <Line
          x1={cx + radius * 0.75}
          y1={cy + radius * 0.75}
          x2={VB - 3.5}
          y2={VB - 3.5}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </Svg>

      {/* Lớp nội dung động: ngôi sao <-> chữ AI */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.centerContent}>
          <Animated.Text
            style={[
              styles.star,
              {
                color,
                fontSize: size * 0.45,
                opacity: starOpacity,
                // Dời ngôi sao lên góc trên bên phải, nằm lọt vào khe hở
                transform: [
                  { translateX: size * 0.15 },
                  { translateY: -size * 0.18 },
                  { scale: starScale }
                ],
              },
            ]}
          >
            ✦
          </Animated.Text>
          <Animated.Text
            style={[
              styles.aiText,
              { 
                color, 
                fontSize: size * 0.3, 
                opacity: aiOpacity,
                transform: [{ translateX: -size * 0.04 }, { translateY: -size * 0.04 }]
              },
            ]}
          >
            AI
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    includeFontPadding: false,
  },
  aiText: {
    position: 'absolute',
    fontWeight: '800',
    includeFontPadding: false,
    letterSpacing: -0.5,
  },
});
