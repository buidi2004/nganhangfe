import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { AppText } from '../components/typography/AppText';
import { GlassCard } from '../components/GlassCard';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, createThemedStyles } from '../theme';
import { useApp } from '../context/AppContext';
import { Image } from 'expo-image';

import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const SPACING = 16;

const FINANCE_WIDGETS = [
  { id: '1', title: 'VN-INDEX', value: '1,284.56', change: '+12.4 (0.9%)', isUp: true, icon: 'trending-up-outline', colors: ['#10B981', '#059669'] },
  { id: '2', title: 'Vàng SJC', value: '81.5M', change: '-500K (-0.6%)', isUp: false, icon: 'cube-outline', colors: ['#F59E0B', '#D97706'] },
  { id: '3', title: 'Tiết kiệm', value: 'Lên tới 5.5%', change: 'Kỳ hạn 12T', isUp: true, icon: 'wallet-outline', colors: ['#3B82F6', '#2563EB'] },
];

const LIFESTYLE_SERVICES = [
  { id: '1', icon: 'airplane-outline', label: 'Vé máy bay' },
  { id: '2', icon: 'business-outline', label: 'Khách sạn' },
  { id: '3', icon: 'cart-outline', label: 'Mua sắm' },
  { id: '4', icon: 'film-outline', label: 'Vé xem phim' },
  { id: '5', icon: 'shield-checkmark-outline', label: 'Bảo hiểm số' },
  { id: '6', icon: 'trending-up-outline', label: 'Đầu tư' },
  { id: '7', icon: 'gift-outline', label: 'Ưu đãi' },
  { id: '8', icon: 'grid-outline', label: 'Xem thêm' },
];

const NEWS_FEED = [
  {
    id: '1',
    category: 'Tài chính cá nhân',
    title: 'Bí quyết Gen Z quản lý chi tiêu hiệu quả mùa lễ hội',
    time: '2 giờ trước',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '2',
    category: 'Cảnh báo bảo mật',
    title: 'Tuyệt đối không cung cấp mã OTP cho người lạ',
    time: '5 giờ trước',
    imageUrl: 'https://images.unsplash.com/photo-1614064641913-6b20ce8defc0?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '3',
    category: 'Đầu tư',
    title: 'Thị trường chứng khoán cuối năm: Đâu là điểm sáng?',
    time: '1 ngày trước',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=200&q=80',
  }
];

