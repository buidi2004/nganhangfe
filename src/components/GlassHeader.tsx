import { Colors } from '../theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './typography/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface GlassHeaderProps {
  title?: string;
  onBack?: () => void;
  rightIcon?: string;
  rightComponent?: React.ReactNode;
  onRightPress?: () => void;
  hasNotification?: boolean;
  variant?: 'glass' | 'solid' | 'transparent';
  textColor?: string;
  tint?: 'light' | 'dark' | 'regular';
}

export function GlassHeader({
  title,
  onBack,
  rightIcon,
  rightComponent,
  onRightPress,
  hasNotification,
  variant = 'glass',
  textColor,
  tint,
}: GlassHeaderProps) {
  const insets = useSafeAreaInsets();
  let isDark = false;
  let colors: any = {
    textPrimary: '#0F172A',
    surface: '#FFFFFF',
    border: '#E2E8F0',
  };

  try {
    const theme = useTheme();
    isDark = theme.isDark;
    colors = theme.colors;
  } catch {
    // Fallback nếu ngoài ThemeProvider
  }

  const effectiveTint = tint || (isDark ? 'dark' : 'light');
  const topPad = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 44 : 28);
  const headerHeight = topPad + 48;
  const resolvedTextColor = textColor || colors.textPrimary;

  const content = (
    <View style={[styles.innerContent, { paddingTop: topPad }]}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={resolvedTextColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.actionSpacer} />
      )}

      {title ? (
        <AppText style={[styles.title, { color: resolvedTextColor }]} numberOfLines={1}>
          {title}
        </AppText>
      ) : (
        <View style={styles.titleSpacer} />
      )}

      {rightComponent ? (
        <View style={styles.actionBtn}>{rightComponent}</View>
      ) : rightIcon && onRightPress ? (
        <TouchableOpacity
          onPress={onRightPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Ionicons name={rightIcon as any} size={22} color={resolvedTextColor} />
          {hasNotification && <View style={styles.dot} />}
        </TouchableOpacity>
      ) : (
        <View style={styles.actionSpacer} />
      )}
    </View>
  );

  if (variant === 'transparent') {
    return <View style={[styles.headerContainer, { height: headerHeight }]}>{content}</View>;
  }

  if (variant === 'solid') {
    return (
      <View
        style={[
          styles.headerContainer,
          {
            height: headerHeight,
            backgroundColor: colors.surface,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {content}
      </View>
    );
  }

  // Mặc định: Glass / BlurView
  return (
    <View style={[styles.headerContainer, { height: headerHeight }]}>
      <BlurView intensity={65} tint={effectiveTint} style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.65)',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      />
      {content}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  headerContainer: {
    width,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  innerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  title: {
    fontSize: 17.5,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    letterSpacing: -0.3,
  },
  actionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSpacer: {
    width: 40,
  },
  titleSpacer: {
    flex: 1,
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});

