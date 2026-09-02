import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { AppText } from '../components/typography/AppText';
import { GlassHeader } from '../components/GlassHeader';
import { GlassCard } from '../components/GlassCard';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme';

import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;
const CARD_HEIGHT = CARD_WIDTH * 0.6;
const SPACING = 16;

const MOCK_CARDS = [
  {
    id: '1',
    type: 'Visa',
    name: 'MB HI VISA',
    number: '**** **** **** 4567',
    expiry: '12/28',
    colors: ['#D2519D', '#700F43'],
    balance: '25,000,000 VND',
    cardholder: 'NGUYEN VAN A',
  },
  {
    id: '2',
    type: 'Mastercard',
    name: 'MB PLATINUM',
    number: '**** **** **** 8899',
    expiry: '09/29',
    colors: ['#1E1B4B', '#312E81'],
    balance: '150,000,000 VND',
    cardholder: 'NGUYEN VAN A',
  },
  {
    id: '3',
    type: 'JCB',
    name: 'MB JCB SAKURA',
    number: '**** **** **** 1234',
    expiry: '05/27',
    colors: ['#831843', '#BE185D'],
    balance: '50,000,000 VND',
    cardholder: 'NGUYEN VAN A',
  }
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
    desc: 'Áp dụng cho thẻ MB Hi Visa khi thanh toán trực tuyến vào thứ 6 hàng tuần. Tối đa 500k/tháng.',
    icon: 'shopping-outline',
    color: '#F97316'
  },
  {
    id: '2',
    title: 'Giảm 30% tại Haidilao, Manwah',
    desc: 'Độc quyền cho chủ thẻ Platinum. Đặt bàn trước 24h để nhận ưu đãi. Hạn sử dụng: 31/12/2026',
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
    desc: 'Tặng 2 lượt sử dụng phòng chờ sân bay quốc nội cho thẻ Platinum và JCB Sakura.',
    icon: 'airplane-takeoff',
    color: '#3B82F6'
  }
];

export default function CardsScreen({ navigation }: any) {
  const { isDark, colors } = useTheme();
  const { onScroll } = useHideOnScroll();

  const renderCard = (card: typeof MOCK_CARDS[0], index: number) => {
    return (
      <View key={card.id} style={[styles.cardContainer, { marginLeft: index === 0 ? SPACING : 0 }]}>
        <LinearGradient
          colors={card.colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Card Top */}
          <View style={styles.cardTop}>
            <View>
              <AppText style={styles.cardName}>{card.name}</AppText>
              <MaterialCommunityIcons name="chip" size={32} color="#FBBF24" style={styles.chipIcon} />
            </View>
            <MaterialCommunityIcons name="contactless-payment" size={24} color="rgba(255,255,255,0.7)" />
          </View>

          {/* Card Middle */}
          <View style={styles.cardMiddle}>
            <AppText style={styles.cardNumber}>{card.number}</AppText>
          </View>

          {/* Card Bottom */}
          <View style={styles.cardBottom}>
            <View>
              <AppText style={styles.cardLabel}>CARDHOLDER</AppText>
              <AppText style={styles.cardholder}>{card.cardholder}</AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText style={styles.cardLabel}>EXPIRES</AppText>
              <AppText style={styles.cardholder}>{card.expiry}</AppText>
            </View>
            <View style={styles.logoContainer}>
              <AppText style={{ color: '#FFF', fontSize: 22, fontWeight: '900', fontStyle: 'italic' }}>
                {card.type.toUpperCase()}
              </AppText>
            </View>
          </View>

          {/* Overlay glass effect for realism */}
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'transparent', 'rgba(0,0,0,0.1)']}
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
    <View style={styles.container}>
      <GlassHeader
        title="Quản lý thẻ"
        onBack={() => navigation.goBack()}
        rightIcon="notification"
        onRightPress={() => {}}
      />

      {/* Trang trí nền */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={['#FDF2F8', '#FCE7F3', '#FBCFE8']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Thẻ của tôi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>Thẻ của tôi</AppText>
            <TouchableOpacity>
              <AppText style={styles.seeAllText}>Tất cả</AppText>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: SPACING }}
          >
            {MOCK_CARDS.map((card, index) => renderCard(card, index))}
          </ScrollView>
        </View>

        {/* Section 2: Tiện ích thẻ */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { marginLeft: SPACING }]}>Tiện ích thẻ</AppText>
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
                      backgroundColor: isDark ? 'rgba(244, 114, 182, 0.12)' : 'rgba(112, 15, 67, 0.06)',
                      borderColor: isDark ? 'rgba(244, 114, 182, 0.2)' : 'rgba(112, 15, 67, 0.1)',
                      borderWidth: 1,
                    }
                  ]}>
                    <MaterialCommunityIcons name={item.icon as any} size={24} color={isDark ? colors.primary : '#700F43'} />
                  </View>
                  <AppText style={styles.utilityLabel}>{item.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* Section 3: Ưu đãi đặc quyền */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { marginLeft: SPACING }]}>Ưu đãi đặc quyền</AppText>
          <View style={styles.promotionsContainer}>
            {PROMOTIONS.map((promo) => (
              <GlassCard key={promo.id} style={styles.promoCard}>
                <View style={[
                  styles.promoIconWrap,
                  {
                    backgroundColor: isDark ? 'rgba(244, 114, 182, 0.12)' : 'rgba(112, 15, 67, 0.06)',
                    borderColor: isDark ? 'rgba(244, 114, 182, 0.2)' : 'rgba(112, 15, 67, 0.1)',
                    borderWidth: 1,
                  }
                ]}>
                  <MaterialCommunityIcons name={promo.icon as any} size={26} color={isDark ? colors.primary : '#700F43'} />
                </View>
                <View style={styles.promoInfo}>
                  <AppText style={styles.promoTitle}>{promo.title}</AppText>
                  <AppText style={styles.promoDesc} numberOfLines={2}>{promo.desc}</AppText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(0,0,0,0.3)" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  content: {
    paddingTop: 90, // Để chừa chỗ cho GlassHeader
    paddingBottom: 40,
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(244, 114, 182, 0.2)',
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
    color: '#DB2777',
    fontWeight: '600',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: SPACING,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
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
    borderRadius: 20,
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
});
