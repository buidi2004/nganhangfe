import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { Colors, Radius, createThemedStyles } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { WalletApi } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface UserProfileScreenProps {
  navigation: any;
}

export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { user, updateAvatar } = useApp();
  const [realName, setRealName] = useState(user?.name || 'Tên người dùng');

  useEffect(() => {
    setRealName(user?.name || 'Tên người dùng');
    if (user?.name === user?.phoneNumber || user?.name === 'Tên người dùng') {
      WalletApi.getMe().then(res => {
        if (res.data?.fullName) setRealName(res.data.fullName);
        else if ((res.data as any)?.name) setRealName((res.data as any).name);
      }).catch(() => {});
    }
  }, [user]);


  // Use avatar from AppContext, fallback to default if not set
  const avatarSource = user?.avatarUri
    ? { uri: user.avatarUri }
    : { uri: 'https://i.pravatar.cc/300?img=11' };

  const handleEditAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập ảnh để đổi ảnh đại diện.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.cardBackground} />

      {/* 1. TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Hồ sơ người dùng</AppText>

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
        {/* 2. MAIN USER CARD (AVATAR + NAME + ID + 2 SUB-CARDS + LOYALTY) */}
        <View style={[styles.userMainCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Avatar with Edit Pencil */}
          <View style={styles.avatarContainer}>
            <Image
              source={avatarSource}
              style={styles.avatarImage}
            />
            <TouchableOpacity
              style={[styles.editPencilBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={handleEditAvatar}
            >
              <Ionicons name="pencil-outline" size={15} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* User Name & User ID */}
          <AppText style={[styles.userNameText, { color: colors.textPrimary }]}>{realName}</AppText>
          <AppText style={[styles.userIdText, { color: colors.textSecondary }]}>
            User ID: <AppText style={{ color: colors.primary, fontWeight: '800' }}>{user?.phoneNumber || '0000000000'}</AppText>
          </AppText>

          {/* 2 Sub-Cards Row */}
          <View style={styles.twoSubCardsRow}>
            {/* Left Card: Đang được bảo vệ */}
            <TouchableOpacity
              style={[styles.subCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SecuritySettings')}
            >
              <MaterialCommunityIcons name="shield-check" size={26} color="#10B981" />
              <AppText style={[styles.subCardText, { color: colors.textPrimary }]}>
                Đang được{'\n'}bảo vệ
              </AppText>
            </TouchableOpacity>

            {/* Right Card: Gói hội viên SenBank Basic */}
            <TouchableOpacity
              style={[styles.subCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('KycLevel')}
            >
              <MaterialCommunityIcons name="crown" size={22} color="#94A3B8" />
              <View>
                <AppText style={[styles.subCardLabel, { color: colors.textSecondary }]}>Hội viên SenBank</AppText>
                <AppText style={[styles.subCardValue, { color: colors.textPrimary }]}>Basic</AppText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Loyalty Score Card Inside Main Container */}
          <View style={[styles.loyaltyBox, { backgroundColor: isDark ? colors.surface : colors.primarySoft, borderColor: isDark ? colors.border : colors.primarySoft }]}>
            <View style={styles.loyaltyLeftCol}>
              <AppText style={[styles.loyaltySmallLabel, { color: colors.textSecondary }]}>ĐIỂM LOYALTY</AppText>
              <View style={styles.loyaltyScoreRow}>
                <AppText style={[styles.loyaltyScoreNumber, { color: colors.primary }]}>0</AppText>
                <MaterialCommunityIcons name="crown" size={16} color="#F59E0B" style={{ marginLeft: 6 }} />
              </View>

              <TouchableOpacity
                style={styles.collectPointsRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Promotions')}
              >
                <AppText style={[styles.collectPointsText, { color: colors.primary }]}>Tích điểm</AppText>
                <Ionicons name="chevron-forward" size={13} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Nút Đổi Quà */}
            <TouchableOpacity
              style={styles.redeemGiftBtn}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Promotions')}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <AppText style={styles.redeemGiftText}>Đổi quà</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. SETTINGS & KYC GROUPED MENU LIST */}
        <View style={[styles.menuGroupCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Item 1: Mức định danh */}
          <TouchableOpacity
            style={styles.menuItemRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('KycLevel')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="face-recognition" size={22} color={colors.primary} />
              <AppText style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Mức định danh</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

          {/* Item 2: Chữ ký số */}
          <TouchableOpacity
            style={styles.menuItemRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('DigitalSignature')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="draw-pen" size={22} color={colors.primary} />
              <AppText style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Chữ ký số</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

          {/* Item 3: Giấy tờ tùy thân */}
          <TouchableOpacity
            style={styles.menuItemRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('IdentityDocument')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="card-account-details-outline" size={22} color={colors.primary} />
              <AppText style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Giấy tờ tùy thân</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

          {/* Item 4: Email */}
          <TouchableOpacity
            style={styles.menuItemRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EmailSettings')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={22} color={colors.primary} />
              <AppText style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Email</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

          {/* Item 5: Đổi mật khẩu */}
          <TouchableOpacity
            style={styles.menuItemRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="lock-reset" size={22} color={colors.primary} />
              <AppText style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Đổi mật khẩu</AppText>
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
    paddingBottom: 100,
  },
  userMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FCE7F3',
  },
  editPencilBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  userIdText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 16,
  },
  twoSubCardsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  subCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  subCardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
  },
  subCardLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  subCardValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  loyaltyBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  loyaltyLeftCol: {
    gap: 2,
  },
  loyaltySmallLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  loyaltyScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loyaltyScoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  collectPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  collectPointsText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  redeemGiftBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 9,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  redeemGiftText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  menuGroupCard: {
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
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
}));
