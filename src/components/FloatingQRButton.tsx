import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from './icons/AppIcon';
import { Radius, Shadows , Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface FloatingQRButtonProps {
  onPress?: () => void;
}

export const FloatingQRButton: React.FC<FloatingQRButtonProps> = ({ onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.touchable} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={[colors.primary, colors.heroGradMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, { shadowColor: colors.shadowColor }]}
      >
        <AppIcon name="qr" size="lg" color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.hero,
  },
});
