import React from 'react';
import {
  ChevronLeft, Search, Bell, Home, History, QrCode, User, Eye, EyeOff,
  X, Check, ChevronRight, Camera, Upload, Zap, Droplet, Wifi, Phone,
  MessageCircle, Gift, HelpCircle, Landmark, CreditCard, Plus, Share2,
  Copy, AlertTriangle, CheckCircle2, XCircle, ScanLine, ArrowLeft,
  ChevronDown, Menu, PiggyBank, Coins, Smartphone, Plane, Ticket, Tag,
  ShoppingBag, ThumbsUp, Star, Play, Wallet, ArrowRightLeft, CircleDollarSign,
  Grid, LayoutGrid, Layers,
  ShieldCheck, ShieldPlus, Film, Clapperboard, ShoppingCart, TrendingUp, ChartLine,
  type LucideIcon,
} from 'lucide-react-native';
import { Colors } from '../../theme';

// Chỉ import icon nào thực sự dùng — KHÔNG import cả object `icons` của lucide,
// làm vậy sẽ mất tree-shaking và bundle toàn bộ thư viện.
const ICON_MAP: Record<string, LucideIcon> = {
  back: ChevronLeft,
  arrowLeft: ArrowLeft,
  search: Search,
  notification: Bell,
  home: Home,
  history: History,
  qr: QrCode,
  profile: User,
  eye: Eye,
  eyeOff: EyeOff,
  close: X,
  check: Check,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  camera: Camera,
  upload: Upload,
  electricity: Zap,
  zap: Zap,
  water: Droplet,
  wifi: Wifi,
  phone: Phone,
  smartphone: Smartphone,
  chat: MessageCircle,
  gift: Gift,
  help: HelpCircle,
  bank: Landmark,
  card: CreditCard,
  cards: Layers,
  plus: Plus,
  share: Share2,
  copy: Copy,
  warning: AlertTriangle,
  success: CheckCircle2,
  fail: XCircle,
  scanFrame: ScanLine,
  menu: Menu,
  piggyBank: PiggyBank,
  coins: Coins,
  transfer: ArrowRightLeft,
  dollar: CircleDollarSign,
  plane: Plane,
  ticket: Ticket,
  tag: Tag,
  shoppingBag: ShoppingBag,
  'shopping-bag': ShoppingBag,
  cart: ShoppingCart,
  shoppingCart: ShoppingCart,
  shieldCheck: ShieldCheck,
  'shield-check': ShieldCheck,
  shieldPlus: ShieldPlus,
  'shield-plus': ShieldPlus,
  film: Film,
  clapperboard: Clapperboard,
  trendingUp: TrendingUp,
  'trending-up': TrendingUp,
  chartLine: ChartLine,
  thumbsUp: ThumbsUp,
  star: Star,
  play: Play,
  wallet: Wallet,
  grid: LayoutGrid,
};

export type IconName = keyof typeof ICON_MAP;
const SIZE_MAP = { xs: 16, sm: 20, md: 24, lg: 28, xl: 32, xxl: 48, xxxl: 80, huge: 160 } as const;

interface AppIconProps {
  name: IconName;
  size?: keyof typeof SIZE_MAP;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

export function AppIcon({
  name,
  size = 'md',
  color = Colors.textPrimary,
  strokeWidth = 1.75,
  style,
}: AppIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) {
    return null;
  }
  return (
    <Icon
      size={SIZE_MAP[size]}
      color={color}
      strokeWidth={strokeWidth}
      style={[{ backgroundColor: 'transparent' }, style]}
    />
  );
}
