import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/typography/AppText';
import { GlassHeader } from '../components/GlassHeader';
import { GlassCard } from '../components/GlassCard';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, createThemedStyles, ThemeColors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { WalletApi } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;
const CARD_HEIGHT = CARD_WIDTH * 0.6;
const SPACING = 16;

const CARD_PALETTES = [
  ['#1E1B4B', '#312E81'],
  ['#065F46', '#047857'],
];

const UTILITIES = [
  { id: '1', icon: 'lock-outline', label: 'Khóa thẻ' },
  { id: '2', icon: 'eye-outline', label: 'Xem số thẻ' },
  { id: '3', icon: 'tune', label: 'Hạn mức' },
  { id: '4', icon: 'history', label: 'Giao dịch' },
  { id: '5', icon: 'bank-transfer', label: 'Trả góp' },
  { id: '6', icon: 'shield-check-outline', label: 'Bảo mật' },
  { id: '7', icon: 'credit-card-plus-outline', label: 'Mở thẻ phụ' },
  { id: '8', icon: 'headphones', label: 'Trợ giúp' },
];

const PROMOTIONS = [
  {
    id: '1',
    title: 'Hoàn tiền 10% tại Shopee & Lazada',
    desc: 'Áp dụng cho thẻ SenBank Hi Visa khi thanh toán trực tuyến vào thứ 6 hàng tuần. Tối đa 500k/tháng.',
    icon: 'shopping-outline',
    color: '#F97316'
  },
  {
    id: '2',
    title: 'Giảm 30% tại Haidilao, Manwah',
    desc: 'Độc quyền cho chủ thẻ SenBank Platinum. Đặt bàn trước 24h để nhận ưu đãi. Hạn sử dụng: 31/12/2026',
    icon: 'food-outline',
    color: '#EAB308'
  },
  {
    id: '3',
    title: 'Trả góp 0% mọi giao dịch từ 3 triệu',
    desc: 'Chuyển đổi trả góp dễ dàng qua App, kỳ hạn linh hoạt 3-6-9-12 tháng không mất phí chuyển đổi.',
    icon: 'brightness-percent',
    color: '#06B6D4'
  },
  {
    id: '4',
    title: 'Phòng chờ hạng thương gia miễn phí',
    desc: 'Tặng 2 lượt sử dụng phòng chờ sân bay quốc nội cho thẻ Platinum và JCB Lotus.',
    icon: 'airplane-takeoff',
    color: '#3B82F6'
  }
];

