import { StyleSheet, StatusBarStyle } from 'react-native';

// ============================================
// HỆ THỐNG THEME ĐA SẮC TOÀN DIỆN (Multi-Theme System)
// ============================================

export type ThemeColorId = 'lotus' | 'emerald' | 'ocean' | 'amber' | 'purple';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeOption {
  id: ThemeColorId;
  name: string;
  subtitle: string;
  meaning: string;
  accent: string;
  previewGradient: [string, string, string];
  icon: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'lotus',
    name: 'Sen Hồng',
    subtitle: 'Hồng sen thanh khiết',
    meaning: 'Bản sắc SenBank • Tinh hoa văn hóa Việt',
    accent: '#D2519D',
    previewGradient: ['#FCE7F3', '#D2519D', '#700F43'],
    icon: 'flower-outline',
  },
  {
    id: 'emerald',
    name: 'Lam Ngọc',
    subtitle: 'Ngọc bích tài lộc',
    meaning: 'Tài lộc • Sinh sôi • Thịnh vượng',
    accent: '#0D9488',
    previewGradient: ['#99F6E4', '#0D9488', '#134E4A'],
    icon: 'leaf-outline',
  },
  {
    id: 'ocean',
    name: 'Đại Dương',
    subtitle: 'Xanh biển công nghệ',
    meaning: 'Vững chắc • Tin cậy • An toàn',
    accent: '#0284C7',
    previewGradient: ['#BAE6FD', '#0284C7', '#0C4A6E'],
    icon: 'water-outline',
  },
  {
    id: 'amber',
    name: 'Hoàng Kim',
    subtitle: 'Hổ phách vương giả',
    meaning: 'Phú quý • Hoàng gia • Sung túc',
    accent: '#D97706',
    previewGradient: ['#FDE68A', '#D97706', '#78350F'],
    icon: 'sparkles-outline',
  },
  {
    id: 'purple',
    name: 'Tím Hoàng Gia',
    subtitle: 'Thạch anh quý tộc',
    meaning: 'Quyền lực • Sang trọng • Đẳng cấp',
    accent: '#7C3AED',
    previewGradient: ['#DDD6FE', '#7C3AED', '#4C1D95'],
    icon: 'diamond-outline',
  },
];

// 1. Nền và chữ trung tính cho Light Mode
const lightBase = {
  bgBase: '#F3F8FC',
  bgGray: '#F3F8FC',
  background: '#F8FAFC',

  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceCard: '#FFFFFF',
  cardBackground: '#FFFFFF',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.75)',

  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',

  iconDefault: '#64748B',
  iconOnHeader: '#FFFFFF',

  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
  inputPlaceholder: '#94A3B8',

  modalBackground: '#FFFFFF',
  modalOverlay: 'rgba(0,0,0,0.5)',

  success: '#10B981',
  danger: '#EF4444',
  error: '#EF4444',
  warning: '#F59E0B',
  badgeRed: '#E11D48',
  accentYellow: '#FDD349',

  glassTint: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.65)',
  shadowTransparent: 'transparent',

  successSoft: '#D1FAD1',
  dangerSoft: '#FFD4D3',
  warningSoft: '#FFF3CD',
  successText: '#1A7A37',
  dangerText: '#C0392B',
  warningText: '#B36B00',

  promoGradStart: '#FF6B52',
  promoGradEnd: '#FF4E50',
  deviceIconGradStart: '#DCEBFF',
  deviceIconGradEnd: '#E8F4FF',

  white: '#FFFFFF',
  black: '#000000',
  dragHandleBg: '#D0D5DD',
  overlayDark: 'rgba(0,0,0,0.5)',

  glassLight: 'rgba(255,255,255,0.3)',
  glassMedium: 'rgba(255,255,255,0.5)',
  glassStrong: 'rgba(255,255,255,0.7)',
  glassHeavy: 'rgba(255,255,255,0.8)',
  glassOpaque: 'rgba(255,255,255,0.9)',
  glassSolid: 'rgba(255,255,255,0.95)',

  statusBarStyle: 'dark-content' as StatusBarStyle,
};

