import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '../components/typography/AppText';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode, Radius, THEME_OPTIONS, ThemeColorId , Colors } from '../theme';

export default function SettingsScreen({ navigation }: any) {
  const { customBackgroundUri, setCustomBackgroundUri } = useApp();
  const { themeMode, themeColor, isDark, colors, setThemeMode, setThemeColor } = useTheme();

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

  const themeModeOptions: { mode: ThemeMode; label: string; icon: any; desc: string }[] = [
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
        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Giao diện & Cài đặt</AppText>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ============================================================ */}
        {/* 1. KHUNG XEM TRƯỚC TRỰC QUAN (LIVE THEME PREVIEW) */}
        {/* ============================================================ */}
        <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Xem trước giao diện</AppText>

        <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Mini ATM Card Preview */}
          <LinearGradient
            colors={[colors.heroGradStart, colors.heroGradMid, colors.heroGradEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.miniAtmCard}
          >
            <View style={styles.miniCardHeader}>
              <View style={styles.miniBrandRow}>
                <Ionicons name="flower" size={16} color="#FFFFFF" />
                <AppText style={styles.miniBrandText}>SenBank Platinum</AppText>
              </View>
              <MaterialCommunityIcons name="contactless-payment" size={20} color="rgba(255,255,255,0.85)" />
            </View>

            <View style={styles.miniCardChip}>
              <LinearGradient
                colors={['#FDE68A', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chipInner}
              />
            </View>

            <View style={styles.miniCardFooter}>
              <View>
                <AppText style={styles.miniCardLabel}>Số dư khả dụng</AppText>
                <AppText style={styles.miniCardBalance}>88.680.000 đ</AppText>
              </View>
              <AppText style={styles.miniCardNumber}>•••• 6868</AppText>
            </View>
          </LinearGradient>

          {/* Sample Mini Interactive Elements */}
          <View style={styles.previewControlsRow}>
            {/* Sample Button */}
            <LinearGradient
              colors={[colors.primary, colors.heroGradMid]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.samplePrimaryBtn, { shadowColor: colors.shadowColor }]}
            >
              <AppText style={styles.sampleBtnText}>Nút bấm mẫu</AppText>
            </LinearGradient>

            {/* Sample Chips */}
            <View style={[styles.sampleChip, { backgroundColor: colors.primarySoft, borderColor: colors.primaryGlow }]}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <AppText style={[styles.sampleChipText, { color: colors.primary }]}>{colors.themeName}</AppText>
            </View>
          </View>
        </View>

        {/* ============================================================ */}
        {/* 2. CHỦ ĐỀ MÀU SẮC HỆ THỐNG (COLOR PALETTE PICKER) */}
        {/* ============================================================ */}
        <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Chủ đề màu sắc (5 Màu)</AppText>

        <View style={styles.palettesContainer}>
          {THEME_OPTIONS.map((item) => {
            const isSelected = themeColor === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.paletteCard,
                  { backgroundColor: colors.surface, borderColor: isSelected ? item.accent : colors.border },
                  isSelected && {
                    borderWidth: 2,
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : colors.primarySoft,
                    shadowColor: item.accent,
                    elevation: 4,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setThemeColor(item.id)}
              >
                {/* Dải gradient xem trước 3 màu */}
                <LinearGradient
                  colors={item.previewGradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.paletteSwatchBar}
                />

                <View style={styles.paletteContent}>
                  <View style={styles.paletteLeft}>
                    {/* Icon đại diện */}
                    <View style={[styles.paletteIconWrap, { backgroundColor: isSelected ? item.accent : isDark ? '#334155' : '#F1F5F9' }]}>
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={isSelected ? '#FFFFFF' : item.accent}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.paletteTitleRow}>
                        <AppText style={[styles.paletteName, { color: colors.textPrimary }]}>
                          {item.name}
                        </AppText>
                        <AppText style={[styles.paletteSubtitle, { color: colors.textSecondary }]}>
                          • {item.subtitle}
                        </AppText>
                      </View>
                      <AppText style={[styles.paletteMeaning, { color: colors.textMuted }]}>
                        {item.meaning}
                      </AppText>
                    </View>
                  </View>

                  {/* Vòng tròn trạng thái chọn */}
                  <View
                    style={[
                      styles.checkCircle,
                      { borderColor: isSelected ? item.accent : colors.border },
                      isSelected && { backgroundColor: item.accent },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ============================================================ */}
        {/* 3. CHẾ ĐỘ SÁNG / TỐI (DARK / LIGHT MODE) */}
        {/* ============================================================ */}
        <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Chế độ hiển thị</AppText>

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
                  : isDark
                  ? 'Đang bật giao diện tối'
                  : 'Đang bật giao diện sáng'}
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
              {themeModeOptions.map((opt) => {
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

        {/* ============================================================ */}
        {/* 4. CÁ NHÂN HÓA HÌNH NỀN */}
        {/* ============================================================ */}
        <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Cá nhân hóa hình nền</AppText>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.rowItem} activeOpacity={0.7} onPress={handlePickImage}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="image-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.rowTitle, { color: colors.textPrimary }]}>Đổi ảnh nền trang chủ</AppText>
              <AppText style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                Tải ảnh lên từ thư viện điện thoại
              </AppText>
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
                <AppText style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                  Quay về hình nền gốc của ứng dụng
                </AppText>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ============================================================ */}
        {/* 5. THÔNG TIN ỨNG DỤNG */}
        {/* ============================================================ */}
        <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]}>Về ứng dụng</AppText>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowItem}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={[styles.rowTitle, { color: colors.textPrimary }]}>Phiên bản SenBank E-Wallet</AppText>
              <AppText style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                v2.6.8 • Theme {colors.themeName}
              </AppText>
            </View>
            <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>Chuẩn PCI DSS</AppText>
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Preview Card */
  previewCard: {
    borderRadius: Radius.card,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  miniAtmCard: {
    borderRadius: 16,
    padding: 16,
    height: 145,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  miniCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniBrandText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
    letterSpacing: 0.5,
  },
  miniCardChip: {
    width: 30,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#FDE68A',
    overflow: 'hidden',
  },
  chipInner: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  miniCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  miniCardLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '500',
  },
  miniCardBalance: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  miniCardNumber: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  previewControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  samplePrimaryBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  sampleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  sampleChipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* Palette Cards */
  palettesContainer: {
    gap: 10,
    marginBottom: 20,
  },
  paletteCard: {
    borderRadius: Radius.card,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  paletteSwatchBar: {
    height: 6,
    width: '100%',
  },
  paletteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  paletteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  paletteIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paletteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  paletteName: {
    fontSize: 15,
    fontWeight: '800',
  },
  paletteSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  paletteMeaning: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Common card styles */
  card: {
    borderRadius: Radius.card,
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
