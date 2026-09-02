import { Image } from 'expo-image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { AppText } from '../components/typography/AppText';

interface LotteryScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const LOTTERY_TYPES = [
  { 
    id: '1', 
    name: 'Mega 6/45', 
    jackpot: '12.450.000.000 đ', 
    nextDraw: 'Hôm nay, 18:00', 
    color: '#E11D48',
    logoText: 'MEGA',
    logoColor: '#E11D48'
  },
  { 
    id: '2', 
    name: 'Power 6/55', 
    jackpot: '105.800.000.000 đ', 
    nextDraw: 'Ngày mai, 18:00', 
    color: '#D97706',
    logoText: 'POWER',
    logoColor: '#D97706'
  },
  { 
    id: '3', 
    name: 'Max 3D', 
    jackpot: '1.000.000.000 đ', 
    nextDraw: 'Hôm nay, 18:00', 
    color: '#059669',
    logoText: 'MAX 3D',
    logoColor: '#059669'
  },
];

const LATEST_RESULTS = [
  { id: '1', name: 'Power 6/55', date: 'Kỳ quay #01124 - 15/10/2024', numbers: ['05', '12', '24', '33', '41', '50', '52'], color: '#D97706' },
  { id: '2', name: 'Mega 6/45', date: 'Kỳ quay #01089 - 14/10/2024', numbers: ['08', '14', '22', '31', '39', '44'], color: '#E11D48' },
];

export default function LotteryScreen({ navigation }: LotteryScreenProps) {
  const isFocused = useIsFocused();
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values
  const scaleAnim = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (!isFocused) {
      cancelAnimation(scaleAnim);
      cancelAnimation(glowOpacity);
      scaleAnim.value = 1;
      glowOpacity.value = 0.5;
      return;
    }

    scaleAnim.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(scaleAnim);
      cancelAnimation(glowOpacity);
    };
  }, [isFocused, scaleAnim, glowOpacity]);

  useEffect(() => () => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
  }, []);

  const generateLuckyNumbers = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }

    let counter = 0;
    spinIntervalRef.current = setInterval(() => {
      setLuckyNumbers(Array.from({ length: 6 }, () => Math.floor(Math.random() * 45) + 1));
      counter++;
      if (counter > 15) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
          spinIntervalRef.current = null;
        }
        const nums: number[] = [];
        while (nums.length < 6) {
          const r = Math.floor(Math.random() * 45) + 1;
          if (nums.indexOf(r) === -1) nums.push(r);
        }
        setLuckyNumbers(nums.sort((a, b) => a - b));
        setIsSpinning(false);
      }
    }, 100);
  };

  const animatedBtnStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#700F43', '#E11D48', '#FCE7F3']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Vua Xổ Số</AppText>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="receipt-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* LUCKY NUMBER GENERATOR CARD */}
          <View style={styles.luckyCardContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.luckyCard}
            >
              <View style={styles.luckyCardHeader}>
                <MaterialCommunityIcons name="clover" size={24} color="#FDE047" />
                <AppText style={styles.luckyCardTitle}>Quay Số May Mắn</AppText>
                <MaterialCommunityIcons name="clover" size={24} color="#FDE047" />
              </View>
              
              <AppText style={styles.luckyCardSubtitle}>Chạm để nhận lộc trời cho ngày hôm nay!</AppText>
              
              <View style={styles.numbersRow}>
                {luckyNumbers.map((num, idx) => (
                  <View key={idx} style={styles.numberBall}>
                    <LinearGradient
                      colors={isSpinning ? ['#E2E8F0', '#CBD5E1'] : ['#FDE047', '#D97706']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <AppText style={[styles.numberText, isSpinning && { color: '#475569' }]}>
                      {num === 0 ? '?' : num.toString().padStart(2, '0')}
                    </AppText>
                  </View>
                ))}
              </View>

              <View style={styles.generateBtnContainer}>
                <Animated.View style={[styles.generateBtnGlow, animatedGlowStyle]} />
                <Animated.View style={[animatedBtnStyle]}>
                  <TouchableOpacity
                    style={styles.generateBtn}
                    activeOpacity={0.8}
                    onPress={generateLuckyNumbers}
                  >
                    <LinearGradient
                      colors={['#E11D48', '#9F1239']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <AppText style={styles.generateBtnText}>
                      {isSpinning ? 'Đang quay...' : 'Lấy số ngay'}
                    </AppText>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </LinearGradient>
          </View>

          {/* LOTTERY TYPES LIST */}
          <View style={styles.sectionContainer}>
            <AppText style={styles.sectionTitle}>Giải thưởng cực lớn</AppText>
            
            {LOTTERY_TYPES.map((lottery) => (
              <TouchableOpacity key={lottery.id} style={styles.lotteryCard} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={StyleSheet.absoluteFillObject}
                />
                
                <View style={styles.lotteryCardTop}>
                  <View style={styles.lotteryNameRow}>
                    <View style={[styles.lotteryBrandBadge, { borderColor: lottery.color }]}>
                      <AppText style={[styles.lotteryBrandText, { color: lottery.color }]}>{lottery.logoText}</AppText>
                    </View>
                    <AppText style={styles.lotteryName}>{lottery.name}</AppText>
                  </View>
                  <AppText style={styles.nextDrawText}>Kỳ quay: {lottery.nextDraw}</AppText>
                </View>

                <View style={styles.lotteryCardBottom}>
                  <View>
                    <AppText style={styles.jackpotLabel}>Jackpot ước tính</AppText>
                    <AppText style={[styles.jackpotAmount, { color: lottery.color }]}>{lottery.jackpot}</AppText>
                  </View>
                  <View style={[styles.buyBtn, { backgroundColor: lottery.color }]}>
                    <AppText style={styles.buyBtnText}>Mua ngay</AppText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* LATEST RESULTS SECTION */}
          <View style={[styles.sectionContainer, { marginTop: 16 }]}>
            <AppText style={styles.sectionTitle}>Kết quả quay số gần nhất</AppText>
            
            {LATEST_RESULTS.map((result) => (
              <View key={result.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <AppText style={styles.resultName}>{result.name}</AppText>
                  <AppText style={styles.resultDate}>{result.date}</AppText>
                </View>
                
                <View style={styles.resultNumbersRow}>
                  {result.numbers.map((num, idx) => (
                    <View key={idx} style={[styles.resultBall, idx === result.numbers.length - 1 && result.id === '1' ? { backgroundColor: '#E11D48' } : {}]}>
                      <AppText style={[styles.resultBallText, idx === result.numbers.length - 1 && result.id === '1' ? { color: '#FFFFFF' } : {}]}>{num}</AppText>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCE7F3',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  luckyCardContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  luckyCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  luckyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  luckyCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FDE047',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  luckyCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    textAlign: 'center',
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  numberBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#700F43',
    includeFontPadding: false,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  generateBtnContainer: {
    position: 'relative',
    width: 200,
    height: 52,
  },
  generateBtnGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#FDE047',
    borderRadius: 30,
    opacity: 0.5,
  },
  generateBtn: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FDE047',
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  lotteryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  lotteryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lotteryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lotteryBrandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lotteryBrandText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lotteryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  nextDrawText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  lotteryCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  jackpotLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },
  jackpotAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  buyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  resultDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  resultNumbersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  resultBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultBallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});
