import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { Radius, Shadows, Spacing , Colors, createThemedStyles } from '../theme';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface DigitalSignatureScreenProps {
  navigation: any;
}

export default function DigitalSignatureScreen({ navigation }: DigitalSignatureScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  const handleTestSign = () => {
    Alert.alert('Chữ ký số Smart CA', 'Ký số thử nghiệm thành công với mã bảo mật Digital OTP của SenBank.');
  };

  const handleChangePIN = () => {
    Alert.alert('Đổi mã PIN', 'Chuyển sang giao diện đổi mã PIN chữ ký số Smart CA SenBank.');
  };

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

        <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Chữ ký số</AppText>

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
        {/* HERO SMART CA CARD */}
        <View style={[styles.heroCard, { borderColor: colors.border }]}>
          <LinearGradient
            colors={isDark ? ['#1E293B', '#0F172A'] : ['#FDF2F8', '#FCE7F3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroIconCircle, { backgroundColor: colors.primarySoft }]}>
            <MaterialCommunityIcons name="draw-pen" size={36} color={colors.primary} />
          </View>

          <AppText style={[styles.heroTitle, { color: colors.textPrimary }]}>Chữ ký số Smart CA SenBank</AppText>
          <AppText style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Giải pháp ký số từ xa an toàn tuyệt đối, tuân thủ tiêu chuẩn bảo mật quốc tế và Bộ Thông tin & Truyền thông.
          </AppText>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <AppText style={styles.statusPillText}>Đang hoạt động</AppText>
          </View>
        </View>

        {/* CERTIFICATE DETAILS CARD */}
        <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <AppText style={[styles.sectionHeading, { color: colors.textPrimary }]}>Thông tin chứng thư số</AppText>

          <View style={styles.infoRow}>
            <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>Chủ thể chứng thư</AppText>
            <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>BÙI VĂN DĨ</AppText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>Số CMND/CCCD</AppText>
            <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>079204012891</AppText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>Nhà cung cấp CA</AppText>
            <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>SenBank & Viettel-CA</AppText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>Thời hạn hiệu lực</AppText>
            <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>25/08/2026 - 25/08/2028</AppText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <AppText style={[styles.infoLabel, { color: colors.textSecondary }]}>Thiết bị kích hoạt</AppText>
            <AppText style={[styles.infoValue, { color: colors.textPrimary }]}>Thiết bị này (Active)</AppText>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={[styles.actionsList, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.actionBtnRow}
            activeOpacity={0.7}
            onPress={handleChangePIN}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="key-outline" size={22} color={colors.primary} />
              <AppText style={[styles.actionTitle, { color: colors.textPrimary }]}>Đổi mã PIN ký số</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.actionBtnRow}
            activeOpacity={0.7}
            onPress={handleTestSign}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              <AppText style={[styles.actionTitle, { color: colors.textPrimary }]}>Ký số thử nghiệm tài liệu</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
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
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
    paddingHorizontal: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusPillText: {
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
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  actionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
}));
