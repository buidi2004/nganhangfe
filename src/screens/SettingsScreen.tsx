import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '../components/typography/AppText';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../theme';

export default function SettingsScreen({ navigation }: any) {
  const { customBackgroundUri, setCustomBackgroundUri } = useApp();
  const { themeMode, isDark, colors, setThemeMode } = useTheme();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để đổi ảnh nền.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCustomBackgroundUri(result.assets[0].uri);
      Alert.alert('Thành công', 'Đã thay đổi ảnh nền trang chủ!');
    }
  };

  const handleResetImage = () => {
    setCustomBackgroundUri(null);
    Alert.alert('Thành công', 'Đã khôi phục ảnh nền mặc định!');
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: any; desc: string }[] = [
    { mode: 'light', label: 'Chế độ Sáng', icon: 'sunny-outline', desc: 'Giao diện nền sáng rực rỡ' },
    { mode: 'dark', label: 'Chế độ Tối', icon: 'moon-outline', desc: 'Dịu mắt, tiết kiệm pin' },
    { mode: 'system', label: 'Theo hệ thống', icon: 'phone-portrait-outline', desc: 'Tự động đồng bộ với thiết bị' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.background}
        translucent
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Cài đặt</AppText>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* SECTION: GIAO DIỆN & CHẾ ĐỘ TỐI */}
        <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Giao diện & Chế độ tối</AppText>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Quick toggle switch */}
          <View style={styles.toggleRow}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.rowTitle, { color: colors.textPrimary }]}>Chế độ tối (Dark Mode)</AppText>
              <AppText style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                {themeMode === 'system'
                  ? `Đang theo hệ thống (${isDark ? 'Đang tối' : 'Đang sáng'})`
                  : isDark ? 'Đang bật giao diện tối' : 'Đang bật giao diện sáng'}
              </AppText>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
              trackColor={{ false: '#CBD5E1', true: colors.primaryDeep }}
              thumbColor={isDark ? colors.primary : '#FFFFFF'}
            />
          </View>

          {/* 3 Theme Mode Choices */}
          <View style={[styles.themePillsContainer, { borderTopColor: colors.border }]}>
            <AppText style={[styles.subLabel, { color: colors.textSecondary }]}>Tùy chọn hiển thị:</AppText>
            
            <View style={styles.themeOptionsGrid}>
              {themeOptions.map((opt) => {
                const isSelected = themeMode === opt.mode;
                return (
                  <TouchableOpacity
                    key={opt.mode}
                    style={[
                      styles.themeOptionPill,
                      { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                      isSelected && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setThemeMode(opt.mode)}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <AppText
                      style={[
                        styles.themeOptionText,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {opt.label}
                    </AppText>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginLeft: 2 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* SECTION: CÁ NHÂN HÓA */}
        <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Cá nhân hóa</AppText>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.rowItem} activeOpacity={0.7} onPress={handlePickImage}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="image-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.rowTitle, { color: colors.textPrimary }]}>Đổi ảnh nền trang chủ</AppText>
              <AppText style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Tải ảnh lên từ thư viện điện thoại</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {customBackgroundUri && (
            <TouchableOpacity
              style={[styles.rowItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
              activeOpacity={0.7}
              onPress={handleResetImage}
            >
              <View style={[styles.rowIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="refresh" size={20} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.rowTitle, { color: '#EF4444' }]}>Khôi phục ảnh mặc định</AppText>
                <AppText style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Quay về hình nền gốc của ứng dụng</AppText>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION: THÔNG TIN ỨNG DỤNG */}
        <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Về ứng dụng</AppText>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowItem}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.rowTitle, { color: colors.textPrimary }]}>Phiên bản Sen Hồng E-Wallet</AppText>
              <AppText style={[styles.rowSubtitle, { color: colors.textSecondary }]}>v2.6.8 • Bảo mật chuẩn PCI DSS</AppText>
            </View>
            <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>Mới nhất</AppText>
          </View>
        </View>

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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17.5,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12.5,
  },
  themePillsContainer: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 14,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  themeOptionsGrid: {
    gap: 8,
  },
  themeOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  themeOptionText: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
});
