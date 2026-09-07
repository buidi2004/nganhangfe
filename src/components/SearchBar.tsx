import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { AppIcon } from './icons/AppIcon';
import { Radius, Spacing, createThemedStyles, ThemeColors } from '../theme';
import { Typography } from '../theme';
import { AppText } from './typography/AppText';

import { useTheme } from '../context/ThemeContext';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm...',
  showCancel,
  onCancel,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <AppIcon name="search" size="sm" color={colors.textSecondary} />
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
      {showCancel && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <AppText variant="body" style={[styles.cancelText, { color: colors.primary }]}>Huỷ</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  cancelBtn: {
    marginLeft: Spacing.sm,
  },
  cancelText: {
    color: colors.primary,
  },
}));
