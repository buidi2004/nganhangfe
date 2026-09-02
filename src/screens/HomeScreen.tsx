import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Image } from 'expo-image';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  DeviceEventEmitter,
  LayoutAnimation,
  UIManager,
  Easing as RNEasing,
} from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay, 
  withRepeat,
  Easing, 
  cancelAnimation,
  runOnJS
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { AppIcon } from '../components/icons/AppIcon';
import { Colors, Shadows, Typography, Radius } from '../theme';
import { AppText } from '../components/typography/AppText';
import { GlassBottomNavbar } from '../components/GlassBottomNavbar';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useThrottledNavBarScroll } from '../hooks/useThrottledNavBarScroll';
import { BlurView } from 'expo-blur';
import AISearchIcon from '../components/icons/AISearchIcon';
import AnimatedRainbowPill from '../components/AnimatedRainbowPill';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = Math.round(width * 0.78);
const ITEM_GAP = 8; // Khoảng cách đồng đều 8px giữa các thẻ
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_GAP;
const SIDE_SPACER = (width - ITEM_WIDTH) / 2;

// Kích thước thẻ số dư vuốt ngang
const BALANCE_CARD_WIDTH = Math.round(width * 0.60); // 👈 Chỉnh chiều rộng thẻ số dư (tăng/giảm % màn hình, vd: 0.58, 0.60, 0.65)
const BALANCE_CARD_GAP = 10;                         // 👈 Khoảng cách giữa thẻ 1 và thẻ 2 khi vuốt ngang
const BALANCE_SNAP_INTERVAL = BALANCE_CARD_WIDTH + BALANCE_CARD_GAP;

// Official Vector Icons for Quick Actions (Lotus Pink Theme)
function MBTransferIcon({ size = 28, color = '#D2519D' }: { size?: number; color?: string }) {
  return <MaterialCommunityIcons name="bank-transfer" size={size} color={color} />;
}

function MBPhoneIcon({ size = 28, color = '#D2519D' }: { size?: number; color?: string }) {
  return <Ionicons name="phone-portrait-outline" size={size} color={color} />;
}

function MBPiggyIcon({ size = 28, color = '#D2519D' }: { size?: number; color?: string }) {
  return <MaterialCommunityIcons name="piggy-bank-outline" size={size} color={color} />;
}

function MBCoinsIcon({ size = 28, color = '#D2519D' }: { size?: number; color?: string }) {
  return <MaterialCommunityIcons name="hand-coin-outline" size={size} color={color} />;
}

// Shield Check Icon (Huy hiệu bảo mật / xác thực)
function MBShieldCheckIcon({ size = 22 }: { size?: number }) {
  return <MaterialCommunityIcons name="shield-check" size={size} color="#10B981" />;
}

// Crown Icon cho Badge Basic
function MBCrownIcon({ size = 14 }: { size?: number }) {
  return <MaterialCommunityIcons name="crown" size={size} color="#94A3B8" />;
}

// Quick Actions Data with exact badges
const QUICK_ACTIONS = [
  { id: '1', component: MBTransferIcon, title: 'Chuyển tiền', badge: null, badgeColor: null },
  { id: '2', component: MBPhoneIcon, title: 'Nạp tiền\nđiện thoại', badge: null, badgeColor: null },
  { id: '3', component: MBPiggyIcon, title: 'Tiền gửi', badge: '🧧 TÀI LỘC', badgeColor: '#E11D48' },
  { id: '4', component: MBCoinsIcon, title: 'Vay nhanh', badge: 'NHƯ GIÓ 💨', badgeColor: '#FDF2F8', badgeTextColor: '#D2519D' },
];

// 4 Icon Quick Actions mở rộng khi bấm nút mũi tên kép
const EXPANDED_ACTIONS = [
  {
    id: 'e1',
    title: 'Thanh toán\nhóa đơn',
    iconName: 'receipt-text-outline',
    lib: 'MaterialCommunityIcons',
    route: 'BillPayment',
    badge: 'GIẢM 50K',
    badgeColor: '#E11D48',
  },
  {
    id: 'e2',
    title: 'Nhận tiền\nQR',
    iconName: 'qrcode',
    lib: 'MaterialCommunityIcons',
    route: 'MyQR',
    badge: null,
    badgeColor: null,
  },
  {
    id: 'e3',
    title: 'Yêu cầu\nchuyển tiền',
    iconName: 'hand-coin-outline',
    lib: 'MaterialCommunityIcons',
    route: 'RequestTransfer',
    badge: null,
    badgeColor: null,
  },
  {
    id: 'e4',
    title: 'Lịch sử\ngiao dịch',
    iconName: 'history',
    lib: 'MaterialCommunityIcons',
    route: 'TransactionHistory',
    badge: 'MỚI ✨',
    badgeColor: '#700F43',
  },
];

