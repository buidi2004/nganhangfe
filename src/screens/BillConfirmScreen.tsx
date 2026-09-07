import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Shadows, Spacing , Colors } from '../theme';
import { AppText } from '../components/typography/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { PinAuthModal } from '../components/PinAuthModal';
import { WalletApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

interface BillConfirmScreenProps {
  route: any;
  navigation: any;
}

export default function BillConfirmScreen({ route, navigation }: BillConfirmScreenProps) {
  const { provider = 'Tiền điện EVN', billId = 'PE010088921', amount = 350000 } = route.params || {};
  const { user, wallet, refreshBalance } = useApp();
  const { colors, isDark } = useTheme();

  const [walletBalance, setWalletBalance] = useState<number>(wallet?.balance ?? 0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (wallet?.balance !== undefined) {
      setWalletBalance(wallet.balance);
    } else if (user?.walletId) {
      WalletApi.getWallet(user.walletId)
        .then((res) => {
          if (res.data?.balance !== undefined) {
            setWalletBalance(res.data.balance);
          }
        })
        .catch((e) => console.warn('Failed to load wallet balance:', e));
    }
  }, [user?.walletId, wallet?.balance]);

  const displayAmount = amount.toLocaleString('vi-VN') + ' đ';

  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('điện')) return 'flash-outline';
    if (lower.includes('nước')) return 'water-outline';
    if (lower.includes('internet') || lower.includes('mạng')) return 'wifi-outline';
    return 'receipt-outline';
  };

  const handleOpenPinModal = () => {
    if (walletBalance !== null && walletBalance < amount) {
      Alert.alert(
        'Số dư không đủ',
        `Số dư ví hiện tại (${walletBalance.toLocaleString('vi-VN')} đ) không đủ để thanh toán hóa đơn ${displayAmount}.\n\nBạn có muốn nạp thêm tiền vào ví ngay không?`,
        [
          { text: 'Đóng', style: 'cancel' },
          {
            text: 'Nạp tiền ngay',
            onPress: () => navigation.navigate('Deposit'),
          },
        ]
      );
      return;
    }
    setShowPinModal(true);
  };

  const handleConfirmPin = async (pin: string) => {
    setIsProcessing(true);
    try {
      if (!user?.walletId) throw new Error('Không tìm thấy thông tin ví');

      // 1. Xác thực mã PIN với Core Banking
      try {
        await WalletApi.verifyPin(pin);
      } catch (pinErr: any) {
        setIsProcessing(false);
        Alert.alert('Mã PIN không đúng', pinErr.message || 'Mã PIN giao dịch không chính xác. Vui lòng thử lại.');
        return;
      }

      // 2. Thực hiện thanh toán hóa đơn
      const res = await WalletApi.payBill(user.walletId, billId, amount);

      // 3. Cập nhật số dư sau thanh toán
      try {
        await refreshBalance();
      } catch (refErr) {
        console.warn('refreshBalance error:', refErr);
      }

      setShowPinModal(false);
      setIsProcessing(false);

      navigation.navigate('TransferResult', {
        success: true,
        amount: displayAmount,
        recipient: { name: provider, phone: billId },
        selectedBank: 'Thanh toán hóa đơn',
        notes: `Thanh toán hóa đơn ${provider}`,
        transactionId: res.data?.id || (res.data as any)?.transactionId || `BILL${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      setIsProcessing(false);
      setShowPinModal(false);
      Alert.alert(
        'Thanh toán không thành công',
        e.message || 'Không thể hoàn tất thanh toán hóa đơn. Vui lòng kiểm tra lại số dư hoặc thử lại sau.'
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Xác nhận thanh toán</AppText>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Bill Summary Hero Card */}
        <View style={[styles.billCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name={getServiceIcon(provider) as any} size={28} color={colors.primary} />
          </View>

          <AppText style={[styles.providerName, { color: colors.textPrimary }]}>{provider}</AppText>
          <AppText style={[styles.customerCode, { color: colors.textSecondary }]}>Mã KH: {billId}</AppText>

          <View style={styles.amountBadge}>
            <AppText style={[styles.amountText, { color: colors.primary }]}>{displayAmount}</AppText>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Details list */}
          <View style={styles.specList}>
            <View style={styles.specRow}>
              <AppText style={[styles.specLabel, { color: colors.textSecondary }]}>Kỳ thanh toán</AppText>
              <AppText style={[styles.specValue, { color: colors.textPrimary }]}>Tháng 09/2026</AppText>
            </View>

            <View style={styles.specRow}>
              <AppText style={[styles.specLabel, { color: colors.textSecondary }]}>Trạng thái gạch nợ</AppText>
              <View style={[styles.instantTag, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }]}>
                <Ionicons name="flash" size={12} color={isDark ? '#34D399' : '#059669'} />
                <AppText style={[styles.instantTagText, { color: isDark ? '#34D399' : '#059669' }]}>Gạch nợ tức thì</AppText>
              </View>
            </View>

            <View style={styles.specRow}>
              <AppText style={[styles.specLabel, { color: colors.textSecondary }]}>Phí giao dịch</AppText>
              <AppText style={[styles.specValue, { color: '#10B981', fontWeight: '700' }]}>Miễn phí (0 đ)</AppText>
            </View>
          </View>
        </View>

        {/* Source Wallet Card */}
        <View style={[styles.sourceCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.sourceLeft}>
            <View style={[styles.walletIconCircle, { backgroundColor: colors.primarySoft }]}>
              <MaterialCommunityIcons name="wallet-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.walletInfo}>
              <AppText style={[styles.sourceTitle, { color: colors.textPrimary }]}>Ví Sen Hồng</AppText>
              <AppText style={[styles.sourceBalance, { color: colors.textSecondary }]}>
                Số dư: {walletBalance !== null ? `${walletBalance.toLocaleString('vi-VN')} đ` : 'Đang tải...'}
              </AppText>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        </View>

        {/* Security Assurance */}
        <View style={[styles.securityNotice, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color="#10B981" />
          <AppText style={[styles.securityNoticeText, { color: colors.textSecondary }]}>
            Giao dịch được bảo mật đa tầng chuẩn Ngân hàng Nhà nước. Hóa đơn sẽ được gạch nợ ngay khi xác thực.
          </AppText>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <View style={styles.totalRow}>
          <AppText style={[styles.totalLabel, { color: colors.textSecondary }]}>Tổng thanh toán</AppText>
          <AppText style={[styles.totalAmount, { color: colors.primary }]}>{displayAmount}</AppText>
        </View>
        <PrimaryButton
          title="Xác nhận thanh toán"
          onPress={handleOpenPinModal}
        />
      </View>

      {/* PinAuthModal */}
      <PinAuthModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handleConfirmPin}
        title="Xác thực thanh toán hóa đơn"
        subtitle={`Nhập mã PIN để thanh toán ${displayAmount} cho ${provider}`}
        isProcessing={isProcessing}
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
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  billCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  customerCode: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  amountBadge: {
    marginVertical: Spacing.xs,
  },
  amountText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: Spacing.lg,
  },
  specList: {
    width: '100%',
    gap: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 13,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  instantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  instantTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  sourceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  walletIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    gap: 2,
  },
  sourceTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sourceBalance: {
    fontSize: 12,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
});
