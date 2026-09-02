import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'regular';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 80,
  tint = 'light',
}) => {
  // Tách riêng borderRadius từ style nếu có, mặc định là Radius.lg
  const flattenedStyle = StyleSheet.flatten(style || {});
  const radius = flattenedStyle.borderRadius ?? Radius.lg;

  return (
    <View style={[styles.shadowContainer, style]}>
      <View style={[styles.radiusContainer, { borderRadius: radius }]}>
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
        {/* Nền nhẹ để fix lỗi hiển thị nội dung trên BlurView Android */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
        <View style={styles.inner}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    ...Shadows.hero,
  },
  radiusContainer: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  inner: {
    // flex: 1 có thể làm lỗi chiều cao nếu nội dung không set flex
  },
});