// 2. Nền và chữ trung tính cho Dark Mode
const darkBase = {
  bgBase: '#0B1329',
  bgGray: '#0F172A',
  background: '#0B1329',

  surface: '#1E293B',
  surfaceSecondary: '#161F36',
  surfaceCard: '#1E293B',
  cardBackground: '#1E293B',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255,255,255,0.75)',

  border: '#334155',
  borderSubtle: '#1E293B',

  iconDefault: '#94A3B8',
  iconOnHeader: '#FFFFFF',

  inputBackground: '#161F36',
  inputBorder: '#334155',
  inputText: '#F8FAFC',
  inputPlaceholder: '#64748B',

  modalBackground: '#1E293B',
  modalOverlay: 'rgba(0,0,0,0.75)',

  success: '#34D399',
  danger: '#F87171',
  error: '#EF4444',
  warning: '#FBBF24',
  badgeRed: '#FB7185',
  accentYellow: '#FDE047',

  glassTint: 'rgba(30,41,59,0.7)',
  glassBorder: 'rgba(255,255,255,0.1)',
  shadowTransparent: 'transparent',

  successSoft: '#064E3B',
  dangerSoft: '#7F1D1D',
  warningSoft: '#78350F',
  successText: '#6EE7B7',
  dangerText: '#FCA5A5',
  warningText: '#FDE68A',

  promoGradStart: '#E11D48',
  promoGradEnd: '#BE123C',
  deviceIconGradStart: '#1E293B',
  deviceIconGradEnd: '#334155',

  white: '#FFFFFF',
  black: '#000000',
  dragHandleBg: '#475569',
  overlayDark: 'rgba(0,0,0,0.75)',

  glassLight: 'rgba(255,255,255,0.06)',
  glassMedium: 'rgba(255,255,255,0.1)',
  glassStrong: 'rgba(255,255,255,0.15)',
  glassHeavy: 'rgba(255,255,255,0.2)',
  glassOpaque: 'rgba(30,41,59,0.9)',
  glassSolid: '#1E293B',

  statusBarStyle: 'light-content' as StatusBarStyle,
};

// 3. Định nghĩa các bảng màu (Palettes)
export type PaletteColors = {
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  primary700: string;
  primary800: string;
  primaryGlow: string;
  primaryMuted: string;
  primaryLight: string;
  primaryDark: string;
  badgePinkSoft: string;
  badgePinkBorder: string;
  heroGradStart: string;
  heroGradMid: string;
  heroGradEnd: string;
  lotusPink: string;
  lotusPetal: string;
  bannerDeep: string;
  navBg: string;
  iconActive: string;
  shadowColor: string;
  badgeBlueSoft: string;
  ctaPill: string;
  navGradient: readonly [string, string];
  stickyGrad: readonly [string, string, string];
};

