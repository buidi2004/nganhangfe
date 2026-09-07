import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Shadows, Spacing , Colors } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { WalletApi } from '../services/api';

interface BillInputScreenProps {
  route: any;
  navigation: any;
}

export default function BillInputScreen({ route, navigation }: BillInputScreenProps) {
  const { provider = 'Tiền điện', defaultCode = '', customerCode = '' } = route.params || {};
  const { colors, isDark } = useTheme();
  const [customerId, setCustomerId] = useState(customerCode || defaultCode || '');
  const [billData, setBillData] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const isValid = customerId.trim().length >= 4;

  const getBillType = (prov: string): string => {
    const lower = prov.toLowerCase();
    if (lower.includes('nước') || lower.includes('water')) return 'WATER';
    if (lower.includes('internet') || lower.includes('mạng') || lower.includes('fpt') || lower.includes('vnpt')) return 'INTERNET';
    if (lower.includes('học') || lower.includes('tuition')) return 'TUITION';
    return 'ELECTRICITY';
  };

  const handleLookup = async (codeToLookup = customerId) => {
    const cleanCode = codeToLookup.trim().toUpperCase();
    if (cleanCode.length < 4) {
      setLookupError('Vui lòng nhập ít nhất 4 ký tự mã khách hàng.');
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setBillData(null);

    const bType = getBillType(provider);
    try {
      const res = await WalletApi.lookupBill(bType, cleanCode);
      if (res.data) {
        setBillData(res.data);
      } else {
        setLookupError('Không tìm thấy hóa đơn cần thanh toán hoặc hóa đơn đã được thanh toán.');
      }
    } catch (e: any) {
      setLookupError(e.message || 'Không tìm thấy hóa đơn cần thanh toán cho mã này.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleClear = () => {
    setCustomerId('');
    setBillData(null);
    setLookupError(null);
  };

  const sampleCodes = ['PE01928374', 'WA98273645', 'VNPT882910'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerBtn, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>{provider}</AppText>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ScanQR')}
        >
          <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Input card */}
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: colors.surface,
                borderColor: isValid ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={styles.inputHeader}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
                <Ionicons
                  name={provider.includes('nước') ? 'water' : 'flash'}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.inputLabel, { color: colors.textPrimary }]}>
                  Mã khách hàng / Số danh bộ
                </AppText>
                <AppText style={[styles.inputSub, { color: colors.textSecondary }]}>
                  Vui lòng nhập mã in trên hóa đơn giấy hoặc tin nhắn SMS
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F8FAFC',
                  borderColor: isValid ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons name="barcode-outline" size={22} color={colors.textSecondary} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="Ví dụ: PE01928374..."
                placeholderTextColor={colors.textMuted}
                value={customerId}
                onChangeText={setCustomerId}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {customerId.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick sample chips */}
            <View style={styles.sampleRow}>
              <AppText style={[styles.sampleTitle, { color: colors.textSecondary }]}>Mã mẫu:</AppText>
              {sampleCodes.map((code) => (
                <TouchableOpacity
                  key={code}
                  onPress={() => {
                    setCustomerId(code);
                    handleLookup(code);
                  }}
                  style={[styles.sampleChip, { backgroundColor: colors.primarySoft }]}
                >
                  <AppText style={[styles.sampleText, { color: colors.primary }]}>{code}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tra cứu Button */}
            <TouchableOpacity
              style={[
                styles.lookupBtn,
                { backgroundColor: isValid ? colors.primary : (isDark ? '#334155' : '#E2E8F0') },
              ]}
              onPress={() => handleLookup(customerId)}
              disabled={!isValid || isLookingUp}
              activeOpacity={0.8}
            >
              {isLookingUp ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="search" size={17} color={isValid ? '#FFFFFF' : colors.textMuted} style={{ marginRight: 6 }} />
                  <AppText style={[styles.lookupBtnText, { color: isValid ? '#FFFFFF' : colors.textMuted }]}>
                    Tra cứu nợ cước
                  </AppText>
                </View>
              )}
            </TouchableOpacity>

            {lookupError && (
              <View style={[styles.errorBadge, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                <AppText style={[styles.errorText, { color: '#EF4444', flex: 1 }]}>
                  {lookupError}
                </AppText>
              </View>
            )}
          </View>

          {/* Preview card */}
          {billData && (
            <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.previewHeader}>
                <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                <AppText style={[styles.previewLabel, { color: colors.textPrimary }]}>
                  Thông tin hóa đơn
                </AppText>
              </View>

              <View style={styles.previewRow}>
                <AppText style={[styles.previewField, { color: colors.textSecondary }]}>
                  Khách hàng
                </AppText>
                <AppText style={[styles.previewValue, { color: colors.textPrimary }]}>
                  {billData.customerName || 'NGUYỄN VĂN AN'}
                </AppText>
              </View>

              <View style={styles.previewRow}>
                <AppText style={[styles.previewField, { color: colors.textSecondary }]}>
                  Mã hợp đồng
                </AppText>
                <AppText style={[styles.previewValue, { color: colors.textPrimary }]}>
                  {(billData.customerCode || customerId).toUpperCase()}
                </AppText>
              </View>

              <View style={styles.previewRow}>
                <AppText style={[styles.previewField, { color: colors.textSecondary }]}>
                  Kỳ thanh toán
                </AppText>
                <AppText style={[styles.previewValue, { color: colors.textPrimary }]}>
                  {billData.period || 'Kỳ 08/2026'}
                </AppText>
              </View>

              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <AppText style={[styles.totalLabel, { color: colors.textPrimary }]}>
                  Tổng tiền thanh toán
                </AppText>
                <AppText style={[styles.totalAmount, { color: colors.primary }]}>
                  {(billData.amount || 0).toLocaleString('vi-VN')} đ
                </AppText>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <PrimaryButton
          title={
            billData
              ? `Thanh toán • ${(billData.amount || 0).toLocaleString('vi-VN')} đ`
              : 'Tra cứu nợ cước'
          }
          onPress={() => {
            if (billData) {
              navigation.navigate('BillConfirm', {
                provider: billData.providerName || provider,
                billId: (billData.customerCode || customerId).toUpperCase(),
                amount: billData.amount || 0,
              });
            } else {
              handleLookup(customerId);
            }
          }}
          disabled={!isValid || isLookingUp}
        />
      </View>
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
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    padding: 16,
  },
  inputCard: {
    borderRadius: Radius.card,
    padding: 18,
    borderWidth: 1.5,
    ...Shadows.card,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  inputSub: {
    fontSize: 12,
    marginTop: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  clearBtn: {
    padding: 4,
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  sampleTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  sampleChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  sampleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  validText: {
    fontSize: 13,
    fontWeight: '700',
  },
  previewCard: {
    borderRadius: Radius.card,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    ...Shadows.card,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  previewLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  previewField: {
    fontSize: 13.5,
  },
  previewValue: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  lookupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: 14,
  },
  lookupBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.md,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});

