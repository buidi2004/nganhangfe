import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedGradientQRIcon from './icons/AnimatedGradientQRIcon';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { navBarTranslateY } from './GlassNavBarBridge';
import { BlurView } from 'expo-blur';

// ==========================================
// THÔNG SỐ BẠN CÓ THỂ TỰ DO CHỈNH SỬA Ở ĐÂY:
// ==========================================
const BAR_HEIGHT = 75; // Chiều cao của thanh
const BOTTOM = 30;     // Khoảng cách cách mép dưới màn hình

// ĐỘ BO CONG 4 GÓC (Chỉnh thoải mái, code sẽ tự động đồng bộ mọi lớp!):
const R_TOP_LEFT = 16;     // Góc trên - bên trái
const R_TOP_RIGHT = 16;    // Góc trên - bên phải
const R_BOTTOM_LEFT = 16;  // Góc dưới - bên trái
const R_BOTTOM_RIGHT = 16; // Góc dưới - bên phải
// ==========================================

const TABS = [
  { name: 'HomeTab', label: 'Trang chủ', icon: 'home-outline', iconFocused: 'home', lib: 'Ionicons' },
  { name: 'Card', label: 'Thẻ', icon: 'credit-card-multiple-outline', iconFocused: 'credit-card-multiple', lib: 'MaterialCommunityIcons' },
  { name: 'QR', label: '', icon: 'qrcode-scan', iconFocused: 'qrcode-scan', lib: 'MaterialCommunityIcons', isCenter: true },
  { name: 'Gift', label: 'Ưu đãi', icon: 'gift-outline', iconFocused: 'gift', lib: 'Ionicons' },
  { name: 'Menu', label: 'Menu', icon: 'grid-outline', iconFocused: 'grid', lib: 'Ionicons' },
];

export function GlassBottomNavbar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Kiểm tra cấu hình ẩn navbar của tab hiện tại
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  if (focusedOptions.tabBarStyle && (focusedOptions.tabBarStyle as any).display === 'none') {
    return null;
  }

  const tabElements = state.routes.map((route, index) => {
    const isFocused = state.index === index;
    const tabDef = TABS.find((t) => t.name === route.name);

    if (!tabDef) return null;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const IconComponent = tabDef.lib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
    const iconName = isFocused ? tabDef.iconFocused : tabDef.icon;
    const color = isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';

    if (tabDef.isCenter) {
      return (
        <TouchableOpacity
          key={index}
          activeOpacity={0.8}
          onPress={onPress}
          style={styles.centerBtn}
        >
          <View style={styles.centerCircle}>
            <AnimatedGradientQRIcon 
              size={50} 
              borderRadius={14} // Khớp với borderRadius 16 trừ đi 2px viền
            />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
          <IconComponent
            name={iconName as any}
            size={25}
            color={color}
            style={isFocused ? styles.iconShadow : undefined}
          />
        </View>
        <Text style={[styles.label, { color }, isFocused && styles.labelFocused]}>
          {tabDef.label}
        </Text>
      </TouchableOpacity>
    );
  });

  // Gộp 4 góc lại thành 1 object để tái sử dụng, đảm bảo không bao giờ bị lệch!
  const radiusStyles = {
    borderTopLeftRadius: R_TOP_LEFT,
    borderTopRightRadius: R_TOP_RIGHT,
    borderBottomLeftRadius: R_BOTTOM_LEFT,
    borderBottomRightRadius: R_BOTTOM_RIGHT,
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY: navBarTranslateY }] }]}>
      {/* 1. Lớp đổ bóng chuyên dụng cho Android (Tách rời để không bị lỗi elevation) */}
      <View style={[styles.shadowContainer, radiusStyles]} />

      {/* 2. Lớp chứa nội dung (Cắt gọt hiển thị theo đúng 4 góc bo cong) */}
      <View style={[styles.pillContent, radiusStyles]}>

        {/* Thay thế LiquidGlassView bằng BlurView theo yêu cầu */}
        <BlurView 
          intensity={80} 
          tint="light"
          style={[StyleSheet.absoluteFill, radiusStyles, { overflow: 'hidden', height: BAR_HEIGHT }]} 
        />

        {/* Bật lại lớp phủ màu hồng */}
        <LinearGradient
          colors={['rgba(210, 81, 157, 0.85)', 'rgba(163, 27, 107, 0.92)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Viền nổi 3D */}
        <View style={[styles.innerBorder, radiusStyles]} />

        {/* Các nút bấm */}
        <View style={styles.tabRow}>
          {tabElements}
        </View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: BOTTOM,
    left: 16,
    right: 16,
    height: BAR_HEIGHT + 12, // Dư ra 12px để nhường chỗ cho nút QR lồi lên
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shadowContainer: {
    position: 'absolute',
    bottom: 4, // Thu vào 4px so với đáy kính
    left: 4,   // Thu vào 4px so với viền trái
    right: 4,  // Thu vào 4px so với viền phải
    height: BAR_HEIGHT - 8, // Giảm chiều cao 8px (trên 4px, dưới 4px)
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Đổi sang xám/đen trong suốt để không bị viền hồng
    elevation: 12, // Đổ bóng cho Android
  },
  pillContent: {
    height: BAR_HEIGHT,
    width: '100%',
    overflow: 'hidden', // Quan trọng: Cắt mọi thứ thừa ra ngoài 4 góc bo cong!
  },
  innerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    // Không dùng nền tròn nữa, bóng sẽ được bám sát hình khối icon
  },
  iconShadow: {
    textShadowColor: 'rgba(255, 255, 255, 1)', // Glow phát sáng màu trắng bám sát Icon
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  labelFocused: {
    fontWeight: '800',
  },
  centerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 15,
    elevation: 8, // Nút QR có bóng riêng
  },
  centerCircle: {
    width: 54,
    height: 54,
    borderRadius: 16, // Hình vuông bo cong nhẹ thay vì tròn vo
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
});
