import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { createThemedStyles, ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: any) {
  const { colors, isDark, themeColor } = useTheme();
  const isThemedBg = themeColor === 'amber' || themeColor === 'purple';
  const styles = getStyles(colors);
  const { register, isLoading, lastError, clearError } = useApp();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !phone || !idNumber || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      await register(phone, password, fullName);
      // Wait for 500ms to show success before navigating to KYC or SetPin
      setTimeout(() => {
        navigation.navigate('SetPin');
      }, 500);
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', lastError || e.message);
      clearError();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isThemedBg || isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* BACKGROUND KHI CHỌN THEME VÀNG HOẶC TÍM */}
      {themeColor === 'amber' ? (
        <ImageBackground
          source={require('../../assets/theme-amber-bg.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Lớp overlay nhẹ giữ độ tương phản chuẩn mực và làm nổi bật các thẻ nhập liệu */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 8, 2, 0.45)' }]} />
        </ImageBackground>
      ) : themeColor === 'purple' ? (
        <ImageBackground
          source={require('../../assets/theme-purple-bg.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Lớp overlay nhẹ giữ độ tương phản chuẩn mực và làm nổi bật các thẻ nhập liệu */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 8, 40, 0.45)' }]} />
        </ImageBackground>
      ) : null}

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* TOP HEADER */}
        <View style={[styles.header, isThemedBg && styles.headerAmber]}>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={isThemedBg ? '#FFFFFF' : colors.primaryDeep}
            />
          </TouchableOpacity>

          <AppText
            style={[
              styles.headerTitle,
              isThemedBg && { color: '#FFFFFF' },
            ]}
          >
            Mở tài khoản SenBank
          </AppText>

          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons
              name="home-outline"
              size={22}
              color={isThemedBg ? '#FFFFFF' : colors.primaryDeep}
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* HERO BADGE */}
            <View style={styles.heroLogoWrap}>
              <View
                style={[
                  styles.mbLogoCircle,
                  isThemedBg && {
                    backgroundColor: themeColor === 'purple' ? 'rgba(192, 132, 252, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                    borderColor: colors.primaryGlow,
                  },
                ]}
              >
                <AppText style={{ color: colors.primary, fontSize: 24, fontWeight: '900' }}>★</AppText>
              </View>
              <AppText
                style={[
                  styles.heroHeading,
                  isThemedBg && { color: '#FFFFFF' },
                ]}
              >
                Tài khoản số đẹp miễn phí
              </AppText>
              <AppText
                style={[
                  styles.heroSub,
                  isThemedBg && { color: 'rgba(255, 255, 255, 0.85)' },
                ]}
              >
                Đăng ký trực tuyến siêu tốc chỉ trong 1 phút
              </AppText>
            </View>

            {/* INPUT 1: HỌ VÀ TÊN */}
            <View style={styles.inputCard}>
              <AppText style={styles.inputLabel}>Họ và tên (In hoa không dấu)</AppText>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="VD: BUI VAN DI"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={(text) => setFullName(text.toUpperCase())}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* INPUT 2: SỐ ĐIỆN THOẠI */}
            <View style={styles.inputCard}>
              <AppText style={styles.inputLabel}>Số điện thoại chính chủ</AppText>
              <View style={styles.inputRow}>
                <Ionicons name="call-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* INPUT 3: SỐ CCCD */}
            <View style={styles.inputCard}>
              <AppText style={styles.inputLabel}>Số CCCD gắn chip (12 số)</AppText>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập 12 số CCCD"
                  placeholderTextColor="#94A3B8"
                  value={idNumber}
                  onChangeText={setIdNumber}
                  keyboardType="number-pad"
                  maxLength={12}
                />
              </View>
            </View>

            {/* INPUT 4: MẬT KHẨU */}
            <View style={styles.inputCard}>
              <AppText style={styles.inputLabel}>Mật khẩu đăng nhập</AppText>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Tối thiểu 8 ký tự"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.primaryGlow}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* TERMS AGREEMENT NOTE */}
            <View
              style={[
                styles.termsNoteBox,
                isThemedBg && {
                  backgroundColor: themeColor === 'purple' ? 'rgba(192, 132, 252, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                  borderColor: themeColor === 'purple' ? 'rgba(192, 132, 252, 0.3)' : 'rgba(251, 191, 36, 0.3)',
                },
              ]}
            >
              <TouchableOpacity onPress={() => setAgreed(!agreed)}>
                <Ionicons 
                  name={agreed ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
              <AppText
                style={[
                  styles.termsNoteText,
                  isThemedBg && { color: 'rgba(255, 255, 255, 0.9)' },
                ]}
              >
                Bằng việc nhấn "Tiếp tục", bạn xác nhận đã đọc và đồng ý vô điều kiện với{' '}
                <AppText
                  style={[
                    styles.termsLinkText,
                    isThemedBg && { color: colors.primaryGlow },
                  ]}
                  onPress={() => navigation.navigate('TermsOfService')}
                >
                  Điều khoản & Điều kiện sử dụng dịch vụ SenBank
                </AppText>
                .
              </AppText>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.submitBtn, (!agreed || isLoading) && { opacity: 0.5 }]}
              activeOpacity={0.8}
              disabled={!agreed || isLoading}
              onPress={handleRegister}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <AppText style={styles.submitBtnText}>Tiếp tục</AppText>
              )}
            </TouchableOpacity>

            {/* BACK TO LOGIN */}
            <TouchableOpacity
              style={styles.loginLinkBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
            >
              <AppText
                style={[
                  styles.loginLinkText,
                  isThemedBg && { color: 'rgba(255, 255, 255, 0.85)' },
                ]}
              >
                Đã có tài khoản?{' '}
                <AppText
                  style={{
                    color: isThemedBg ? colors.primaryGlow : colors.primaryDeep,
                    fontWeight: '800',
                  }}
                >
                  Đăng nhập ngay
                </AppText>
              </AppText>
            </TouchableOpacity>

            {/* 4. ĐẶC QUYỀN THÀNH VIÊN MỚI (Kéo dài màn hình khi cuộn xuống) */}
            <View style={styles.benefitsContainer}>
              <AppText style={[styles.benefitsSectionTitle, isThemedBg && { color: '#FFFFFF' }]}>
                Đặc quyền thành viên mới
              </AppText>

              {/* Bento Grid 2 Columns */}
              <View style={styles.bentoRow}>
                <View style={styles.bentoCol}>
                  <View style={[styles.bentoCard, isThemedBg ? styles.bentoCardAmber : styles.bentoCardLight]}>
                    <MaterialCommunityIcons name="shield-check" size={28} color={isThemedBg ? (themeColor === 'purple' ? '#C084FC' : '#FBBF24') : colors.primary} />
                    <AppText style={[styles.bentoCardTitle, isThemedBg && { color: '#FFFFFF' }]}>
                      Miễn phí 100%
                    </AppText>
                    <AppText style={[styles.bentoCardSub, isThemedBg && { color: 'rgba(255,255,255,0.75)' }]}>
                      Chuyển khoản 24/7 & phí duy trì 0đ trọn đời
                    </AppText>
                  </View>

                  <View style={[styles.bentoCard, isThemedBg ? styles.bentoCardAmber : styles.bentoCardLight, { marginTop: 12 }]}>
                    <MaterialCommunityIcons name="star-shooting" size={28} color={isThemedBg ? (themeColor === 'purple' ? '#C084FC' : '#FBBF24') : colors.primary} />
                    <AppText style={[styles.bentoCardTitle, isThemedBg && { color: '#FFFFFF' }]}>
                      Tài khoản số đẹp
                    </AppText>
                    <AppText style={[styles.bentoCardSub, isThemedBg && { color: 'rgba(255,255,255,0.75)' }]}>
                      Chọn số phong thủy, ngày sinh hoàn toàn miễn phí
                    </AppText>
                  </View>
                </View>

                <View style={styles.bentoCol}>
                  <View style={[styles.bentoCard, isThemedBg ? styles.bentoCardAmber : styles.bentoCardLight]}>
                    <MaterialCommunityIcons name="credit-card-refund" size={28} color={isThemedBg ? (themeColor === 'purple' ? '#C084FC' : '#FBBF24') : colors.primary} />
                    <AppText style={[styles.bentoCardTitle, isThemedBg && { color: '#FFFFFF' }]}>
                      Hoàn tiền 5%
                    </AppText>
                    <AppText style={[styles.bentoCardSub, isThemedBg && { color: 'rgba(255,255,255,0.75)' }]}>
                      Ưu đãi hoàn tiền ăn uống, mua sắm khi chi tiêu thẻ
                    </AppText>
                  </View>

                  <View style={[styles.bentoCard, isThemedBg ? styles.bentoCardAmber : styles.bentoCardLight, { marginTop: 12 }]}>
                    <MaterialCommunityIcons name="gift-outline" size={28} color={isThemedBg ? (themeColor === 'purple' ? '#C084FC' : '#FBBF24') : colors.primary} />
                    <AppText style={[styles.bentoCardTitle, isThemedBg && { color: '#FFFFFF' }]}>
                      Voucher 500k
                    </AppText>
                    <AppText style={[styles.bentoCardSub, isThemedBg && { color: 'rgba(255,255,255,0.75)' }]}>
                      Gói quà tặng chào mừng bạn mới ngay khi kích hoạt
                    </AppText>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ height: Platform.OS === 'ios' ? 40 : 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerAmber: {
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroLogoWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mbLogoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.badgePinkSoft,
    borderWidth: 1.5,
    borderColor: colors.badgePinkBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroHeading: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.primaryDeep,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  termsNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.badgePinkSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.badgePinkBorder,
    padding: 12,
    marginVertical: 14,
  },
  termsNoteText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  termsLinkText: {
    color: colors.primaryDeep,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  submitBtn: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  loginLinkBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  benefitsContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  benefitsSectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primaryDeep,
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  bentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bentoCol: {
    width: '48.5%',
  },
  bentoCard: {
    borderRadius: 16,
    padding: 14,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  bentoCardAmber: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  bentoCardLight: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bentoCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  bentoCardSub: {
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
}));