const PALETTE_DEFINITIONS: Record<ThemeColorId, { light: PaletteColors; dark: PaletteColors }> = {
  // 🌸 SEN HỒNG (Mặc định bản sắc SenBank)
  lotus: {
    light: {
      primary: '#D2519D',
      primarySoft: '#FDF2F8',
      primaryDeep: '#700F43',
      primary700: '#9D1764',
      primary800: 'rgba(157, 23, 100, 0.55)',
      primaryGlow: '#F472B6',
      primaryMuted: '#FDF2F8',
      primaryLight: '#F472B6',
      primaryDark: '#B83D85',
      badgePinkSoft: '#FDF2F8',
      badgePinkBorder: '#FCE7F3',
      heroGradStart: '#E4ACB2',
      heroGradMid: '#D2519D',
      heroGradEnd: '#700F43',
      lotusPink: '#D2519D',
      lotusPetal: '#E4ACB2',
      bannerDeep: '#700F43',
      navBg: '#D2519D',
      iconActive: '#D2519D',
      shadowColor: '#D2519D',
      badgeBlueSoft: '#FCE7F3',
      ctaPill: '#F472B6',
      navGradient: ['rgba(210, 81, 157, 0.88)', 'rgba(112, 15, 67, 0.94)'],
      stickyGrad: ['rgba(228, 172, 178, 0.6)', 'rgba(210, 81, 157, 0.75)', 'rgba(112, 15, 67, 0.9)'],
    },
    dark: {
      primary: '#F472B6',
      primarySoft: 'rgba(244, 114, 182, 0.15)',
      primaryDeep: '#831843',
      primary700: '#BE185D',
      primary800: 'rgba(131, 24, 67, 0.7)',
      primaryGlow: '#F472B6',
      primaryMuted: 'rgba(244, 114, 182, 0.15)',
      primaryLight: '#F472B6',
      primaryDark: '#BE185D',
      badgePinkSoft: 'rgba(244, 114, 182, 0.15)',
      badgePinkBorder: 'rgba(244, 114, 182, 0.3)',
      heroGradStart: '#9D174D',
      heroGradMid: '#D2519D',
      heroGradEnd: '#500724',
      lotusPink: '#F472B6',
      lotusPetal: '#FBCFE8',
      bannerDeep: '#500724',
      navBg: '#1E293B',
      iconActive: '#F472B6',
      shadowColor: '#000000',
      badgeBlueSoft: 'rgba(244, 114, 182, 0.2)',
      ctaPill: '#F472B6',
      navGradient: ['rgba(157, 23, 77, 0.88)', 'rgba(80, 7, 36, 0.95)'],
      stickyGrad: ['rgba(157, 23, 77, 0.6)', 'rgba(210, 81, 157, 0.75)', 'rgba(80, 7, 36, 0.9)'],
    },
  },

  // 💎 LAM NGỌC (Ngọc Lục Bảo / Phong Thủy Sinh Sôi)
  emerald: {
    light: {
      primary: '#0D9488',
      primarySoft: '#F0FDFA',
      primaryDeep: '#134E4A',
      primary700: '#0F766E',
      primary800: 'rgba(15, 118, 110, 0.55)',
      primaryGlow: '#2DD4BF',
      primaryMuted: '#ECFDF5',
      primaryLight: '#34D399',
      primaryDark: '#047857',
      badgePinkSoft: '#ECFDF5',
      badgePinkBorder: '#A7F3D0',
      heroGradStart: '#99F6E4',
      heroGradMid: '#0D9488',
      heroGradEnd: '#134E4A',
      lotusPink: '#0D9488',
      lotusPetal: '#99F6E4',
      bannerDeep: '#134E4A',
      navBg: '#0D9488',
      iconActive: '#0D9488',
      shadowColor: '#0D9488',
      badgeBlueSoft: '#CCFBF1',
      ctaPill: '#14B8A6',
      navGradient: ['rgba(13, 148, 136, 0.88)', 'rgba(19, 78, 74, 0.95)'],
      stickyGrad: ['rgba(153, 246, 228, 0.6)', 'rgba(13, 148, 136, 0.75)', 'rgba(19, 78, 74, 0.9)'],
    },
    dark: {
      primary: '#2DD4BF',
      primarySoft: 'rgba(45, 212, 191, 0.15)',
      primaryDeep: '#134E4A',
      primary700: '#0F766E',
      primary800: 'rgba(19, 78, 74, 0.7)',
      primaryGlow: '#5EEAD4',
      primaryMuted: 'rgba(45, 212, 191, 0.15)',
      primaryLight: '#5EEAD4',
      primaryDark: '#0F766E',
      badgePinkSoft: 'rgba(45, 212, 191, 0.15)',
      badgePinkBorder: 'rgba(45, 212, 191, 0.3)',
      heroGradStart: '#0F766E',
      heroGradMid: '#0D9488',
      heroGradEnd: '#042F2E',
      lotusPink: '#2DD4BF',
      lotusPetal: '#99F6E4',
      bannerDeep: '#042F2E',
      navBg: '#1E293B',
      iconActive: '#2DD4BF',
      shadowColor: '#000000',
      badgeBlueSoft: 'rgba(45, 212, 191, 0.2)',
      ctaPill: '#2DD4BF',
      navGradient: ['rgba(15, 118, 110, 0.88)', 'rgba(4, 47, 46, 0.95)'],
      stickyGrad: ['rgba(15, 118, 110, 0.6)', 'rgba(13, 148, 136, 0.75)', 'rgba(4, 47, 46, 0.9)'],
    },
  },

  // 🌊 ĐẠI DƯƠNG (Xanh Biển Sâu Công Nghệ / Ngân Hàng Số)
  ocean: {
    light: {
      primary: '#0284C7',
      primarySoft: '#F0F9FF',
      primaryDeep: '#0C4A6E',
      primary700: '#0369A1',
      primary800: 'rgba(3, 105, 161, 0.55)',
      primaryGlow: '#38BDF8',
      primaryMuted: '#F0F9FF',
      primaryLight: '#38BDF8',
      primaryDark: '#0369A1',
      badgePinkSoft: '#F0F9FF',
      badgePinkBorder: '#BAE6FD',
      heroGradStart: '#BAE6FD',
      heroGradMid: '#0284C7',
      heroGradEnd: '#0C4A6E',
      lotusPink: '#0284C7',
      lotusPetal: '#BAE6FD',
      bannerDeep: '#0C4A6E',
      navBg: '#0284C7',
      iconActive: '#0284C7',
      shadowColor: '#0284C7',
      badgeBlueSoft: '#E0F2FE',
      ctaPill: '#38BDF8',
      navGradient: ['rgba(2, 132, 199, 0.88)', 'rgba(12, 74, 110, 0.95)'],
      stickyGrad: ['rgba(186, 230, 253, 0.6)', 'rgba(2, 132, 199, 0.75)', 'rgba(12, 74, 110, 0.9)'],
    },
    dark: {
      primary: '#38BDF8',
      primarySoft: 'rgba(56, 189, 248, 0.15)',
      primaryDeep: '#0C4A6E',
      primary700: '#0369A1',
      primary800: 'rgba(12, 74, 110, 0.7)',
      primaryGlow: '#7DD3FC',
      primaryMuted: 'rgba(56, 189, 248, 0.15)',
      primaryLight: '#7DD3FC',
      primaryDark: '#0369A1',
      badgePinkSoft: 'rgba(56, 189, 248, 0.15)',
      badgePinkBorder: 'rgba(56, 189, 248, 0.3)',
      heroGradStart: '#0369A1',
      heroGradMid: '#0284C7',
      heroGradEnd: '#082F49',
      lotusPink: '#38BDF8',
      lotusPetal: '#BAE6FD',
      bannerDeep: '#082F49',
      navBg: '#1E293B',
      iconActive: '#38BDF8',
      shadowColor: '#000000',
      badgeBlueSoft: 'rgba(56, 189, 248, 0.2)',
      ctaPill: '#38BDF8',
      navGradient: ['rgba(3, 105, 161, 0.88)', 'rgba(8, 47, 73, 0.95)'],
      stickyGrad: ['rgba(3, 105, 161, 0.6)', 'rgba(2, 132, 199, 0.75)', 'rgba(8, 47, 73, 0.9)'],
    },
  },

  // 👑 HOÀNG KIM (Hổ Phách / Vàng Son Phú Quý)
  amber: {
    light: {
      primary: '#D97706',
      primarySoft: '#FFFBEB',
      primaryDeep: '#78350F',
      primary700: '#B45309',
      primary800: 'rgba(180, 83, 9, 0.55)',
      primaryGlow: '#FBBF24',
      primaryMuted: '#FFFBEB',
      primaryLight: '#FBBF24',
      primaryDark: '#B45309',
      badgePinkSoft: '#FFFBEB',
      badgePinkBorder: '#FDE68A',
      heroGradStart: '#FDE68A',
      heroGradMid: '#D97706',
      heroGradEnd: '#78350F',
      lotusPink: '#D97706',
      lotusPetal: '#FDE68A',
      bannerDeep: '#78350F',
      navBg: '#D97706',
      iconActive: '#D97706',
      shadowColor: '#D97706',
      badgeBlueSoft: '#FEF3C7',
      ctaPill: '#F59E0B',
      navGradient: ['rgba(217, 119, 6, 0.88)', 'rgba(120, 53, 15, 0.95)'],
      stickyGrad: ['rgba(253, 230, 138, 0.6)', 'rgba(217, 119, 6, 0.75)', 'rgba(120, 53, 15, 0.9)'],
    },
    dark: {
      primary: '#FBBF24',
      primarySoft: 'rgba(251, 191, 36, 0.15)',
      primaryDeep: '#78350F',
      primary700: '#B45309',
      primary800: 'rgba(120, 53, 15, 0.7)',
      primaryGlow: '#FDE68A',
      primaryMuted: 'rgba(251, 191, 36, 0.15)',
      primaryLight: '#FDE68A',
      primaryDark: '#B45309',
      badgePinkSoft: 'rgba(251, 191, 36, 0.15)',
      badgePinkBorder: 'rgba(251, 191, 36, 0.3)',
      heroGradStart: '#B45309',
      heroGradMid: '#D97706',
      heroGradEnd: '#451A03',
      lotusPink: '#FBBF24',
      lotusPetal: '#FDE68A',
      bannerDeep: '#451A03',
      navBg: '#1E293B',
      iconActive: '#FBBF24',
      shadowColor: '#000000',
      badgeBlueSoft: 'rgba(251, 191, 36, 0.2)',
      ctaPill: '#FBBF24',
      navGradient: ['rgba(180, 83, 9, 0.88)', 'rgba(69, 26, 3, 0.95)'],
      stickyGrad: ['rgba(180, 83, 9, 0.6)', 'rgba(217, 119, 6, 0.75)', 'rgba(69, 26, 3, 0.9)'],
    },
  },

  // 🔮 TÍM HOÀNG GIA (Thạch Anh / Vương Giả Đẳng Cấp)
  purple: {
    light: {
      primary: '#7C3AED',
      primarySoft: '#F5F3FF',
      primaryDeep: '#4C1D95',
      primary700: '#6D28D9',
      primary800: 'rgba(109, 40, 217, 0.55)',
      primaryGlow: '#A78BFA',
      primaryMuted: '#FAF5FF',
      primaryLight: '#A78BFA',
      primaryDark: '#6D28D9',
      badgePinkSoft: '#FAF5FF',
      badgePinkBorder: '#DDD6FE',
      heroGradStart: '#DDD6FE',
      heroGradMid: '#7C3AED',
      heroGradEnd: '#4C1D95',
      lotusPink: '#7C3AED',
      lotusPetal: '#DDD6FE',
      bannerDeep: '#4C1D95',
      navBg: '#7C3AED',
      iconActive: '#7C3AED',
      shadowColor: '#7C3AED',
      badgeBlueSoft: '#EDE9FE',
      ctaPill: '#8B5CF6',
      navGradient: ['rgba(124, 58, 237, 0.88)', 'rgba(76, 29, 149, 0.95)'],
      stickyGrad: ['rgba(221, 214, 254, 0.6)', 'rgba(124, 58, 237, 0.75)', 'rgba(76, 29, 149, 0.9)'],
    },
    dark: {
      primary: '#A78BFA',
      primarySoft: 'rgba(167, 139, 250, 0.15)',
      primaryDeep: '#4C1D95',
      primary700: '#6D28D9',
      primary800: 'rgba(76, 29, 149, 0.7)',
      primaryGlow: '#C4B5FD',
      primaryMuted: 'rgba(167, 139, 250, 0.15)',
      primaryLight: '#C4B5FD',
      primaryDark: '#6D28D9',
      badgePinkSoft: 'rgba(167, 139, 250, 0.15)',
      badgePinkBorder: 'rgba(167, 139, 250, 0.3)',
      heroGradStart: '#6D28D9',
      heroGradMid: '#7C3AED',
      heroGradEnd: '#2E1065',
      lotusPink: '#A78BFA',
      lotusPetal: '#DDD6FE',
      bannerDeep: '#2E1065',
      navBg: '#1E293B',
      iconActive: '#A78BFA',
      shadowColor: '#000000',
      badgeBlueSoft: 'rgba(167, 139, 250, 0.2)',
      ctaPill: '#A78BFA',
      navGradient: ['rgba(109, 40, 217, 0.88)', 'rgba(46, 16, 101, 0.95)'],
      stickyGrad: ['rgba(109, 40, 217, 0.6)', 'rgba(124, 58, 237, 0.75)', 'rgba(46, 16, 101, 0.9)'],
    },
  },
};

