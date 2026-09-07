import React from 'react';
import { Text, TextProps } from 'react-native';
import { Typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

type Variant = keyof typeof Typography;

interface AppTextProps extends TextProps {
  variant?: Variant;
  children?: React.ReactNode;
}

export function AppText({ variant = 'body', style, ...rest }: AppTextProps) {
  let dynamicColor: string | undefined;
  try {
    const { colors } = useTheme();
    const variantStyle = Typography[variant];
    const isTextOnDark = variantStyle && 'color' in variantStyle && variantStyle.color === '#FFFFFF';
    dynamicColor = isTextOnDark ? '#FFFFFF' : colors.textPrimary;
  } catch {
    // Fallback nếu render ngoài ThemeProvider
  }

  const variantStyle = Typography[variant];
  return (
    <Text
      style={[
        variantStyle as any,
        dynamicColor ? { color: dynamicColor } : null,
        style,
      ]}
      {...rest}
    />
  );
}

