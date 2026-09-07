import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Svg, { Rect, Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { createThemedStyles, ThemeColors } from '../theme';

const { width } = Dimensions.get('window');

export default function AccountDetailScreen({ navigation }: any) {
  const { colors, isDark, themeColor } = useTheme();
  const { user, wallet } = useApp();
  const styles = getStyles(colors, isDark);

  const [activeTab, setActiveTab] = useState<'VND' | 'FOREIGN'>('VND');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  // Formatted balance
  const rawBalance = wallet?.balance ?? 500510;
  const displayBalance = balanceVisible
    ? rawBalance.toLocaleString('vi-VN')
    : '*** ***';
  const displayCurrency = wallet?.currency || 'VND';
  const accountNumber = user?.phoneNumber || '0923158725';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Đã sao chép', `Đã sao chép số tài khoản: ${accountNumber}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* 1. TOP HEADER (Back button & 3 Action icons: AI, Bell, Home) */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color={styles.headerIconColor.color} />
          </TouchableOpacity>

          <View style={styles.headerRightActions}>
            {/* AI Assistant */}
            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Search')}
            >
              <View style={styles.aiBadge}>
                <AppText style={styles.aiBadgeText}>(AI)</AppText>
              </View>
            </TouchableOpacity>

            {/* Notifications Bell */}
            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={styles.headerIconColor.color} />
            </TouchableOpacity>

            {/* Home Icon */}
            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Ionicons name="home-outline" size={24} color={styles.headerIconColor.color} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 2. TITLE "Tài khoản" */}
          <AppText style={styles.pageTitle}>Tài khoản</AppText>

          {/* 3. SEGMENTED TABS (VND / Ngoại tệ) */}
          <View style={styles.segmentedTabsWrap}>
            <TouchableOpacity
              style={[styles.segmentTab, activeTab === 'VND' && styles.segmentTabActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('VND')}
            >
              <AppText
                style={[
                  styles.segmentTabText,
                  activeTab === 'VND' && styles.segmentTabTextActive,
                ]}
              >
                VND
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentTab, activeTab === 'FOREIGN' && styles.segmentTabActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('FOREIGN')}
            >
              <AppText
                style={[
                  styles.segmentTabText,
                  activeTab === 'FOREIGN' && styles.segmentTabTextActive,
                ]}
              >
                Ngoại tệ
              </AppText>
            </TouchableOpacity>
          </View>

          {activeTab === 'VND' ? (
            <>
              {/* 4. MAIN ACCOUNT CARD */}
              <View style={styles.mainAccountCard}>
                {/* Header: Label + Eye Toggle */}
                <View style={styles.cardHeaderRow}>
                  <AppText style={styles.cardHeaderLabel}>Số dư tài khoản</AppText>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setBalanceVisible(!balanceVisible)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={styles.subTextColor.color}
                    />
                  </TouchableOpacity>
                </View>

                {/* Big Balance */}
                <AppText style={styles.cardBalanceAmount}>
                  {displayBalance} <AppText style={styles.cardBalanceCurrency}>{displayCurrency}</AppText>
                </AppText>

                {/* Inner Account Box with Green Border */}
                <View style={styles.innerAccountBox}>
                  {/* Tag MẶC ĐỊNH attached to top border */}
                  <View style={styles.defaultTagWrap}>
                    <AppText style={styles.defaultTagText}>MẶC ĐỊNH</AppText>
                  </View>

                  <View style={styles.innerBoxContent}>
                    {/* Account Number with Copy */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleCopy}
                      style={styles.accountNumberRow}
                    >
                      <AppText style={styles.accountNumberText}>{accountNumber}</AppText>
                      <Ionicons
                        name={copied ? 'checkmark-circle' : 'copy-outline'}
                        size={18}
                        color={copied ? '#10B981' : styles.subTextColor.color}
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>

                    {/* Balance inside */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('TransactionHistory')}
                    >
                      <AppText style={styles.innerBalanceText}>
                        {displayBalance}{' '}
                        <AppText style={styles.innerBalanceCurrency}>{displayCurrency}</AppText>
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3 Quick Action Items (QR của tôi, TK số đẹp, TK chạm) */}
                <View style={styles.quickActionsRow}>
                  {/* Action 1: QR của tôi */}
                  <TouchableOpacity
                    style={styles.quickActionItem}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('MyQR')}
                  >
                    <View style={styles.quickActionCircle}>
                      <MaterialCommunityIcons
                        name="qrcode-scan"
                        size={22}
                        color={styles.actionIconColor.color}
                      />
                    </View>
                    <AppText style={styles.quickActionLabel}>QR của tôi</AppText>
                  </TouchableOpacity>

                  {/* Action 2: TK số đẹp */}
                  <TouchableOpacity
                    style={styles.quickActionItem}
                    activeOpacity={0.8}
                    onPress={() =>
                      Alert.alert(
                        'Tài khoản số đẹp',
                        'Mở thêm tài khoản số đẹp theo phong thủy, ngày sinh hoàn toàn miễn phí.',
                        [
                          { text: 'Khám phá ngay', onPress: () => navigation.navigate('Cards') },
                          { text: 'Đóng', style: 'cancel' },
                        ]
                      )
                    }
                  >
                    <View style={styles.quickActionCircle}>
                      <MaterialCommunityIcons
                        name="emoticon-happy-outline"
                        size={25}
                        color={styles.actionIconColor.color}
                      />
                    </View>
                    <AppText style={styles.quickActionLabel}>TK số đẹp</AppText>
                  </TouchableOpacity>

                  {/* Action 3: TK chạm (Google Pay / NFC) */}
                  <TouchableOpacity
                    style={styles.quickActionItem}
                    activeOpacity={0.8}
                    onPress={() =>
                      Alert.alert(
                        'Tài khoản Chạm (NFC)',
                        'Thanh toán chạm siêu tốc không cần mở ứng dụng. Liên kết thẻ với Google Pay hoặc Apple Wallet.',
                        [{ text: 'Đã hiểu' }]
                      )
                    }
                  >
                    <View style={styles.quickActionCircle}>
                      <View style={styles.gPayIconWrap}>
                        <FontAwesome5 name="google-pay" size={24} color="#4A3E36" />
                      </View>
                    </View>
                    <AppText style={styles.quickActionLabel}>TK chạm</AppText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 5. BOTTOM BANNER: TÀI KHOẢN HỘ KINH DOANH */}
              <View style={styles.businessBannerCard}>
                <View style={styles.businessTextCol}>
                  <AppText style={styles.businessTitle}>Tài khoản hộ kinh doanh</AppText>
                  <AppText style={styles.businessSub}>Tối ưu lợi nhuận kinh doanh</AppText>
                  <TouchableOpacity
                    style={styles.registerBtn}
                    activeOpacity={0.8}
                    onPress={() =>
                      Alert.alert(
                        'Tài khoản Hộ kinh doanh',
                        'Đăng ký gói giải pháp tài chính chuyên biệt cho Hộ kinh doanh cá thể: Miễn phí quản lý, hoàn tiền giao dịch, ưu đãi lãi suất vay vốn.',
                        [
                          { text: 'Đăng ký ngay', onPress: () => navigation.navigate('QuickLoan') },
                          { text: 'Để sau', style: 'cancel' },
                        ]
                      )
                    }
                  >
                    <AppText style={styles.registerBtnText}>Đăng ký</AppText>
                  </TouchableOpacity>
                </View>

                {/* Cute 3D Shop Illustration */}
                <View style={styles.businessGraphicWrap}>
                  <Svg width={110} height={100} viewBox="0 0 110 100">
                    <Defs>
                      <SvgLinearGradient id="pedestalGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#D97706" />
                        <Stop offset="100%" stopColor="#B45309" />
                      </SvgLinearGradient>
                      <SvgLinearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#FDBA74" />
                        <Stop offset="100%" stopColor="#FB923C" />
                      </SvgLinearGradient>
                    </Defs>

                    {/* Concentric Ripple Rings */}
                    <Circle cx="85" cy="70" r="42" stroke="rgba(217, 119, 6, 0.12)" strokeWidth="1.5" fill="none" />
                    <Circle cx="85" cy="70" r="30" stroke="rgba(217, 119, 6, 0.18)" strokeWidth="1.5" fill="none" />
                    <Circle cx="85" cy="70" r="18" stroke="rgba(217, 119, 6, 0.22)" strokeWidth="1.5" fill="none" />

                    {/* Pedestal Ellipse */}
                    <Path
                      d="M 55,72 C 55,67 105,67 105,72 L 105,78 C 105,83 55,83 55,78 Z"
                      fill="url(#pedestalGrad)"
                    />
                    <Circle cx="80" cy="72" r="22" fill="#F59E0B" />

                    {/* Shop Building Base */}
                    <Rect x="64" y="46" width="32" height="24" rx="3" fill="#FDE68A" />
                    {/* Door */}
                    <Rect x="74" y="54" width="12" height="16" rx="2" fill="#EA580C" />
                    <Circle cx="83" cy="62" r="1.5" fill="#FEF3C7" />

                    {/* Awning Roof */}
                    <Path
                      d="M 60,46 C 60,42 100,42 100,46 L 98,51 C 98,51 62,51 62,51 Z"
                      fill="url(#roofGrad)"
                    />
                    {/* Stripes on Awning */}
                    <Rect x="66" y="44" width="5" height="7" fill="#EA580C" opacity="0.6" />
                    <Rect x="76" y="44" width="5" height="7" fill="#EA580C" opacity="0.6" />
                    <Rect x="86" y="44" width="5" height="7" fill="#EA580C" opacity="0.6" />

                    {/* Floating Sparkles */}
                    <Path d="M 83,30 L 84,33 L 87,34 L 84,35 L 83,38 L 82,35 L 79,34 L 82,33 Z" fill="#F59E0B" />
                    <Path d="M 58,40 L 59,42 L 61,43 L 59,44 L 58,46 L 57,44 L 55,43 L 57,42 Z" fill="#FBBF24" />
                    <Path d="M 98,36 L 99,38 L 101,39 L 99,40 L 98,42 L 97,40 L 95,39 L 97,38 Z" fill="#FBBF24" />
                  </Svg>
                </View>
              </View>
            </>
          ) : (
            /* FOREIGN CURRENCY TAB */
            <View style={styles.foreignContainer}>
              <View style={styles.emptyForeignCard}>
                <Ionicons name="globe-outline" size={48} color={colors.primary} />
                <AppText style={styles.emptyForeignTitle}>Tài khoản ngoại tệ</AppText>
                <AppText style={styles.emptyForeignDesc}>
                  Bạn chưa đăng ký tài khoản ngoại tệ (USD, EUR, JPY...). Đăng ký ngay để nhận ưu đãi tỷ giá tốt nhất.
                </AppText>
                <TouchableOpacity
                  style={styles.openForeignBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    Alert.alert('Đăng ký tài khoản ngoại tệ', 'Tính năng đang được kích hoạt cho tài khoản của bạn.')
                  }
                >
                  <AppText style={styles.openForeignBtnText}>Mở tài khoản ngoại tệ</AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#141210' : '#FDFBF7',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconColor: {
    color: isDark ? '#E5E5E5' : '#332822',
  },
  aiBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: isDark ? '#E5E5E5' : '#332822',
    letterSpacing: -0.5,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: isDark ? '#F5F5F5' : '#332822',
    marginTop: 10,
    marginBottom: 16,
  },
  segmentedTabsWrap: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#26221E' : '#EFEAE4',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    backgroundColor: isDark ? '#3D3630' : '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 15,
    fontWeight: '700',
    color: isDark ? '#9E948C' : '#7D7065',
  },
  segmentTabTextActive: {
    color: isDark ? '#FFFFFF' : '#2D231B',
    fontWeight: '800',
  },
  mainAccountCard: {
    backgroundColor: isDark ? '#1F1B18' : '#FBF7F2',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? '#332D27' : '#F0E9DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardHeaderLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: isDark ? '#D6CEC7' : '#4A3E36',
  },
  subTextColor: {
    color: isDark ? '#9E948C' : '#7D7065',
  },
  eyeBtn: {
    padding: 4,
  },
  cardBalanceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: isDark ? '#FFFFFF' : '#261F1A',
    marginBottom: 16,
  },
  cardBalanceCurrency: {
    fontSize: 15,
    fontWeight: '700',
    color: isDark ? '#D6CEC7' : '#4A3E36',
  },
  innerAccountBox: {
    backgroundColor: isDark ? '#26211D' : '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    position: 'relative',
    marginTop: 6,
    marginBottom: 20,
  },
  defaultTagWrap: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  innerBoxContent: {
    gap: 8,
  },
  accountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: isDark ? '#FFFFFF' : '#1C1917',
    letterSpacing: 0.5,
  },
  innerBalanceText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: isDark ? '#F3F4F6' : '#292524',
  },
  innerBalanceCurrency: {
    fontSize: 12.5,
    fontWeight: '700',
    color: isDark ? '#9CA3AF' : '#57534E',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
  },
  quickActionCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: isDark ? '#2E2823' : '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconColor: {
    color: isDark ? '#E5E5E5' : '#3D312A',
  },
  gPayIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: isDark ? '#D6CEC7' : '#4A3E36',
  },
  businessBannerCard: {
    backgroundColor: isDark ? '#241F1A' : '#F6EFE6',
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: isDark ? '#3D342C' : '#EDE3D6',
    overflow: 'hidden',
  },
  businessTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  businessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: isDark ? '#FFFFFF' : '#2D231B',
  },
  businessSub: {
    fontSize: 12.5,
    color: isDark ? '#A89E94' : '#736559',
    marginTop: 4,
  },
  registerBtn: {
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: isDark ? '#A89E94' : '#564438',
    paddingHorizontal: 18,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  registerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: isDark ? '#FFFFFF' : '#4A3B32',
  },
  businessGraphicWrap: {
    width: 100,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foreignContainer: {
    marginTop: 10,
  },
  emptyForeignCard: {
    backgroundColor: isDark ? '#1F1B18' : '#FBF7F2',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#332D27' : '#F0E9DF',
    gap: 12,
  },
  emptyForeignTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: isDark ? '#FFFFFF' : '#2D231B',
  },
  emptyForeignDesc: {
    fontSize: 13.5,
    color: isDark ? '#9E948C' : '#6B5E53',
    textAlign: 'center',
    lineHeight: 19,
  },
  openForeignBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  openForeignBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