/**
 * Hàm lấy trọn bộ mã màu ThemeColors theo palette đã chọn và chế độ tối/sáng
 */
export function getThemeColors(themeColorId: ThemeColorId = 'lotus', isDark: boolean = false) {
  const base = isDark ? darkBase : lightBase;
  const palette = PALETTE_DEFINITIONS[themeColorId] || PALETTE_DEFINITIONS.lotus;
  const colors = isDark ? palette.dark : palette.light;
  const meta = THEME_OPTIONS.find((t) => t.id === themeColorId) || THEME_OPTIONS[0];

  return {
    ...base,
    ...colors,
    themeId: themeColorId,
    themeName: meta.name,
    themeAccent: meta.accent,
  };
}

// Bảng màu mặc định ban đầu để tương thích ngược 100%
export const lightColors = getThemeColors('lotus', false);
export const darkColors = getThemeColors('lotus', true);

export type ThemeColors = ReturnType<typeof getThemeColors>;

// Live active colors store
let activeThemeColors: ThemeColors = lightColors;

export function setActiveThemeColors(newColors: ThemeColors) {
  activeThemeColors = newColors;
}

export function getActiveThemeColors(): ThemeColors {
  return activeThemeColors;
}

// Dynamic Proxy để mọi nơi import { Colors } đều tự động trỏ đến palette đang kích hoạt
export const Colors = new Proxy({} as ThemeColors, {
  get(_target, prop) {
    return activeThemeColors[prop as keyof ThemeColors];
  },
});