export default function MoreScreen({ navigation }: any) {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors);
  const { onScroll } = useHideOnScroll();
  const { user } = useApp();

  const renderFinanceWidget = (widget: typeof FINANCE_WIDGETS[0]) => (
    <LinearGradient
      key={widget.id}
      colors={widget.colors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.financeWidget}
    >
      <View style={styles.widgetHeader}>
        <Ionicons name={widget.icon as any} size={20} color="rgba(255,255,255,0.9)" />
        <AppText style={styles.widgetTitle}>{widget.title}</AppText>
      </View>
      <AppText style={styles.widgetValue}>{widget.value}</AppText>
      <View style={styles.widgetChangeRow}>
        <Ionicons 
          name={widget.isUp ? "caret-up" : "caret-down"} 
          size={16} 
          color="#FFF" 
          style={{ marginRight: 2 }}
        />
        <AppText style={styles.widgetChange}>{widget.change}</AppText>
      </View>
    </LinearGradient>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.bgBase : '#F8FAFC' }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={isDark ? colors.bgBase : '#F8FAFC'} />
      {/* Nền trang trí */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={isDark ? [colors.bgBase, '#1a0515', colors.bgBase] : ['#F8FAFC', '#F1F5F9']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={[styles.pageTitle, { color: colors.textPrimary }]}>Khám phá</AppText>

        {/* 1. User Profile VIP */}
        <TouchableOpacity style={styles.profileSection} activeOpacity={0.8} onPress={() => navigation.navigate('UserProfile')}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={user?.avatarUri ? { uri: user.avatarUri } : { uri: 'https://i.pravatar.cc/150?img=11' }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={22} color="#38BDF8" />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <AppText style={styles.profileName}>{user?.name || 'Nguyễn Văn A'}</AppText>
              <View style={styles.tierBadge}>
                <MaterialCommunityIcons name="crown" size={14} color="#FBBF24" />
                <AppText style={styles.tierText}>Hội viên SenBank Priority</AppText>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
            
            {/* Pattern Overlay */}
            <MaterialCommunityIcons name="hexagon-multiple-outline" size={120} color="rgba(255,255,255,0.03)" style={styles.bgPattern} />
          </LinearGradient>
        </TouchableOpacity>

        {/* 2. Thị trường tài chính */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tài chính & Thị trường</AppText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: SPACING }}
          >
            {FINANCE_WIDGETS.map(renderFinanceWidget)}
          </ScrollView>
        </View>

        {/* 3. Tiện ích Đời sống */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { marginLeft: SPACING, color: colors.textPrimary }]}>Tiện ích Đời sống</AppText>
          <GlassCard style={styles.lifestyleCard}>
            <View style={styles.lifestyleGrid}>
              {LIFESTYLE_SERVICES.map((item) => (
                <TouchableOpacity key={item.id} style={styles.utilityItem}>
                  <View style={[
                    styles.utilityIconWrap, 
                    { 
                      backgroundColor: colors.primarySoft,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }
                  ]}>
                    <Ionicons name={item.icon as any} size={24} color={isDark ? colors.primary : colors.primaryDeep} />
                  </View>
                  <AppText style={[styles.utilityLabel, { color: colors.textPrimary }]}>{item.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* 4. Tin tức & Khám phá */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { marginLeft: SPACING, color: colors.textPrimary }]}>Cẩm nang & Tin tức</AppText>
          <View style={{ paddingHorizontal: SPACING }}>
            {NEWS_FEED.map((news) => (
              <TouchableOpacity key={news.id} style={[styles.newsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]} activeOpacity={0.8}>
                <Image
                  source={{ uri: news.imageUrl }}
                  style={styles.newsImagePlaceholder}
                  contentFit="cover"
                />
                <View style={styles.newsInfo}>
                  <AppText style={styles.newsCategory}>{news.category}</AppText>
                  <AppText style={[styles.newsTitle, { color: colors.textPrimary }]} numberOfLines={2}>{news.title}</AppText>
                  <AppText style={styles.newsTime}>{news.time}</AppText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. Cài đặt hệ thống (Giữ lại từ bản cũ) */}
        <View style={[styles.section, { paddingHorizontal: SPACING, marginBottom: 120 }]}>
          <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Cài đặt hệ thống</AppText>
          <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Settings')}>
              <View style={styles.settingLeft}>
                <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
                <View>
                  <AppText style={[styles.settingTitle, { color: colors.textPrimary }]}>Giao diện & Chủ đề màu sắc</AppText>
                  <AppText style={{ fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 1 }}>
                    {colors.themeName} • {isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}
                  </AppText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Config')}>
              <View style={styles.settingLeft}>
                <Ionicons name="options" size={24} color={colors.primary} />
                <AppText style={[styles.settingTitle, { color: colors.textPrimary }]}>Hạn mức giao dịch NHNN</AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('SecuritySettings')}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
                <AppText style={[styles.settingTitle, { color: colors.textPrimary }]}>Cài đặt bảo mật</AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('TermsOfService')}>
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                <AppText style={[styles.settingTitle, { color: colors.textPrimary }]}>Điều khoản & Pháp lý</AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Login')}>
              <View style={styles.settingLeft}>
                <Ionicons name="log-out-outline" size={24} color={colors.error} />
                <AppText style={[styles.settingTitle, { color: colors.error }]}>Đăng xuất</AppText>
              </View>
            </TouchableOpacity>
          </GlassCard>
          
          <View style={styles.versionFooter}>
            <AppText style={styles.versionNumber}>Phiên bản SenBank v6.5.15 (763)</AppText>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingTop: 60, 
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: SPACING,
    marginBottom: 20,
  },
  profileSection: {
    paddingHorizontal: SPACING,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: Radius.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tierText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  bgPattern: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    zIndex: -1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    paddingHorizontal: SPACING,
  },
  financeWidget: {
    width: 140,
    height: 110,
    borderRadius: Radius.card,
    padding: 16,
    marginLeft: SPACING,
    justifyContent: 'space-between',
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  widgetTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  widgetValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  widgetChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetChange: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lifestyleCard: {
    marginHorizontal: SPACING,
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  utilityItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  utilityIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  utilityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: Radius.card,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newsImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  newsInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  newsCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 8,
  },
  newsTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 52,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionNumber: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  }
}));
