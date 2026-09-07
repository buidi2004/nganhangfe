import { Colors, createThemedStyles, ThemeColors } from '../theme';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { WalletApi } from '../services/api';

const { width } = Dimensions.get('window');

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankType: string;
  nickname?: string;
  isInternal?: boolean;
}

export default function BeneficiariesScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setIsLoading(true);
      const res = await WalletApi.getBeneficiaries();
      const raw = res.data || [];
      const mapped = raw.map((b: any) => {
        const code = (b.bankCode || '').toLowerCase();
        const isInternal = !b.bankCode || code.includes('sen') || code.includes('nội bộ');
        return {
          id: b.id,
          name: b.nickname || b.accountNumber,
          accountNumber: b.accountNumber || b.beneficiaryWalletId,
          bankName: isInternal ? 'SenBank (Nội bộ)' : (b.bankCode || 'Liên ngân hàng'),
          bankType: code.includes('mb') ? 'mb' :
                    code.includes('vcb') ? 'vcb' :
                    code.includes('tcb') ? 'tcb' :
                    code.includes('acb') ? 'acb' :
                    code.includes('bidv') ? 'bidv' : 'senbank',
          nickname: b.nickname,
          isInternal,
        };
      });
      setBeneficiaries(mapped);
    } catch (e) {
      console.error('Failed to get beneficiaries', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return beneficiaries;
    return beneficiaries.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.accountNumber.includes(q) ||
        (b.nickname && b.nickname.toLowerCase().includes(q)) ||
        b.bankName.toLowerCase().includes(q)
    );
  }, [beneficiaries, searchQuery]);

  const handleDeleteBeneficiary = (id: string, name: string) => {
    Alert.alert(
      'Xóa người thụ hưởng',
      `Bạn có chắc chắn muốn xóa "${name}" khỏi danh bạ người nhận đã lưu?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await WalletApi.deleteBeneficiary(id);
              setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
            } catch (e) {
              Alert.alert('Lỗi', 'Không thể xóa người nhận lúc này.');
            }
          },
        },
      ]
    );
  };

  const renderBankBadge = (bankType: string, isInternal?: boolean) => {
    if (isInternal || bankType === 'senbank') {
      return (
        <View style={[styles.bankBadge, { backgroundColor: isDark ? colors.surface : colors.primarySoft, borderColor: isDark ? colors.border : colors.primarySoft }]}>
          <Ionicons name="flower-outline" size={20} color={colors.primary} />
        </View>
      );
    }
    if (bankType === 'vcb') {
      return (
        <View style={[styles.bankBadge, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
          <Ionicons name="triangle" size={17} color="#15803D" />
        </View>
      );
    }
    if (bankType === 'tcb') {
      return (
        <View style={[styles.bankBadge, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
          <MaterialCommunityIcons name="view-grid" size={17} color="#E21A22" />
        </View>
      );
    }
    if (bankType === 'acb') {
      return (
        <View style={[styles.bankBadge, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
          <AppText style={{ color: '#0284C7', fontSize: 11, fontWeight: '900' }}>ACB</AppText>
        </View>
      );
    }
    if (bankType === 'bidv') {
      return (
        <View style={[styles.bankBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <MaterialCommunityIcons name="flower-tulip-outline" size={18} color="#0284C7" />
        </View>
      );
    }
    return (
      <View style={[styles.bankBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
        <Ionicons name="business-outline" size={18} color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Danh bạ người nhận</AppText>

        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={[
        styles.searchBarWrapper,
        { 
          backgroundColor: colors.cardBackground,
          borderColor: isDark ? colors.border : 'rgba(226, 232, 240, 0.8)',
        }
      ]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Tìm tên, số tài khoản hoặc ngân hàng..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 90 }]}
      >
        <View style={styles.sectionHeaderRow}>
          <AppText style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            Đã lưu ({filtered.length} người thụ hưởng)
          </AppText>
          {beneficiaries.length > 0 && (
            <TouchableOpacity onPress={fetchBeneficiaries}>
              <Ionicons name="refresh-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={{ marginTop: 12, color: colors.textSecondary, fontSize: 13 }}>Đang tải danh bạ...</AppText>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="people-outline" size={40} color={colors.primary} />
            </View>
            <AppText style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {searchQuery ? 'Không tìm thấy người nhận phù hợp' : 'Chưa có người thụ hưởng nào'}
            </AppText>
            <AppText style={[styles.emptySub, { color: colors.textSecondary }]}>
              {searchQuery ? 'Vui lòng kiểm tra lại từ khóa tìm kiếm' : 'Các tài khoản bạn đã chuyển tiền thành công sẽ tự động hiển thị ở đây'}
            </AppText>
          </View>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.beneficiaryCard,
                { 
                  backgroundColor: colors.cardBackground,
                  borderColor: isDark ? colors.border : 'rgba(226, 232, 240, 0.8)',
                }
              ]}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('EnterAmount', {
                  recipient: { name: item.name, phone: item.accountNumber },
                  selectedBank: item.bankName,
                })
              }
            >
              {/* Bank Badge */}
              {renderBankBadge(item.bankType, item.isInternal)}

              {/* Info */}
              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <AppText style={[styles.nameText, { color: colors.textPrimary }]}>{item.nickname || item.name}</AppText>
                  {item.isInternal ? (
                    <View style={styles.internalBadge}>
                      <AppText style={styles.internalBadgeText}>Nội bộ</AppText>
                    </View>
                  ) : (
                    <View style={styles.napasBadge}>
                      <AppText style={styles.napasBadgeText}>Napas 247</AppText>
                    </View>
                  )}
                </View>
                <AppText style={[styles.accountText, { color: colors.primary }]}>STK: {item.accountNumber}</AppText>
                <AppText style={[styles.bankText, { color: colors.textSecondary }]}>{item.bankName}</AppText>
              </View>

              {/* Action: Delete */}
              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2' }]}
                activeOpacity={0.7}
                onPress={() => handleDeleteBeneficiary(item.id, item.nickname || item.name)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FOOTER: ADD BENEFICIARY */}
      <View style={[
        styles.bottomFooter,
        { 
          backgroundColor: isDark ? colors.bgBase : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(226, 232, 240, 0.8)',
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ChooseRecipient')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <AppText style={styles.addBtnText}>Chuyển tiền & Thêm người nhận</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
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
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  beneficiaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  bankBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  internalBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  internalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  napasBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  napasBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  accountText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  bankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  addBtn: {
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
}));
