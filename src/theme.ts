// ============================================
// THEME — Central design tokens for E-Wallet
// ============================================
import { StatusBarStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export const lightColors = {
  // Background
  bgBase: '#F3F8FC',
  bgGray: '#F3F8FC',
  background: '#F8FAFC',

  // Surface
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceCard: '#FFFFFF',

  // Primary palette (Lotus Deep Pink - Hồng Sen Đậm & Hồng Cánh Sen)
  primary: '#D2519D',
  primarySoft: '#FDF2F8',
  primaryDeep: '#700F43',
  primary700: '#9D1764',
  primary800: 'rgba(157, 23, 100, 0.55)',
  primaryGlow: '#F472B6',

  // Custom Gradients
  heroGradStart: '#E4ACB2',
  heroGradMid: '#D2519D',
  heroGradEnd: '#700F43',
  lotusPink: '#D2519D',
  lotusPetal: '#E4ACB2',

  bannerDeep: '#700F43',
  navBg: '#D2519D',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.75)',

  // Border
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',

  // Icons
  iconDefault: '#64748B',
  iconActive: '#D2519D',
  iconOnHeader: '#FFFFFF',

  // Inputs
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
  inputPlaceholder: '#94A3B8',

  // Modals / Bottom Sheets
  modalBackground: '#FFFFFF',
  modalOverlay: 'rgba(0,0,0,0.5)',

  // Status & Accents
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',

  badgeRed: '#E11D48',
  badgeBlueSoft: '#FCE7F3',
  accentYellow: '#FDD349',
  ctaPill: '#F472B6',

  // Glass
  glassTint: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.65)',

  // Shadow
  shadowColor: '#D2519D',
  shadowTransparent: 'transparent',

  // Status chip soft backgrounds
  successSoft: '#D1FAD1',
  dangerSoft: '#FFD4D3',
  warningSoft: '#FFF3CD',

  // Status chip text colors
  successText: '#1A7A37',
  dangerText: '#C0392B',
  warningText: '#B36B00',

  // Promo/special gradients
  promoGradStart: '#FF6B52',
  promoGradEnd: '#FF4E50',

  // Device management icon gradient
  deviceIconGradStart: '#DCEBFF',
  deviceIconGradEnd: '#E8F4FF',

  // Base
  white: '#FFFFFF',
  black: '#000000',

  // Drag handle
  dragHandleBg: '#D0D5DD',

  // Overlay dark
  overlayDark: 'rgba(0,0,0,0.5)',

  // Custom glass/rgba overlays
  glassLight: 'rgba(255,255,255,0.3)',
  glassMedium: 'rgba(255,255,255,0.5)',
  glassStrong: 'rgba(255,255,255,0.7)',
  glassHeavy: 'rgba(255,255,255,0.8)',
  glassOpaque: 'rgba(255,255,255,0.9)',
  glassSolid: 'rgba(255,255,255,0.95)',

  // Status bar
  statusBarStyle: 'dark-content' as StatusBarStyle,
};