// 6 Banners SenBank thương hiệu chuẩn với dải màu hồng nhạt đến đậm hài hòa cao cấp
const BASE_CAROUSEL_DATA = [
  {
    id: 'b1',
    type: 'pink-magenta',
    brand: 'SenBank Vay',
    badge: '⚡ DUYỆT TRONG 1 PHÚT',
    titleYellow: 'VAY SIÊU TỐC',
    titleRed: '100 TRIỆU',
    subtitle: 'Không thế chấp • Giải ngân ví trong 1 phút',
    cta: 'VAY NGAY',
    colorStart: '#700F43', // Hồng mận đậm sang trọng
    colorEnd: '#D2519D',   // Hồng sen rực rỡ
    tags: [
      { text: '1 PHÚT', color: '#FEF08A', textColor: '#700F43', top: 22, right: 18, rotate: '12deg' },
    ],
    showCarMascot: false,
  },
  {
    id: 'b2',
    type: 'pink-ruby',
    brand: 'SenBank Tiết Kiệm',
    badge: '📈 TÍCH LŨY SINH LỜI 24/7',
    titleYellow: 'TIẾT KIỆM',
    titleRed: 'LÃI 7.8%/NĂM',
    subtitle: 'Nhận lãi mỗi ngày • Rút gốc linh hoạt từ 10K',
    cta: 'GỬI TIỀN NGAY',
    colorStart: '#831843', // Hồng ruby đậm quý phái
    colorEnd: '#BE185D',   // Hồng sen tươi
    tags: [
      { text: '7.8%', color: '#FDF2F8', textColor: '#831843', top: 22, right: 18, rotate: '-10deg' },
    ],
    showCarMascot: false,
  },
  {
    id: 'b3',
    type: 'pink-wine',
    brand: 'SenBank Card',
    badge: '🎁 TẶNG VOUCHER 1 TRIỆU',
    titleYellow: 'MỞ THẺ TÍN DỤNG',
    titleRed: 'HOÀN TIỀN 15%',
    subtitle: 'Miễn phí thường niên trọn đời • Chi tiêu trước',
    cta: 'MỞ THẺ NGAY',
    colorStart: '#500724', // Rượu vang mận quý tộc
    colorEnd: '#9D174D',   // Hồng tím hoàng gia
    tags: [
      { text: 'HOÀN 15%', color: '#FEF08A', textColor: '#500724', top: 22, right: 18, rotate: '14deg' },
    ],
    showCarMascot: false,
  },
  {
    id: 'b4',
    type: 'pink-coral',
    brand: 'SenBank Pay',
    badge: '✨ MIỄN PHÍ TRỌN ĐỜI',
    titleYellow: 'CHUYỂN TIỀN 24/7',
    titleRed: '0 ĐỒNG PHÍ',
    subtitle: 'Quét VietQR siêu tốc • Không giới hạn hạn mức',
    cta: 'CHUYỂN TIỀN',
    colorStart: '#9D174D', // Hồng hoa sen kiêu sa
    colorEnd: '#F43F5E',   // Hồng san hô rạng ngời
    tags: [
      { text: 'FREE 0Đ', color: '#FFFFFF', textColor: '#9D174D', top: 22, right: 18, rotate: '-8deg' },
    ],
    showCarMascot: false,
  },
  {
    id: 'b5',
    type: 'pink-orchid',
    brand: 'SenBank Rewards',
    badge: '🎉 VÒNG QUAY MAY MẮN',
    titleYellow: 'SĂN IPHONE 16',
    titleRed: 'TRÚNG 100%',
    subtitle: 'Giao dịch nhận lượt quay • Đổi vàng & quà khủng',
    cta: 'QUAY NGAY',
    colorStart: '#4A044E', // Tím hoa sen đậm
    colorEnd: '#C026D3',   // Hồng tím phát quang
    tags: [
      { text: 'TRÚNG 100%', color: '#FDF2F8', textColor: '#4A044E', top: 22, right: 18, rotate: '12deg' },
    ],
    showCarMascot: false,
  },
  {
    id: 'b6',
    type: 'pink-blossom',
    brand: 'SenBank Bill',
    badge: '💡 THANH TOÁN TIỆN LỢI',
    titleYellow: 'ĐIỆN NƯỚC & DATA',
    titleRed: 'GIẢM NGAY 50K',
    subtitle: 'Tự động nhắc nợ • Thanh toán 1 chạm an toàn',
    cta: 'THANH TOÁN',
    colorStart: '#700F43', // Sen Hồng kinh điển
    colorEnd: '#FB7185',   // Hồng phấn hoàng hôn
    tags: [
      { text: '-50.000Đ', color: '#FEF08A', textColor: '#700F43', top: 22, right: 18, rotate: '-12deg' },
    ],
    showCarMascot: false,
  },
];

// Tạo danh sách lặp tuần hoàn vô tận (Infinite Looping Array)
const LOOP_MULTIPLIER = 6;
const CAROUSEL_DATA = Array.from({ length: LOOP_MULTIPLIER }).flatMap((_, loopIdx) =>
  BASE_CAROUSEL_DATA.map((item, itemIdx) => ({
    ...item,
    uniqueId: `loop-${loopIdx}-${item.id}-${itemIdx}`,
  }))
);
const TOTAL_CAROUSEL_ITEMS = CAROUSEL_DATA.length;
const LOOP_CENTER_INDEX = BASE_CAROUSEL_DATA.length * Math.floor(LOOP_MULTIPLIER / 2);
const INITIAL_CAROUSEL_INDEX = LOOP_CENTER_INDEX;

const SERVICES = [
  { id: '1', title: 'Hóa đơn\ntiện ích', icon: 'zap' },
  { id: '2', title: 'Nạp Data\n4G / 5G', icon: 'smartphone' },
  { id: '3', title: 'Vé máy bay\n& Du lịch', icon: 'plane' },
  { id: '4', title: 'Bảo hiểm\nsức khỏe', icon: 'shield-check' },
  { id: '5', title: 'Vé xem phim\nCinema', icon: 'film' },
  { id: '6', title: 'Mua sắm\nhoàn tiền', icon: 'cart' },
  { id: '7', title: 'Đầu tư\ntài chính', icon: 'trending-up' },
  { id: '8', title: 'Vé số\nVietlott', icon: 'ticket', badgeText: 'HOT' },
];

