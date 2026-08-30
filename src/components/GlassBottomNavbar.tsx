import React from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const BAR_HEIGHT = 64;
const BOTTOM = Platform.OS === 'ios' ? 24 : 16;

const TABS = [
  { name: 'HomeTab', label: 'Trang chu', icon: 'home-outline', iconFocused: 'home', lib: 'Ionicons' },
  { name: 'Card', label: 'Lich su', icon: 'credit-card-multiple-outline', iconFocused: 'credit-card-multiple', lib: 'MaterialCommunityIcons' },
  { name: 'QR', label: '', icon: 'qrcode-scan', iconFocused: 'qrcode-scan', lib: 'MaterialCommunityIcons', isCenter: true },
  { name: 'Gift', label: 'Uu dai', icon: 'gift-outline', iconFocused: 'gift', lib: 'Ionicons' },
  { name: 'More', label: 'Ca nhan', icon: 'account-outline', iconFocused: 'account', lib: 'MaterialCommunityIcons' },
];

export function GlassBottomNavbar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      {/* Shadow */}
      <View style={styles.shadowContainer}>
        <View style={[styles.pillContent, { backgroundColor: '#D2519D', borderRadius: BAR_HEIGHT / 2 }]} />
      </View>

      <BlurView intensity={30} tint="light" style={[styles.pillContent, { borderRadius: BAR_HEIGHT / 2, overflow: 'hidden' }]}>
        <View style={styles.innerBorder} />
        
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
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
            const color = isFocused ? '#D2519D' : '#666';

            if (tabDef.isCenter) {
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={onPress}
                  style={styles.centerBtn}
                >
                  <LinearGradient
                    colors={['#D2519D', '#B3307D']}
                    style={styles.centerCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <IconComponent name={iconName as any} size={26} color="#FFF" />
                  </LinearGradient>
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
                  <IconComponent name={iconName as any} size={22} color={color} />
                </View>
                <Text style={[styles.label, { color }, isFocused && styles.labelFocused]}>
                  {tabDef.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: BOTTOM,
    left: 16,
    right: 16,
    height: BAR_HEIGHT + 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shadowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  pillContent: {
    height: BAR_HEIGHT,
    width: '100%',
  },
  innerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.95)',
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(210, 81, 157, 0.12)',
  },
  label: {
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  labelFocused: {
    fontWeight: '800',
  },
  centerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    bottom: 6,
    zIndex: 15,
    elevation: 15,
    shadowColor: 'transparent',
  },
  centerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
