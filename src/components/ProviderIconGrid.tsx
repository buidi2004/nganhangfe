import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { AppIcon } from './icons/AppIcon';
import { Radius, Spacing, createThemedStyles, ThemeColors } from '../theme';
import { AppText } from './typography/AppText';
import { useTheme } from '../context/ThemeContext';

interface ProviderIconGridProps {
  providers: Array<{
    icon: string;
    label: string;
    onPress?: () => void;
  }>;
}

export const ProviderIconGrid: React.FC<ProviderIconGridProps> = ({ providers }) => {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {providers.map((provider, i) => (
        <TouchableOpacity
          key={i}
          style={styles.providerItem}
          onPress={provider.onPress}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, { backgroundColor: colors.primarySoft }]}>
            <AppIcon name={provider.icon as any} size="md" color={colors.primary} />
          </View>
          <AppText variant="caption" style={[styles.providerLabel, { color: colors.textPrimary }]}>{provider.label}</AppText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flexDirection: 'row',
    paddingBottom: Spacing.sm,
  },
  providerItem: {
    alignItems: 'center',
    marginRight: Spacing.md,
    minWidth: 80,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  providerLabel: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
}));
