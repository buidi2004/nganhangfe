import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows } from '../theme';
import { useTheme } from '../context/ThemeContext';

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
  tint,
}) => {
  let isDark = false;
  let colors = Colors;
  try {
    const theme = useTheme();
    isDark = theme.isDark;
    colors = theme.colors;
  } catch {
    // Fallback nếu render ngoài ThemeProvider
  }

  const effectiveTint = tint || (isDark ? 'dark' : 'light');

  // Tách riêng borderRadius từ style nếu có, mặc định đồng bộ chuẩn ngân hàng là Radius.card (20px)
  const flattenedStyle = StyleSheet.flatten(style || {});
  const radius = flattenedStyle.borderRadius ?? Radius.card;

  return (
    <View style={[styles.shadowContainer, { borderRadius: radius }, isDark && { shadowColor: '#000000', shadowOpacity: 0.4 }, style]}>
      <View style={[styles.radiusContainer, { borderRadius: radius, borderColor: colors.glassBorder }]}>
        <BlurView
          intensity={intensity}
          tint={effectiveTint}
          style={StyleSheet.absoluteFill}
        />
        {/* Nền nhẹ để fix lỗi hiển thị nội dung trên BlurView Android & thích ứng theme */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.3)' }]} />
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
  },
  inner: {
    // flex: 1 có thể làm lỗi chiều cao nếu nội dung không set flex
  },
});

