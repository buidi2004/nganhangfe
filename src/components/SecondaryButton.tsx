import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Radius, Opacity , Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { AppText } from './typography/AppText';

interface SecondaryButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: colors.primary },
        disabled ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <AppText variant="body" style={[styles.text, { color: colors.primary }, textStyle]}>
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  disabled: {
    opacity: Opacity.disabled,
  },
});
