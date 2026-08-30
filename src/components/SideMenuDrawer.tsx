import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './typography/AppText';
import { Colors } from '../theme';
import { useApp } from '../context/AppContext';

interface SideMenuDrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation?: any;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.round(width * 0.82);

// Standard Icons from @expo/vector-icons are used below

export function SideMenuDrawer({ visible, onClose, navigation }: SideMenuDrawerProps) {
  const { user } = useApp();
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        {/* Dim Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Slide-In Drawer Body */}
        <Animated.View style={[styles.drawerBody, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={styles.safeArea}>
            
            {/* Top Close Button */}
            <View style={styles.topHeader}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={26} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* User Profile Header */}
            <TouchableOpacity
              style={styles.profileRow}
              activeOpacity={0.75}
              onPress={() => {
                onClose();
                navigation?.navigate('EditProfile');
              }}
            >
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
                  style={styles.avatar}
                />
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#10B981" />
                </View>
              </View>

              <View style={styles.profileInfo}>
                <AppText style={styles.profileName}>{user?.name || 'Tài khoản'}</AppText>
                <View style={styles.profileLinkRow}>
                  <AppText style={styles.profileLinkText}>Hồ sơ người dùng</AppText>
                  <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Menu List */}
            <View style={styles.menuList}>
              {/* Item 1: Cấu hình */}
              <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={() => { onClose(); navigation?.navigate('Config'); }}>
                <View style={styles.menuLeft}>
                  <MaterialCommunityIcons name="view-grid-plus-outline" size={24} color={Colors.primary} />
                  <AppText style={styles.menuTitle}>Cấu hình</AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>

              {/* Item 2: Cài đặt with NEW badge */}
              <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={() => { onClose(); navigation?.navigate('Settings'); }}>
                <View style={styles.menuLeft}>
                  <Ionicons name="settings-outline" size={24} color={Colors.primary} />
                  <AppText style={styles.menuTitle}>Cài đặt</AppText>
                  <View style={styles.newBadge}>
                    <AppText style={styles.newBadgeText}>NEW</AppText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>

              {/* Item 3: Hội viên MB with Basic badge */}
              <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                <View style={styles.menuLeft}>
                  <MaterialCommunityIcons name="crown-outline" size={26} color={Colors.primary} />
                  <AppText style={styles.menuTitle}>Hội viên MB</AppText>
                </View>
                <View style={styles.basicPillBadge}>
                  <MaterialCommunityIcons name="crown" size={16} color="#94A3B8" />
                  <AppText style={styles.basicPillText}>Basic</AppText>
                </View>
              </TouchableOpacity>
            </View>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Bottom Actions */}
            <View style={styles.bottomSection}>
              {/* Ngôn ngữ */}
              <TouchableOpacity style={styles.bottomRow} activeOpacity={0.7}>
                <View style={styles.menuLeft}>
                  <Ionicons name="globe-outline" size={24} color={Colors.primary} />
                  <AppText style={styles.bottomTitle}>Ngôn ngữ</AppText>
                </View>
                <View style={styles.langValueRow}>
                  <AppText style={styles.langText}>Tiếng Việt</AppText>
                  <AppText style={{ fontSize: 20 }}>🇻🇳</AppText>
                </View>
              </TouchableOpacity>

              {/* Đăng xuất */}
              <TouchableOpacity
                style={styles.bottomRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  navigation?.navigate('Login');
                }}
              >
                <View style={styles.menuLeft}>
                  <MaterialCommunityIcons name="logout" size={24} color={Colors.primary} />
                  <AppText style={styles.bottomTitle}>Đăng xuất</AppText>
                </View>
              </TouchableOpacity>

              {/* Version & Status */}
              <View style={styles.versionFooter}>
                <AppText style={styles.versionNumber}>v6.5.15 (763)</AppText>
                <AppText style={styles.versionStatus}>Phiên bản mới nhất</AppText>
              </View>
            </View>

          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Nền mờ phía sau
  },
  drawerBody: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeBtn: {
    padding: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -3,
    left: -3,
    zIndex: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  profileLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  profileLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary, // Hồng Sen Đậm (#D2519D)
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  menuList: {
    paddingTop: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.1,
  },
  newBadge: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  basicPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  basicPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  bottomTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  langValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary, // Hồng Sen Đậm (#D2519D)
  },
  versionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  versionNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  versionStatus: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary, // Hồng Sen Đậm (#D2519D)
  },
});