export const Opacity = {
  disabled: 0.5,
  muted: 0.8,
} as const;

export const Radius = {
  none: 0,
  xs: 6,
  sm: 12,
  cardSm: 16,
  md: 20,
  card: 20, // Chuẩn ngân hàng số cho Card (ATM, chi tiết giao dịch, form)
  lg: 28,
  sheet: 28, // Chuẩn cho Bottom Sheet & Modal
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
  get card() {
    return {
      shadowColor: activeThemeColors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 4,
    };
  },
  get elevated() {
    return {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 6,
    };
  },
  get hero() {
    return {
      shadowColor: activeThemeColors.shadowColor,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 8,
    };
  },
  get transparent() {
    return {
      shadowColor: activeThemeColors.shadowTransparent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    };
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
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  headingXl: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  headingLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  headingMd: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  headingSm: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  
  // Body text
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bodyXs: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  
  // Labels (form labels, section headers)
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  labelSm: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  labelXs: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
  },
  
  // Captions and helpers
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
  },
  captionSm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
  },
  captionBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
  },
  
  // Button text
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.white,
    lineHeight: 20,
  },
  get buttonSm() {
    return {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 13,
      color: activeThemeColors.primary,
      lineHeight: 18,
    };
  },
};

// Font family names for direct usage when needed
export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Manrope_800ExtraBold',
  display: 'Manrope_700Bold',
} as const;