export default function CardsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const styles = getStyles(colors);
  const cardPalettes = useMemo(() => [
    [colors.primary, colors.primaryDeep],
    ['#1E1B4B', '#312E81'],
    [colors.heroGradEnd, colors.heroGradMid],
    ['#065F46', '#047857'],
  ], [colors]);
  const { user } = useApp();
  const { onScroll } = useHideOnScroll();
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const res = await WalletApi.getFundingSources();
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setCards(res.data);
      } else {
        setCards([]);
      }
    } catch (e) {
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const renderCard = (card: any, index: number) => {
    const palette = cardPalettes[index % CARD_PALETTES.length];
    const cardNum = card.number ? (card.number.includes('*') ? card.number : `**** **** **** ${card.number.slice(-4)}`) : '**** **** **** 8888';
    const cardHolder = (card.cardHolderName || user?.name || 'SENBANK CLIENT').toUpperCase();
    const cardType = (card.provider || card.type || 'VISA').toUpperCase();

    return (
      <View key={card.id || index.toString()} style={[styles.cardContainer, { marginLeft: index === 0 ? SPACING : 0 }]}>
        <LinearGradient
          colors={palette as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Card Top */}
          <View style={styles.cardTop}>
            <View>
              <AppText style={styles.cardName}>{card.provider ? `SENBANK ${card.provider.toUpperCase()}` : 'SENBANK DIGITAL CARD'}</AppText>
              <MaterialCommunityIcons name="chip" size={32} color="#FBBF24" style={styles.chipIcon} />
            </View>
            <MaterialCommunityIcons name="contactless-payment" size={24} color="rgba(255,255,255,0.7)" />
          </View>

          {/* Card Middle */}
          <View style={styles.cardMiddle}>
            <AppText style={styles.cardNumber}>{cardNum}</AppText>
          </View>

          {/* Card Bottom */}
          <View style={styles.cardBottom}>
            <View>
              <AppText style={styles.cardLabel}>CARDHOLDER</AppText>
              <AppText style={styles.cardholder}>{cardHolder}</AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText style={styles.cardLabel}>EXPIRES</AppText>
              <AppText style={styles.cardholder}>{card.expiryDate || '12/29'}</AppText>
            </View>
            <View style={styles.logoContainer}>
              <AppText style={{ color: '#FFF', fontSize: 20, fontWeight: '900', fontStyle: 'italic' }}>
                {cardType}
              </AppText>
            </View>
          </View>

          {/* Overlay glass effect for realism */}
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'transparent', 'rgba(0,0,0,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.bgBase : colors.badgePinkSoft }]}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor="transparent" translucent />
      <GlassHeader
        title="Quản lý thẻ"
        onBack={() => navigation.goBack()}
        rightIcon="notification"
        onRightPress={() => {}}
      />

      {/* Trang trí nền */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={isDark ? [colors.bgBase, colors.primaryDeep, colors.bgBase] : [colors.badgePinkSoft, colors.badgePinkBorder, colors.badgeBlueSoft]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.bgCircle1, isDark && { opacity: 0.05 }]} />
        <View style={[styles.bgCircle2, isDark && { opacity: 0.05 }]} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: Math.max(112, insets.top + 72) }]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Thẻ của tôi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>Thẻ của tôi</AppText>
            <TouchableOpacity onPress={() => navigation?.navigate('PaymentMethods')}>
              <AppText style={[styles.seeAllText, { color: colors.primary }]}>Tất cả</AppText>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={{ height: CARD_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : cards.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + SPACING}
              decelerationRate="fast"
              contentContainerStyle={{ paddingRight: SPACING }}
            >
              {cards.map((card, index) => renderCard(card, index))}
            </ScrollView>
          ) : (
            <View style={[styles.cardContainer, { marginLeft: SPACING, width: CARD_WIDTH, height: CARD_HEIGHT }]}>
              <LinearGradient
                colors={[colors.primaryDeep, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cardGradient, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}
              >
                <MaterialCommunityIcons name="credit-card-plus-outline" size={44} color="#FFFFFF" style={{ marginBottom: 10 }} />
                <AppText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>
                  Chưa có thẻ liên kết
                </AppText>
                <AppText style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5, textAlign: 'center', marginBottom: 14 }}>
                  Liên kết tài khoản ngân hàng để nạp rút tiền tức thì
                </AppText>
                <TouchableOpacity
                  style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 }}
                  onPress={() => navigation?.navigate('PaymentMethods')}
                  activeOpacity={0.8}
                >
                  <AppText style={{ color: colors.primaryDeep, fontWeight: '800', fontSize: 13 }}>+ Liên kết thẻ ngay</AppText>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Section 2: Tiện ích thẻ */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { marginLeft: SPACING, color: colors.textPrimary }]}>Tiện ích thẻ</AppText>
          <GlassCard style={styles.utilitiesCard}>
            <View style={styles.utilitiesGrid}>
              {UTILITIES.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.utilityItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.id === '1' || item.id === '2' || item.id === '7') navigation?.navigate('PaymentMethods');
                    else if (item.id === '3') navigation?.navigate('Config');
                    else if (item.id === '4') navigation?.navigate('TransactionHistory');
                    else if (item.id === '6') navigation?.navigate('SecuritySettings');
                    else if (item.id === '8') navigation?.navigate('HelpCenter');
                  }}
                >
                  <View style={[
                    styles.utilityIconWrap, 
                    { 
                      backgroundColor: colors.primarySoft,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }
                  ]}>
                    <MaterialCommunityIcons name={item.icon as any} size={24} color={isDark ? colors.primary : colors.primaryDeep} />
                  </View>
                  <AppText style={[styles.utilityLabel, { color: colors.textPrimary }]}>{item.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* Section 3: Ưu đãi đặc quyền */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { marginLeft: SPACING, color: colors.textPrimary }]}>Ưu đãi đặc quyền</AppText>
          <View style={styles.promotionsContainer}>
            {PROMOTIONS.map((promo) => (
              <GlassCard key={promo.id} style={styles.promoCard}>
                <View style={[
                  styles.promoIconWrap,
                  {
                    backgroundColor: colors.primarySoft,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }
                ]}>
                  <MaterialCommunityIcons name={promo.icon as any} size={26} color={isDark ? colors.primary : colors.primaryDeep} />
                </View>
                <View style={styles.promoInfo}>
                  <AppText style={[styles.promoTitle, { color: colors.textPrimary }]}>{promo.title}</AppText>
                  <AppText style={[styles.promoDesc, { color: colors.textSecondary }]} numberOfLines={2}>{promo.desc}</AppText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'} />
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Section 4: Phát hành thẻ mới */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#F472B6', '#DB2777']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newCardBanner}
            >
              <View style={styles.newCardContent}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.newCardTitle}>Phát hành thẻ mới</AppText>
                  <AppText style={styles.newCardDesc}>Mở thẻ ảo lấy ngay trong 1 phút, miễn phí thường niên trọn đời.</AppText>
                </View>
                <MaterialCommunityIcons name="credit-card-plus" size={48} color="rgba(255,255,255,0.4)" style={styles.newCardIcon} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const getStyles = createThemedStyles((colors: ThemeColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 112, // Để chừa chỗ cho GlassHeader
    paddingBottom: 40,
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primarySoft,
  },
  bgCircle2: {
    position: 'absolute',
    top: 400,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: SPACING,
    borderRadius: Radius.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    borderRadius: Radius.card,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  chipIcon: {
    opacity: 0.9,
  },
  cardMiddle: {
    marginTop: 10,
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardholder: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilitiesCard: {
    marginHorizontal: SPACING,
    marginTop: 12,
  },
  utilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  utilityItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  utilityIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  utilityLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  promotionsContainer: {
    paddingHorizontal: SPACING,
    marginTop: 12,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  promoIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  promoInfo: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  promoDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  newCardBanner: {
    marginHorizontal: SPACING,
    borderRadius: Radius.card,
    padding: 24,
    overflow: 'hidden',
  },
  newCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newCardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  newCardDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  newCardIcon: {
    marginLeft: 16,
  }
}));