// --- ANIMATED SEARCH BUTTON ---
const AnimatedSearchButton = ({ onPress, paused = false }: { onPress: () => void; paused?: boolean }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (paused) {
      cancelAnimation(rotation);
      return;
    }

    // Tối ưu an toàn 100%: Dùng withRepeat thay vì runOnJS đệ quy để tránh gây treo JS thread/UI thread
    // Radar xoay liên tục 1 vòng trong 2s, sau đó dừng 2s, rồi lặp lại mãi mãi.
    rotation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) }),
        withTiming(1, { duration: 2000 }) // pause at 1 for 2s
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [rotation, paused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value * 360}deg` }],
    };
  });

  return (
    <TouchableOpacity style={styles.glassHeaderBtn} activeOpacity={0.7} onPress={onPress}>
      {/* Lớp viền chạy (Running sweeping border) */}
      <Reanimated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <Svg width={36} height={36} viewBox="0 0 36 36">
          <Circle
            cx="18" cy="18" r="17"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="20 100" // Độ dài của vạch chạy
            fill="none"
          />
        </Svg>
      </Reanimated.View>

      {/* Icon kính lúp AI */}
      <AISearchIcon size={26} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

// --- WIGGLING NOTIFICATION BELL BUTTON ---
const WigglingBellButton = ({
  onPress,
  isFocused = true,
}: {
  onPress: () => void;
  isFocused?: boolean;
}) => {
  const bellRotateAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFocused) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      bellRotateAnim.stopAnimation();
      bellRotateAnim.setValue(0);
      return;
    }

    let isMounted = true;

    const runWiggle = () => {
      if (!isMounted) return;

      // Mô phỏng chuông thật bị gõ nhẹ rồi tắt dần (damped oscillation):
      // 0° → 14° → -10° → 6° → -3° → 0°
      Animated.sequence([
        Animated.timing(bellRotateAnim, {
          toValue: 14,
          duration: 75,
          easing: RNEasing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: -10,
          duration: 75,
          easing: RNEasing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 6,
          duration: 75,
          easing: RNEasing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: -3,
          duration: 70,
          easing: RNEasing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 0,
          duration: 85,
          easing: RNEasing.out(RNEasing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMounted) return;

        // Khoảng cách giữa các lần rung: NGẪU NHIÊN từ 4 đến 9 giây (4000 - 9000ms)
        const nextDelay = 4000 + Math.random() * 5000;
        timeoutRef.current = setTimeout(runWiggle, nextDelay);
      });
    };

    // Lần rung đầu tiên ngẫu nhiên sau 2.5 - 4.5 giây khi vào màn hình
    const initialDelay = 2500 + Math.random() * 2000;
    timeoutRef.current = setTimeout(runWiggle, initialDelay);

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      bellRotateAnim.stopAnimation();
      bellRotateAnim.setValue(0);
    };
  }, [isFocused, bellRotateAnim]);

  const rotateInterpolated = bellRotateAnim.interpolate({
    inputRange: [-15, 0, 15],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <TouchableOpacity
      style={styles.glassHeaderBtn}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ rotate: rotateInterpolated }] }}>
        <AppIcon name="notification" size="sm" color={Colors.white} />
      </Animated.View>
    </TouchableOpacity>
  );
};

// 7. Giải pháp 3: Gói (Memoize) thành phần renderItem để chống lag
const MemoizedBannerItem = React.memo(({ item, index, scrollX }: { item: any; index: number; scrollX: Animated.Value }) => {
  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  // Thu nhỏ đáng kể thẻ 2 bên (còn 82%) và làm mờ nhiều hơn (còn 40%)
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.82, 1.0, 0.82],
    extrapolate: 'clamp',
  });

  // Bù đắp khoảng trống do bị thu nhỏ: thẻ trái dịch sang phải, thẻ phải dịch sang trái
  const SHIFT_AMOUNT = ITEM_WIDTH * 0.09; // 9% mỗi bên bị dư ra do scale 0.82
  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [-SHIFT_AMOUNT, 0, SHIFT_AMOUNT],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1.0, 0.5], // Tăng nhẹ độ sáng 2 bên lên 50% cho dễ nhìn
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.bannerItemWrapper,
        {
          width: ITEM_WIDTH,
          transform: [{ scale }, { translateX }],
          opacity,
          marginHorizontal: ITEM_GAP / 2, // Đồng bộ khoảng cách 2 bên chuẩn 8px
        },
      ]}
    >
      <View style={styles.bannerItem}>
        <LinearGradient
          colors={[item.colorStart, item.colorEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerBackground}
        >
          {/* Top Row: Mini Brand Logo + Promo Badge */}
          <View style={styles.bannerTopRow}>
            <View style={styles.bannerBrandLogo}>
              <Image
                source={require('../../assets/sen-hong-logo.png')}
                style={styles.bannerSenBankLogo}
                contentFit="contain"
              />
              <AppText style={styles.bannerBrandText}>{item.brand}</AppText>
            </View>

            {item.badge && (
              <View style={styles.bannerBadge}>
                <AppText style={styles.bannerBadgeText}>{item.badge}</AppText>
              </View>
            )}
          </View>

          {/* 2-line 3D Banner Title */}
          <View style={styles.bannerTextContent}>
            {item.titleYellow && (
              <View style={styles.title3DBoxYellow}>
                <AppText style={styles.bannerTitleYellow}>{item.titleYellow}</AppText>
              </View>
            )}
            {item.titleRed && (
              <View style={styles.title3DBoxRed}>
                <AppText style={styles.bannerTitleRed}>{item.titleRed}</AppText>
              </View>
            )}
            <AppText style={styles.bannerSubtitle} numberOfLines={1}>{item.subtitle}</AppText>
          </View>

          {/* Floating Confetti / Voucher Tags */}
          {item.tags && item.tags.map((tag: any, tIdx: number) => (
            <View
              key={tIdx}
              style={[
                styles.floatingTag,
                {
                  top: tag.top,
                  right: tag.right,
                  backgroundColor: tag.color,
                  transform: [{ rotate: tag.rotate }],
                },
              ]}
            >
              <AppText style={[styles.floatingTagText, { color: tag.textColor }]}>
                {tag.text}
              </AppText>
            </View>
          ))}

          {/* Mascot Graphic at Right Bottom */}
          {item.showCarMascot && (
            <View style={styles.mascotBleedContainer}>
              <View style={styles.carMascotWrapper}>
                {/* Bee mascot on yellow car */}
                <View style={styles.beeHead}>
                  <AppText style={{ fontSize: 24 }}>🐝</AppText>
                  <View style={styles.flagIcon}>
                    <AppText style={{ fontSize: 10 }}>🇻🇳</AppText>
                  </View>
                </View>
                <View style={styles.yellowCar}>
                  <AppText style={{ fontSize: 26 }}>🚗</AppText>
                </View>
              </View>
            </View>
          )}

          {/* Bottom CTA Pill Button */}
          {item.cta && (
            <TouchableOpacity style={styles.ctaPill} activeOpacity={0.8}>
              <AppText style={styles.ctaPillText}>{item.cta}</AppText>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    </Animated.View>
  );
});

export default function HomeScreen({ navigation }: any) {
  const { user, wallet, refreshBalance, isBalanceLoading, customBackgroundUri } = useApp();
  const { isDark, colors } = useTheme();
  const isFocused = useIsFocused();
  const throttledNavBarScroll = useThrottledNavBarScroll();
  const lastBalanceRefreshRef = useRef(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });

    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 280,
      easing: RNEasing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    setIsExpanded((prev) => !prev);
  }, [isExpanded, rotateAnim]);
  const scrollX = useRef(new Animated.Value(INITIAL_CAROUSEL_INDEX * SNAP_INTERVAL)).current;
  const scrollY = useRef(new Animated.Value(0)).current; // Theo dõi vị trí cuộn dọc
  const flatListRef = useRef<FlatList>(null);
  const isUserInteracting = useRef(false);
  const currentIndexRef = useRef(INITIAL_CAROUSEL_INDEX);

  // Lưu trữ Animated.event vào useRef để KHÔNG BỊ TẠO LẠI mỗi lần render, giúp useNativeDriver: true chạy mượt mà trên Android
  const handleScroll = useRef(
    Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { useNativeDriver: true }
    )
  ).current;

  // Lắng nghe cuộn để ẩn/hiện Bottom Navbar (throttled — không đổi ngưỡng UX)
  const navBarScrollRef = useRef(throttledNavBarScroll);
  navBarScrollRef.current = throttledNavBarScroll;

  const handleVerticalScroll = useRef(
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: true,
        listener: (event: import('react-native').NativeSyntheticEvent<import('react-native').NativeScrollEvent>) => navBarScrollRef.current(event),
      }
    )
  ).current;

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastBalanceRefreshRef.current > 30000) {
        lastBalanceRefreshRef.current = now;
        refreshBalance();
      }
    }, [refreshBalance])
  );

  useEffect(() => {
    if (!isFocused) return;

    // Cuộn tới vị trí giữa ban đầu và thiết lập scrollX chuẩn xác
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: INITIAL_CAROUSEL_INDEX * SNAP_INTERVAL,
        animated: false,
      });
      scrollX.setValue(INITIAL_CAROUSEL_INDEX * SNAP_INTERVAL);
      currentIndexRef.current = INITIAL_CAROUSEL_INDEX;
    }, 100);

    // Vòng lặp chuyển động tự động vô tận không bao giờ đứt gãy
    const timer = setInterval(() => {
      if (!isUserInteracting.current && flatListRef.current) {
        let nextIndex = currentIndexRef.current + 1;

        // Khi gần chạm đuôi, tự động dịch chuyển âm thầm về giữa mượt mà
        if (nextIndex >= TOTAL_CAROUSEL_ITEMS - BASE_CAROUSEL_DATA.length * 2) {
          const resetIndex = LOOP_CENTER_INDEX;
          flatListRef.current.scrollToOffset({
            offset: resetIndex * SNAP_INTERVAL,
            animated: false,
          });
          scrollX.setValue(resetIndex * SNAP_INTERVAL);
          currentIndexRef.current = resetIndex;
          nextIndex = resetIndex + 1;
        }

        flatListRef.current.scrollToOffset({
          offset: nextIndex * SNAP_INTERVAL,
          animated: true,
        });
        currentIndexRef.current = nextIndex;
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [isFocused]);
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [40, 85],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [39, 40, 85],
    outputRange: [-500, -25, 0],
    extrapolate: 'clamp',
  });

  // Tự động làm mờ và ẩn lớp nền hồng phía trên khi kéo cuộn xuống
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerBgTranslateY = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, -80],
    extrapolate: 'clamp',
  });

  const renderBannerItem = useCallback(({ item, index }: { item: any; index: number }) => {
    return <MemoizedBannerItem item={item} index={index} scrollX={scrollX} />;
  }, [scrollX]);

  return (
    <View style={styles.container}>
      {/* @ts-ignore */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* STICKY FLOATING TOP BAR (Chỉ hiện khi cuộn xuống dưới, bo cong sâu bên TRÁI) */}
      <Animated.View
        style={[
          styles.stickyHeaderContainer,
          {
            opacity: stickyHeaderOpacity,
            transform: [{ translateY: stickyHeaderTranslateY }],
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Lớp đổ bóng ảo (cách điệu) nằm dưới kính, thu nhỏ một chút để không lẹm viền khúc xạ */}
        <View style={styles.stickyHeaderShadow} />

        <View style={styles.stickyHeaderWrapper}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
          {/* DẢI MÀU (GRADIENT) HỒNG ĐẬM HƠN PHỦ LÊN KÍNH */}
          <LinearGradient
            colors={['rgba(228, 172, 178, 0.6)', 'rgba(210, 81, 157, 0.75)', 'rgba(112, 15, 67, 0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Vùng phát quang uốn lượn kính mờ ở góc dưới bên trái */}
          <View style={styles.stickyLeftAura} />

          <SafeAreaView edges={['top']}>
            <View style={styles.stickyHeaderContent}>
              {/* 1. Ô Dán chuyển tiền AI dạng viên thuốc viền 7 màu chạy động từ trái sang phải */}
              <AnimatedRainbowPill
                title="Dán chuyển tiền AI"
                height={38}
                style={{ flex: 1, marginLeft: 6 }}
                onPress={() => navigation.navigate('Search')}
              />

              {/* 2. Cụm Icon: Chuông 🔔 + 3 Gạch ☰ */}
              <View style={styles.stickyHeaderActions}>
                <WigglingBellButton
                  isFocused={isFocused}
                  onPress={() => navigation.navigate('Notifications')}
                />

                <TouchableOpacity
                  style={styles.glassHeaderBtn}
                  activeOpacity={0.7}
                  onPress={() => DeviceEventEmitter.emit('openSideMenu')}
                >
                  <AppIcon name="menu" size="sm" color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Animated.View>

      {/* Background Gradient & Light Flares */}
      <View style={styles.headerBackground} pointerEvents="none">
        {customBackgroundUri ? (
          <Image cachePolicy="memory-disk" source={{ uri: customBackgroundUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <LinearGradient
            colors={['#E4ACB2', '#D2519D', '#700F43']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {/* Thêm các đường nét trang trí uốn lượn (Waves & Rings) */}
        {!customBackgroundUri && (
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            {/* Đường cong mềm mại */}
            <Path d="M-50 150 Q 150 50 400 180 T 600 100" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" fill="none" />
            <Path d="M-50 165 Q 200 -20 450 200 T 600 120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
            <Path d="M-20 280 C 150 200, 250 350, 500 220" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" />
            <Path d="M0 320 C 200 380, 300 250, 500 280" stroke="rgba(255,255,255,0.03)" strokeWidth="3" fill="none" />

            {/* Vòng tròn đồng tâm */}
            <Circle cx="85%" cy="25%" r="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" strokeDasharray="4 6" />
            <Circle cx="85%" cy="25%" r="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" fill="none" />
            <Circle cx="85%" cy="25%" r="80" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" fill="none" />

            <Circle cx="10%" cy="60%" r="200" stroke="rgba(255,255,255,0.02)" strokeWidth="4" fill="none" />
            <Circle cx="10%" cy="60%" r="150" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
          </Svg>
        )}
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleVerticalScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isBalanceLoading}
            onRefresh={refreshBalance}
            tintColor="#D2519D"
            colors={['#D2519D', '#700F43']}
          />
        }
      >
        <SafeAreaView edges={['top']}>
          {/* Row 1: Top Navigation Header (Logo MB bên trái + 3 icon bên phải) */}
          <View style={styles.headerRow}>
            {/* Logo Custom */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.customAppLogo}
                contentFit="contain"
              />
            </View>

            {/* 3 Right Action Icons (Gap: 16px, kích thước 22-24px) */}
            <View style={styles.headerActions}>
              {/* Search Icon with Animated Sweeping Border */}
              <AnimatedSearchButton paused={!isFocused} onPress={() => navigation.navigate('Search')} />

              {/* Notification Bell với hiệu ứng rung nhẹ tự nhiên */}
              <WigglingBellButton
                isFocused={isFocused}
                onPress={() => navigation.navigate('Notifications')}
              />

              {/* Hamburger Menu 3 gạch */}
              <TouchableOpacity
                style={styles.glassHeaderBtn}
                activeOpacity={0.7}
                onPress={() => DeviceEventEmitter.emit('openSideMenu')}
              >
                <AppIcon name="menu" size="sm" color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance & Avatar Section (Nổi trên header, hỗ trợ vuốt ngang xem thẻ kế bên) */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceRow}>

              {/* Horizontal Swipeable Balance Cards List + Avatar (Cuộn toàn cụm) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={BALANCE_SNAP_INTERVAL}
                contentContainerStyle={styles.balanceScrollContent}
                style={styles.balanceScrollList}
              >
                {/* Left Column: Avatar (52px, viền trắng 2px, check xanh) + Badge Basic */}
                <View style={styles.avatarColumn}>
                  <View style={styles.avatarWrapper}>
                    <Image cachePolicy="memory-disk" 
                      source={user?.avatarUri ? { uri: user.avatarUri } : { uri: 'https://i.pravatar.cc/150?img=11' }} 
                      style={styles.avatar} 
                    />
                    {/* Verified Shield Badge */}
                    <View style={styles.verifiedShield}>
                      <AppIcon name="check" size="xs" color={Colors.white} />
                    </View>
                  </View>

                  {/* Badge "Basic": Pill trắng nhỏ dưới avatar, icon giỏ hàng 12px + chữ 11px */}
                  <View style={styles.basicBadge}>
                    <AppIcon name="shoppingBag" size="xs" color="#475569" />
                    <AppText style={styles.basicBadgeText}>Basic</AppText>
                  </View>

                  {/* User Name below badge */}
                  <AppText style={{ color: Colors.white, fontSize: 12, fontWeight: 'bold', marginTop: 4, maxWidth: 100, textAlign: 'center' }} numberOfLines={1} ellipsizeMode="tail">
                    {user?.name || 'Bạn'}
                  </AppText>
                </View>
                {/* CARD 1: Tổng số dư VND (Kính mờ) */}
                <View style={[styles.balanceCardWrapper, { width: BALANCE_CARD_WIDTH, marginRight: BALANCE_CARD_GAP }]}>
                  <View style={styles.balanceCard}>
                    {/* Dòng 1: Label "Tổng số dư VND" + chevron > + icon con mắt */}
                    <View style={styles.balanceHeader}>
                      <AppText style={styles.balanceTitle}>Tổng số dư VND</AppText>
                      <AppIcon name="chevronRight" size="xs" color="rgba(255,255,255,0.9)" />
                      <View style={{ flex: 1 }} />
                      <TouchableOpacity
                        onPress={() => setBalanceVisible(!balanceVisible)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        style={styles.eyeToggleBtn}
                      >
                        <AppIcon name={balanceVisible ? "eyeOff" : "eye"} size="sm" color="#FDF2F8" />
                      </TouchableOpacity>
                    </View>

                    {/* Dòng 2: Số dư lớn + đơn vị "VND" */}
                    <View style={styles.amountRow}>
                      <AppText style={styles.amountNumber}>
                        {balanceVisible
                          ? (wallet?.balance?.toLocaleString('vi-VN') || '0')
                          : '*** ***'}
                      </AppText>
                      <AppText style={styles.amountCurrency}> {wallet?.currency || 'VND'}</AppText>
                    </View>

                    {/* Dòng 3: Link Lịch sử giao dịch */}
                    <TouchableOpacity
                      style={styles.profitStrip}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('TransactionHistory')}
                    >
                      <AppText style={styles.profitText}>LỊCH SỬ GIAO DỊCH</AppText>
                      <AppIcon name="chevronRight" size="xs" color="#FDF2F8" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* CARD 2: Thẻ MB Visa (Kính mờ) */}
                <View style={[styles.balanceCardWrapper, { width: BALANCE_CARD_WIDTH }]}>
                  <View style={styles.balanceCard}>
                    {/* Dòng 1: Label "Thẻ MB Hi Visa" + chevron > + icon thẻ */}
                    <View style={styles.balanceHeader}>
                      <AppText style={styles.balanceTitle}>Thẻ MB Hi Visa</AppText>
                      <AppIcon name="chevronRight" size="xs" color="rgba(255,255,255,0.9)" />
                      <View style={{ flex: 1 }} />
                      <AppIcon name="card" size="xs" color="#FDF2F8" />
                    </View>

                    {/* Dòng 2: Hạn mức / Số dư thẻ */}
                    <View style={styles.amountRow}>
                      <AppText style={styles.amountNumber}>
                        {balanceVisible ? '0' : '*** ***'}
                      </AppText>
                      <AppText style={styles.amountCurrency}> VND</AppText>
                    </View>

                    {/* Dòng 3: Link "QUẢN LÝ THẺ & HẠN MỨC" + chevron > */}
                    <TouchableOpacity style={styles.profitStrip} activeOpacity={0.8}>
                      <AppText style={styles.profitText}>QUẢN LÝ THẺ & HẠN MỨC</AppText>
                      <AppIcon name="chevronRight" size="xs" color="#FDF2F8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>

        {/* MAIN FULL-WIDTH BODY CONTAINER (Chuyển nền tối khi bật Dark Mode) */}
        <View style={[styles.whiteBodyContainer, { backgroundColor: colors.background }]}>
          {!isDark && (
            <ImageBackground 
              source={require('../assets/images/bg-white-pink-pattern.png')}
              style={StyleSheet.absoluteFill}
              imageStyle={{ borderTopLeftRadius: 22, borderTopRightRadius: 22 }}
            />
          )}
          {/* 4 Quick Actions Row */}
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map((item, index) => {
              const IconComp = item.component;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.id === '1') navigation.navigate('Transfer');
                    else if (item.id === '2') navigation.navigate('PhoneRecharge');
                    else if (item.id === '3') navigation.navigate('Savings');
                    else if (item.id === '4') navigation.navigate('QuickLoan');
                  }}
                >
                  {/* Icon Container with relative position for the badge */}
                  <View style={styles.actionIconContainer}>
                    <View style={[styles.actionIconBg, isDark && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                      <IconComp size={28} color={isDark ? colors.primary : '#D2519D'} />
                    </View>

                    {/* Badges positioned at top: -8, right: -10 */}
                    {item.badge && (
                      <View
                        style={[
                          styles.badge,
                          item.id === '4' ? styles.badgeNhuGio : styles.badgeTaiLoc,
                        ]}
                      >
                        <AppText
                          style={[
                            styles.badgeText,
                            item.id === '4' ? styles.badgeTextNhuGio : styles.badgeTextTaiLoc,
                          ]}
                        >
                          {item.badge}
                        </AppText>
                      </View>
                    )}
                  </View>

                  {/* Text below icon */}
                  <AppText style={[styles.actionTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 4 Quick Actions Row 2 (Mở rộng khi bấm nút mũi tên kép) */}
          {isExpanded && (
            <View style={[styles.quickActionsRow, { marginTop: 12 }]}>
              {EXPANDED_ACTIONS.map((item, index) => {
                const IconComp = item.lib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
                return (
                  <TouchableOpacity
                    key={item.id || index}
                    style={styles.actionItem}
                    activeOpacity={0.8}
                    onPress={() => item.route && navigation.navigate(item.route)}
                  >
                    <View style={styles.actionIconContainer}>
                      <View style={[styles.actionIconBg, isDark && { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                        <IconComp name={item.iconName as any} size={28} color={isDark ? colors.primary : '#D2519D'} />
                      </View>

                      {item.badge && (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: item.badgeColor || '#E11D48' },
                          ]}
                        >
                          <AppText style={[styles.badgeText, { color: '#FFFFFF' }]}>
                            {item.badge}
                          </AppText>
                        </View>
                      )}
                    </View>

                    <AppText style={[styles.actionTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                      {item.title}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Center Red Round Chevrons Down Expand Button */}
          <View style={styles.expandButtonWrapper}>
            <TouchableOpacity
              style={styles.expandButton}
              activeOpacity={0.8}
              onPress={toggleExpand}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M7 8l5 5 5-5M7 14l5 5 5-5"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Banner Carousel (6 Banners chạy vòng lặp vô tận không đứt gãy) */}
          <View style={styles.carouselContainer}>
            <Animated.FlatList
              ref={flatListRef}
              data={CAROUSEL_DATA}
              keyExtractor={(item: any) => item.uniqueId}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              bounces={true}
              getItemLayout={(_, index) => ({
                length: SNAP_INTERVAL,
                offset: SNAP_INTERVAL * index,
                index,
              })}
              contentContainerStyle={{
                paddingHorizontal: SIDE_SPACER - ITEM_GAP / 2,
              }}
              onScrollBeginDrag={() => { isUserInteracting.current = true; }}
              onScrollEndDrag={() => { isUserInteracting.current = false; }}
              onMomentumScrollEnd={(e) => {
                const rawIdx = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
                currentIndexRef.current = rawIdx;
                isUserInteracting.current = false;

                // Tự động căn vị trí về giữa dải lặp nếu người dùng vuốt về quá gần mép
                if (rawIdx < BASE_CAROUSEL_DATA.length * 2 || rawIdx >= TOTAL_CAROUSEL_ITEMS - BASE_CAROUSEL_DATA.length * 2) {
                  const normalizedIdx = (rawIdx % BASE_CAROUSEL_DATA.length) + LOOP_CENTER_INDEX;
                  flatListRef.current?.scrollToOffset({
                    offset: normalizedIdx * SNAP_INTERVAL,
                    animated: false,
                  });
                  scrollX.setValue(normalizedIdx * SNAP_INTERVAL);
                  currentIndexRef.current = normalizedIdx;
                }
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              renderItem={renderBannerItem}
            />
          </View>

          {/* Services Section "Mua sắm - Giải trí - Đầu tư" */}
          <View style={styles.servicesSection}>
            <AppText style={styles.sectionTitle}>Mua sắm - Giải trí - Đầu tư</AppText>
            <View style={styles.servicesGrid}>
              {SERVICES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.id === '8') {
                      navigation.navigate('Lottery');
                    } else if (item.id === '2') {
                      navigation.navigate('PhoneRecharge');
                    } else {
                      navigation.navigate('BillPayment');
                    }
                  }}
                >
                  <View style={styles.serviceIconContainer}>
                    <View style={[
                      styles.serviceIconBg, 
                      { 
                        backgroundColor: isDark ? colors.surface : '#FDF2F8',
                        borderColor: isDark ? colors.border : '#FCE7F3',
                      }
                    ]}>
                      <AppIcon name={item.icon as any} size="md" color={isDark ? colors.primary : '#700F43'} />
                    </View>
                    {item.badgeText && (
                      <View style={[styles.serviceItemBadge, { backgroundColor: isDark ? colors.primary : '#700F43' }]}>
                        <AppText style={styles.serviceItemBadgeText}>{item.badgeText}</AppText>
                      </View>
                    )}
                  </View>
                  <AppText style={[styles.serviceTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Horizontal Mini Ads Banner Section */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalAdsContainer}
            >
              <TouchableOpacity style={[styles.miniAdBanner, { backgroundColor: '#FCE7F3' }]} activeOpacity={0.85}>
                <Image cachePolicy="memory-disk" source={{ uri: 'https://images.unsplash.com/photo-1557821552-171051530dcb?w=400&q=80' }} style={styles.miniAdImage} />
                <LinearGradient colors={['transparent', 'rgba(112, 15, 67, 0.85)']} style={StyleSheet.absoluteFill} />
                <View style={styles.miniAdOverlay}>
                  <AppText style={styles.miniAdTitle}>Hoàn tiền 50%</AppText>
                  <AppText style={styles.miniAdSubtitle}>Thanh toán quét mã QR</AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.miniAdBanner, { backgroundColor: '#E0F2FE' }]} activeOpacity={0.85}>
                <Image cachePolicy="memory-disk" source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80' }} style={styles.miniAdImage} />
                <LinearGradient colors={['transparent', 'rgba(2, 132, 199, 0.85)']} style={StyleSheet.absoluteFill} />
                <View style={styles.miniAdOverlay}>
                  <AppText style={styles.miniAdTitle}>Săn Sale Đậm</AppText>
                  <AppText style={styles.miniAdSubtitle}>Giảm liền tay 100K</AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.miniAdBanner, { backgroundColor: '#FEF3C7' }]} activeOpacity={0.85}>
                <Image cachePolicy="memory-disk" source={{ uri: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&q=80' }} style={styles.miniAdImage} />
                <LinearGradient colors={['transparent', 'rgba(217, 119, 6, 0.85)']} style={StyleSheet.absoluteFill} />
                <View style={styles.miniAdOverlay}>
                  <AppText style={styles.miniAdTitle}>Mở Thẻ Tín Dụng</AppText>
                  <AppText style={styles.miniAdSubtitle}>Miễn phí thường niên trọn đời</AppText>
                </View>
              </TouchableOpacity>
            </ScrollView>

          </View>
        </View>

      </Animated.ScrollView>
      {/* Slide-In Side Menu Drawer (Nút 3 gạch chuẩn 1:1 theo ảnh) */}
      {/* Side Menu Drawer - Moved to MainTabs */}
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  stickyHeaderShadow: {
    position: 'absolute',
    top: 0,
    bottom: 2, // Thu nhỏ vào 2px để không bị khúc xạ
    left: 2,   // Thu nhỏ vào 2px bên trái (chỗ góc bo)
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Màu xám đen nền để Android tính toán bóng đổ
    borderBottomLeftRadius: 46, // 48 - 2
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 16, // Đổ bóng mạnh
  },
  stickyHeaderWrapper: {
    overflow: 'hidden',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)', // Viền đen mờ tạo cảm giác 3D tách biệt
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  stickyLeftAura: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 180,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: Platform.OS === 'android' ? 6 : 2,
    paddingBottom: 16,
    gap: 12,
  },
  stickySearchPill: {
    flex: 1,
    height: 38,
    marginLeft: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stickySearchPillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stickySearchText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.1,
  },
  stickyHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 380,
    overflow: 'hidden',
  },
  capsuleShape1: {
    position: 'absolute',
    top: -40, left: -60,
    width: 220, height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ rotate: '-25deg' }],
  },
  capsuleShape2: {
    position: 'absolute',
    top: 40, right: -40,
    width: 200, height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ rotate: '15deg' }],
  },
  auraGlow: {
    position: 'absolute',
    top: -30, left: 20,
    width: 180, height: 180,
    borderRadius: 90,
    backgroundColor: '#F472B6',
    opacity: 0.3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customAppLogo: {
    width: 130,
    height: 130,
    marginLeft: -35,
    marginVertical: -40,
  },
  headerBeeCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  beeCircle: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Cách đều nhau gap: 16px
  },
  glassHeaderBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  aiBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  balanceSection: {
    marginTop: 8,
    zIndex: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  avatarColumn: {
    alignItems: 'center',
    marginLeft: 34,
    marginRight: 30,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 52,            // 👈 Chiều rộng ảnh đại diện
    height: 52,           // 👈 Chiều cao ảnh đại diện
    borderRadius: 26,     // 👈 Bo tròn ảnh (nửa width/height để tròn xoe)
    borderWidth: 2,       // 👈 Độ dày viền trắng quanh avatar
    borderColor: Colors.white, // 👈 Màu viền trắng
  },
  verifiedShield: {
    position: 'absolute',
    bottom: -2,           // 👈 Vị trí huy hiệu check so với đáy avatar (chỉnh top/bottom)
    right: -2,            // 👈 Vị trí huy hiệu check so với mép phải avatar (chỉnh left/right)
    backgroundColor: '#10B981', // 👈 Màu nền xanh lá của huy hiệu
    width: 18,            // 👈 Chiều rộng huy hiệu
    height: 18,           // 👈 Chiều cao huy hiệu
    borderRadius: 9,      // 👈 Bo tròn huy hiệu
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,     // 👈 Viền trắng huy hiệu
    borderColor: Colors.white,
  },
  basicBadge: {
    flexDirection: 'row', // Sắp xếp icon và chữ nằm ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
    backgroundColor: Colors.white, // 👈 Màu nền thẻ (trắng)
    paddingHorizontal: 8, // 👈 Độ rộng lề ngang 2 bên của thẻ (tăng/giảm độ dài thẻ)
    paddingVertical: 3,   // 👈 Độ cao lề trên/dưới của thẻ (tăng/giảm độ dày thẻ)
    borderRadius: Radius.pill, // 👈 Bo cong 2 đầu dạng viên thuốc (hoặc custom số vd: 12, 16, 999)
    marginTop: 6,         // 👈 Khoảng cách từ avatar xuống thẻ Basic (tăng = thẻ tụt xuống, giảm = thẻ nhích lên sát avatar)
    gap: 4,               // 👈 Khoảng cách giữa icon và chữ Basic
    ...Shadows.card,      // 👈 Đổ bóng nhẹ cho thẻ
  },
  basicBadgeText: {
    fontSize: 11,         // 👈 Kích cỡ chữ "Basic" (tăng/giảm size chữ)
    fontWeight: '700',    // 👈 Độ đậm chữ ('400', '600', '700', '800', 'bold')
    color: '#475569',     // 👈 Màu sắc chữ (màu xám đậm slate)
  },
  balanceScrollList: {
    flex: 1,
    overflow: 'visible',
  },
  balanceScrollContent: {
    paddingRight: 16,
  },
  balanceCardWrapper: {
    minHeight: 125,       // 👈 Chiều cao tối thiểu của thẻ số dư (tăng/giảm độ cao thẻ)
    borderRadius: 20,     // 👈 Độ bo cong 4 góc của thẻ
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  balanceCard: {
    flex: 1,
    borderRadius: 20,
    paddingTop: 12,        // 👈 Khoảng cách từ mép trên tới dòng "Tổng số dư VND"
    paddingHorizontal: 14, // 👈 Đệm lề 2 bên trong thẻ (trái & phải)
    paddingBottom: 8,      // 👈 Khoảng cách mép dưới
    justifyContent: 'space-between',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,               // 👈 Khoảng cách giữa chữ và icon mũi tên
    marginBottom: 2,      // 👈 Khoảng cách giữa dòng header và dòng số tiền
  },
  balanceTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12.5,       // 👈 Kích thước chữ "Tổng số dư VND"
    fontWeight: '600',    // 👈 Độ đậm chữ tiêu đề
  },
  eyeToggleBtn: {
    padding: 3,           // 👈 Vùng bấm mở rộng cho icon con mắt
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,      // 👈 Khoảng cách giữa dòng số tiền và dải "SINH LỜI MỖI NGÀY"
  },
  amountNumber: {
    color: Colors.white,
    fontSize: 22,         // 👈 Kích thước số tiền (vd: 18,010) (tăng = số to hơn, giảm = số nhỏ lại)
    fontWeight: '800',    // 👈 Độ đậm số tiền ('800', '900', 'bold')
    letterSpacing: 0.5,   // 👈 Khoảng cách giữa các con số
  },
  amountCurrency: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13.5,       // 👈 Kích thước chữ đơn vị "VND"
    fontWeight: '700',    // 👈 Độ đậm chữ "VND"
  },
  profitStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.16)', // 👈 Màu nền dải mờ bên dưới
    marginHorizontal: -14,// 👈 Kéo dài dải mờ ra sát 2 mép thẻ (phải bằng âm của paddingHorizontal)
    marginBottom: -8,     // 👈 Kéo dải mờ xuống sát đáy thẻ (phải bằng âm của paddingBottom)
    paddingHorizontal: 14,// 👈 Đệm lề 2 bên của dải mờ
    paddingVertical: 6,   // 👈 Độ dày chiều dọc của dải mờ (tăng/giảm độ cao dải)
    borderBottomLeftRadius: 20,  // 👈 Bo góc dưới-trái dải mờ khớp với thẻ
    borderBottomRightRadius: 20, // 👈 Bo góc dưới-phải dải mờ khớp với thẻ
  },
  profitText: {
    color: '#FDF2F8',     // 👈 Màu chữ "SINH LỜI MỖI NGÀY" (trắng hồng sen sáng)
    fontSize: 10.5,       // 👈 Kích thước chữ "SINH LỜI MỖI NGÀY"
    fontWeight: '800',    // 👈 Độ đậm chữ
    letterSpacing: 0.3,
  },
  whiteBodyContainer: {
    // backgroundColor: '#FFFFFF',  // Đã thay thế bằng ImageBackground

    borderTopLeftRadius: 22,    // 👈 2. Độ bo cong góc trên-trái
    borderTopRightRadius: 22,   // 👈 3. Độ bo cong góc trên-phải

    // 👇👇👇 CHỈNH KÉO KHỐI TRẮNG LÊN / XUỐNG TẠI ĐÂY: 👇👇👇
    // • MUỐN KÉO XUỐNG DƯỚI (lộ nhiều nền xanh hơn): TĂNG số này lên (vd: 20, 26, 32, 40)
    // • MUỐN KÉO LÊN TRÊN (đè lẹm sâu vào nền xanh): GIẢM số này xuống hoặc DÙNG SỐ ÂM (vd: 5, 0, -10, -20)
    marginTop: 25,              // 👈 4. VỊ TRÍ ĐẨY LÊN/XUỐNG (Tăng số = kéo khối trắng tụt xuống dưới)

    paddingTop: 20,             // 👈 5. Đệm lề bên trong từ mép trên khối trắng đến 4 nút chuyển tiền
    paddingBottom: 100,         // 👈 6. Đệm lề đáy để cuộn không bị thanh menu đáy che
    width: '100%',              // 👈 7. Chiều rộng 100% tràn toàn màn hình
    shadowColor: '#700F43',     // 👈 8. Màu đổ bóng lên nền hồng sen
    shadowOffset: { width: 0, height: -4 }, // 👈 Hướng bóng hắt lên phía trên
    shadowOpacity: 0.12,         // 👈 Độ mờ của bóng
    shadowRadius: 14,           // 👈 Độ lan tỏa của bóng
    elevation: 6,               // 👈 Đảm bảo khối trắng luôn NẰM ĐÈ LÊN TRÊN nền xanh (Android)
    zIndex: 10,                 // 👈 Đảm bảo khối trắng luôn NẰM ĐÈ LÊN TRÊN nền xanh (iOS/Web)
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  actionIconBg: {
    width: 54,
    height: 54,
    borderRadius: 18, // Squircle
    backgroundColor: '#FDF2F8', // Nền hồng pastel hoa sen
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3', // Viền hồng pastel
    overflow: 'hidden',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 16,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
    elevation: 3,
  },
  badgeTaiLoc: {
    backgroundColor: '#E11D48',
  },
  badgeNhuGio: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  badgeTextTaiLoc: {
    color: '#FFFFFF',
  },
  badgeTextNhuGio: {
    color: '#D2519D',
  },
  expandButtonWrapper: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E11D48', // Bright pinkish red
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  carouselContainer: {
    marginTop: 20,
    marginBottom: 20,
    height: 190,
  },
  bannerItemWrapper: {
    height: 190,
    justifyContent: 'center',
    ...Shadows.elevated,
  },
  bannerItem: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  bannerBackground: {
    flex: 1,
    padding: 14,
    position: 'relative',
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bannerBrandLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  bannerSenBankLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  bannerBrandText: {
    color: Colors.white,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    gap: 4,
  },
  bannerBadgeText: {
    color: '#FEF08A',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  bannerTextContent: {
    marginTop: 2,
    zIndex: 2,
  },
  title3DBoxYellow: {
    alignSelf: 'flex-start',
  },
  bannerTitleYellow: {
    color: '#FDE047',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  title3DBoxRed: {
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  bannerTitleRed: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    color: '#FFE4E6',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  floatingTag: {
    position: 'absolute',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingTagText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  mascotBleedContainer: {
    position: 'absolute',
    right: 30,
    bottom: 10,
    zIndex: 2,
  },
  carMascotWrapper: {
    alignItems: 'center',
  },
  beeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -10,
    zIndex: 3,
  },
  flagIcon: {
    marginLeft: -4,
  },
  yellowCar: {
    zIndex: 1,
  },
  ctaPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginTop: 'auto',
    zIndex: 4,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaPillText: {
    color: '#700F43',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  servicesSection: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 16,
  },
  serviceIconContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  serviceIconBg: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    backgroundColor: '#FDF2F8',
    overflow: 'hidden',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  customLogoText: {
    fontSize: 11,
    fontWeight: '900',
  },
  serviceItemBadge: {
    position: 'absolute',
    top: -4, right: -4,
    backgroundColor: '#EF4444',
    width: 16, height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceItemBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 16,
  },
  horizontalAdsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  miniAdBanner: {
    width: 250,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  miniAdImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniAdOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 12,
  },
  miniAdTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  miniAdSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarCardContent: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    position: 'absolute',
    top: 12,
  },
  calendarRing: {
    width: 8,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#818CF8',
  },
  calendarBody: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  calendarZeroText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  calendarSubText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});