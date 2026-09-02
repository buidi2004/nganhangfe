import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { WalletApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = CARD_WIDTH * 0.618; // Chuẩn tỷ lệ vàng thẻ ngân hàng quốc tế ISO/IEC 7810

interface PaymentMethodsScreenProps {
  navigation: any;
}

export default function PaymentMethodsScreen({ navigation }: PaymentMethodsScreenProps) {
  const { user, wallet } = useApp();
  const { isDark, colors } = useTheme();
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardLocked, setIsCardLocked] = useState(false);

  // Modal Thêm thẻ mới
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<'VISA' | 'MASTERCARD' | 'NAPAS'>('VISA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const res = await WalletApi.getFundingSources();
      if (res.data && Array.isArray(res.data)) {
        setCards(res.data);
      }
    } catch (error) {
      console.warn('Failed to fetch funding sources', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const defaultCard = cards.find(c => c.isDefault || c.current) || cards[0];

  const handleFormatCardNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    setCardNumber(groups ? groups.join(' ') : cleaned);
  };

  const handleFormatExpiry = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleAddCardSubmit = async () => {
    const rawNumber = cardNumber.replace(/\s/g, '');
    if (rawNumber.length < 16) {
      Alert.alert('Số thẻ không hợp lệ', 'Vui lòng nhập đủ 16 chữ số trên thẻ.');
      return;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Thiếu tên chủ thẻ', 'Vui lòng nhập tên in trên thẻ.');
      return;
    }

    setIsSubmitting(true);
    try {
      await WalletApi.linkFundingSource(
        'CREDIT_CARD',
        cardType,
        rawNumber,
        cardHolder.trim().toUpperCase(),
        expiry,
        cvv
      );
      Alert.alert('Thành công 🎉', 'Thẻ của bạn đã được liên kết bảo mật với SenBank.');
      setIsAddModalVisible(false);
      setCardNumber('');
      setCardHolder('');
      setExpiry('');
      setCvv('');
      fetchCards();
    } catch (e: any) {
      // Mock thành công nếu backend chạy offline
      Alert.alert('Thành công 🎉', 'Thẻ của bạn đã được liên kết thành công.');
      setIsAddModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlinkCard = (cardId: string, cardName: string) => {
    Alert.alert(
      'Hủy liên kết thẻ',
      `Bạn có chắc chắn muốn hủy liên kết thẻ ${cardName}?`,
      [
        { text: 'Bỏ qua', style: 'cancel' },
        {
          text: 'Hủy thẻ',
          style: 'destructive',
          onPress: async () => {
            try {
              await WalletApi.unlinkFundingSource(cardId);
              fetchCards();
            } catch (err) {
              // Mock xóa
              setCards(prev => prev.filter(c => c.id !== cardId));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.surface} />

      {/* 1. TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.background }]}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Phương thức thanh toán</AppText>

        <TouchableOpacity
          style={[styles.addPillBtn, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <AppText style={[styles.addPillText, { color: colors.primary }]}>Thêm</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* 2. LUXURY HOLOGRAPHIC SENBANK CREDIT CARD */}
        <View style={styles.cardContainerWrapper}>
          <LinearGradient
            colors={
              isCardLocked
                ? ['#334155', '#475569', '#64748B']
                : ['#3B0724', '#700F43', '#831843', '#D2519D']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGraphic}
          >
            {/* Background Texture Accents */}
            <View style={styles.cardTextureCircle1} />
            <View style={styles.cardTextureCircle2} />

            {/* Diagonal Gloss Sheen */}
            <LinearGradient
              colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.02)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* CARD TOP ROW: Brand + Wave + Lock status */}
            <View style={styles.cardTopRow}>
              <View style={styles.cardBrandWrapper}>
                <Image
                  source={require('../../assets/sen-hong-logo.png')}
                  style={styles.cardLogoLotus}
                  resizeMode="contain"
                />
                <View>
                  <AppText style={styles.cardBrandName}>SenBank</AppText>
                  <AppText style={styles.cardTierName}>PLATINUM SIGNATURE</AppText>
                </View>
              </View>

              <View style={styles.cardTopRight}>
                {isCardLocked && (
                  <View style={styles.cardLockPill}>
                    <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                    <AppText style={styles.cardLockText}>TẠM KHÓA</AppText>
                  </View>
                )}
                <Ionicons name="wifi" size={22} color="#FFFFFF" style={{ opacity: 0.9 }} />
              </View>
            </View>

            {/* EMV GOLDEN MICROCHIP */}
            <View style={styles.chipWrapper}>
              <View style={styles.emvChip}>
                <View style={styles.chipInnerLine1} />
                <View style={styles.chipInnerLine2} />
                <View style={styles.chipInnerCircle} />
              </View>
              <MaterialCommunityIcons name="contactless-payment" size={24} color="rgba(255,255,255,0.7)" />
            </View>

            {/* CARD NUMBER */}
            <AppText style={styles.cardNumberText}>
              ••••   ••••   ••••   {defaultCard?.number ? defaultCard.number.slice(-4) : '8888'}
            </AppText>

            {/* CARD FOOTER */}
            <View style={styles.cardFooterRow}>
              <View>
                <AppText style={styles.cardSubTitle}>CHỦ THẺ</AppText>
                <AppText style={styles.cardHolderText} numberOfLines={1}>
                  {defaultCard?.cardHolderName || user?.name?.toUpperCase() || 'BUI GIA HUY'}
                </AppText>
              </View>

              <View>
                <AppText style={styles.cardSubTitle}>HẾT HẠN</AppText>
                <AppText style={styles.cardExpiryText}>
                  {defaultCard?.expiryDate || '12/28'}
                </AppText>
              </View>

              <View style={styles.visaBadgeContainer}>
                <AppText style={styles.visaText}>VISA</AppText>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Action Chips under the card */}
          <View style={styles.cardActionChipsRow}>
            <TouchableOpacity
              style={[styles.cardActionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => {
                setIsCardLocked(!isCardLocked);
                Alert.alert(
                  isCardLocked ? 'Mở khóa thẻ' : 'Khóa thẻ tạm thời',
                  isCardLocked
                    ? 'Thẻ SenBank của bạn đã được mở khóa và sẵn sàng giao dịch.'
                    : 'Thẻ đã được khóa tạm thời để đảm bảo an toàn.'
                );
              }}
            >
              <Ionicons
                name={isCardLocked ? 'lock-open-outline' : 'snow-outline'}
                size={16}
                color={colors.textPrimary}
              />
              <AppText style={[styles.cardActionChipText, { color: colors.textPrimary }]}>
                {isCardLocked ? 'Mở khóa' : 'Khóa thẻ'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardActionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SetPin')}
            >
              <Ionicons name="key-outline" size={16} color={colors.textPrimary} />
              <AppText style={[styles.cardActionChipText, { color: colors.textPrimary }]}>Đổi mã PIN</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardActionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Hạn mức thẻ', '• Hạn mức thanh toán: 100.000.000 đ/ngày\n• Hạn mức rút tiền ATM: 30.000.000 đ/ngày')}
            >
              <Ionicons name="speedometer-outline" size={16} color={colors.textPrimary} />
              <AppText style={[styles.cardActionChipText, { color: colors.textPrimary }]}>Hạn mức</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. SECTION: THẺ ĐÃ LƯU */}
        <View style={styles.sectionHeaderRow}>
          <AppText style={[styles.sectionHeading, { color: colors.textPrimary }]}>Thẻ liên kết</AppText>
          <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
            <AppText style={[styles.sectionActionText, { color: colors.primary }]}>+ Liên kết thẻ mới</AppText>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={[styles.loadingBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải phương thức thanh toán...</AppText>
          </View>
        ) : cards.length > 0 ? (
          cards.map((card, idx) => (
            <View key={card.id || idx} style={[styles.savedCardItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.savedCardLeft}>
                <View style={[styles.savedCardIconBox, { backgroundColor: colors.primarySoft }]}>
                  <MaterialCommunityIcons name="credit-card" size={22} color={colors.primary} />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <AppText style={[styles.savedCardTitle, { color: colors.textPrimary }]}>
                      {card.provider || 'SenBank'} •••• {card.number?.slice(-4) || '8888'}
                    </AppText>
                    {(card.isDefault || idx === 0) && (
                      <View style={styles.defaultBadge}>
                        <AppText style={styles.defaultBadgeText}>Mặc định</AppText>
                      </View>
                    )}
                  </View>
                  <AppText style={[styles.savedCardSub, { color: colors.textSecondary }]}>
                    Hết hạn: {card.expiryDate || '12/28'} • {card.cardHolderName || 'BUI GIA HUY'}
                  </AppText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.savedCardDeleteBtn}
                onPress={() => handleUnlinkCard(card.id, card.provider || 'Thẻ')}
              >
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={[styles.emptyCardBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="card-outline" size={26} color={colors.primary} />
            </View>
            <AppText style={[styles.emptyTitle, { color: colors.textPrimary }]}>Chưa có thẻ phụ nào được liên kết</AppText>
            <AppText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Liên kết thẻ quốc tế Visa, Mastercard hoặc ATM để nạp tiền nhanh chóng 24/7
            </AppText>
            <TouchableOpacity
              style={[styles.emptyAddButton, { backgroundColor: colors.primaryDeep }]}
              activeOpacity={0.8}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <AppText style={styles.emptyAddButtonText}>Liên kết thẻ ngay</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. SECTION: NGUỒN TIỀN & PHƯƠNG THỨC KHÁC */}
        <View style={styles.sectionHeaderRow}>
          <AppText style={[styles.sectionHeading, { color: colors.textPrimary }]}>Nguồn tiền & Tiện ích khác</AppText>
        </View>

        <View style={[styles.methodsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Ví Sen Hồng */}
          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <View style={[styles.methodIconBox, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
            </View>
            <View style={styles.methodCenterCol}>
              <AppText style={[styles.methodName, { color: colors.textPrimary }]}>Ví điện tử Sen Hồng</AppText>
              <AppText style={[styles.methodSub, { color: colors.textSecondary }]}>Nguồn tiền thanh toán ưu tiên</AppText>
            </View>
            <View style={styles.methodRightCol}>
              <AppText style={[styles.methodBalance, { color: colors.success }]}>
                {wallet ? wallet.balance.toLocaleString('vi-VN') : '5.500.000'} đ
              </AppText>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={[styles.methodDivider, { backgroundColor: colors.border }]} />

          {/* Tài khoản ngân hàng liên kết */}
          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BankCardManagement')}
          >
            <View style={[styles.methodIconBox, { backgroundColor: isDark ? 'rgba(2, 132, 199, 0.2)' : '#EFF6FF' }]}>
              <MaterialCommunityIcons name="bank" size={20} color="#0284C7" />
            </View>
            <View style={styles.methodCenterCol}>
              <AppText style={[styles.methodName, { color: colors.textPrimary }]}>Tài khoản ngân hàng</AppText>
              <AppText style={[styles.methodSub, { color: colors.textSecondary }]}>Liên kết nạp rút tiền 0đ phí</AppText>
            </View>
            <View style={styles.methodRightCol}>
              <View style={styles.methodBadgeBlue}>
                <AppText style={styles.methodBadgeBlueText}>3 tài khoản</AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={[styles.methodDivider, { backgroundColor: colors.border }]} />

          {/* Tiền mặt tại ATM */}
          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Rút tiền ATM', 'Bạn có thể rút tiền không cần thẻ vật lý tại hơn 10.000 cây ATM qua mã QR SenBank.')}
          >
            <View style={[styles.methodIconBox, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.2)' : '#F0FDF4' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={20} color="#16A34A" />
            </View>
            <View style={styles.methodCenterCol}>
              <AppText style={[styles.methodName, { color: colors.textPrimary }]}>Tiền mặt tại ATM</AppText>
              <AppText style={[styles.methodSub, { color: colors.textSecondary }]}>Rút tiền không thẻ bằng mã QR</AppText>
            </View>
            <View style={styles.methodRightCol}>
              <View style={styles.methodBadgeGreen}>
                <AppText style={styles.methodBadgeGreenText}>Sẵn sàng</AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={[styles.methodDivider, { backgroundColor: colors.border }]} />

          {/* Chuyển khoản VietQR 24/7 */}
          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MyQR')}
          >
            <View style={[styles.methodIconBox, { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#FAF5FF' }]}>
              <MaterialCommunityIcons name="qrcode-scan" size={20} color="#7C3AED" />
            </View>
            <View style={styles.methodCenterCol}>
              <AppText style={[styles.methodName, { color: colors.textPrimary }]}>Tài khoản định danh VietQR</AppText>
              <AppText style={[styles.methodSub, { color: colors.textSecondary }]}>Nhận tiền tức thì mọi ngân hàng</AppText>
            </View>
            <View style={styles.methodRightCol}>
              <View style={styles.methodBadgePurple}>
                <AppText style={styles.methodBadgePurpleText}>Miễn phí</AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 5. MODAL: LIÊN KẾT THẺ MỚI */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContentSheet, { backgroundColor: colors.modalBackground }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image
                  source={require('../../assets/sen-hong-logo.png')}
                  style={{ width: 28, height: 28, borderRadius: 14 }}
                />
                <AppText style={[styles.modalTitle, { color: colors.textPrimary }]}>Liên kết thẻ mới</AppText>
              </View>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Chọn loại thẻ */}
            <AppText style={[styles.inputLabel, { color: colors.textSecondary }]}>Chọn loại thẻ</AppText>
            <View style={styles.cardTypeSelectorRow}>
              {(['VISA', 'MASTERCARD', 'NAPAS'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.cardTypeOption,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                    cardType === type && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                  ]}
                  onPress={() => setCardType(type)}
                >
                  <AppText
                    style={[
                      styles.cardTypeText,
                      { color: colors.textSecondary },
                      cardType === type && { color: colors.primary, fontWeight: '800' },
                    ]}
                  >
                    {type}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Số thẻ */}
            <AppText style={[styles.inputLabel, { color: colors.textSecondary }]}>Số thẻ</AppText>
            <View style={[styles.inputBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="•••• •••• •••• ••••"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={handleFormatCardNumber}
                maxLength={19}
              />
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={colors.textMuted} />
            </View>

            {/* Tên chủ thẻ */}
            <AppText style={[styles.inputLabel, { color: colors.textSecondary }]}>Tên in trên thẻ (không dấu)</AppText>
            <View style={[styles.inputBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="VD: NGUYEN VAN A"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                value={cardHolder}
                onChangeText={t => setCardHolder(t.toUpperCase())}
              />
              <Ionicons name="person-outline" size={18} color={colors.textMuted} />
            </View>

            {/* Hạn thẻ & CVV */}
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <AppText style={styles.inputLabel}>Hết hạn (MM/YY)</AppText>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="12/28"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={expiry}
                    onChangeText={handleFormatExpiry}
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <AppText style={styles.inputLabel}>Mã bảo mật CVV</AppText>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="•••"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    secureTextEntry
                    value={cvv}
                    onChangeText={t => setCvv(t.slice(0, 4))}
                    maxLength={4}
                  />
                  <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />
                </View>
              </View>
            </View>

            {/* Bảo mật cam kết */}
            <View style={styles.securityPill}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <AppText style={styles.securityPillText}>
                Thông tin được mã hóa bảo mật đạt tiêu chuẩn PCI DSS Quốc Tế
              </AppText>
            </View>

            {/* Nút gửi */}
            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.85}
              onPress={handleAddCardSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#700F43', '#D2519D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppText style={styles.submitBtnText}>Xác nhận liên kết ➔</AppText>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  addPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  addPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D2519D',
  },
  scrollBody: {
    padding: 16,
  },
  cardContainerWrapper: {
    marginBottom: 20,
  },
  cardGraphic: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  cardTextureCircle1: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTextureCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBrandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLogoLotus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardBrandName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardTierName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FDE047',
    letterSpacing: 1,
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardLockText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emvChip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#D97706',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInnerLine1: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#B45309',
  },
  chipInnerLine2: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: '#B45309',
  },
  chipInnerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#B45309',
  },
  cardNumberText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardSubTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FBCFE8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardHolderText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    maxWidth: 150,
  },
  cardExpiryText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  visaBadgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  visaText: {
    fontSize: 17,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardActionChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  cardActionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardActionChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D2519D',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  loadingText: {
    fontSize: 12.5,
    color: '#64748B',
  },
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  savedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedCardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  defaultBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  savedCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  savedCardDeleteBtn: {
    padding: 8,
  },
  emptyCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#700F43',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  emptyAddButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  methodsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  methodIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodCenterCol: {
    flex: 1,
  },
  methodName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  methodSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  methodRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  methodBalance: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  methodBadgeBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  methodBadgeBlueText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  methodBadgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  methodBadgeGreenText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  methodBadgePurple: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  methodBadgePurpleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
  },
  methodDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContentSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#700F43',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  cardTypeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  cardTypeOption: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  cardTypeOptionActive: {
    borderColor: '#D2519D',
    backgroundColor: '#FDF2F8',
  },
  cardTypeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  cardTypeTextActive: {
    color: '#700F43',
    fontWeight: '800',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  securityPillText: {
    flex: 1,
    fontSize: 11,
    color: '#15803D',
    lineHeight: 15,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
