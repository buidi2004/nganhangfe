import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { PinAuthModal } from '../components/PinAuthModal';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { WalletApi } from '../services/api';
import { Radius , Colors } from '../theme';

const { width } = Dimensions.get('window');

function numberToVietnameseWords(numStr: string): string {
  const num = parseInt(numStr.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num) || num === 0) return 'Không Đồng';
  if (num === 2000) return 'Hai nghìn Việt Nam Đồng';
  if (num === 20000) return 'Hai mươi nghìn Việt Nam Đồng';
  if (num === 200000) return 'Hai trăm nghìn Việt Nam Đồng';
  if (num === 2000000) return 'Hai triệu Việt Nam Đồng';
  return `${num.toLocaleString('vi-VN')} Việt Nam Đồng`;
}

interface WithdrawConfirmScreenProps {
  route: any;
  navigation: any;
}

export default function WithdrawConfirmScreen({ route, navigation }: WithdrawConfirmScreenProps) {
  const { user, wallet, refreshBalance } = useApp();
  const { colors, isDark } = useTheme();
  const {
    amount = '2,000',
    selectedBank = 'Ngân hàng liên kết',
    bankAccountId = 'default-bank-id',
  } = route.params || {};

  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [feeAmount, setFeeAmount] = useState<number | null>(null);
  const [isFetchingFee, setIsFetchingFee] = useState(true);

  const rawNumAmount = parseInt(String(amount).replace(/[^0-9]/g, ''), 10) || 0;
  const currentWalletId = wallet?.walletId || user?.walletId;

  useEffect(() => {
    const fetchFee = async () => {
      try {
        if (!currentWalletId) return;
        const res = await WalletApi.estimateFees(currentWalletId, rawNumAmount, 'WITHDRAWAL', 'VND');
        setFeeAmount(res.data?.feeAmount ?? 0);
      } catch (error) {
        console.warn('Lỗi tính phí:', error);
        setFeeAmount(0);
      } finally {
        setIsFetchingFee(false);
      }
    };
    fetchFee();
  }, [currentWalletId, rawNumAmount]);

  const displayAmount = String(amount).includes('VND') || String(amount).includes('đ') ? String(amount) : `${amount} VND`;

  const handlePinSubmit = async (pin: string) => {
    setIsProcessing(true);
    setPinError(null);

    try {
      if (pin.length !== 6) {
        throw new Error('Mã PIN không chính xác. Vui lòng nhập đủ 6 chữ số.');
      }

      // 1. Xác thực mã PIN với Core Banking để lấy pinToken
      let pinToken = '';
      try {
        const pinRes = await WalletApi.verifyPin(pin);
        pinToken = typeof pinRes.data === 'string' ? pinRes.data : (pinRes.data as any)?.pinToken || '';
      } catch (pinErr: any) {
        throw new Error(pinErr.message || 'Mã PIN không chính xác. Vui lòng thử lại.');
      }

      if (!pinToken) {
        throw new Error('Không thể xác thực quyền rút tiền. Vui lòng kiểm tra lại mã PIN.');
      }

      // 2. Thực hiện lệnh rút tiền
      if (!currentWalletId) {
        throw new Error('Không tìm thấy thông tin ví của người dùng.');
      }

      const withdrawRes = await WalletApi.withdraw(currentWalletId, rawNumAmount, 'VND', bankAccountId, pinToken);
      const txId = withdrawRes.data?.id || (withdrawRes.data as any)?.transactionId || `WD${Date.now()}`;

      // 3. Cập nhật số dư ví tức thì
      try {
        await refreshBalance();
      } catch (refErr) {
        console.warn('refreshBalance error:', refErr);
      }

      setIsPinModalVisible(false);
      setIsProcessing(false);

      navigation.navigate('TransferResult', {
        success: true,
        amount: displayAmount,
        recipient: { name: user?.name || 'Người dùng', phone: user?.phoneNumber || '0987654321' },
        selectedBank: selectedBank,
        notes: `Rút tiền về tài khoản ngân hàng`,
        transactionId: txId,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      setIsProcessing(false);
      setPinError(e.message || 'Giao dịch rút tiền không thành công. Vui lòng kiểm tra lại số dư hoặc hạn mức.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.cardBackground} />

      {/* 1. TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Xác nhận rút tiền</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. MAIN DETAILS CARD */}
        <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.amountSection}>
            <AppText style={[styles.amountLabel, { color: colors.textSecondary }]}>Số tiền rút</AppText>
            <AppText style={[styles.amountValueText, { color: colors.primary }]}>{displayAmount}</AppText>
            <AppText style={[styles.amountWordsText, { color: colors.textSecondary }]}>
              {numberToVietnameseWords(String(amount))}
            </AppText>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          <View style={styles.partySection}>
            <AppText style={[styles.partyHeaderLabel, { color: colors.textPrimary }]}>Nguồn rút tiền</AppText>
            <View style={styles.partyInfoRow}>
              <View style={[styles.senLogoCircle, { backgroundColor: colors.primarySoft }]}>
                <AppText style={{ color: colors.primary, fontSize: 16, fontWeight: '900' }}>★</AppText>
              </View>
              <View style={styles.partyDetailsCol}>
                <AppText style={[styles.partyName, { color: colors.textPrimary }]}>Ví SenBank của tôi</AppText>
                <AppText style={[styles.partySubInfo, { color: colors.textSecondary }]}>
                  {user?.phoneNumber || 'SĐT Của Bạn'}
                </AppText>
              </View>
            </View>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          <View style={styles.partySection}>
            <AppText style={[styles.partyHeaderLabel, { color: colors.textPrimary }]}>Tài khoản nhận</AppText>
            <View style={styles.partyInfoRow}>
              <View style={[styles.vcbLogoCircle, { backgroundColor: isDark ? '#334155' : '#E0F2FE' }]}>
                <Ionicons name="card" size={18} color="#0284C7" />
              </View>
              <View style={styles.partyDetailsCol}>
                <AppText style={[styles.partyName, { color: colors.textPrimary }]}>{selectedBank}</AppText>
                <AppText style={[styles.partySubInfo, { color: colors.textSecondary }]}>
                  Tài khoản ngân hàng liên kết
                </AppText>
              </View>
            </View>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          <View style={styles.extraInfoBlock}>
            <View style={styles.extraInfoRow}>
              <AppText style={[styles.extraInfoLabel, { color: colors.textSecondary }]}>Phí giao dịch</AppText>
              {isFetchingFee ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <AppText style={[styles.extraInfoValue, { color: colors.primary }]}>
                  {feeAmount === 0 ? 'Miễn phí' : `${feeAmount?.toLocaleString('vi-VN')} đ`}
                </AppText>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 3. BOTTOM ACTIONS */}
      <View style={[styles.bottomFooter, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.confirmActionButton}
          activeOpacity={0.9}
          onPress={() => {
            setPinError(null);
            setIsPinModalVisible(true);
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <AppText style={styles.confirmActionText}>Xác nhận rút tiền</AppText>
        </TouchableOpacity>
      </View>

      {/* 4. UNIFIED PIN AUTH MODAL */}
      <PinAuthModal
        visible={isPinModalVisible}
        onClose={() => setIsPinModalVisible(false)}
        onSuccess={handlePinSubmit}
        title="Xác nhận rút tiền"
        subtitle={`Nhập mã PIN 6 chữ số để rút ${displayAmount} về ${selectedBank}`}
        isProcessing={isProcessing}
        errorMessage={pinError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    padding: 16,
    paddingBottom: 100,
  },
  detailsCard: {
    borderRadius: Radius.card,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountValueText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  amountWordsText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  cardDivider: {
    height: 1,
    marginVertical: 16,
  },
  partySection: {
    marginBottom: 4,
  },
  partyHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  partyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  senLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vcbLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partyDetailsCol: {
    flex: 1,
  },
  partyName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  partySubInfo: {
    fontSize: 13,
  },
  extraInfoBlock: {
    marginTop: 4,
  },
  extraInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  extraInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  extraInfoValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  confirmActionButton: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
