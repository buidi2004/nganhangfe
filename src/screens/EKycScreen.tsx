import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Shadows, Spacing , Colors } from '../theme';
import { AppText } from '../components/typography/AppText';
import { GlassHeader } from '../components/GlassHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { WalletApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function EKycScreen({ navigation }: { navigation: any }) {
  const { colors, isDark } = useTheme();
  const [idCardNumber, setIdCardNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [frontCardUploaded, setFrontCardUploaded] = useState(false);
  const [backCardUploaded, setBackCardUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    idCardNumber.trim().length >= 9 &&
    fullName.trim().length > 2 &&
    dob.trim().length >= 8 &&
    frontCardUploaded &&
    backCardUploaded &&
    selfieUploaded;

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert('Chưa đủ thông tin', 'Vui lòng điền đầy đủ thông tin cá nhân và chụp đủ 3 ảnh xác thực (Mặt trước, Mặt sau CCCD và Ảnh chân dung).');
      return;
    }
    setIsSubmitting(true);
    try {
      await WalletApi.submitKyc(
        idCardNumber.trim(),
        fullName.trim().toUpperCase(),
        dob.trim(),
        'https://static.senbank.vn/kyc/front_sample.jpg',
        'https://static.senbank.vn/kyc/back_sample.jpg',
        'https://static.senbank.vn/kyc/selfie_sample.jpg'
      );
      setIsSubmitting(false);
      Alert.alert(
        'Định danh thành công',
        'Hồ sơ eKYC của bạn đã được tiếp nhận và xác thực thành công. Hạn mức giao dịch của bạn đã được nâng lên Cấp 2.',
        [{ text: 'Hoàn tất', onPress: () => navigation.navigate('Home') }]
      );
    } catch (e: any) {
      setIsSubmitting(false);
      Alert.alert('Lỗi định danh', e.message || 'Không thể nộp hồ sơ eKYC. Vui lòng thử lại.');
    }
  };

  const simulateUpload = (type: 'front' | 'back' | 'selfie', title: string) => {
    Alert.alert('Chụp ảnh xác thực', `Hệ thống mô phỏng quét nhận diện AI cho ${title}.`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Chụp ảnh chuẩn',
        onPress: () => {
          if (type === 'front') setFrontCardUploaded(true);
          if (type === 'back') setBackCardUploaded(true);
          if (type === 'selfie') setSelfieUploaded(true);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <GlassHeader title="Định danh điện tử (eKYC)" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Security Header Banner */}
          <View style={[styles.trustBanner, { backgroundColor: isDark ? colors.cardBackground : '#FDF2F8', borderColor: colors.glassBorder }]}>
            <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText style={[styles.trustTitle, { color: colors.textPrimary }]}>Xác thực định danh Cấp 2</AppText>
              <AppText style={[styles.trustSubtitle, { color: colors.textSecondary }]}>
                Mở khóa hạn mức 100 triệu/ngày theo quy định Ngân hàng Nhà nước
              </AppText>
            </View>
          </View>

          {/* Section 1: Personal Information */}
          <View style={[styles.cardSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Thông tin cá nhân trên CCCD</AppText>

            <View style={styles.inputGroup}>
              <AppText style={[styles.label, { color: colors.textSecondary }]}>Số CCCD gắn chip (12 số)</AppText>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Ví dụ: 079204012891"
                  placeholderTextColor={colors.textSecondary}
                  value={idCardNumber}
                  onChangeText={setIdCardNumber}
                  keyboardType="numeric"
                  maxLength={12}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText style={[styles.label, { color: colors.textSecondary }]}>Họ và tên (có dấu, in hoa)</AppText>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Ví dụ: NGUYỄN VĂN AN"
                  placeholderTextColor={colors.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText style={[styles.label, { color: colors.textSecondary }]}>Ngày tháng năm sinh (DD/MM/YYYY)</AppText>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Ví dụ: 15/08/1998"
                  placeholderTextColor={colors.textSecondary}
                  value={dob}
                  onChangeText={setDob}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Section 2: Document Photo Captures */}
          <View style={[styles.cardSection, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. Hình ảnh CCCD & Khuôn mặt</AppText>
            <AppText style={[styles.guidelineText, { color: colors.textSecondary }]}>
              • Đặt thẻ vừa khung hình, chụp ở nơi đủ sáng
              • Không chụp lóa đèn, không bị che khuất góc
            </AppText>

            {/* Front Card */}
            <TouchableOpacity
              style={[
                styles.captureBox,
                {
                  borderColor: frontCardUploaded ? '#10B981' : colors.border,
                  backgroundColor: frontCardUploaded
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.1)'
                      : '#ECFDF5'
                    : isDark
                    ? '#0F172A'
                    : '#F8FAFC',
                },
              ]}
              onPress={() => simulateUpload('front', 'Mặt trước CCCD')}
              activeOpacity={0.7}
            >
              <View style={styles.captureLeft}>
                <View style={[styles.cameraCircle, { backgroundColor: frontCardUploaded ? '#D1FAE5' : colors.primarySoft }]}>
                  <Ionicons
                    name={frontCardUploaded ? 'checkmark-circle' : 'camera-outline'}
                    size={22}
                    color={frontCardUploaded ? '#10B981' : colors.primary}
                  />
                </View>
                <View>
                  <AppText style={[styles.captureTitle, { color: colors.textPrimary }]}>Mặt trước CCCD</AppText>
                  <AppText style={[styles.captureStatus, { color: frontCardUploaded ? '#10B981' : colors.textSecondary }]}>
                    {frontCardUploaded ? 'Đã quét thành công' : 'Chưa chụp ảnh'}
                  </AppText>
                </View>
              </View>
              <Ionicons
                name={frontCardUploaded ? 'checkmark' : 'chevron-forward'}
                size={20}
                color={frontCardUploaded ? '#10B981' : colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Back Card */}
            <TouchableOpacity
              style={[
                styles.captureBox,
                {
                  borderColor: backCardUploaded ? '#10B981' : colors.border,
                  backgroundColor: backCardUploaded
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.1)'
                      : '#ECFDF5'
                    : isDark
                    ? '#0F172A'
                    : '#F8FAFC',
                },
              ]}
              onPress={() => simulateUpload('back', 'Mặt sau CCCD')}
              activeOpacity={0.7}
            >
              <View style={styles.captureLeft}>
                <View style={[styles.cameraCircle, { backgroundColor: backCardUploaded ? '#D1FAE5' : colors.primarySoft }]}>
                  <Ionicons
                    name={backCardUploaded ? 'checkmark-circle' : 'camera-outline'}
                    size={22}
                    color={backCardUploaded ? '#10B981' : colors.primary}
                  />
                </View>
                <View>
                  <AppText style={[styles.captureTitle, { color: colors.textPrimary }]}>Mặt sau CCCD</AppText>
                  <AppText style={[styles.captureStatus, { color: backCardUploaded ? '#10B981' : colors.textSecondary }]}>
                    {backCardUploaded ? 'Đã quét thành công' : 'Chưa chụp ảnh'}
                  </AppText>
                </View>
              </View>
              <Ionicons
                name={backCardUploaded ? 'checkmark' : 'chevron-forward'}
                size={20}
                color={backCardUploaded ? '#10B981' : colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Selfie */}
            <TouchableOpacity
              style={[
                styles.captureBox,
                {
                  borderColor: selfieUploaded ? '#10B981' : colors.border,
                  backgroundColor: selfieUploaded
                    ? isDark
                      ? 'rgba(16, 185, 129, 0.1)'
                      : '#ECFDF5'
                    : isDark
                    ? '#0F172A'
                    : '#F8FAFC',
                },
              ]}
              onPress={() => simulateUpload('selfie', 'Ảnh chân dung (Selfie)')}
              activeOpacity={0.7}
            >
              <View style={styles.captureLeft}>
                <View style={[styles.cameraCircle, { backgroundColor: selfieUploaded ? '#D1FAE5' : colors.primarySoft }]}>
                  <Ionicons
                    name={selfieUploaded ? 'checkmark-circle' : 'scan-outline'}
                    size={22}
                    color={selfieUploaded ? '#10B981' : colors.primary}
                  />
                </View>
                <View>
                  <AppText style={[styles.captureTitle, { color: colors.textPrimary }]}>Xác thực khuôn mặt (FaceID)</AppText>
                  <AppText style={[styles.captureStatus, { color: selfieUploaded ? '#10B981' : colors.textSecondary }]}>
                    {selfieUploaded ? 'Đã nhận diện sinh trắc học' : 'Chưa quét khuôn mặt'}
                  </AppText>
                </View>
              </View>
              <Ionicons
                name={selfieUploaded ? 'checkmark' : 'chevron-forward'}
                size={20}
                color={selfieUploaded ? '#10B981' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Compliance & Terms */}
          <View style={styles.complianceRow}>
            <MaterialCommunityIcons name="shield-lock" size={18} color="#10B981" />
            <AppText style={[styles.complianceText, { color: colors.textSecondary }]}>
              Dữ liệu được mã hóa đầu cuối (E2EE) và bảo mật tuyệt đối theo tiêu chuẩn của Ngân hàng Nhà nước Việt Nam.
            </AppText>
          </View>

          {/* Submit CTA */}
          <View style={{ marginTop: Spacing.xl }}>
            {isSubmitting ? (
              <View style={{ alignItems: 'center', padding: Spacing.md }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>Đang xử lý hồ sơ định danh điện tử...</AppText>
              </View>
            ) : (
              <PrimaryButton
                title="Gửi hồ sơ định danh"
                onPress={handleSubmit}
                disabled={!isFormValid}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  trustTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  trustSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  cardSection: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  guidelineText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  captureBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  captureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cameraCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  captureStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
  },
  complianceText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
