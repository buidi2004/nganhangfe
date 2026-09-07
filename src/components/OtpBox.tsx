import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius } from '../theme';

import { useTheme } from '../context/ThemeContext';

interface OtpBoxProps {
  value?: string;
  isActive?: boolean;
}

export const OtpBox: React.FC<OtpBoxProps> = ({ value, isActive }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isActive ? colors.primary : colors.primarySoft,
          backgroundColor: isActive ? colors.primarySoft : colors.surface,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            width: 8,
            height: 8,
            borderRadius: Radius.xs,
            backgroundColor: value ? colors.primary : 'transparent',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 56,
    borderRadius: Radius.xs,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    borderRadius: Radius.xs,
  },
});