export const darkColors = {
  // Background (Slate 900 đậm sâu, chuẩn Material/Apple dark mode)
  bgBase: '#0B1329',
  bgGray: '#0F172A',
  background: '#0B1329',

  // Surface (Slate 800 - Nổi bật rõ rệt trên background)
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  surfaceCard: '#1E293B',

  // Primary palette (Hồng sen sáng hơn để nổi bật trên nền tối)
  primary: '#F472B6',
  primarySoft: 'rgba(244, 114, 182, 0.15)',
  primaryDeep: '#831843',
  primary700: '#BE185D',
  primary800: 'rgba(131, 24, 67, 0.7)',
  primaryGlow: '#F472B6',

  // Custom Gradients (Giữ bản sắc hoa sen rạng rỡ)
  heroGradStart: '#9D174D',
  heroGradMid: '#D2519D',
  heroGradEnd: '#500724',
  lotusPink: '#F472B6',
  lotusPetal: '#FBCFE8',

  bannerDeep: '#500724',
  navBg: '#1E293B',

  // Text (Độ tương phản cao, êm dịu mắt)
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.8)',

  // Border (Sắc nét trên nền tối, không bị chìm)
  border: '#334155',
  borderSubtle: '#1E293B',

  // Icons
  iconDefault: '#94A3B8',
  iconActive: '#F472B6',
  iconOnHeader: '#FFFFFF',

  // Inputs
  inputBackground: '#1E293B',
  inputBorder: '#475569',
  inputText: '#F8FAFC',
  inputPlaceholder: '#64748B',

  // Modals / Bottom Sheets
  modalBackground: '#1E293B',
  modalOverlay: 'rgba(0,0,0,0.75)',

  // Status & Accents
  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',

  badgeRed: '#F43F5E',
  badgeBlueSoft: 'rgba(244, 114, 182, 0.2)',
  accentYellow: '#FCD34D',
  ctaPill: '#F472B6',

  // Glass
  glassTint: 'rgba(30, 41, 59, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',

  // Shadow
  shadowColor: '#000000',
  shadowTransparent: 'transparent',

  // Status chip soft backgrounds
  successSoft: 'rgba(16, 185, 129, 0.2)',
  dangerSoft: 'rgba(239, 68, 68, 0.2)',
  warningSoft: 'rgba(245, 158, 11, 0.2)',

  // Status chip text colors
  successText: '#6EE7B7',
  dangerText: '#FCA5A5',
  warningText: '#FDE68A',

  // Promo/special gradients
  promoGradStart: '#E11D48',
  promoGradEnd: '#BE123C',

  // Device management icon gradient
  deviceIconGradStart: '#1E293B',
  deviceIconGradEnd: '#334155',

  // Base
  white: '#FFFFFF',
  black: '#000000',

  // Drag handle
  dragHandleBg: '#475569',

  // Overlay dark
  overlayDark: 'rgba(0,0,0,0.75)',

  // Custom glass/rgba overlays
  glassLight: 'rgba(255,255,255,0.06)',
  glassMedium: 'rgba(255,255,255,0.1)',
  glassStrong: 'rgba(255,255,255,0.15)',
  glassHeavy: 'rgba(255,255,255,0.2)',
  glassOpaque: 'rgba(30,41,59,0.9)',
  glassSolid: '#1E293B',

  // Status bar
  statusBarStyle: 'light-content' as StatusBarStyle,
};

export type ThemeColors = typeof lightColors;

// Tương thích ngược với các file import { Colors } cũ
export const Colors = lightColors;

export const Opacity = {
  disabled: 0.5,
  muted: 0.8,
} as const;

export const Radius = {
  none: 0,
  xs: 6,
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const Shadows = {
  card: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  hero: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  transparent: {
    shadowColor: Colors.shadowTransparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// ============================================
// TYPOGRAPHY TOKENS — Complete font scale
// All font sizes and families must use these tokens
// ============================================

export const Typography = {
  // Balance Amount
  balanceLarge: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    color: Colors.textOnDark,
    fontVariant: ['tabular-nums'] as const,
    lineHeight: 34,
  },
  // Display/Balance (largest, for amounts and balances)
  displayLarge: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 40,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
    lineHeight: 48,
  },
  display: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 32,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'] as const,
    lineHeight: 40,
  },
  
  // Headings
  headingXl: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  headingLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  headingSm: {
    fontFamily: 'Inter_600SemiBold', // Mua sắm giải trí (15-16px semi-bold)
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  
  // Body text
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  bodyMd: {
    fontFamily: 'Inter_500Medium', // Action names
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12, // Tên icon dịch vụ
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  
  // Caption/labels
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  captionSm: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11, // Label bottom nav
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  captionXs: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  badgeSmall: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.3,
    color: Colors.white,
    lineHeight: 12,
  },
  
  // Button text
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.white,
    lineHeight: 20,
  },
  buttonSm: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 18,
  },
} as const;

// Font family names for direct usage when needed
export const FontFamily = {
  manropeBold: 'Manrope_700Bold',
  manropeExtraBold: 'Manrope_800ExtraBold',
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
} as const;

// Grouped list divider color
export const ListDivider = {
  color: Colors.primarySoft,
  thickness: 1,
};
