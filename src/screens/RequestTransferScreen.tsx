import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Share, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/icons/AppIcon';
import { Radius, Shadows, Spacing , Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { GlassCard } from '../components/GlassCard';
import { AppText } from '../components/typography/AppText';

interface RequestTransferScreenProps {
  navigation: any;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function RequestTransferScreen({ navigation }: RequestTransferScreenProps) {
  const { colors, isDark } = useTheme();
  const [showQR, setShowQR] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const formatCurrency = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    if (!numeric) return '';
    return Number(numeric).toLocaleString('vi-VN');
  };

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/\D/g, '');
    setAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
  };

  const handleSelectQuickAmount = (val: number) => {
    setAmount(val.toLocaleString('vi-VN'));
  };

  const handleCreateRequest = () => {
    if (!amount || amount === '0') {
      Alert.alert('Thông báo', 'Vui lòng nhập số tiền hợp lệ để tạo yêu cầu.');
      return;
    }
    setShowQR(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Yêu cầu chuyển tiền qua SenBank: ${amount} VNĐ${message ? ` - Lời nhắn: "${message}"` : ''}. Vui lòng thanh toán qua ứng dụng SenBank.`,
      });
    } catch (error) {
      console.warn('Error sharing:', error);
    }
  };

  const handleCopy = () => {
    Alert.alert('Thành công', 'Đã sao chép liên kết thanh toán SenBank vào bộ nhớ tạm.');
  };

  if (showQR) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
        <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.bgBase} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowQR(false)} style={styles.backBtn}>
            <AppIcon name="arrow-back" size="md" color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Mã Yêu Cầu Chuyển Tiền</AppText>
          <View style={styles.spacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* QR Card */}
          <GlassCard intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.qrGlassCard}>
            <View style={styles.qrContent}>
              <View style={[styles.qrIconWrapper, { backgroundColor: colors.primarySoft }]}>
                <AppIcon name="qr-code" size="huge" color={colors.primary} />
              </View>
              <AppText style={[styles.qrTitle, { color: colors.textPrimary }]}>Quét mã để chuyển tiền</AppText>
              <AppText variant="headingLg" style={[styles.qrAmount, { color: colors.primary }]}>
                {amount || '0'} VNĐ
              </AppText>
              {recipientPhone ? (
                <AppText style={[styles.qrRecipient, { color: colors.textSecondary }]}>
                  Gửi tới: {recipientPhone}
                </AppText>
              ) : null}
              {message ? (
                <View style={[styles.qrMessageBadge, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <AppText style={[styles.qrMessage, { color: colors.textSecondary }]}>"{message}"</AppText>
                </View>
              ) : null}
            </View>
          </GlassCard>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isDark ? colors.cardBackground : colors.surface }]}
              onPress={handleShare}
            >
              <AppIcon name="share-social" size="sm" color={colors.primary} />
              <AppText style={[styles.actionText, { color: colors.primary }]}>Chia sẻ mã</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isDark ? colors.cardBackground : colors.surface }]}
              onPress={handleCopy}
            >
              <AppIcon name="copy" size="sm" color={colors.primary} />
              <AppText style={[styles.actionText, { color: colors.primary }]}>Sao chép link</AppText>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: Spacing.xl }}>
            <PrimaryButton title="Tạo yêu cầu khác" onPress={() => setShowQR(false)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.bgBase} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <AppIcon name="arrow-back" size="md" color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Yêu cầu chuyển tiền</AppText>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Create request form */}
        <View style={[styles.formCard, { backgroundColor: isDark ? colors.cardBackground : colors.surface }]}>
          <AppText style={[styles.formTitle, { color: colors.textPrimary }]}>Tạo yêu cầu mới</AppText>

          {/* Recipient Field */}
          <View style={styles.field}>
            <AppText style={[styles.label, { color: colors.textPrimary }]}>Người nhận yêu cầu (SĐT)</AppText>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <AppIcon name="person-outline" size="sm" color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="Nhập SĐT người gửi tiền (tùy chọn)..."
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
              />
              {recipientPhone.length > 0 && (
                <TouchableOpacity onPress={() => setRecipientPhone('')}>
                  <AppIcon name="close-circle" size="xs" color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Amount Field */}
          <View style={styles.field}>
            <AppText style={[styles.label, { color: colors.textPrimary }]}>Số tiền yêu cầu</AppText>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <AppText style={[styles.currency, { color: colors.textSecondary }]}>VNĐ</AppText>
              <TextInput
                style={[styles.textInput, styles.amountInputText, { color: colors.primary }]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={handleAmountChange}
              />
              {amount.length > 0 && (
                <TouchableOpacity onPress={() => setAmount('')}>
                  <AppIcon name="close-circle" size="xs" color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.quickChipsRow}>
              {QUICK_AMOUNTS.map((val) => {
                const formatted = val.toLocaleString('vi-VN');
                const isSelected = amount === formatted;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.quickChip,
                      {
                        backgroundColor: isSelected
                          ? colors.primarySoft
                          : isDark
                          ? '#0F172A'
                          : '#F1F5F9',
                        borderColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelectQuickAmount(val)}
                  >
                    <AppText
                      style={[
                        styles.quickChipText,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Note Field */}
          <View style={styles.field}>
            <AppText style={[styles.label, { color: colors.textPrimary }]}>Lời nhắn (không bắt buộc)</AppText>
            <View style={[styles.messageInputWrapper, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <TextInput
                style={[styles.messageTextInput, { color: colors.textPrimary }]}
                placeholder="Ví dụ: Tiền ăn tối hôm qua, tiền mua quà..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                value={message}
                onChangeText={setMessage}
              />
            </View>
          </View>

          <PrimaryButton
            title="Tạo yêu cầu chuyển tiền"
            onPress={handleCreateRequest}
          />
        </View>

        {/* Recent requests */}
        <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Yêu cầu gần đây</AppText>
        <View style={[styles.requestsList, { backgroundColor: isDark ? colors.cardBackground : colors.surface }]}>
          <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
            <AppIcon name="receipt-outline" size="xl" color={colors.textSecondary} />
            <AppText style={{ color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }}>
              Chưa có yêu cầu chuyển tiền nào gần đây
            </AppText>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  spacer: {
    width: 36,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  formCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  currency: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountInputText: {
    fontSize: 18,
    fontWeight: '700',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickChip: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  messageInputWrapper: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 84,
  },
  messageTextInput: {
    fontSize: 14,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  requestsList: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  qrGlassCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  qrContent: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  qrIconWrapper: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  qrAmount: {
    fontSize: 26,
    fontWeight: '800',
  },
  qrRecipient: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  qrMessageBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  qrMessage: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    ...Shadows.card,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

