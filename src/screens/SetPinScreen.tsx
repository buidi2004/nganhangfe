import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Spacing , Colors } from '../theme';
import { AppText } from '../components/typography/AppText';
import { GlassHeader } from '../components/GlassHeader';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { WalletApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface SetPinScreenProps {
  navigation: any;
}

const NumericKeypad = React.memo(({
  onPress,
  onDelete,
  isDark,
  colors,
}: {
  onPress: (num: string) => void;
  onDelete: () => void;
  isDark: boolean;
  colors: any;
}) => {
  return (
    <View
      style={[
        styles.keypadWrapper,
        {
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
          backgroundColor: isDark ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.6)',
        },
      ]}
    >
      <BlurView intensity={isDark ? 40 : 30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['', '0', 'del'],
        ].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((key, kIdx) => (
              <TouchableOpacity
                key={kIdx}
                style={[
                  styles.key,
                  {
                    backgroundColor: isDark ? 'rgba(51,65,85,0.8)' : 'rgba(255,255,255,0.85)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                  },
                  key === '' && styles.emptyKey,
                ]}
                onPress={() => {
                  if (key === 'del') onDelete();
                  else if (key) onPress(key);
                }}
                activeOpacity={0.7}
                disabled={!key}
              >
                {key === 'del' ? (
                  <Ionicons name="backspace-outline" size={26} color={colors.primary} />
                ) : key !== '' ? (
                  <AppText style={[styles.keyText, { color: colors.textPrimary }]}>{key}</AppText>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
});

export default function SetPinScreen({ navigation }: SetPinScreenProps) {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const currentPin = step === 1 ? firstPin : confirmPin;

  const submitPin = async (finalPin: string) => {
    try {
      setIsLoading(true);
      await WalletApi.setPin(finalPin);
      setIsLoading(false);
      Alert.alert('Thành công', 'Thiết lập mã PIN giao dịch thành công!', [
        { text: 'Bắt đầu sử dụng', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error: any) {
      setIsLoading(false);
      setErrorMsg(error.message || 'Không thể thiết lập mã PIN');
      setConfirmPin('');
    }
  };

  const handlePress = useCallback(
    (num: string) => {
      if (isLoading) return;
      setErrorMsg('');

      if (step === 1) {
        setFirstPin((prev) => {
          if (prev.length >= 6) return prev;
          const next = prev + num;
          if (next.length === 6) {
            setTimeout(() => {
              setStep(2);
            }, 250);
          }
          return next;
        });
      } else {
        setConfirmPin((prev) => {
          if (prev.length >= 6) return prev;
          const next = prev + num;
          if (next.length === 6) {
            if (next === firstPin) {
              submitPin(next);
            } else {
              setErrorMsg('Mã PIN xác nhận không trùng khớp. Vui lòng nhập lại.');
              setTimeout(() => {
                setConfirmPin('');
              }, 400);
            }
          }
          return next;
        });
      }
    },
    [step, firstPin, isLoading]
  );

  const handleDelete = useCallback(() => {
    setErrorMsg('');
    if (step === 1) {
      setFirstPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  }, [step]);

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setConfirmPin('');
      setErrorMsg('');
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.bgBase} />
      <GlassHeader
        title={step === 1 ? 'Thiết lập mã PIN' : 'Xác nhận mã PIN'}
        onBack={handleBack}
      />
      <View style={styles.content}>
        <View style={styles.topSection}>
          {/* Stepper badge */}
          <View style={[styles.stepBadge, { backgroundColor: colors.primarySoft }]}>
            <AppText style={[styles.stepBadgeText, { color: colors.primary }]}>
              Bước {step}/2: {step === 1 ? 'Tạo mã mới' : 'Xác nhận lại'}
            </AppText>
          </View>

          <View style={[styles.iconWrapper, { backgroundColor: colors.primarySoft, borderColor: colors.glassBorder }]}>
            <Ionicons name={step === 1 ? 'key-outline' : 'shield-checkmark-outline'} size={32} color={colors.primary} />
          </View>

          <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 1
              ? 'Nhập 6 chữ số để tạo mã PIN bảo vệ giao dịch SenBank của bạn'
              : 'Vui lòng nhập lại đúng 6 chữ số mã PIN vừa tạo'}
          </AppText>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <AppText style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</AppText>
            </View>
          ) : null}
        </View>

        {/* PIN Indicators */}
        <View style={styles.pinCirclesRow}>
          {[...Array(6)].map((_, index) => {
            const isFilled = index < currentPin.length;
            return (
              <View
                key={index}
                style={[
                  styles.pinCircle,
                  {
                    borderColor: isFilled ? colors.primary : colors.border,
                    backgroundColor: isFilled ? colors.primarySoft : isDark ? '#1E293B' : '#FFFFFF',
                  },
                  index === currentPin.length && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                {isFilled && <View style={[styles.pinInnerDot, { backgroundColor: colors.primary }]} />}
              </View>
            );
          })}
        </View>

        {/* Security checklist guidelines (only on step 1) */}
        {step === 1 && (
          <View style={[styles.guidelineCard, { backgroundColor: isDark ? colors.cardBackground : '#F8FAFC', borderColor: colors.border }]}>
            <View style={styles.guidelineHeader}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <AppText style={[styles.guidelineTitle, { color: colors.textPrimary }]}>Quy tắc bảo mật mã PIN:</AppText>
            </View>
            <AppText style={[styles.guidelineItem, { color: colors.textSecondary }]}>
              • Không dùng dãy số liên tiếp (123456, 654321)
            </AppText>
            <AppText style={[styles.guidelineItem, { color: colors.textSecondary }]}>
              • Không dùng số lặp (111111, 888888) hoặc ngày sinh
            </AppText>
            <AppText style={[styles.guidelineItem, { color: colors.textSecondary }]}>
              • SenBank tuyệt đối không bao giờ yêu cầu mã PIN của bạn
            </AppText>
          </View>
        )}

        {isLoading ? (
          <View style={{ alignItems: 'center', padding: Spacing.xl }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>Đang thiết lập mã PIN an toàn...</AppText>
          </View>
        ) : (
          <NumericKeypad onPress={handlePress} onDelete={handleDelete} isDark={isDark} colors={colors} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  stepBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginBottom: Spacing.md,
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pinCirclesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 20,
  },
  pinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  guidelineCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  guidelineTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  guidelineItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  keypadWrapper: {
    marginHorizontal: 16,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  keypad: {
    padding: 16,
    gap: 14,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  key: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyKey: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
  },
});

