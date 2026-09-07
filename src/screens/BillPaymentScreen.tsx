import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { Radius, Colors, createThemedStyles } from '../theme';

interface BillPaymentScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 32 - 48) / 4; // 4 items per row with gaps

const PROVIDERS = [
  { id: '1', label: 'Điện lực\nEVN', icon: 'flash', color: '#F59E0B' },
  { id: '2', label: 'Nước sinh hoạt', icon: 'water', color: '#0EA5E9' },
  { id: '3', label: 'Internet\nTruyền hình', icon: 'wifi', color: '#8B5CF6' },
  { id: '4', label: 'Học phí\nEduPay', icon: 'school', color: '#10B981' },
  { id: '5', label: 'Cước di động\nTrả sau', icon: 'phone-portrait-outline', color: '#EC4899' },
  { id: '6', label: 'Chung cư\nPhí dịch vụ', icon: 'business', color: '#6366F1' },
  { id: '7', label: 'Truyền hình cáp', icon: 'tv-outline', color: '#F97316' },
  { id: '8', label: 'Dịch vụ công\nThuế đất', icon: 'document-text-outline', color: '#14B8A6' },
];

const SAVED_BILLS = [
  { 
    id: '1', 
    provider: 'Điện lực TP.HCM', 
    customerCode: 'PE01928374',
    amount: '350.000 đ', 
    dueDate: '15/09/2026',
    icon: 'flash',
    status: 'Chưa thanh toán'
  },
  { 
    id: '2', 
    provider: 'Nước sạch Chợ Lớn', 
    customerCode: 'WA98273645',
    amount: '180.000 đ', 
    dueDate: '20/09/2026',
    icon: 'water',
    status: 'Đã thanh toán'
  },
];

