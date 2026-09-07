import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Radius, Shadows, createThemedStyles, ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface SolidCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SolidCard: React.FC<SolidCardProps> = ({ children, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return <View style={[styles.container, style]}>{children}</View>;
};

const getStyles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    backgroundColor: colors.surface,
    borderRadius: Radius.md,
    ...Shadows.card,
  },
}));
