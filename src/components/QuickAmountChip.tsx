import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Radius, Spacing, createThemedStyles, ThemeColors } from '../theme';
import { Typography } from '../theme';
import { AppText } from './typography/AppText';

import { useTheme } from '../context/ThemeContext';

interface QuickAmountChipProps {
  value: string;
  onPress: (value: string) => void;
}

export const QuickAmountChip: React.FC<QuickAmountChipProps> = ({ value, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.chip, { backgroundColor: colors.primarySoft }]} onPress={() => onPress(value)}>
      <AppText variant="caption" style={[styles.chipText, { color: colors.primaryDeep }]}>{value}</AppText>
    </TouchableOpacity>
  );
};

const styles = createThemedStyles((colors: ThemeColors) => ({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: Radius.pill,
  },
  chipText: {
    color: colors.primaryDeep,
  },
}));
