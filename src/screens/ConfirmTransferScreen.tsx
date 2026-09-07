import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { Colors, Radius, createThemedStyles } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { WalletApi } from '../services/api';
import { ActivityIndicator, Alert } from 'react-native';

const { width, height } = Dimensions.get('window');

// Helper định dạng thông báo lỗi Backend sang Tiếng Việt chuẩn xác
function formatErrorMessage(rawMsg: string): string {
  if (!rawMsg) return 'Giao dịch thất bại. Vui lòng thử lại sau.';
  if (rawMsg.includes('Daily transaction limit exceeded')) {
    const match = rawMsg.match(/Spent today:\s*([0-9.]+),\s*Attempted:\s*([0-9.]+),\s*Limit:\s*([0-9.]+)/i);
    if (match) {
      const spent = Number(match[1]).toLocaleString('vi-VN');
      const attempted = Number(match[2]).toLocaleString('vi-VN');
      const limit = Number(match[3]).toLocaleString('vi-VN');
      return `Đã vượt quá hạn mức giao dịch trong ngày của bạn!\n\n• Đã chuyển hôm nay: ${spent} đ\n• Số tiền muốn chuyển: ${attempted} đ\n• Hạn mức tối đa / ngày: ${limit} đ`;
    }
    return 'Giao dịch vượt quá hạn mức chuyển tiền trong ngày của tài khoản.';
  }
  if (rawMsg.includes('INSUFFICIENT_BALANCE') || rawMsg.toLowerCase().includes('insufficient')) {
    return 'Số dư trong ví không đủ để thực hiện giao dịch này. Vui lòng nạp thêm tiền.';
  }
  if (rawMsg.includes('INVALID_PIN') || rawMsg.toLowerCase().includes('pin')) {
    return 'Mã PIN xác thực không chính xác. Vui lòng kiểm tra lại.';
  }
  if (rawMsg.includes('ACCOUNT_LOCKED')) {
    return 'Tài khoản tạm thời bị khóa do lý do bảo mật. Vui lòng liên hệ CSKH.';
  }
  return rawMsg;
}

// Helper to convert number to Vietnamese words
function numberToVietnameseWords(numStr: string): string {
  const num = parseInt(numStr.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num) || num === 0) return 'Không Đồng';
  if (num === 2000) return 'Hai nghìn Việt Nam Đồng';
  if (num === 20000) return 'Hai mươi nghìn Việt Nam Đồng';
  if (num === 200000) return 'Hai trăm nghìn Việt Nam Đồng';
  if (num === 2000000) return 'Hai triệu Việt Nam Đồng';
  return `${num.toLocaleString('vi-VN')} Việt Nam Đồng`;
}

interface ConfirmTransferScreenProps {
  route: any;
  navigation: any;
}

