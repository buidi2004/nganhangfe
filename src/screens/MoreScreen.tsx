import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { createThemedStyles, ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import StickyCurvedHeader from '../components/StickyCurvedHeader';

const { width } = Dimensions.get('window');

interface GridItemProps {
  iconLib?: 'ionicons' | 'mci';
  iconName: string;
  label: string;
  onPress?: () => void;
  badge?: {
    text: string;
    type?: 'red' | 'cyan' | 'new';
  };
  customIconWrapStyle?: any;
  iconColor?: string;
  isDark?: boolean;
}

function GridItem({
  iconLib = 'mci',
  iconName,
  label,
  onPress,
  badge,
  customIconWrapStyle,
  iconColor,
  isDark,
}: GridItemProps) {
  const resolvedColor = iconColor || (isDark ? '#F1F5F9' : '#3D2A1D');

  return (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        {badge && (
          <View
            style={[
              styles.badgePill,
              badge.type === 'cyan' && styles.badgeCyan,
              badge.type === 'new' && styles.badgeNew,
            ]}
          >
            <AppText
              style={[
                styles.badgeText,
                badge.type === 'cyan' && styles.badgeTextCyan,
              ]}
              numberOfLines={1}
            >
              {badge.text}
            </AppText>
          </View>
        )}

        <View style={[styles.iconWrap, customIconWrapStyle]}>
          {iconLib === 'ionicons' ? (
            <Ionicons name={iconName as any} size={24} color={resolvedColor} />
          ) : (
            <MaterialCommunityIcons name={iconName as any} size={25} color={resolvedColor} />
          )}
        </View>
      </View>

      <AppText style={styles.gridLabel} numberOfLines={2}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

export default function MoreScreen({ navigation }: any) {
  const { isDark, colors, themeColor } = useTheme();
  const themedStyles = getThemedStyles(colors);
  const { onScroll } = useHideOnScroll();

  return (
    <View style={themedStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* BACKGROUND NỀN */}
      {!isDark && (themeColor === 'amber' || themeColor === 'purple') ? (
        <ImageBackground
          source={
            themeColor === 'amber'
              ? require('../assets/images/bg-white-amber-pattern.png')
              : require('../assets/images/bg-white-purple-pattern.png')
          }
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LinearGradient
            colors={
              isDark
                ? [colors.background, '#131A29', colors.background]
                : ['#FCFAF7', '#FAF6F0', '#F8F2E6']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      {/* 1. TOP CURVED GRADIENT HEADER */}
      <StickyCurvedHeader navigation={navigation} />

      {/* 2. MAIN SCROLL CONTENT */}
      <ScrollView
          contentContainerStyle={styles.scrollContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 1: TÍNH NĂNG ĐỘC QUYỀN CỦA HỘI VIÊN MB */}
          <View style={themedStyles.exclusiveCard}>
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.95)']
                  : ['#F0F7FF', '#E8F2FE']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <AppText style={themedStyles.exclusiveTitle}>
              Tính năng độc quyền của hội viên MB
            </AppText>

            <View style={styles.gridRow}>
              <GridItem
                iconName="chart-box-outline"
                label={'Quản lý\ndòng tiền'}
                isDark={isDark}
                onPress={() => navigation.navigate('TransactionHistory')}
              />
              <GridItem
                iconName="credit-card-refund-outline"
                label={'Hoàn tiền\nchi tiêu thẻ'}
                isDark={isDark}
                onPress={() => navigation.navigate('Cards')}
              />
              <View style={styles.gridItemPlaceholder} />
            </View>
          </View>

          {/* SECTION 2: TIỀN GỬI & ĐẦU TƯ */}
          <View style={themedStyles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <AppText style={themedStyles.sectionTitle}>Tiền gửi & đầu tư</AppText>
              <TouchableOpacity
                style={themedStyles.arrowBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Savings')}
              >
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Hàng 1 */}
            <View style={styles.gridRow}>
              <GridItem
                iconName="swap-horizontal-bold"
                label={'Chuyển\nnhượng'}
                badge={{ text: 'NEW', type: 'new' }}
                customIconWrapStyle={{ backgroundColor: '#65A30D' }}
                iconColor="#FFFFFF"
                isDark={isDark}
                onPress={() => navigation.navigate('Savings')}
              />
              <GridItem
                iconName="certificate-outline"
                label={'Chứng chỉ\ntiền gửi'}
                isDark={isDark}
                onPress={() => navigation.navigate('Savings')}
              />
              <GridItem
                iconName="safe"
                label={'Tiền gửi số cố\nđịnh'}
                isDark={isDark}
                onPress={() => navigation.navigate('Savings')}
              />
            </View>

            {/* Hàng 2 */}
            <View style={styles.gridRow}>
              <GridItem
                iconName="piggy-bank-outline"
                label={'Tiền gửi số\ntích lũy'}
                isDark={isDark}
                onPress={() => navigation.navigate('Savings')}
              />
              <GridItem
                iconName="cash-fast"
                label={'TK Siêu lãi\nngày'}
                isDark={isDark}
                onPress={() => navigation.navigate('Savings')}
              />
              <GridItem
                iconName="hand-coin-outline"
                label={'Tiết kiệm\ntiền lẻ'}
                isDark={isDark}
                onPress={() => navigation.navigate('Savings')}
              />
            </View>

            {/* Hàng 3 */}
            <View style={styles.gridRow}>
              <GridItem
                iconName="clipboard-text-outline"
                label={'DS tiền gửi\ntiết kiệm'}
                isDark={isDark}
                onPress={() => navigation.navigate('Savings')}
              />
              <View style={styles.gridItemPlaceholder} />
              <View style={styles.gridItemPlaceholder} />
            </View>
          </View>

          {/* SECTION 3: QR CỦA TÔI */}
          <View style={themedStyles.sectionCard}>
            <AppText style={[themedStyles.sectionTitle, { marginBottom: 16 }]}>
              QR của tôi
            </AppText>

            <View style={styles.gridRow}>
              <GridItem
                iconName="qrcode-scan"
                label="Quét QR"
                isDark={isDark}
                onPress={() => navigation.navigate('ScanQR')}
              />
              <GridItem
                iconName="qrcode"
                label="QR nhận tiền"
                isDark={isDark}
                onPress={() => navigation.navigate('QRMy')}
              />
              <GridItem
                iconName="barcode-scan"
                label={'QR thanh\ntoán'}
                isDark={isDark}
                onPress={() => navigation.navigate('ScanQR')}
              />
            </View>
          </View>

          {/* SECTION 4: NỘP, RÚT TIỀN VÀ GIAO DỊCH TẠI QUẦY */}
          <View style={themedStyles.sectionCard}>
            <AppText style={[themedStyles.sectionTitle, { marginBottom: 16 }]}>
              Nộp, rút tiền và giao dịch tại quầy
            </AppText>

            {/* Hàng 1 */}
            <View style={styles.gridRow}>
              <GridItem
                iconName="atm"
                label="Rút tiền ATM"
                isDark={isDark}
                onPress={() => navigation.navigate('Withdraw')}
              />
              <GridItem
                iconName="bank-outline"
                label={'Nộp, rút tiền\ntại quầy MB'}
                isDark={isDark}
                onPress={() => navigation.navigate('Deposit')}
              />
              <GridItem
                iconName="ticket-confirmation-outline"
                label={'Xếp hàng và\nđặt lịch'}
                isDark={isDark}
                onPress={() => navigation.navigate('Config')}
              />
            </View>

            {/* Hàng 2 */}
            <View style={styles.gridRow}>
              <GridItem
                iconName="mailbox-outline"
                label={'Rút tiền tại\nquầy VNPost'}
                isDark={isDark}
                onPress={() => navigation.navigate('Withdraw')}
              />
              <GridItem
                iconName="storefront-outline"
                label={'Rút tiền tại\nđại lý MB'}
                isDark={isDark}
                onPress={() => navigation.navigate('Withdraw')}
              />
              <GridItem
                iconName="clipboard-clock-outline"
                label={'Quản lý GD\ntại quầy'}
                isDark={isDark}
                onPress={() => navigation.navigate('TransactionHistory')}
              />
            </View>

            {/* Hàng 3 */}
            <View style={styles.gridRow}>
              <GridItem
                iconName="file-document-outline"
                label="Xuất sao kê"
                isDark={isDark}
                onPress={() => navigation.navigate('TransactionHistory')}
              />
              <View style={styles.gridItemPlaceholder} />
              <View style={styles.gridItemPlaceholder} />
            </View>
          </View>

          {/* SECTION 5: QUẢN LÝ CỬA HÀNG */}
          <View style={themedStyles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <AppText style={themedStyles.sectionTitle}>Quản lý cửa hàng</AppText>
              <TouchableOpacity
                style={themedStyles.arrowBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Config')}
              >
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Hàng 1 */}
            <View style={styles.gridRow}>
              <GridItem
                iconName="store-outline"
                label={'Hộ kinh\ndoanh'}
                isDark={isDark}
                onPress={() => navigation.navigate('Config')}
              />
              <GridItem
                iconName="store-plus-outline"
                label={'Thêm cửa\nhàng'}
                badge={{ text: 'TK TỪ 6 SỐ', type: 'red' }}
                isDark={isDark}
                onPress={() => navigation.navigate('Config')}
              />
              <GridItem
                iconName="share-variant-outline"
                label={'Chia sẻ biến\nđộng số dư'}
                isDark={isDark}
                onPress={() => navigation.navigate('Config')}
              />
            </View>

            {/* Hàng 2 */}
            <View style={styles.gridRow}>
              <GridItem
                iconName="bullhorn-outline"
                label="Loa thông báo"
                badge={{ text: 'TẶNG MIỄN PHÍ', type: 'cyan' }}
                iconColor="#0284C7"
                isDark={isDark}
                onPress={() => navigation.navigate('Config')}
              />
              <GridItem
                iconName="star-shooting-outline"
                label="MBee"
                iconColor="#DC2626"
                isDark={isDark}
                onPress={() => navigation.navigate('Config')}
              />
              <View style={styles.gridItemPlaceholder} />
            </View>
          </View>

          {/* Khoảng cách đáy an toàn tránh lẹm vào GlassBottomNavbar */}
          <View style={{ height: Platform.OS === 'ios' ? 120 : 130 }} />
        </ScrollView>
    </View>
  );
}

const getThemedStyles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  exclusiveCard: {
    borderRadius: 18,
    overflow: 'hidden',
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.45)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  exclusiveTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const styles = StyleSheet.create({
  searchPillWrapper: {
    flex: 1,
    marginRight: 12,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  gridItem: {
    width: '32%',
    alignItems: 'center',
  },
  gridItemPlaceholder: {
    width: '32%',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    minHeight: 52,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FDFBF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFECE6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  gridLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#33261D',
    textAlign: 'center',
    lineHeight: 16,
  },
  badgePill: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeNew: {
    top: -6,
    right: -4,
  },
  badgeCyan: {
    backgroundColor: '#ECFEFF',
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  badgeTextCyan: {
    color: '#0891B2',
  },
});
