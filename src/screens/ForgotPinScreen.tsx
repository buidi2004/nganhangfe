import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Spacing, Shadows , Colors } from '../theme';
import { AppText } from '../components/typography/AppText';
import { GlassHeader } from '../components/GlassHeader';
import { Ionicons } from '@expo/vector-icons';
import { WalletApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

interface ForgotPinScreenProps {
  navigation: any;
}

export default function ForgotPinScreen({ navigation }: ForgotPinScreenProps) {
  const { colors, isDark } = useTheme();
  const { user } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: verify OTP, 2: set new pin, 3: confirm pin
  const [otp, setOtp] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // OTP Countdown
  useEffect(() => {
    let timer: any;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      setCountdown(60);
      setCanResend(false);
      setOtp('');
      setError('');
      if (user?.phoneNumber) {
        await WalletApi.sendOtp(user.phoneNumber);
      }
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi tới số điện thoại của bạn.');
    } catch (e: any) {
      Alert.alert('Thông báo', e.message || 'Đã gửi lại mã OTP mô phỏng.');
    }
  };

  const currentInput = step === 1 ? otp : step === 2 ? newPin : confirmPin;

  const verifyOtpStep = async (enteredOtp: string) => {
    if (!user?.phoneNumber) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    try {
      const res = await WalletApi.verifyOtp(user.phoneNumber, enteredOtp);
      if (res.data === true || res.success) {
        setIsLoading(false);
        setStep(2);
      } else {
        setIsLoading(false);
        setError('Mã OTP không chính xác hoặc đã hết hạn.');
        setOtp('');
      }
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
      setOtp('');
    }
  };

  const handleKeyPress = useCallback((val: string) => {
    if (isLoading) return;
    setError('');

    if (step === 1) {
      setOtp(prev => {
        if (prev.length >= 6) return prev;
        const next = prev + val;
        if (next.length === 6) {
          setTimeout(() => {
            verifyOtpStep(next);
          }, 300);
        }
        return next;
      });
    } else if (step === 2) {
      setNewPin(prev => {
        if (prev.length >= 6) return prev;
        const next = prev + val;
        if (next.length === 6) {
          setTimeout(() => {
            setStep(3);
          }, 300);
        }
        return next;
      });
    } else {
      setConfirmPin(prev => {
        if (prev.length >= 6) return prev;
        const next = prev + val;
        if (next.length === 6) {
          if (next === newPin) {
            handleCompleteReset(next);
          } else {
            setError('Mã PIN xác nhận không khớp. Vui lòng thử lại.');
            setTimeout(() => setConfirmPin(''), 400);
          }
        }
        return next;
      });
    }
  }, [step, newPin, isLoading, user?.phoneNumber]);

  const handleDelete = useCallback(() => {
    setError('');
    if (step === 1) setOtp(prev => prev.slice(0, -1));
    else if (step === 2) setNewPin(prev => prev.slice(0, -1));
    else setConfirmPin(prev => prev.slice(0, -1));
  }, [step]);

  const handleCompleteReset = async (finalPin: string) => {
    try {
      setIsLoading(true);
      await WalletApi.setPin(finalPin);
      setIsLoading(false);
      Alert.alert('Thành công', 'Đặt lại mã PIN thành công! Bạn có thể sử dụng mã PIN mới cho các giao dịch.', [
        { text: 'Về trang chủ', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || 'Không thể thiết lập mã PIN');
      setConfirmPin('');
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setConfirmPin('');
      setError('');
    } else if (step === 2) {
      setStep(1);
      setNewPin('');
      setError('');
    } else {
      navigation.goBack();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Xác thực mã OTP';
      case 2: return 'Tạo mã PIN mới';
      case 3: return 'Xác nhận lại mã PIN';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return `Nhập mã OTP 6 số đã gửi tới SĐT ${user?.phoneNumber ? `***${user.phoneNumber.slice(-4)}` : 'của bạn'}`;
      case 2: return 'Nhập 6 chữ số mã PIN mới cho tài khoản';
      case 3: return 'Nhập lại 6 chữ số mã PIN vừa tạo để hoàn tất';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.bgBase} />
      <GlassHeader title="Khôi phục mã PIN" onBack={handleBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step indicator */}
        <View style={styles.stepIndicatorRow}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.stepLine,
                {
                  backgroundColor: step >= s ? colors.primary : isDark ? '#334155' : '#E2E8F0',
                  flex: s === 3 ? 0.8 : 1,
                },
              ]}
            />
          ))}
        </View>

        {/* Header Title */}
        <View style={styles.headerTextWrapper}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.primarySoft }]}>
            <Ionicons
              name={step === 1 ? 'chatbubble-ellipses-outline' : step === 2 ? 'key-outline' : 'shield-checkmark-outline'}
              size={30}
              color={colors.primary}
            />
          </View>
          <AppText style={[styles.title, { color: colors.textPrimary }]}>{getStepTitle()}</AppText>
          <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>{getStepSubtitle()}</AppText>
        </View>

        {/* Circles indicator */}
        <View style={styles.pinContainer}>
          {[...Array(6)].map((_, i) => {
            const isFilled = currentInput.length > i;
            return (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  {
                    borderColor: isFilled ? colors.primary : colors.border,
                    backgroundColor: isFilled ? colors.primarySoft : isDark ? '#1E293B' : '#FFFFFF',
                  },
                  i === currentInput.length && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                {isFilled && <View style={[styles.pinInner, { backgroundColor: colors.primary }]} />}
              </View>
            );
          })}
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <AppText style={[styles.errorText, { color: colors.danger }]}>{error}</AppText>
          </View>
        ) : null}

        {/* Resend OTP button (step 1 only) */}
        {step === 1 && (
          <View style={styles.resendWrapper}>
            <AppText style={{ color: colors.textSecondary, fontSize: 13 }}>Không nhận được mã?</AppText>
            <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
              <AppText style={[styles.resendText, { color: canResend ? colors.primary : colors.textMuted }]}>
                {canResend ? 'Gửi lại mã OTP' : `Gửi lại sau (${countdown}s)`}
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Keypad */}
        {isLoading ? (
          <View style={{ padding: Spacing.xxl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>Đang cập nhật mã PIN...</AppText>
          </View>
        ) : (
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.key,
                  {
                    backgroundColor: isDark ? colors.cardBackground : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                  },
                  key === '' && styles.emptyKey,
                ]}
                onPress={() => {
                  if (key === 'del') handleDelete();
                  else if (key) handleKeyPress(key);
                }}
                activeOpacity={0.7}
                disabled={!key}
              >
                {key === 'del' ? (
                  <Ionicons name="backspace-outline" size={24} color={colors.primary} />
                ) : (
                  <AppText style={[styles.keyText, { color: colors.textPrimary }]}>{key}</AppText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  stepLine: {
    height: 4,
    borderRadius: Radius.pill,
  },
  headerTextWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: Spacing.lg,
  },
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resendWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xl,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.card,
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

