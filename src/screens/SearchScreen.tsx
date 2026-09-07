import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Shadows, Spacing , Colors } from '../theme';
import { AppText } from '../components/typography/AppText';
import { EmptyState } from '../components/EmptyState';
import { useTheme } from '../context/ThemeContext';

interface SearchScreenProps {
  navigation: any;
}

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  screen: string;
  params?: any;
  keywords: string[];
}

const BANK_FEATURES: FeatureItem[] = [
  {
    id: 'transfer',
    title: 'Chuyển tiền nhanh 24/7',
    subtitle: 'Nội bộ SenBank & Liên ngân hàng VietQR',
    icon: 'swap-horizontal',
    screen: 'ChooseRecipient',
    keywords: ['chuyen tien', 'transfer', 'gui tien', 'ngan hang', 'vietqr', 'napas'],
  },
  {
    id: 'deposit',
    title: 'Nạp tiền vào ví',
    subtitle: 'Nạp từ ngân hàng liên kết, miễn phí 100%',
    icon: 'wallet-outline',
    screen: 'Deposit',
    keywords: ['nap tien', 'deposit', 'nap vi', 'top up'],
  },
  {
    id: 'withdraw',
    title: 'Rút tiền về tài khoản',
    subtitle: 'Rút về tài khoản ngân hàng chính chủ',
    icon: 'cash-outline',
    screen: 'Withdraw',
    keywords: ['rut tien', 'withdraw', 'rut vi', 'chuyen ve ngan hang'],
  },
  {
    id: 'scan-qr',
    title: 'Quét mã VietQR',
    subtitle: 'Thanh toán & Chuyển tiền quét mã tức thì',
    icon: 'qr-code-outline',
    screen: 'ScanQR',
    keywords: ['quet ma', 'qr', 'scan', 'vietqr', 'ma qr'],
  },
  {
    id: 'bills',
    title: 'Thanh toán hóa đơn',
    subtitle: 'Điện, nước, internet, truyền hình, học phí',
    icon: 'receipt-outline',
    screen: 'BillPayment',
    keywords: ['hoa don', 'bill', 'tien dien', 'tien nuoc', 'internet', 'hoc phi'],
  },
  {
    id: 'topup',
    title: 'Nạp tiền điện thoại',
    subtitle: 'Viettel, Vinaphone, Mobifone chiết khấu cao',
    icon: 'phone-portrait-outline',
    screen: 'PhoneRecharge',
    keywords: ['nap the', 'nap dien thoai', 'viettel', 'vina', 'mobi', 'card'],
  },
  {
    id: 'history',
    title: 'Lịch sử giao dịch & Sao kê',
    subtitle: 'Tra cứu biến động số dư và xuất file sao kê',
    icon: 'time-outline',
    screen: 'TransactionHistory',
    keywords: ['lich su', 'history', 'sao ke', 'bien dong so du', 'giao dich'],
  },
  {
    id: 'cards',
    title: 'Quản lý tài khoản ngân hàng',
    subtitle: 'Liên kết thẻ Napas & tài khoản ngân hàng',
    icon: 'card-outline',
    screen: 'BankCards',
    keywords: ['the', 'ngan hang', 'lien ket', 'the atm', 'cards'],
  },
  {
    id: 'ekyc',
    title: 'Định danh tài khoản (eKYC)',
    subtitle: 'Xác thực CCCD gắn chip & sinh trắc học',
    icon: 'shield-checkmark-outline',
    screen: 'EKyc',
    keywords: ['ekyc', 'dinh danh', 'cccd', 'xac thuc', 'kyc', 'sinh trac hoc'],
  },
  {
    id: 'limits',
    title: 'Hạn mức giao dịch',
    subtitle: 'Hạn mức ngày, tháng & Quyết định 2345',
    icon: 'speedometer-outline',
    screen: 'Config',
    keywords: ['han muc', 'limit', '2345', 'gioi han'],
  },
  {
    id: 'promos',
    title: 'Ưu đãi & Khuyến mại',
    subtitle: 'Voucher giảm giá hóa đơn & hoàn tiền',
    icon: 'gift-outline',
    screen: 'Promotions',
    keywords: ['khuyen mai', 'voucher', 'uu dai', 'giam gia', 'promo'],
  },
  {
    id: 'security',
    title: 'Cài đặt an toàn & Bảo mật',
    subtitle: 'Đổi mật khẩu, mã PIN, sinh trắc học FaceID',
    icon: 'lock-closed-outline',
    screen: 'SecuritySettings',
    keywords: ['bao mat', 'security', 'doi pin', 'mat khau', 'faceid', 'van tay'],
  },
];

const POPULAR_SEARCHES = ['Chuyển tiền', 'Tiền điện', 'Nạp thẻ', 'Sao kê', 'Hạn mức'];

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  };

  const filteredResults = useMemo(() => {
    const q = normalize(searchQuery.trim());
    if (!q) return [];
    return BANK_FEATURES.filter((item) => {
      const matchTitle = normalize(item.title).includes(q);
      const matchSub = normalize(item.subtitle).includes(q);
      const matchKey = item.keywords.some((k) => normalize(k).includes(q));
      return matchTitle || matchSub || matchKey;
    });
  }, [searchQuery]);

  const handleSelectFeature = (item: FeatureItem) => {
    navigation.navigate(item.screen, item.params);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.cardBackground} />
      {/* Search Input Bar */}
      <View style={[styles.searchBarWrapper, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={[styles.inputBox, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.textInput, { color: colors.textPrimary }]}
            placeholder="Tìm tính năng, dịch vụ, hóa đơn..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!searchQuery ? (
          <>
            {/* Recent/Popular Searches */}
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Tìm kiếm phổ biến</AppText>
              <View style={styles.chipsRow}>
                {POPULAR_SEARCHES.map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={[styles.chip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                    onPress={() => setSearchQuery(term)}
                  >
                    <Ionicons name="trending-up-outline" size={14} color={colors.primary} />
                    <AppText style={[styles.chipText, { color: colors.textPrimary }]}>{term}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Feature Grid */}
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Dịch vụ tài chính nổi bật</AppText>
              <View style={styles.grid}>
                {BANK_FEATURES.slice(0, 8).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.gridItem, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                    onPress={() => handleSelectFeature(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.gridIconCircle, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name={item.icon} size={24} color={colors.primary} />
                    </View>
                    <AppText style={[styles.gridTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </AppText>
                    <AppText style={[styles.gridSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.subtitle}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : filteredResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <AppText style={[styles.resultsHeader, { color: colors.textSecondary }]}>
              Kết quả tìm kiếm ({filteredResults.length})
            </AppText>
            {filteredResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.resultRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={() => handleSelectFeature(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.resultIconCircle, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name={item.icon} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.resultTitle, { color: colors.textPrimary }]}>{item.title}</AppText>
                  <AppText style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="search-outline"
              title={`Không tìm thấy kết quả cho "${searchQuery}"`}
              subtitle="Thử tìm kiếm với từ khóa khác như 'chuyển tiền', 'hóa đơn', 'sao kê'..."
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    ...Shadows.card,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    gap: Spacing.md,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.card,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  gridSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  resultsContainer: {
    gap: Spacing.sm,
  },
  resultsHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.card,
  },
  resultIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    marginTop: 40,
  },
});