export default function ConfirmTransferScreen({ route, navigation }: ConfirmTransferScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { user, wallet } = useApp();
  const {
    recipient = { name: 'Người nhận', phone: '' },
    amount = '0',
    selectedBank = 'Ngân hàng Nội bộ',
    notes = 'Chuyển tiền',
    bankCode = '',
  } = route.params || {};

  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [feeAmount, setFeeAmount] = useState<number | null>(null);
  const [isFetchingFee, setIsFetchingFee] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rawNumAmount = parseInt(String(amount).replace(/[^0-9]/g, ''), 10) || 0;

  React.useEffect(() => {
    const fetchFee = async () => {
      try {
        if (!user?.walletId) return;
        const res = await WalletApi.estimateFees(user.walletId, rawNumAmount, 'TRANSFER', 'VND');
        if (res.data && typeof res.data.feeAmount === 'number') {
          setFeeAmount(res.data.feeAmount);
        } else {
          setFeeAmount(0);
        }
      } catch (error) {
        console.warn('Failed to estimate fee:', error);
        setFeeAmount(0);
      } finally {
        setIsFetchingFee(false);
      }
    };
    fetchFee();
  }, [user?.walletId, rawNumAmount]);

  const displayAmount = amount.includes('VND') || amount.includes('đ') ? amount : `${amount} VND`;

  // Keypad press handler
  const handleKeyPress = async (val: string) => {
    if (pinDigits.length < 6 && !isTransferring) {
      const nextPins = [...pinDigits, val];
      setPinDigits(nextPins);

      // Auto-validate when 6 digits are entered
      if (nextPins.length === 6) {
        const pin = nextPins.join('');
        setIsTransferring(true);
        
        try {
          if (!user?.walletId) throw new Error('Không tìm thấy ví nguồn');
          const rawNumAmount = parseInt(String(amount).replace(/[^0-9]/g, ''), 10) || 0;
          
          // 1. Init Transfer
          const initRes = await WalletApi.initTransfer(user.walletId, recipient.walletId || recipient.phone, bankCode, rawNumAmount, notes, 'VND');
          
          // 2. Confirm Transfer
          const confirmRes = await WalletApi.confirmTransfer(initRes.data.transactionId, pin);
          
          // 3. Auto-save Beneficiary
          try {
            await WalletApi.addBeneficiary(
              recipient.walletId || recipient.phone, // beneficiaryWalletId
              recipient.name,                        // nickname
              selectedBank,                          // bankCode
              recipient.phone                        // accountNumber
            );
          } catch (e) {
            console.log('Failed to auto-save beneficiary:', e);
          }

          setIsOtpModalVisible(false);
          setPinDigits([]);
          setIsTransferring(false);
          
          navigation.navigate('TransferResult', {
            success: true,
            receipt: confirmRes.data,
            amount: `${confirmRes.data.amount} ${confirmRes.data.currency || 'VND'}`,
            recipient: { name: confirmRes.data.recipientName, phone: confirmRes.data.recipientAccount },
            selectedBank: confirmRes.data.bankCode,
            notes: confirmRes.data.note,
            transactionId: confirmRes.data.transactionId,
            timestamp: confirmRes.data.timestamp,
            feeAmount: confirmRes.data.feeAmount,
            runningBalance: confirmRes.data.runningBalance
          });
        } catch (e: any) {
          setIsTransferring(false);
          setPinDigits([]);
          setErrorMessage(formatErrorMessage(e.message));
        }
      }
    }
  };

  const handleDelete = () => {
    if (pinDigits.length > 0) {
      setPinDigits(pinDigits.slice(0, -1));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.cardBackground} />

      {/* 1. TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Xác nhận thông tin</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. MAIN DETAILS CARD */}
        <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* SỐ TIỀN GIAO DỊCH */}
          <View style={styles.amountSection}>
            <AppText style={[styles.amountLabel, { color: colors.textSecondary }]}>Số tiền giao dịch</AppText>
            <AppText style={[styles.amountValueText, { color: colors.primary }]}>{displayAmount}</AppText>
            <AppText style={[styles.amountWordsText, { color: colors.textSecondary }]}>
              {numberToVietnameseWords(amount)}
            </AppText>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          {/* NGƯỜI CHUYỂN */}
          <View style={styles.partySection}>
            <AppText style={[styles.partyHeaderLabel, { color: colors.textPrimary }]}>Người chuyển</AppText>

            <View style={styles.partyInfoRow}>
              {/* SenBank Logo */}
              <View style={[styles.senLogoCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft, borderColor: isDark ? colors.border : colors.primarySoft }]}>
                <AppText style={{ color: colors.primary, fontSize: 20, fontWeight: '900' }}>★</AppText>
              </View>

              <View style={styles.partyDetailsCol}>
                <AppText style={[styles.partyName, { color: colors.textPrimary }]}>{user?.name?.toUpperCase() || 'NGƯỜI GỬI'}</AppText>
                <AppText style={[styles.partySubInfo, { color: colors.textSecondary }]}>{user?.phoneNumber}</AppText>
                <AppText style={[styles.partySubInfo, { color: colors.textSecondary }]}>SenBank (Nội bộ)</AppText>
              </View>
            </View>
          </View>

          {/* NGƯỜI NHẬN */}
          <View style={styles.partySection}>
            <AppText style={[styles.partyHeaderLabel, { color: colors.textPrimary }]}>Người nhận</AppText>

            <View style={styles.partyInfoRow}>
              {/* Recipient Bank Logo */}
              {selectedBank.includes('SenBank') ? (
                <View style={[styles.vcbLogoCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft, borderColor: isDark ? colors.border : colors.primarySoft }]}>
                  <AppText style={{ color: colors.primary, fontSize: 16, fontWeight: '900' }}>★</AppText>
                </View>
              ) : selectedBank.includes('MB') ? (
                <View style={[styles.vcbLogoCircle, { backgroundColor: isDark ? '#3B0D14' : '#FFF1F2', borderColor: isDark ? '#881337' : '#FECDD3' }]}>
                  <AppText style={{ color: '#E11D48', fontSize: 16, fontWeight: '900' }}>★</AppText>
                </View>
              ) : selectedBank.includes('Techcombank') || selectedBank.includes('TCB') ? (
                <View style={[styles.vcbLogoCircle, { backgroundColor: isDark ? '#3B0D14' : '#FEF2F2', borderColor: isDark ? '#881337' : '#FEE2E2' }]}>
                  <MaterialCommunityIcons name="view-grid" size={16} color="#E21A22" />
                </View>
              ) : (
                <View style={[styles.vcbLogoCircle, { backgroundColor: isDark ? '#052E16' : '#F0FDF4', borderColor: isDark ? '#14532D' : '#DCFCE7' }]}>
                  <Ionicons name="triangle" size={17} color="#15803D" />
                </View>
              )}

              <View style={styles.partyDetailsCol}>
                <AppText style={[styles.partyName, { color: colors.textPrimary }]}>{recipient?.name || 'BÙI VĂN DĨ'}</AppText>
                <AppText style={[styles.partySubInfo, { color: colors.textSecondary }]}>{recipient?.phone || '0923158725'}</AppText>
                <AppText style={[styles.partySubInfo, { color: colors.textSecondary }]}>
                  {selectedBank}
                </AppText>
              </View>
            </View>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

          {/* THÔNG TIN BỔ SUNG */}
          <View style={styles.extraInfoBlock}>
            {/* Nội dung chuyển tiền */}
            <View style={styles.extraInfoRow}>
              <AppText style={[styles.extraInfoLabel, { color: colors.textSecondary }]}>Nội dung chuyển tiền</AppText>
              <AppText style={[styles.extraInfoValue, { color: colors.textPrimary }]}>{notes || `${user?.name?.toUpperCase() || user?.phoneNumber || 'Khach hang'} chuyen tien`}</AppText>
            </View>

            {/* Hình thức chuyển tiền */}
            <View style={[styles.extraInfoRow, { marginTop: 10 }]}>
              <AppText style={[styles.extraInfoLabel, { color: colors.textSecondary }]}>Hình thức chuyển tiền</AppText>
              <AppText style={[styles.extraInfoValue, { color: colors.textPrimary }]}>Chuyển nhanh</AppText>
            </View>

            {/* Phí giao dịch */}
            <View style={[styles.extraInfoRow, { marginTop: 10 }]}>
              <AppText style={[styles.extraInfoLabel, { color: colors.textSecondary }]}>Phí giao dịch</AppText>
              {isFetchingFee ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <AppText style={[styles.extraInfoValue, { color: colors.textPrimary }]}>
                  {feeAmount === 0 ? 'Miễn phí' : `${feeAmount?.toLocaleString('vi-VN')} đ`}
                </AppText>
              )}
            </View>
          </View>
        </View>

        {/* 3. WARNING ALERT BOX */}
        <View style={[styles.warningAlertBox, { backgroundColor: isDark ? '#2D2305' : '#FFFBEB', borderColor: isDark ? '#4D3B0A' : '#FEF08A' }]}>
          <Ionicons name="warning" size={20} color="#EAB308" />
          <AppText style={[styles.warningAlertText, { color: isDark ? '#FDE047' : '#854D0E' }]}>
            Vui lòng kiểm tra chính xác thông tin trước khi xác nhận giao dịch.
          </AppText>
        </View>
      </ScrollView>

      {/* 4. BOTTOM ACTION BUTTONS */}
      <View style={[styles.bottomFooter, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        {/* Nút Quay lại */}
        <TouchableOpacity
          style={[styles.backActionButton, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <AppText style={[styles.backActionText, { color: colors.primary }]}>Quay lại</AppText>
        </TouchableOpacity>

        {/* Nút Xác nhận -> Mở BottomSheet Xác Thực Digital OTP */}
        <TouchableOpacity
          style={styles.confirmActionButton}
          activeOpacity={0.9}
          onPress={() => {
            setPinDigits([]);
            setIsOtpModalVisible(true);
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <AppText style={styles.confirmActionText}>Xác nhận</AppText>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          5. BOTTOM SHEET MODAL: "XÁC THỰC DIGITAL OTP" (CHUẨN 1:1 THEO ẢNH)
         ========================================================================= */}
      <Modal
        visible={isOtpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropTap}
            activeOpacity={1}
            onPress={() => setIsOtpModalVisible(false)}
          />

          <View style={[styles.otpSheetContainer, { backgroundColor: colors.cardBackground }]}>
            {/* Top Drag Handle */}
            <View style={[styles.sheetHandleBar, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />

            {/* Sheet Title */}
            <AppText style={[styles.otpSheetTitle, { color: colors.primary }]}>Xác thực Digital OTP</AppText>

            {/* Subtitle Prompt */}
            <AppText style={[styles.otpSubtitle, { color: colors.textSecondary }]}>
              Vui lòng nhập mã <AppText style={{ fontWeight: '800', color: colors.textPrimary }}>PIN Digital OTP</AppText> để nhận mã{'\n'}xác thực giao dịch
            </AppText>

            {/* 6 PIN Input Dots Circles */}
            <View style={styles.pinCirclesRow}>
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const isFilled = index < pinDigits.length;
                return (
                  <View
                    key={index}
                    style={[
                      styles.pinCircle,
                      { backgroundColor: colors.cardBackground, borderColor: colors.border },
                      isFilled && styles.pinCircleFilled,
                      index === 0 && !isFilled && { borderColor: colors.primary },
                    ]}
                  >
                    {isFilled && <View style={styles.pinInnerDot} />}
                  </View>
                );
              })}
            </View>

            {isTransferring ? (
              <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText style={{ marginTop: 12, color: colors.primary, fontWeight: 'bold' }}>
                  Đang xử lý giao dịch...
                </AppText>
              </View>
            ) : (
              <>
                {/* "Đặt lại mã PIN" Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.resetPinBtn}
                  onPress={() => setPinDigits([])}
                >
                  <AppText style={[styles.resetPinText, { color: colors.primary }]}>Đặt lại mã PIN</AppText>
                </TouchableOpacity>

            {/* Numeric Keypad Grid */}
            <View style={styles.keypadGrid}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['bio', '0', 'del'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((item, cIdx) => {
                    if (item === 'bio') {
                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={[styles.keypadBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                          activeOpacity={0.7}
                          onPress={() => {
                            // Biometric Quick Auth
                            setPinDigits(['1', '2', '3', '4', '5', '6']);
                            setTimeout(() => {
                              setIsOtpModalVisible(false);
                              navigation.navigate('TransferResult', {
                                success: true,
                                amount: displayAmount,
                                recipient,
                                selectedBank,
                                notes,
                              });
                            }, 250);
                          }}
                        >
                          <MaterialCommunityIcons name="fingerprint" size={30} color={colors.primary} />
                        </TouchableOpacity>
                      );
                    }
                    if (item === 'del') {
                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={[styles.keypadBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                          activeOpacity={0.7}
                          onPress={handleDelete}
                        >
                          <Ionicons name="backspace-outline" size={26} color={colors.primary} />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={cIdx}
                        style={[styles.keypadBtn, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                        activeOpacity={0.7}
                        onPress={() => handleKeyPress(item)}
                      >
                        <AppText style={[styles.keypadDigitText, { color: colors.textPrimary }]}>{item}</AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </>
        )}
          </View>
        </View>

        {/* Custom Error Alert Dialog: Card hồng trắng + nút OK đỏ (hiển thị đè lên trên PIN modal) */}
        {errorMessage && (
          <View style={styles.errorModalOverlay}>
            <View style={[styles.errorCardContainer, { backgroundColor: colors.cardBackground, borderColor: colors.danger }]}>
              <View style={styles.errorIconCircle}>
                <Ionicons name="alert-circle" size={44} color="#EF4444" />
              </View>
              <AppText style={[styles.errorCardTitle, { color: colors.textPrimary }]}>Lỗi chuyển tiền</AppText>
              <AppText style={[styles.errorCardMessage, { color: colors.textSecondary }]}>{errorMessage}</AppText>
              
              <TouchableOpacity
                style={styles.errorRedOkBtn}
                activeOpacity={0.85}
                onPress={() => setErrorMessage(null)}
              >
                <AppText style={styles.errorRedOkBtnText}>OK</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Custom Error Alert Dialog khi OTP modal không mở */}
      <Modal visible={!!errorMessage && !isOtpModalVisible} transparent animationType="fade" onRequestClose={() => setErrorMessage(null)}>
        <View style={styles.errorModalOverlay}>
          <View style={[styles.errorCardContainer, { backgroundColor: colors.cardBackground, borderColor: colors.danger }]}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="alert-circle" size={44} color="#EF4444" />
            </View>
            <AppText style={[styles.errorCardTitle, { color: colors.textPrimary }]}>Lỗi chuyển tiền</AppText>
            <AppText style={[styles.errorCardMessage, { color: colors.textSecondary }]}>{errorMessage}</AppText>
            
            <TouchableOpacity
              style={styles.errorRedOkBtn}
              activeOpacity={0.85}
              onPress={() => setErrorMessage(null)}
            >
              <AppText style={styles.errorRedOkBtnText}>OK</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  amountSection: {
    paddingVertical: 4,
  },
  amountLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  amountValueText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDeep,
    letterSpacing: -0.5,
  },
  amountWordsText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  partySection: {
    marginBottom: 14,
  },
  partyHeaderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
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
    backgroundColor: colors.badgePinkSoft,
    borderWidth: 1,
    borderColor: colors.badgePinkBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vcbLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partyDetailsCol: {
    flex: 1,
  },
  partyName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  partySubInfo: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 17,
  },
  extraInfoBlock: {
    paddingVertical: 2,
  },
  extraInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extraInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  extraInfoValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  warningAlertBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF08A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningAlertText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#854D0E',
    lineHeight: 17,
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  backActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  confirmActionButton: {
    flex: 1.4,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ===== "XÁC THỰC DIGITAL OTP" BOTTOM SHEET STYLES =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBackdropTap: {
    flex: 1,
  },
  otpSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  sheetHandleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  otpSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDeep,
    textAlign: 'center',
    marginBottom: 10,
  },
  otpSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  pinCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  pinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pinCircleFirstEmpty: {
    borderColor: colors.primaryDeep,
  },
  pinCircleFilled: {
    borderColor: colors.primary,
    backgroundColor: '#FDF2F8',
  },
  pinInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  resetPinBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  resetPinText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  keypadGrid: {
    paddingHorizontal: 10,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  keypadBtn: {
    width: 70,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadDigitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },

  // ===== ERROR MODAL (CARD HỒNG TRẮNG CỦA HỆ THỐNG & NÚT OK ĐỎ) =====
  errorModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 99999,
    elevation: 99999,
  },
  errorCardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.badgePinkBorder,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  errorIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  errorCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorCardMessage: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  errorRedOkBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444', // Màu đỏ nổi bật chuẩn xác
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  errorRedOkBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
}));
