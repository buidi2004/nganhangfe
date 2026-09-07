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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Shadows, Spacing , Colors } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { QuickAmountChip } from '../components/QuickAmountChip';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { WalletApi } from '../services/api';

interface DepositScreenProps {
  navigation: any;
}

export default function DepositScreen({ navigation }: DepositScreenProps) {
  const { colors, isDark } = useTheme();
  const [amount, setAmount] = useState('');
  const [fundingSources, setFundingSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState('Ví SenBank');
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);

  useEffect(() => {
    WalletApi.getFundingSources()
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setFundingSources(res.data);
          const def = res.data.find((s: any) => s.isDefault) || res.data[0];
          const name = `${def.provider || 'Ngân hàng'} ****${def.number?.slice(-4) || '8888'}`;
          setSelectedSource(name);
        } else {
          setSelectedSource('Liên kết tài khoản ngân hàng');
        }
      })
      .catch(() => {
        setSelectedSource('Liên kết tài khoản ngân hàng');
      });
  }, []);

  const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Nạp tiền vào ví</AppText>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Source card */}
          <TouchableOpacity
            style={[styles.sourceCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => {
              if (fundingSources.length > 0) {
                setIsSourceModalVisible(true);
              } else {
                navigation.navigate('BankCardManagement');
              }
            }}
          >
            <View style={styles.sourceLeft}>
              <View style={[styles.sourceIconWrap, { backgroundColor: colors.primarySoft }]}>
                <MaterialCommunityIcons name="bank" size={24} color={colors.primary} />
              </View>
              <View style={styles.sourceInfo}>
                <AppText style={[styles.sourceLabel, { color: colors.textSecondary }]}>Nguồn nạp tiền</AppText>
                <AppText style={[styles.sourceValue, { color: colors.textPrimary }]}>{selectedSource}</AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Amount input */}
          <View style={styles.amountSection}>
            <AppText style={[styles.amountLabel, { color: colors.textPrimary }]}>Nhập số tiền nạp</AppText>
            <View style={[styles.amountDisplay, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.amountValue, { color: colors.primary }]}
                value={amount ? Number(amount.replace(/[^0-9]/g, '')).toLocaleString('vi-VN') : ''}
                onChangeText={(text) => {
                  const raw = text.replace(/[^0-9]/g, '');
                  setAmount(raw);
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
              <AppText style={[styles.currencySymbol, { color: colors.primary }]}>₫</AppText>
            </View>
          </View>

          {/* Quick amount chips */}
          <View style={styles.quickAmounts}>
            {['100.000', '200.000', '500.000', '1.000.000', '2.000.000'].map((q) => (
              <QuickAmountChip
                key={q}
                value={q}
                onPress={(val) => setAmount(val.replace(/\./g, ''))}
              />
            ))}
          </View>

          {/* Info */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(244, 114, 182, 0.1)' : '#FDF2F8', borderColor: isDark ? 'rgba(244, 114, 182, 0.2)' : '#FCE7F3' }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} style={{ marginRight: 10 }} />
            <AppText style={[styles.infoText, { color: colors.primary }]}>
              Nạp tiền từ ngân hàng liên kết hoàn toàn miễn phí 24/7. Tiền vào ví tức thì.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <PrimaryButton
          title={numAmount > 0 ? `Nạp ${numAmount.toLocaleString('vi-VN')} ₫` : 'Nhập số tiền cần nạp'}
          onPress={() => navigation.navigate('DepositConfirm', { amount: numAmount.toLocaleString('vi-VN'), selectedSource })}
          disabled={numAmount < 10000}
        />
        <SecondaryButton title="Hủy" onPress={() => navigation.goBack()} style={styles.secondaryBtn} />
      </View>

      {/* Modal chọn nguồn tiền */}
      <Modal visible={isSourceModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <AppText style={[styles.modalTitle, { color: colors.textPrimary }]}>Chọn nguồn nạp tiền</AppText>
              <TouchableOpacity onPress={() => setIsSourceModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {fundingSources.map((s: any) => {
              const sName = `${s.provider || 'Ngân hàng'} ****${s.number?.slice(-4) || '8888'}`;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedSource(sName);
                    setIsSourceModalVisible(false);
                  }}
                >
                  <MaterialCommunityIcons name="bank" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                  <AppText style={[styles.modalItemText, { color: colors.textPrimary, flex: 1 }]}>{sName}</AppText>
                  {selectedSource === sName && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.addNewSourceBtn, { backgroundColor: colors.primarySoft }]}
              onPress={() => {
                setIsSourceModalVisible(false);
                navigation.navigate('BankCardManagement');
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <AppText style={{ color: colors.primary, fontWeight: '700' }}>Liên kết thêm ngân hàng khác</AppText>
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
    fontSize: 17.5,
    fontWeight: '800',
  },
  spacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sourceCard: {
    borderRadius: Radius.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    ...Shadows.card,
  },
  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceInfo: {
    gap: 4,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sourceValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.card,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    ...Shadows.card,
  },
  currencySymbol: {
    fontSize: 26,
    fontWeight: '800',
    marginLeft: 8,
  },
  amountValue: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    padding: 0,
    margin: 0,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
  },
  secondaryBtn: {
    marginTop: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
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
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addNewSourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.md,
    marginTop: 16,
  },
});
