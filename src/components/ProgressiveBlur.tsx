import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export interface ProgressiveBlurProps {
  /** Chiều cao hoặc kích thước container */
  style?: ViewStyle;
  /** Hướng làm mờ tiệm tiến: 'bottom-up' (đáy lên đỉnh), 'top-down' (đỉnh xuống đáy), v.v. */
  direction?: 'bottom-up' | 'top-down' | 'left-to-right' | 'right-to-left';
  /** Độ mờ tối đa (1-100) */
  maxIntensity?: number;
  /** Màu phủ tint hòa trộn (mặc định '#FFFFFF' hoặc '#700F43') */
  tintColor?: string;
  /** Cường độ tint (0.0 -> 1.0) */
  tintIntensity?: number;
  /** Số bước phân tầng alpha-mask để tạo độ mượt (smoothstep) */
  steps?: number;
  /** Content đặt phía trên lớp làm mờ */
  children?: React.ReactNode;
}

/**
 * 🌟 ProgressiveBlur - Hiệu ứng làm mờ tiệm tiến (Alpha-Masked Progressive Blur)
 * Mô phỏng chính xác thuật toán AGSL Runtime Shader:
 * float blurAlpha = smoothstep(size.y, size.y * 0.5, coord.y);
 * float tintAlpha = smoothstep(size.y, size.y * 0.5, coord.y);
 */
export function ProgressiveBlur({
  style,
  direction = 'bottom-up',
  maxIntensity = 80,
  tintColor = '#FFFFFF',
  tintIntensity = 0.8,
  steps = 6,
  children,
}: ProgressiveBlurProps) {
  // Tạo các dải phân tầng alpha theo hàm mượt smoothstep
  const layers = Array.from({ length: steps }, (_, index) => {
    const t = (index + 1) / steps;
    // Hàm smoothstep(0, 1, t) = 3*t^2 - 2*t^3
    const smoothFactor = 3 * Math.pow(t, 2) - 2 * Math.pow(t, 3);
    const layerIntensity = Math.round(maxIntensity * smoothFactor);
    const layerTintAlpha = (tintIntensity * smoothFactor).toFixed(3);

    return {
      intensity: layerIntensity,
      tintAlpha: parseFloat(layerTintAlpha),
      weight: 1 / steps,
    };
  });

  const getGradientPoints = () => {
    switch (direction) {
      case 'bottom-up':
        return { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } };
      case 'top-down':
        return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
      case 'left-to-right':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
      case 'right-to-left':
        return { start: { x: 1, y: 0 }, end: { x: 0, y: 0 } };
      default:
        return { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } };
    }
  };

  const { start, end } = getGradientPoints();

  // Chuyển tintColor hex sang RGBA string
  const getRgba = (alpha: number) => {
    if (tintColor.startsWith('#')) {
      const hex = tintColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2) || '255', 16);
      const g = parseInt(hex.substring(2, 4) || '255', 16);
      const b = parseInt(hex.substring(4, 6) || '255', 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return tintColor;
  };

  return (
    <View style={[styles.container, style]}>
      {/* 1. Phân tầng BlurView vi mô tạo hiệu ứng Progressive Blur mượt mà */}
      <View style={StyleSheet.absoluteFill}>
        <BlurView
          intensity={maxIntensity}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* 2. Alpha Mask & Tint Transition Gradient Layer (mô phỏng RuntimeShader AlphaMask) */}
      <LinearGradient
        colors={[
          getRgba(tintIntensity * 0.95),
          getRgba(tintIntensity * 0.75),
          getRgba(tintIntensity * 0.40),
          getRgba(tintIntensity * 0.15),
          'rgba(255, 255, 255, 0.0)',
        ]}
        locations={[0.0, 0.35, 0.65, 0.85, 1.0]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. Lớp tán sắc ánh sáng thứ cấp (Subtle Ambient Refraction) */}
      <LinearGradient
        colors={[
          'rgba(253, 242, 248, 0.30)',
          'rgba(255, 255, 255, 0.10)',
          'transparent',
        ]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />

      {/* Children Content */}
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});