export default function BillPaymentScreen({ navigation }: BillPaymentScreenProps) {
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors);
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc danh mục dịch vụ theo từ khóa tìm kiếm
  const filteredProviders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PROVIDERS;
    return PROVIDERS.filter(p => p.label.toLowerCase().includes(q));
  }, [searchQuery]);

  // Lọc danh sách hóa đơn theo từ khóa tìm kiếm
  const filteredBills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SAVED_BILLS;
    return SAVED_BILLS.filter(
      b => b.provider.toLowerCase().includes(q) || b.customerCode.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? [colors.bgBase, colors.primaryDeep, colors.bgBase] : [colors.badgePinkBorder, colors.surface, colors.surface]}
        locations={[0, 0.25, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <AppText style={[styles.headerTitle, { color: colors.primary }]}>Thanh toán hoá đơn</AppText>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <Ionicons name="receipt-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* SEARCH BAR - REAL INTERACTIVE INPUT */}
          <View style={[
            styles.searchContainer,
            { 
              backgroundColor: colors.cardBackground,
              borderColor: isDark ? colors.border : 'rgba(226, 232, 240, 0.8)',
            }
          ]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Tìm kiếm dịch vụ, nhà cung cấp, mã KH..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* PROVIDER GRID */}
          <View style={styles.sectionContainer}>
            <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Danh mục dịch vụ</AppText>
            {filteredProviders.length === 0 ? (
              <View style={styles.emptySearchWrap}>
                <AppText style={[styles.emptySearchText, { color: colors.textSecondary }]}>
                  Không có dịch vụ nào khớp với từ khóa
                </AppText>
              </View>
            ) : (
              <View style={styles.providerGrid}>
                {filteredProviders.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.providerItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('BillInput', { provider: p.label })}
                  >
                    <View style={[
                      styles.providerIconBg, 
                      { 
                        backgroundColor: colors.primarySoft,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }
                    ]}>
                      <MaterialCommunityIcons name={p.icon as any} size={26} color={isDark ? colors.primary : colors.primaryDeep} />
                    </View>
                    <AppText style={[styles.providerLabel, { color: colors.textPrimary }]}>{p.label}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* SAVED BILLS */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hoá đơn đã lưu</AppText>
              <TouchableOpacity onPress={() => navigation.navigate('BillInput', { provider: 'Tất cả' })}>
                <AppText style={styles.seeAllText}>Thêm mới +</AppText>
              </TouchableOpacity>
            </View>

            {filteredBills.length === 0 ? (
              <View style={styles.emptySearchWrap}>
                <AppText style={[styles.emptySearchText, { color: colors.textSecondary }]}>
                  Không tìm thấy hóa đơn phù hợp
                </AppText>
              </View>
            ) : (
              <View style={styles.billsList}>
                {filteredBills.map((bill) => {
                  const isUnpaid = bill.status === 'Chưa thanh toán';
                  return (
                    <TouchableOpacity
                      key={bill.id}
                      style={[
                        styles.billCard,
                        { 
                          backgroundColor: colors.cardBackground,
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                        }
                      ]}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('BillInput', { provider: bill.provider, customerCode: bill.customerCode })}
                    >
                      <View style={[
                        styles.billIconWrap, 
                        { 
                          backgroundColor: colors.primarySoft,
                          borderColor: colors.border,
                          borderWidth: 1,
                        }
                      ]}>
                        <MaterialCommunityIcons name={bill.icon as any} size={26} color={isDark ? colors.primary : colors.primaryDeep} />
                      </View>

                      <View style={styles.billCenter}>
                        <AppText style={[styles.billProviderName, { color: colors.textPrimary }]}>{bill.provider}</AppText>
                        <AppText style={[styles.billCustomerCode, { color: colors.textSecondary }]}>Mã KH: {bill.customerCode}</AppText>
                        <AppText style={styles.billDueDate}>Kỳ cước: {bill.dueDate}</AppText>
                      </View>

                      <View style={styles.billRight}>
                        <AppText style={[styles.billAmount, !isUnpaid && { color: colors.textSecondary }]}>
                          {bill.amount}
                        </AppText>
                        <View style={[styles.statusBadge, isUnpaid ? styles.statusBadgeUnpaid : (isDark ? styles.statusBadgePaidDark : styles.statusBadgePaid)]}>
                          <AppText style={[styles.statusText, isUnpaid ? styles.statusTextUnpaid : (isDark ? styles.statusTextPaidDark : styles.statusTextPaid)]}>
                            {bill.status}
                          </AppText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          
          {/* AUTO PAY BANNER */}
          <TouchableOpacity
            style={styles.autoPayBanner}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Config')}
          >
            <LinearGradient
              colors={[colors.primaryDeep, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.autoPayContent}>
              <View style={styles.autoPayTextWrap}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Ionicons name="flash-outline" size={16} color="#FDE047" />
                  <AppText style={styles.autoPayTitle}>Đăng ký Trích nợ tự động</AppText>
                </View>
                <AppText style={styles.autoPaySub}>Thanh toán định kỳ đúng hạn, an tâm tuyệt đối không lo ngắt dịch vụ.</AppText>
              </View>
              <View style={styles.autoPayBtn}>
                <AppText style={styles.autoPayBtnText}>Đăng ký ngay</AppText>
              </View>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  providerItem: {
    width: GRID_ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 4,
  },
  providerIconBg: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  providerLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySearchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: 13.5,
    fontStyle: 'italic',
  },
  billsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.card,
    padding: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  billIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billCenter: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  billProviderName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  billCustomerCode: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  billDueDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  billRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeUnpaid: {
    backgroundColor: colors.badgePinkSoft,
  },
  statusBadgePaid: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgePaidDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextUnpaid: {
    color: colors.primary,
  },
  statusTextPaid: {
    color: '#64748B',
  },
  statusTextPaidDark: {
    color: '#94A3B8',
  },
  autoPayBanner: {
    marginHorizontal: 16,
    borderRadius: Radius.card,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  autoPayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  autoPayTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  autoPayTitle: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
  },
  autoPaySub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 17,
  },
  autoPayBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  autoPayBtnText: { color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: '800',
  },
}));
