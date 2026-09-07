import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { Radius, Colors, createThemedStyles, ThemeColors } from '../theme';
import { WalletApi } from '../services/api';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

interface LinkedBank {
  id: string;
  provider: string;
  number: string;
  cardHolderName: string;
  type?: string;
  isDefault?: boolean;
}

const POPULAR_BANKS = [
  { id: 'vcb', name: 'Vietcombank', code: 'VCB', color: '#15803D', bg: '#F0FDF4' },
  { id: 'tcb', name: 'Techcombank', code: 'TCB', color: '#E21A22', bg: '#FEF2F2' },
  { id: 'bidv', name: 'BIDV', code: 'BIDV', color: '#0284C7', bg: '#EFF6FF' },
  { id: 'mb', name: 'MBBank', code: 'MB', color: '#1E3A8A', bg: '#EFF6FF' },
  { id: 'acb', name: 'ACB', code: 'ACB', color: '#0284C7', bg: '#EFF6FF' },
  { id: 'agri', name: 'Agribank', code: 'VBA', color: '#991B1B', bg: '#FEF2F2' },
  { id: 'vtb', name: 'VietinBank', code: 'CTG', color: '#0369A1', bg: '#F0F9FF' },
  { id: 'vpb', name: 'VPBank', code: 'VPB', color: '#16A34A', bg: '#F0FDF4' },
];

