import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppIcon } from './icons/AppIcon';
import { Radius, Spacing, createThemedStyles, ThemeColors } from '../theme';
import { AppText } from './typography/AppText';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'scanFrame',
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.primarySoft }]}>
        <AppIcon name={icon as any} size="lg" color={colors.primary} />
      </View>
      <AppText variant="headingXl" style={[styles.title, { color: colors.textPrimary }]}>{title}</AppText>
      {subtitle && <AppText variant="caption" style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</AppText>}
      {actionLabel && onAction && (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primarySoft }]} onPress={onAction}>
          <AppText variant="body" style={[styles.actionText, { color: colors.primary }]}>{actionLabel}</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: Radius.lg,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: Radius.pill,
  },
  actionText: {
    color: colors.primary,
  },
}));
