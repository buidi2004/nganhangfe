import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Radius, Colors } from '../theme';

import { useTheme } from '../context/ThemeContext';

interface PinDotProps {
  filled?: boolean;
  masked?: boolean;
  size?: number | string;
}

export const PinDot: React.FC<PinDotProps> = ({ filled = false, masked = true, size = 16 }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.dot,
        {
          width: typeof size === 'number' ? size : parseInt(size as string) || 16,
          height: typeof size === 'number' ? size : parseInt(size as string) || 16,
          backgroundColor: filled ? colors.primary : colors.primarySoft,
          borderColor: filled ? colors.primary : colors.primarySoft,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
});
