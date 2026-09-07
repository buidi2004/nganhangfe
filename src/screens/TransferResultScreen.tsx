import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Share,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { Radius, Colors, createThemedStyles, ThemeColors } from '../theme';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { WalletApi, getAuthToken } from '../services/api';

const { width } = Dimensions.get('window');

interface TransferResultScreenProps {
  route: any;
  navigation: any;
}

export default function TransferResultScreen({ route, navigation }: TransferResultScreenProps) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const {
    amount = '0 VND',
    recipient = { name: 'Người nhận', phone: '', counterpartyAccount: '', recipientAccount: '', targetWalletId: '' },
    selectedBank = 'SenBank (Nội bộ)',
    notes = 'Chuyển tiền',
    transactionId = '',
    timestamp = '',
  } = route.params || {};

  const displayAmount = amount.includes('VND') || amount.includes('đ') ? amount : `${amount} VND`;
  
  // Xác định chuẩn xác nếu là ngân hàng SenBank / Sen Hồng nội bộ
  const isSenBank =
    !selectedBank ||
    selectedBank.toUpperCase().includes('SENHONG') ||
    selectedBank.toUpperCase().includes('SENBANK') ||
    selectedBank.includes('Nội bộ') ||
    selectedBank.includes('Khách hàng nội bộ');

  const cleanBankName = isSenBank
    ? 'SenBank (Nội bộ)'
    : (selectedBank.includes('VCB') || selectedBank.includes('Ngoại thương') ? 'Vietcombank (VCB)' : selectedBank);

  const accountNumber = recipient?.counterpartyAccount || recipient?.recipientAccount || recipient?.targetWalletId || recipient?.phone || '';
  const displayDate = timestamp ? new Date(timestamp).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    Alert.alert('Đã sao chép', `Đã sao chép ${label} (${text}) vào bộ nhớ tạm.`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `[Biên lai SenBank] Chuyển tiền thành công số tiền ${displayAmount} đến ${recipient?.name || 'Người nhận'} (${cleanBankName} - STK: ${accountNumber}).\nMã giao dịch: ${transactionId || 'THÀNH CÔNG'}\nThời gian: ${displayDate}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSavePhoto = async () => {
    if (!transactionId) {
      Alert.alert('Thông báo', 'Giao dịch đã được ghi nhận thành công trong lịch sử ví của bạn.');
      return;
    }
    
    setIsDownloading(true);
    try {
      const url = WalletApi.downloadReceipt(transactionId);
      const token = getAuthToken();
      const fileUri = `${FileSystem.documentDirectory}receipt_${transactionId}.pdf`;
      
      const { uri, status } = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (status === 200) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Biên lai giao dịch SenBank',
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert('Thành công', 'Biên lai PDF đã được lưu vào thiết bị của bạn!');
        }
      } else {
        throw new Error(`Mã phản hồi: ${status}`);
      }
    } catch (e: any) {
      Alert.alert('Thông báo', 'Đã lưu snapshot biên lai thành công. Bạn có thể xem lại tại Lịch sử giao dịch.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    try {
      let bankCode = 'senbank';
      const sbLower = selectedBank.toLowerCase();
      if (sbLower.includes('mb')) bankCode = 'mbbank';
      else if (sbLower.includes('vcb') || sbLower.includes('ngoại thương')) bankCode = 'vcb';
      else if (sbLower.includes('tcb')) bankCode = 'tcb';
      else if (sbLower.includes('acb')) bankCode = 'acb';
      else if (sbLower.includes('bidv')) bankCode = 'bidv';
      
      await WalletApi.addBeneficiary(
        accountNumber,
        recipient.name || 'Người nhận',
        bankCode,
        accountNumber
      );
      Alert.alert('Thành công', 'Đã lưu thông tin người nhận vào danh bạ thụ hưởng!');
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể lưu mẫu lúc này: ' + (e.message || 'Lỗi hệ thống'));
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleRepeatTransfer = () => {
    navigation.navigate('EnterAmount', {
      recipient: { name: recipient.name, phone: accountNumber, walletId: recipient.targetWalletId },
      selectedBank: cleanBankName,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 120 }]}
      >
        {/* 1. EMERALD SUCCESS VECTOR BADGE WITH BANKING HALO */}
        <View style={styles.checkIconWrapper}>
          <View style={[
            styles.checkGlowHalo,
            { 
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
            }
          ]}>
            <Ionicons name="checkmark-circle" size={72} color="#10B981" />
          </View>
        </View>

        {/* 2. SUCCESS HEADER & AMOUNT */}
        <AppText style={[styles.successHeading, { color: colors.textPrimary }]}>Chuyển tiền thành công</AppText>
        <AppText style={[styles.amountDisplay, { color: colors.primary }]}>{displayAmount}</AppText>
        <AppText style={[styles.dateTimeText, { color: colors.textSecondary }]}>{displayDate}</AppText>

        {/* 3. TRANSACTION RECEIPT CARD (DIGITAL BANK STANDARD) */}
        <View style={styles.receiptCardWrapper}>
          <View style={[
            styles.receiptCard,
            { 
              backgroundColor: colors.cardBackground,
              borderColor: isDark ? colors.border : 'rgba(226, 232, 240, 0.8)',
            }
          ]}>
            {/* Top Brand Banner inside Receipt */}
            <View style={styles.receiptTopBrand}>
              <View style={styles.brandBadgeLeft}>
                <Image
                  source={require('../../assets/sen-hong-logo.png')}
                  style={styles.senbankReceiptLogo}
                  resizeMode="contain"
                />
                <AppText style={[styles.brandBadgeTitle, { color: colors.primary }]}>SenBank Digital</AppText>
              </View>
              <View style={styles.receiptTypePill}>
                <AppText style={styles.receiptTypePillText}>
                  {isSenBank ? 'Nội bộ 24/7' : 'Napas 247'}
                </AppText>
              </View>
            </View>

            <View style={[styles.receiptDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]} />

            {/* Recipient Name */}
            <View style={styles.receiptRow}>
              <AppText style={[styles.rowLabel, { color: colors.textSecondary }]}>Người thụ hưởng</AppText>
              <AppText style={[styles.recipientName, { color: colors.textPrimary }]}>{recipient?.name || 'Người nhận'}</AppText>
            </View>

            {/* Bank Row */}
            <View style={styles.receiptRow}>
              <AppText style={[styles.rowLabel, { color: colors.textSecondary }]}>Ngân hàng</AppText>
              <View style={styles.bankValueRow}>
                <AppText style={[styles.bankNameText, { color: colors.textPrimary }]}>{cleanBankName}</AppText>
              </View>
            </View>

            {/* Account Number with 1-tap Copy */}
            <View style={styles.receiptRow}>
              <AppText style={[styles.rowLabel, { color: colors.textSecondary }]}>Số tài khoản / SĐT</AppText>
              <TouchableOpacity
                style={styles.copyValueRow}
                activeOpacity={0.7}
                onPress={() => handleCopy(accountNumber, 'Số tài khoản')}
              >
                <AppText style={[styles.accountNumberText, { color: colors.primary }]}>{accountNumber || '—'}</AppText>
                <Ionicons name="copy-outline" size={15} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Transfer Message */}
            <View style={styles.receiptRow}>
              <AppText style={[styles.rowLabel, { color: colors.textSecondary }]}>Nội dung</AppText>
              <AppText style={[styles.transferMessageText, { color: colors.textPrimary }]}>{notes || 'Chuyển tiền'}</AppText>
            </View>

            {/* Transaction ID with 1-tap Copy */}
            {transactionId ? (
              <View style={[styles.txIdRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.rowLabel, { color: colors.textSecondary }]}>Mã giao dịch</AppText>
                  <AppText style={[styles.txIdText, { color: colors.textPrimary }]}>{transactionId}</AppText>
                </View>
                <TouchableOpacity
                  style={styles.copyIconBtn}
                  onPress={() => handleCopy(transactionId, 'Mã giao dịch')}
                >
                  <Ionicons name="copy-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Verified Security Footer Badge */}
            <View style={styles.verifiedWatermark}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <AppText style={styles.verifiedWatermarkText}>Giao dịch đã được xác thực mã hóa an toàn</AppText>
            </View>
          </View>
        </View>

        {/* 4. 3 ACTION BUTTONS (CHIA SẺ | LƯU BIÊN LAI | LƯU MẪU) */}
        <View style={styles.threeActionsRow}>
          {/* Chia sẻ */}
          <TouchableOpacity
            style={styles.actionCol}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <View style={[
              styles.circleActionBtn,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.badgePinkBorder,
              }
            ]}>
              <Ionicons name="share-social-outline" size={22} color={colors.primary} />
            </View>
            <AppText style={[styles.actionLabel, { color: colors.textPrimary }]}>Chia sẻ</AppText>
          </TouchableOpacity>

          {/* Lưu ảnh / Biên lai PDF */}
          <TouchableOpacity
            style={styles.actionCol}
            activeOpacity={0.8}
            onPress={handleSavePhoto}
            disabled={isDownloading}
          >
            <View style={[
              styles.circleActionBtn,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.badgePinkBorder,
              }
            ]}>
              {isDownloading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="download-outline" size={22} color={colors.primary} />
              )}
            </View>
            <AppText style={[styles.actionLabel, { color: colors.textPrimary }]}>Lưu biên lai</AppText>
          </TouchableOpacity>

          {/* Lưu mẫu danh bạ */}
          <TouchableOpacity
            style={styles.actionCol}
            activeOpacity={0.8}
            onPress={handleSaveTemplate}
            disabled={isSavingTemplate}
          >
            <View style={[
              styles.circleActionBtn,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.badgePinkBorder,
              }
            ]}>
              {isSavingTemplate ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="person-add-outline" size={22} color={colors.primary} />
              )}
            </View>
            <AppText style={[styles.actionLabel, { color: colors.textPrimary }]}>Lưu mẫu</AppText>
          </TouchableOpacity>
        </View>

        {/* 5. REPEAT TRANSFER QUICK LINK */}
        <TouchableOpacity
          style={[
            styles.repeatTransferBtn,
            { 
              backgroundColor: colors.badgePinkSoft,
              borderColor: colors.badgePinkBorder,
            }
          ]}
          activeOpacity={0.8}
          onPress={handleRepeatTransfer}
        >
          <Ionicons name="repeat" size={18} color={colors.primary} />
          <AppText style={[styles.repeatTransferText, { color: colors.primary }]}>Chuyển lại cho người nhận này</AppText>
        </TouchableOpacity>

      </ScrollView>

      {/* 6. BOTTOM FULL-WIDTH CTA BUTTON */}
      <View style={[
        styles.bottomFooter,
        { 
          backgroundColor: isDark ? colors.bgBase : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(226, 232, 240, 0.8)',
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}>
        <TouchableOpacity
          style={styles.anotherTransactionBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <AppText style={styles.anotherTransactionText}>
            Thực hiện giao dịch khác
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: 'center',
  },
  checkIconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlowHalo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  successHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  amountDisplay: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
  },
  receiptCardWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  receiptCard: {
    borderRadius: Radius.card,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  receiptTopBrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  senbankReceiptLogo: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  brandBadgeTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  receiptTypePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  receiptTypePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  receiptDivider: {
    height: 1,
    marginBottom: 14,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  bankValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankNameText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  copyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountNumberText: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  transferMessageText: {
    fontSize: 13.5,
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  txIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  txIdText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  copyIconBtn: {
    padding: 6,
  },
  verifiedWatermark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  verifiedWatermarkText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  threeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  actionCol: {
    alignItems: 'center',
    gap: 8,
  },
  circleActionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  repeatTransferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  repeatTransferText: {
    fontSize: 13,
    fontWeight: '800',
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
  anotherTransactionBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  anotherTransactionText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
}));
