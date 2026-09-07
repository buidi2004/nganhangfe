import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Shadows, Spacing , Colors } from '../theme';
import { AppText } from '../components/typography/AppText';
import { GlassHeader } from '../components/GlassHeader';
import { WalletApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface LimitStatus {
  dailyLimit: number;
  dailySpent: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlySpent: number;
  monthlyRemaining: number;
  kycLevel?: string;
}

export default function ConfigScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [limitsStatus, setLimitsStatus] = useState<LimitStatus>({
    dailyLimit: 100000000,
    dailySpent: 500000,
    dailyRemaining: 99500000,
    monthlyLimit: 500000000,
    monthlySpent: 2000000,
    monthlyRemaining: 498000000,
    kycLevel: 'VERIFIED',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await WalletApi.getLimitsStatus();
        if (res.data) {
          setLimitsStatus(res.data);
        }
      } catch (error) {
        // Fallback to default certified banking limits
        console.warn('Fallback to standard limits config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLimits();
  }, []);

  const dailyPercent = Math.min(100, Math.round((limitsStatus.dailySpent / limitsStatus.dailyLimit) * 100)) || 1;
  const monthlyPercent = Math.min(100, Math.round((limitsStatus.monthlySpent / limitsStatus.monthlyLimit) * 100)) || 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <GlassHeader title="Hạn mức giao dịch" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* KYC Level Banner */}
            <View style={[styles.kycBanner, { backgroundColor: isDark ? colors.cardBackground : '#FDF2F8', borderColor: colors.glassBorder }]}>
              <View style={styles.kycLeft}>
                <View style={[styles.kycIcon, { backgroundColor: colors.primarySoft }]}>
                  <MaterialCommunityIcons name="shield-check" size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <AppText style={[styles.kycTitle, { color: colors.textPrimary }]}>Gói eKYC Nâng Cao</AppText>
                    <View style={styles.verifiedTag}>
                      <AppText style={styles.verifiedTagText}>Cấp 2</AppText>
                    </View>
                  </View>
                  <AppText style={[styles.kycSubtitle, { color: colors.textSecondary }]}>
                    Tài khoản đã xác thực CCCD gắn chip và sinh trắc học
                  </AppText>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.upgradeBtn, { backgroundColor: colors.primarySoft }]}
                onPress={() => navigation.navigate('KycLevel')}
              >
                <AppText style={[styles.upgradeBtnText, { color: colors.primary }]}>Chi tiết</AppText>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Daily Limit Card */}
            <View style={[styles.limitCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.limitCardHeader}>
                <View style={styles.headerLeft}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <AppText style={[styles.cardTitle, { color: colors.textPrimary }]}>Hạn mức ngày</AppText>
                </View>
                <AppText style={[styles.cardTotal, { color: colors.primary }]}>
                  {limitsStatus.dailyLimit.toLocaleString('vi-VN')} đ/ngày
                </AppText>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressTrack, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <View style={[styles.progressBar, { width: `${dailyPercent}%`, backgroundColor: colors.primary }]} />
              </View>

              <View style={styles.progressLabels}>
                <View>
                  <AppText style={[styles.progLabel, { color: colors.textSecondary }]}>Đã dùng hôm nay</AppText>
                  <AppText style={[styles.progValue, { color: colors.textPrimary }]}>
                    {limitsStatus.dailySpent.toLocaleString('vi-VN')} đ ({dailyPercent}%)
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText style={[styles.progLabel, { color: colors.textSecondary }]}>Còn lại khả dụng</AppText>
                  <AppText style={[styles.progValueBold, { color: '#10B981' }]}>
                    {limitsStatus.dailyRemaining.toLocaleString('vi-VN')} đ
                  </AppText>
                </View>
              </View>
            </View>

            {/* Monthly Limit Card */}
            <View style={[styles.limitCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.limitCardHeader}>
                <View style={styles.headerLeft}>
                  <Ionicons name="pie-chart-outline" size={20} color={colors.primary} />
                  <AppText style={[styles.cardTitle, { color: colors.textPrimary }]}>Hạn mức tháng</AppText>
                </View>
                <AppText style={[styles.cardTotal, { color: colors.primary }]}>
                  {limitsStatus.monthlyLimit.toLocaleString('vi-VN')} đ/tháng
                </AppText>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressTrack, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <View style={[styles.progressBar, { width: `${monthlyPercent}%`, backgroundColor: '#3B82F6' }]} />
              </View>

              <View style={styles.progressLabels}>
                <View>
                  <AppText style={[styles.progLabel, { color: colors.textSecondary }]}>Đã dùng tháng này</AppText>
                  <AppText style={[styles.progValue, { color: colors.textPrimary }]}>
                    {limitsStatus.monthlySpent.toLocaleString('vi-VN')} đ ({monthlyPercent}%)
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText style={[styles.progLabel, { color: colors.textSecondary }]}>Còn lại khả dụng</AppText>
                  <AppText style={[styles.progValueBold, { color: '#10B981' }]}>
                    {limitsStatus.monthlyRemaining.toLocaleString('vi-VN')} đ
                  </AppText>
                </View>
              </View>
            </View>

            {/* Per-transaction breakdown list */}
            <View style={[styles.breakdownCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <AppText style={[styles.breakdownSectionTitle, { color: colors.textPrimary }]}>
                Hạn mức theo từng giao dịch
              </AppText>

              {[
                { label: 'Chuyển tiền nội bộ SenBank', min: '10.000 đ', max: '50.000.000 đ/lần' },
                { label: 'Chuyển tiền liên ngân hàng 24/7', min: '10.000 đ', max: '50.000.000 đ/lần' },
                { label: 'Nạp tiền vào ví', min: '10.000 đ', max: '50.000.000 đ/lần' },
                { label: 'Rút tiền về ngân hàng liên kết', min: '50.000 đ', max: '20.000.000 đ/lần' },
                { label: 'Thanh toán hóa đơn & Tiện ích', min: '1.000 đ', max: '50.000.000 đ/lần' },
              ].map((item, idx, arr) => (
                <View key={idx}>
                  <View style={styles.breakdownRow}>
                    <View style={{ flex: 1 }}>
                      <AppText style={[styles.serviceName, { color: colors.textPrimary }]}>{item.label}</AppText>
                      <AppText style={[styles.serviceMin, { color: colors.textSecondary }]}>Tối thiểu: {item.min}</AppText>
                    </View>
                    <AppText style={[styles.serviceMax, { color: colors.primary }]}>{item.max}</AppText>
                  </View>
                  {idx < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </View>

            {/* State Bank Decree 2345 Notice */}
            <View style={[styles.complianceCard, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <View style={styles.complianceHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
                <AppText style={[styles.complianceTitle, { color: '#1E40AF' }]}>
                  Quy định An toàn Bảo mật (QĐ 2345/QĐ-NHNN)
                </AppText>
              </View>
              <AppText style={[styles.complianceText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
                • Giao dịch chuyển tiền trên <AppText style={{ fontWeight: '700' }}>10.000.000 đ/lần</AppText> bắt buộc xác thực khuôn mặt sinh trắc học.
              </AppText>
              <AppText style={[styles.complianceText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
                • Tổng giá trị các giao dịch trong ngày vượt quá <AppText style={{ fontWeight: '700' }}>20.000.000 đ</AppText> bắt buộc xác thực sinh trắc học cho lần giao dịch tiếp theo.
              </AppText>
            </View>
          </>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  kycLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  kycIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kycTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  verifiedTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  kycSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    gap: 2,
    marginLeft: Spacing.xs,
  },
  upgradeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  limitCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  limitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardTotal: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progLabel: {
    fontSize: 11,
  },
  progValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  progValueBold: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  breakdownCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  breakdownSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceMin: {
    fontSize: 11,
    marginTop: 2,
  },
  serviceMax: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  complianceCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 6,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  complianceTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  complianceText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
