import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * AnimatedGradientQRIcon
 * ----------------------
 * Icon quét QR đặt trên nền hình vuông bo góc (squircle) có gradient
 * TỰ CHUYỂN MÀU nhẹ nhàng theo vòng lặp (không cần tap/tương tác).
 */

// Sử dụng các định dạng tuple để TypeScript không báo lỗi khi truyền vào LinearGradient
type ColorTuple = readonly [string, string, ...string[]];

type Props = {
  size?: number;
  borderRadius?: number;
  iconColor?: string;
  palettes?: ColorTuple[];
  holdDuration?: number;
  transitionDuration?: number;
};

// Sử dụng các tông màu pastel trắng, hồng, xanh siêu nhạt như thiết kế
const DEFAULT_PALETTES: ColorTuple[] = [
  // 3 tông siêu nhạt (cũ)
  ['#F0F9FF', '#FFFFFF', '#FCE7F3'], // Xanh nhạt -> Trắng -> Hồng nhạt
  ['#FFFFFF', '#FDF2F8', '#FBCFE8'], // Trắng -> Hồng phấn -> Hồng đậm hơn tí
  ['#FCE7F3', '#F0F9FF', '#FFFFFF'], // Hồng nhạt -> Xanh nhạt -> Trắng
  // 3 tông đậm đà hơn (mới)
  ['#FBCFE8', '#F9A8D4', '#F472B6'], // Hồng phấn -> Hồng kẹo -> Hồng sen
  ['#E0E7FF', '#C7D2FE', '#A78BFA'], // Xanh tím -> Tím lila -> Tím mộng mơ
  ['#FDE68A', '#FBCFE8', '#E879F9'], // Vàng hoàng hôn -> Hồng phấn -> Tím vân anh
];

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function AnimatedGradientQRIcon({
  size = 44,
  borderRadius,
  iconColor = '#1E3A8A', // Màu navy đậm gần đen
  palettes = DEFAULT_PALETTES,
  holdDuration = 2200,
  transitionDuration = 1400,
}: Props) {
  const radius = borderRadius ?? size * 0.28;
  
  // Dùng useState (hoặc useRef kết hợp kiểm tra length) để an toàn với Fast Refresh
  // Khi palettes.length thay đổi (ví dụ từ 3 lên 6), ta phải tạo lại mảng Animated.Value
  const prevLengthRef = useRef(palettes.length);
  const opacitiesRef = useRef(palettes.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)));

  if (prevLengthRef.current !== palettes.length) {
    opacitiesRef.current = palettes.map((_, i) => new Animated.Value(i === 0 ? 1 : 0));
    prevLengthRef.current = palettes.length;
  }
  
  const opacities = opacitiesRef.current;

  useEffect(() => {
    const n = palettes.length;
    const steps: Animated.CompositeAnimation[] = [];

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      steps.push(Animated.delay(holdDuration));
      steps.push(
        Animated.parallel([
          Animated.timing(opacities[i], {
            toValue: 0,
            duration: transitionDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacities[next], {
            toValue: 1,
            duration: transitionDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
    }

    const loop = Animated.loop(Animated.sequence(steps));
    loop.start();
    return () => loop.stop();
  }, [palettes, holdDuration, transitionDuration, opacities]);

  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }}>
      {palettes.map((colors, i) => (
        <AnimatedLinearGradient
          key={i}
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity: opacities[i] }]}
        />
      ))}

      <View style={styles.iconWrap} pointerEvents="none">
        <MaterialCommunityIcons 
          name="qrcode-scan" 
          size={size * 0.65} 
          color={iconColor} 
          style={{ transform: [{ translateX: 1 }, { translateY: 1 }] }} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
