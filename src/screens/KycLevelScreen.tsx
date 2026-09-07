import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { Colors, Radius, createThemedStyles } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { WalletApi } from '../services/api';

const { width } = Dimensions.get('window');

interface KycLevelScreenProps {
  navigation: any;
}

export default function KycLevelScreen({ navigation }: KycLevelScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { user } = useApp();
  const [kycData, setKycData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    WalletApi.getKycStatus()
      .then((res) => {
        if (res.data) setKycData(res.data);
      })
      .catch(() => setKycData(null))
      .finally(() => setIsLoading(false));
  }, []);

  const isVerified = kycData?.status === 'VERIFIED';
  const isPending = kycData?.status === 'PENDING';

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

        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Mức định danh</AppText>

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
        {isLoading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải trạng thái định danh...</AppText>
          </View>
        ) : (
          <>
            {/* CURRENT KYC HERO CARD */}
            <View style={[styles.heroCard, { borderColor: isDark ? colors.border : colors.primarySoft }]}>
              <LinearGradient
                colors={isDark ? ['#3B1028', '#200A18'] : ['#FDF2F8', '#FCE7F3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.heroIconWrapper, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#065F46' : '#DCFCE7' }]}>
                <MaterialCommunityIcons name="shield-check" size={48} color={isVerified ? '#10B981' : isPending ? '#F59E0B' : colors.primary} />
              </View>

              <AppText style={[styles.heroLevelTitle, { color: colors.primary }]}>
                {isVerified ? 'Định danh Cấp 2 (eKYC)' : isPending ? 'Hồ sơ đang chờ duyệt' : 'Định danh Cấp 1 (Cơ bản)'}
              </AppText>
              <AppText style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                {isVerified
                  ? 'Tài khoản của bạn đã được xác thực danh tính đầy đủ trực tuyến qua sinh trắc học và CCCD gắn chip.'
                  : isPending
                  ? 'Hồ sơ eKYC của bạn đang được hệ thống phê duyệt. Vui lòng kiểm tra lại sau ít phút.'
                  : 'Nâng cấp lên Cấp 2 bằng CCCD gắn chip để nâng hạn mức giao dịch lên 500 triệu/ngày.'}
              </AppText>

              <View style={styles.activeBadge}>
                <View style={[styles.greenDot, { backgroundColor: isVerified ? '#10B981' : isPending ? '#F59E0B' : '#94A3B8' }]} />
                <AppText style={styles.activeBadgeText}>
                  {isVerified ? 'Đang hoạt động đầy đủ tính năng' : isPending ? 'Chờ xác thực hoàn tất' : 'Chưa hoàn tất định danh'}
                </AppText>
              </View>

              {!isVerified && !isPending && (
                <TouchableOpacity
                  style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 14 }}
                  onPress={() => navigation.navigate('EKyc')}
                >
                  <AppText style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Định danh ngay</AppText>
                </TouchableOpacity>
              )}
            </View>

            {/* VERIFIED ITEMS CARD */}
            <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <AppText style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>Hồ sơ xác thực</AppText>

              <View style={styles.kycRow}>
                <View style={[styles.kycIconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                  <MaterialCommunityIcons name="face-recognition" size={22} color={colors.primary} />
                </View>
                <View style={styles.kycInfoCol}>
                  <AppText style={[styles.kycItemTitle, { color: colors.textPrimary }]}>Khuôn mặt (FaceID / Sinh trắc học)</AppText>
                  <AppText style={[styles.kycItemSub, { color: colors.textSecondary }]}>
                    {isVerified ? 'Đã đối khớp với dữ liệu dân cư' : 'Chưa xác thực khuôn mặt'}
                  </AppText>
                </View>
                <Ionicons
                  name={isVerified ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isVerified ? '#10B981' : colors.textMuted}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.kycRow}>
                <View style={[styles.kycIconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                  <MaterialCommunityIcons name="card-account-details-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.kycInfoCol}>
                  <AppText style={[styles.kycItemTitle, { color: colors.textPrimary }]}>CCCD Gắn Chip NFC</AppText>
                  <AppText style={[styles.kycItemSub, { color: colors.textSecondary }]}>
                    {kycData?.idCardNumber
                      ? `${kycData.idCardNumber.slice(0, 4)} •••• ${kycData.idCardNumber.slice(-4)} - Đã kích hoạt`
                      : 'Chưa cập nhật'}
                  </AppText>
                </View>
                <Ionicons
                  name={isVerified ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isVerified ? '#10B981' : colors.textMuted}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.kycRow}>
                <View style={[styles.kycIconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                  <Ionicons name="call-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.kycInfoCol}>
                  <AppText style={[styles.kycItemTitle, { color: colors.textPrimary }]}>Số điện thoại chính chủ</AppText>
                  <AppText style={[styles.kycItemSub, { color: colors.textSecondary }]}>
                    {user?.phoneNumber || '0987654321'} (Đã kích hoạt OTP)
                  </AppText>
                </View>
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              </View>
            </View>
          </>
        )}

        {/* BENEFITS CARD */}
        <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <AppText style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>Hạn mức & Quyền lợi của bạn</AppText>

          <View style={styles.benefitRow}>
            <Ionicons name="flash-outline" size={20} color={colors.primary} />
            <AppText style={[styles.benefitText, { color: colors.textPrimary }]}>Chuyển tiền hạn mức lên tới 500,000,000 đ/ngày</AppText>
          </View>

          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="bank-outline" size={20} color={colors.primary} />
            <AppText style={[styles.benefitText, { color: colors.textPrimary }]}>Mở tài khoản số đẹp & thẻ thanh toán quốc tế</AppText>
          </View>

          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="piggy-bank-outline" size={20} color={colors.primary} />
            <AppText style={[styles.benefitText, { color: colors.textPrimary }]}>Gửi tiết kiệm trực tuyến & vay vốn tín chấp</AppText>
          </View>
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
  heroIconWrapper: {
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
  heroLevelTitle: {
    fontSize: 20,
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
    paddingHorizontal: 10,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeBadgeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#15803D',
  },
  detailsCard: {
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
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  kycRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  kycIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kycInfoCol: {
    flex: 1,
  },
  kycItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  kycItemSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  benefitText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
}));