export default function BankCardsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const { isDark, colors } = useTheme();

  const [banks, setBanks] = useState<LinkedBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const res = await WalletApi.getFundingSources();
      if (res.data && Array.isArray(res.data)) {
        setBanks(res.data);
      } else {
        setBanks([]);
      }
    } catch (e) {
      console.warn('Lấy danh sách thẻ từ API không thành công:', e);
      setBanks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLinkModal = () => {
    setAccountNumber('');
    setCardHolder(user?.name || '');
    setIsModalVisible(true);
  };

  const handleLinkSubmit = async () => {
    const rawNumber = accountNumber.replace(/\s/g, '');
    if (rawNumber.length < 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tài khoản hoặc số thẻ hợp lệ (tối thiểu 6 chữ số).');
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên chủ tài khoản.');
      return;
    }

    setIsSubmitting(true);
    try {
      await WalletApi.linkFundingSource(
        'BANK_ACCOUNT',
        selectedBank.name,
        rawNumber,
        cardHolder.trim().toUpperCase()
      );
      Alert.alert('Thành công', `Đã liên kết tài khoản ngân hàng ${selectedBank.name} thành công!`);
      setIsModalVisible(false);
      fetchBanks();
    } catch (e: any) {
      Alert.alert('Liên kết thất bại', e.message || 'Không thể liên kết tài khoản ngân hàng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlinkBank = (bank: LinkedBank) => {
    Alert.alert(
      'Hủy liên kết tài khoản',
      `Bạn có chắc chắn muốn hủy liên kết tài khoản ${bank.provider} (${bank.number})?`,
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Hủy liên kết',
          style: 'destructive',
          onPress: async () => {
            try {
              await WalletApi.unlinkFundingSource(bank.id);
              setBanks((prev) => prev.filter((b) => b.id !== bank.id));
              Alert.alert('Thành công', 'Đã hủy liên kết tài khoản.');
            } catch (e: any) {
              Alert.alert('Lỗi', e.message || 'Không thể hủy liên kết tài khoản. Vui lòng thử lại sau.');
            }
          },
        },
      ]
    );
  };

  const formatMaskedNumber = (num: string) => {
    if (!num) return '•••• ••••';
    const clean = num.replace(/\s/g, '');
    if (clean.includes('*') || clean.includes('•')) {
      return clean;
    }
    if (clean.length <= 4) return clean;
    return `•••• •••• ${clean.slice(-4)}`;
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

        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Ngân hàng & Thẻ liên kết</AppText>

        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 90 }]}
      >
        <View style={styles.sectionHeaderRow}>
          <AppText style={[styles.sectionHeading, { color: colors.textPrimary }]}>
            Tài khoản đã liên kết ({banks.length})
          </AppText>
          <TouchableOpacity onPress={fetchBanks}>
            <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={{ marginTop: 12, color: colors.textSecondary, fontSize: 13 }}>Đang tải danh sách ngân hàng...</AppText>
          </View>
        ) : banks.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.primarySoft }]}>
              <MaterialCommunityIcons name="bank-outline" size={42} color={colors.primary} />
            </View>
            <AppText style={[styles.emptyTitle, { color: colors.textPrimary }]}>Chưa có tài khoản liên kết</AppText>
            <AppText style={[styles.emptySub, { color: colors.textSecondary }]}>
              Liên kết tài khoản hoặc thẻ ngân hàng nội địa để nạp và rút tiền miễn phí tức thì 24/7.
            </AppText>
          </View>
        ) : (
          banks.map((bank) => (
            <View
              key={bank.id}
              style={[
                styles.bankCard,
                { 
                  backgroundColor: colors.cardBackground,
                  borderColor: isDark ? colors.border : 'rgba(226, 232, 240, 0.8)',
                }
              ]}
            >
              <View style={styles.bankTopRow}>
                {/* Bank Badge */}
                <View style={[
                  styles.bankBadge,
                  { 
                    backgroundColor: colors.badgePinkSoft,
                    borderColor: colors.badgePinkBorder,
                  }
                ]}>
                  <Ionicons name="card-outline" size={22} color={colors.primary} />
                </View>

                <View style={styles.bankInfoCol}>
                  <View style={styles.bankNameRow}>
                    <AppText style={[styles.bankNameText, { color: colors.textPrimary }]}>{bank.provider || 'Ngân hàng'}</AppText>
                    {bank.isDefault ? (
                      <View style={styles.defaultPill}>
                        <AppText style={styles.defaultPillText}>Mặc định</AppText>
                      </View>
                    ) : null}
                  </View>
                  <AppText style={[styles.bankAccountText, { color: colors.primary }]}>
                    STK: {formatMaskedNumber(bank.number)}
                  </AppText>
                  <AppText style={[styles.bankHolderText, { color: colors.textSecondary }]}>
                    Chủ tài khoản: {bank.cardHolderName || '—'}
                  </AppText>
                </View>

                {/* Delete button */}
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2' }]}
                  activeOpacity={0.7}
                  onPress={() => handleUnlinkBank(bank)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* SECURITY PROMISE CARD */}
        <View style={[
          styles.securityNoticeCard,
          { 
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0',
          }
        ]}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#10B981" style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <AppText style={[styles.secTitle, { color: isDark ? '#A7F3D0' : '#065F46' }]}>Bảo mật tiêu chuẩn PCI-DSS</AppText>
            <AppText style={[styles.secDesc, { color: isDark ? '#6EE7B7' : '#047857' }]}>
              Thông tin thẻ và tài khoản ngân hàng của bạn được mã hóa an toàn theo tiêu chuẩn bảo mật quốc tế cao nhất.
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER: ADD NEW BANK */}
      <View style={[
        styles.bottomFooter,
        { 
          backgroundColor: isDark ? colors.bgBase : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(226, 232, 240, 0.8)',
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}>
        <TouchableOpacity
          style={styles.addBankBtn}
          activeOpacity={0.9}
          onPress={handleOpenLinkModal}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <MaterialCommunityIcons name="bank-plus" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <AppText style={styles.addBankBtnText}>Liên kết ngân hàng mới</AppText>
        </TouchableOpacity>
      </View>

      {/* MODAL: LIÊN KẾT TÀI KHOẢN NGÂN HÀNG THỰC TẾ */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <AppText style={[styles.modalTitle, { color: colors.primary }]}>Liên kết tài khoản ngân hàng</AppText>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle-outline" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* 1. Chọn ngân hàng */}
                <AppText style={[styles.inputLabel, { color: colors.textPrimary }]}>Chọn ngân hàng liên kết</AppText>
                <View style={styles.bankGrid}>
                  {POPULAR_BANKS.map((b) => {
                    const isSelected = selectedBank.id === b.id;
                    return (
                      <TouchableOpacity
                        key={b.id}
                        style={[
                          styles.bankGridItem,
                          { 
                            backgroundColor: isSelected 
                              ? colors.badgePinkSoft 
                              : (isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC'),
                            borderColor: isSelected ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
                          }
                        ]}
                        onPress={() => setSelectedBank(b)}
                      >
                        <AppText style={[styles.bankItemCode, { color: isSelected ? colors.primary : colors.textPrimary }]}>{b.code}</AppText>
                        <AppText style={[styles.bankItemName, { color: colors.textSecondary }]} numberOfLines={1}>{b.name}</AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 2. Nhập số tài khoản / số thẻ */}
                <AppText style={[styles.inputLabel, { color: colors.textPrimary, marginTop: 14 }]}>Số tài khoản / Số thẻ ATM</AppText>
                <View style={[styles.inputBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC', borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.inputField, { color: colors.textPrimary }]}
                    placeholder="Nhập số tài khoản hoặc số thẻ Napas"
                    placeholderTextColor={colors.textSecondary}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="numeric"
                  />
                </View>

                {/* 3. Tên chủ tài khoản */}
                <AppText style={[styles.inputLabel, { color: colors.textPrimary, marginTop: 14 }]}>Tên chủ tài khoản (In hoa không dấu)</AppText>
                <View style={[styles.inputBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC', borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.inputField, { color: colors.textPrimary }]}
                    placeholder="NGUYEN VAN A"
                    placeholderTextColor={colors.textSecondary}
                    value={cardHolder}
                    onChangeText={(val) => setCardHolder(val.toUpperCase())}
                    autoCapitalize="characters"
                  />
                </View>
              </ScrollView>

              {/* Modal Submit Button */}
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { opacity: isSubmitting ? 0.7 : 1 }]}
                activeOpacity={0.9}
                onPress={handleLinkSubmit}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppText style={styles.modalSubmitText}>Xác nhận liên kết</AppText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  bankCard: {
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  bankTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  bankInfoCol: {
    flex: 1,
  },
  bankNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  bankNameText: {
    fontSize: 15,
    fontWeight: '800',
  },
  defaultPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  bankAccountText: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  bankHolderText: {
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
    width: 76,
    height: 76,
    borderRadius: 38,
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
  securityNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  secTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  secDesc: {
    fontSize: 11.5,
    lineHeight: 16,
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
  addBankBtn: {
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
  addBankBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankGridItem: {
    width: (width - 40 - 24) / 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  bankItemCode: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  bankItemName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputField: {
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  modalSubmitBtn: {
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalSubmitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
}));
