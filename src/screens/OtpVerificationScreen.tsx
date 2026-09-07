import { Colors, createThemedStyles } from '../theme';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { WalletApi } from '../services/api';

const { width } = Dimensions.get('window');

interface OtpVerificationScreenProps {
  route?: any;
  navigation: any;
}

export default function OtpVerificationScreen({ route, navigation }: OtpVerificationScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { phone = '0923158725', fromScreen = 'ForgotPassword' } = route?.params || {};
  const [pinDigits, setPinDigits] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = async (val: string) => {
    if (pinDigits.length < 6 && !isLoading) {
      const nextPins = [...pinDigits, val];
      setPinDigits(nextPins);

      if (nextPins.length === 6) {
        try {
          setIsLoading(true);
          const otpStr = nextPins.join('');
          // Import WalletApi if not already imported (will add below if needed)
          await WalletApi.verifyOtp(phone, otpStr);
          setIsLoading(false);

          if (fromScreen === 'ForgotPassword') {
            navigation.navigate('ResetPassword', { phone, otp: otpStr });
          } else {
            navigation.navigate('MainTabs');
          }
        } catch (error: any) {
          setIsLoading(false);
          setPinDigits([]);
          Alert.alert('Lỗi', error.message || 'Mã OTP không hợp lệ');
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Xác thực OTP</AppText>

        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* HERO ICON */}
        <View style={[styles.heroIconWrapper, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#F0FDF4' }]}>
          <MaterialCommunityIcons name="shield-check" size={44} color="#10B981" />
        </View>

        <AppText style={[styles.title, { color: colors.primary }]}>Nhập mã xác thực OTP</AppText>
        <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Mã xác thực gồm 6 chữ số đã được gửi tới số điện thoại{' '}
          <AppText style={{ fontWeight: '800', color: colors.primary }}>{phone}</AppText>
        </AppText>

        {/* 6 PIN CIRCLE DOTS */}
        <View style={styles.pinCirclesRow}>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pinDigits.length;
            return (
              <View
                key={index}
                style={[
                  styles.pinCircle,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  isFilled && { borderColor: colors.primary },
                ]}
              >
                {isFilled && <View style={[styles.pinInnerDot, { backgroundColor: colors.primary }]} />}
              </View>
            );
          })}
        </View>

        {/* RESEND OTP */}
        <TouchableOpacity
          style={styles.resendBtn}
          activeOpacity={0.7}
          onPress={() => setPinDigits([])}
        >
          <AppText style={[styles.resendText, { color: colors.textSecondary }]}>Chưa nhận được mã? <AppText style={[styles.resendHighlight, { color: colors.primary }]}>Gửi lại (45s)</AppText></AppText>
        </TouchableOpacity>
      </View>

      {/* NUMERIC KEYPAD */}
      <View style={[styles.keypadContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['clear', '0', 'del'],
        ].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((item, cIdx) => {
              if (item === 'clear') {
                return (
                  <TouchableOpacity
                    key={cIdx}
                    style={styles.keypadBtn}
                    activeOpacity={0.7}
                    onPress={() => setPinDigits([])}
                  >
                    <AppText style={[styles.keypadActionText, { color: colors.textSecondary }]}>Xóa hết</AppText>
                  </TouchableOpacity>
                );
              }
              if (item === 'del') {
                return (
                  <TouchableOpacity
                    key={cIdx}
                    style={styles.keypadBtn}
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
                  style={styles.keypadBtn}
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
    </SafeAreaView>
  );
}

const getStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
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
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: -0.3,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  heroIconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#DCFCE7',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
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
  resendBtn: {
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '600',
  },
  resendHighlight: { color: colors.primaryDeep,
    fontWeight: '800',
  },
  keypadContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  keypadBtn: {
    width: 76,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadDigitText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  keypadActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
}));
