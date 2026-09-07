import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { Colors, Radius, createThemedStyles } from '../theme';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface SecuritySettingsScreenProps {
  navigation: any;
}

export default function SecuritySettingsScreen({ navigation }: SecuritySettingsScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [isHideBalanceDefault, setIsHideBalanceDefault] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.cardBackground} />

      {/* TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Bảo mật & Xác thực</AppText>

        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO STATUS CARD */}
        <View style={[styles.heroCard, { borderColor: isDark ? colors.border : colors.primarySoft }]}>
          <LinearGradient
            colors={isDark ? ['#3B1028', '#200A18'] : ['#FDF2F8', '#FCE7F3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroIconCircle, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#065F46' : '#DCFCE7' }]}>
            <MaterialCommunityIcons name="shield-check" size={44} color="#10B981" />
          </View>

          <AppText style={[styles.heroTitle, { color: colors.primary }]}>Tài khoản đang được bảo vệ</AppText>
          <AppText style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Hệ thống giám sát bảo mật đa lớp 24/7 của SenBank bảo vệ an toàn cho mọi giao dịch thanh toán của bạn.
          </AppText>

          <View style={[styles.securityScoreBadge, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle" size={16} color={isDark ? '#34D399' : '#10B981'} />
            <AppText style={[styles.securityScoreText, { color: isDark ? '#A7F3D0' : '#15803D' }]}>Mức độ an toàn: Tối đa (100%)</AppText>
          </View>
        </View>

        {/* AUTHENTICATION METHODS */}
        <View style={[styles.groupCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <AppText style={[styles.groupCardTitle, { color: colors.textPrimary }]}>Phương thức xác thực</AppText>

          {/* 1. Biometric Fingerprint / FaceID */}
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                <MaterialCommunityIcons name="fingerprint" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.menuTitle, { color: colors.textPrimary }]}>Đăng nhập sinh trắc học</AppText>
                <AppText style={[styles.menuSub, { color: colors.textSecondary }]}>Vân tay / Nhận diện khuôn mặt</AppText>
              </View>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={setIsBiometricEnabled}
              trackColor={{ false: isDark ? '#475569' : '#CBD5E1', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* 2. Digital OTP */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Digital OTP', 'Mã PIN Digital OTP của bạn đang hoạt động bình thường.')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                <MaterialCommunityIcons name="shield-key-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.menuTitle, { color: colors.textPrimary }]}>Quản lý Digital OTP</AppText>
                <AppText style={[styles.menuSub, { color: colors.textSecondary }]}>Đổi mã PIN / Đăng ký lại thiết bị</AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* 3. Đổi mật khẩu đăng nhập */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                <MaterialCommunityIcons name="lock-reset" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.menuTitle, { color: colors.textPrimary }]}>Đổi mật khẩu đăng nhập</AppText>
                <AppText style={[styles.menuSub, { color: colors.textSecondary }]}>Cập nhật định kỳ để tăng tính an toàn</AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* PRIVACY & DEVICES */}
        <View style={[styles.groupCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <AppText style={[styles.groupCardTitle, { color: colors.textPrimary }]}>Quyền riêng tư & Thiết bị</AppText>

          {/* Ẩn số dư mặc định */}
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                <Ionicons name="eye-off-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.menuTitle, { color: colors.textPrimary }]}>Ẩn số dư khi mở ứng dụng</AppText>
                <AppText style={[styles.menuSub, { color: colors.textSecondary }]}>Bảo vệ số dư khỏi người xung quanh</AppText>
              </View>
            </View>
            <Switch
              value={isHideBalanceDefault}
              onValueChange={setIsHideBalanceDefault}
              trackColor={{ false: isDark ? '#475569' : '#CBD5E1', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Quản lý thiết bị */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DeviceManagement')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                <MaterialCommunityIcons name="cellphone-link" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.menuTitle, { color: colors.textPrimary }]}>Quản lý thiết bị đăng nhập</AppText>
                <AppText style={[styles.menuSub, { color: colors.textSecondary }]}>1 thiết bị đang tin cậy</AppText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = createThemedStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: Radius.card,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#DCFCE7',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.primaryDeep,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  securityScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  securityScoreText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#15803D',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  groupCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
}));
