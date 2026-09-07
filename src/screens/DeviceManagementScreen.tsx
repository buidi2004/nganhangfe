import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/icons/AppIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { Radius, Shadows, Spacing , Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { StatusChip } from '../components/StatusChip';
import { SolidCard } from '../components/SolidCard';
import { EmptyState } from '../components/EmptyState';
import { AppText } from '../components/typography/AppText';
import { WalletApi } from '../services/api';

interface DeviceManagementScreenProps {
  navigation: any;
}

interface DeviceSession {
  id: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  active: boolean;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export default function DeviceManagementScreen({ navigation }: DeviceManagementScreenProps) {
  const { colors, isDark } = useTheme();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const res = await WalletApi.getActiveSessions();
      if (res.data) {
        const sorted = res.data.sort((a: any, b: any) => 
          new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
        );
        if (sorted.length > 0) {
          sorted[0].isCurrent = true;
        }
        setSessions(sorted);
      }
    } catch (e) {
      console.warn('Failed to fetch sessions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = (deviceId: string, deviceName: string) => {
    Alert.alert(
      'Gỡ thiết bị',
      `Bạn có chắc chắn muốn đăng xuất khỏi thiết bị "${deviceName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gỡ thiết bị',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await WalletApi.revokeSession(deviceId);
              await fetchSessions();
            } catch (e: any) {
              Alert.alert('Lỗi', e.message || 'Không thể gỡ thiết bị.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const getPlatform = (ua: string) => {
    if (!ua) return 'Unknown';
    if (ua.toLowerCase().includes('iphone') || ua.toLowerCase().includes('ios') || ua.toLowerCase().includes('mac')) return 'iOS';
    if (ua.toLowerCase().includes('android')) return 'Android';
    if (ua.toLowerCase().includes('windows')) return 'Windows';
    return 'Web/Khác';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.bgBase} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <AppIcon name="arrow-back" size="md" color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Thiết bị đã đăng nhập</AppText>
        <TouchableOpacity onPress={fetchSessions} style={styles.backBtn}>
          <AppIcon name="refresh" size="sm" color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon="phone-portrait-outline"
            title="Chưa có thiết bị nào"
            subtitle="Thiết bị bạn đăng nhập sẽ hiển thị ở đây"
          />
        ) : (
          <>
            <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Thiết bị đang hoạt động</AppText>
            {sessions.map((device) => {
              const platform = getPlatform(device.userAgent);
              const name = device.userAgent.split(' ')[0] || device.deviceId;
              const date = new Date(device.lastActiveAt).toLocaleString('vi-VN');

              return (
                <SolidCard
                  key={device.id}
                  style={[
                    styles.deviceCard,
                    { backgroundColor: isDark ? colors.cardBackground : colors.surface },
                  ]}
                >
                  <View style={styles.deviceHeader}>
                    <LinearGradient
                      colors={[colors.primarySoft, isDark ? '#334155' : colors.deviceIconGradEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.deviceIcon}
                    >
                      <AppIcon
                        name={platform === 'iOS' ? 'phone-portrait' : (platform === 'Android' ? 'logo-android' : 'laptop-outline')}
                        size="lg"
                        color={colors.primary}
                      />
                    </LinearGradient>
                    <View style={styles.deviceInfo}>
                      <View style={styles.deviceNameRow}>
                        <AppText style={[styles.deviceName, { color: colors.textPrimary }]} numberOfLines={1}>
                          {name}
                        </AppText>
                        {device.isCurrent && <StatusChip text="Đang dùng" type="success" size="sm" />}
                      </View>
                      <AppText style={[styles.devicePlatform, { color: colors.textSecondary }]}>
                        {platform} • {device.ipAddress}
                      </AppText>
                      <AppText style={[styles.deviceLastUsed, { color: colors.textSecondary }]}>
                        Lần cuối: {date}
                      </AppText>
                    </View>
                  </View>
                  {!device.isCurrent && (
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRevoke(device.deviceId, name)}>
                      <AppText style={[styles.removeText, { color: colors.danger }]}>Gỡ thiết bị</AppText>
                    </TouchableOpacity>
                  )}
                </SolidCard>
              );
            })}

            {/* Security tip */}
            <View style={[styles.tipCard, { backgroundColor: isDark ? colors.cardBackground : colors.primarySoft }]}>
              <AppIcon name="information-circle" size="md" color={colors.primary} />
              <AppText style={[styles.tipText, { color: isDark ? colors.textPrimary : colors.primary }]}>
                Nếu bạn không nhận ra thiết bị nào, hãy gỡ thiết bị và đổi mật khẩu tài khoản ngay lập tức.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deviceCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    ...Shadows.card,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  deviceIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
    gap: 4,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '700',
  },
  devicePlatform: {
    fontSize: 13,
  },
  deviceLastUsed: {
    fontSize: 12,
  },
  removeBtn: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

