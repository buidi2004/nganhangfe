import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppIcon } from './icons/AppIcon';
import { Radius, Spacing, createThemedStyles, ThemeColors } from '../theme';
import { AppText } from './typography/AppText';
import { useTheme } from '../context/ThemeContext';

interface BankCardRowProps {
  bankName: string;
  accountNumber: string;
  isDefault?: boolean;
  onPress?: () => void;
}

export const BankCardRow: React.FC<BankCardRowProps> = ({
  bankName,
  accountNumber,
  isDefault,
  onPress,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={[styles.bankIcon, { backgroundColor: colors.primarySoft }]}>
          <AppIcon name="bank" size="sm" color={colors.primary} />
        </View>
        <View style={styles.info}>
          <AppText variant="body" style={[styles.bankName, { color: colors.textPrimary }]}>{bankName}</AppText>
          <AppText variant="bodySm" style={[styles.accountNumber, { color: colors.textSecondary }]}>{accountNumber}</AppText>
        </View>
      </View>
      <View style={styles.rightSection}>
        {isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.primarySoft }]}>
            <AppText variant="caption" style={[styles.defaultBadgeText, { color: colors.primary }]}>Mặc định</AppText>
          </View>
        )}
        <AppIcon name="chevronRight" size="sm" color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  bankName: {
    color: colors.textPrimary,
  },
  accountNumber: {
    color: colors.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  defaultBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  defaultBadgeText: {
    color: colors.primary,
  },
}));