// Grouped list divider color
export const ListDivider = {
  get color() {
    return activeThemeColors.primarySoft;
  },
  thickness: 1,
};

/**
 * Helper tạo StyleSheet có khả năng phản ứng tự động theo Theme (Themed Stylesheet Factory)
 * - Tự động cache theo reference của `colors`
 * - Khi theme thay đổi, tự động tạo lại stylesheet với màu sắc mới
 * - Đảm bảo 100% component và style đồng bộ màu sắc tức thì khi chuyển theme
 */
export function createThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  styleFactory: (colors: ThemeColors) => T
): ((colors?: ThemeColors) => T) & T {
  let cachedColors: ThemeColors | null = null;
  let cachedStyles: T | null = null;

  function getStyles(colors: ThemeColors = activeThemeColors): T {
    if (cachedStyles && cachedColors === colors) {
      return cachedStyles;
    }
    cachedColors = colors;
    cachedStyles = StyleSheet.create(styleFactory(colors));
    return cachedStyles;
  }

  return new Proxy(getStyles, {
    get(target, prop) {
      if (prop in target) {
        return (target as any)[prop];
      }
      return target(activeThemeColors)[prop as keyof T];
    },
    apply(target, _thisArg, args) {
      return target(args[0] || activeThemeColors);
    },
  }) as ((colors?: ThemeColors) => T) & T;
}
