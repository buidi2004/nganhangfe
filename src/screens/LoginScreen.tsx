import { useTheme } from '../context/ThemeContext';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText } from '../components/typography/AppText';
import { Colors, Radius, createThemedStyles } from '../theme';
import { useApp } from '../context/AppContext';
import { ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { saveCredentials, getCredentials, getSavedCredentialsInfo, clearCredentials, checkBiometricSupport } from '../services/secureStore';
import { WalletApi } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');


function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get('window');
  const firstViewportHeight = screenHeight - insets.top - insets.bottom - 10;
  const { colors, isDark, themeColor } = useTheme();
  const styles = getStyles(colors);
  const { login, loginDemo, isLoading, lastError, clearError, customBackgroundUri, setCustomBackgroundUri } = useApp();
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBottomActionsExpanded, setIsBottomActionsExpanded] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [hasBiometricsEnabled, setHasBiometricsEnabled] = useState(false);
  const passwordRef = React.useRef<TextInput>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const extraQuickActions = [
    {
      key: 'register',
      label: 'Đăng ký',
      icon: 'person-add-outline' as const,
      iconLib: 'ionicons' as const,
      badge: null as string | null,
      onPress: () => navigation.navigate('Register'),
    },
    {
      key: 'forgot-password',
      label: 'Quên MK',
      icon: 'key-outline' as const,
      iconLib: 'ionicons' as const,
      badge: null as string | null,
      onPress: () => navigation.navigate('ForgotPassword'),
    },
    {
      key: 'promotions',
      label: 'Ưu đãi',
      icon: 'gift-outline' as const,
      iconLib: 'ionicons' as const,
      badge: null as string | null,
      onPress: () => navigation.navigate('Promotions'),
    },
    {
      key: 'help',
      label: 'Trợ giúp',
      icon: 'headset-outline' as const,
      iconLib: 'ionicons' as const,
      badge: null as string | null,
      onPress: () => navigation.navigate('HelpCenter'),
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: 'settings-outline' as const,
      iconLib: 'ionicons' as const,
      badge: null as string | null,
      onPress: () => navigation.navigate('Settings'),
    },
    {
      key: 'terms',
      label: 'Điều khoản',
      icon: 'document-text-outline' as const,
      iconLib: 'ionicons' as const,
      badge: null as string | null,
      onPress: () => navigation.navigate('TermsOfService'),
    },
  ];

  React.useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      const savedInfo = await getSavedCredentialsInfo();
      if (savedInfo && savedInfo.phone) {
        setIsRemembered(true);
        setHasBiometricsEnabled(true);
        setPhone(savedInfo.phone);
        
        if (savedInfo.name) {
          setSavedName(savedInfo.name);
        } else {
          // Lấy tên từ API theo yêu cầu
          try {
            const infoRes = await WalletApi.getRecipientInfo(undefined, savedInfo.phone);
            if (infoRes.data?.maskedName) {
              setSavedName(infoRes.data.maskedName);
            }
          } catch (apiError) {
            console.warn('Không thể lấy tên từ API:', apiError);
          }
        }
        // User must manually press the fingerprint button to trigger it now.
      }
    } catch (e) {
      console.warn('Failed to load credentials state', e);
    }
  };

  const handleBiometricLogin = async () => {
    const credentials = await getCredentials('Đăng nhập bằng Vân tay/FaceID');
    if (credentials && credentials.phone && credentials.password) {
      setPhone(credentials.phone);
      try {
        await login(credentials.phone, credentials.password);
        navigation.navigate('MainTabs');
      } catch (e: any) {
        Alert.alert(
          'Đăng nhập thất bại',
          (lastError || e.message) + '\n\nBạn có muốn vào chế độ Trải nghiệm Ngân hàng (Demo Mode) không?',
          [
            { text: 'Thử lại', style: 'cancel' },
            {
              text: 'Vào trải nghiệm',
              onPress: () => {
                loginDemo(credentials.phone || '0923158725');
                navigation.navigate('MainTabs');
              }
            }
          ]
        );
        clearError();
      }
    } else if (credentials && credentials.phone) {
      setPhone(credentials.phone);
      setIsRemembered(true);
      // Nếu chỉ có phone mà không có pass, yêu cầu nhập pass
    }
  };

    const handleOtherAccount = () => {
    Alert.alert(
      'Tài khoản khác',
      'Chọn hình thức đăng nhập:',
      [
        {
          text: '⚡ Đăng nhập nhanh Demo (Bùi Văn Dị)',
          onPress: () => {
            loginDemo('0987654321');
            navigation.navigate('MainTabs');
          },
        },
        {
          text: 'Đăng nhập tài khoản khác',
          onPress: async () => {
            await clearCredentials();
            setIsRemembered(false);
            setHasBiometricsEnabled(false);
            setPhone('');
            setPassword('');
          },
        },
        { text: 'Đóng', style: 'cancel' },
      ]
    );
  };

  const handleLogin = async () => {
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }
    if (!phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    try {
      const profile = await login(phone, password);
      const userName = profile?.name || phone;
      
      // Nếu đăng nhập thành công thủ công, hỏi xem có muốn lưu vân tay không (nếu chưa lưu)
      const isBiometricSupported = await checkBiometricSupport();
      const savedInfo = await getSavedCredentialsInfo();
      const hasSaved = !!savedInfo;
      
      if (isBiometricSupported && !hasSaved) {
        Alert.alert(
          'Đăng nhập nhanh',
          'Bạn có muốn sử dụng Vân tay/FaceID cho những lần đăng nhập sau không?',
          [
            {
              text: 'Không',
              style: 'cancel',
              onPress: () => navigation.navigate('MainTabs')
            },
            {
              text: 'Đồng ý',
              onPress: async () => {
                await saveCredentials({ phone, password, name: userName });
                navigation.navigate('MainTabs');
              }
            }
          ]
        );
      } else {
        if (!hasSaved) {
          // Chỉ lưu tạm sđt vào secure store nếu không có vân tay
          await saveCredentials({ phone, name: userName });
        }
        navigation.navigate('MainTabs');
      }
    } catch (e: any) {
      Alert.alert(
        'Đăng nhập thất bại',
        (lastError || e.message) + '\n\nBạn có muốn vào chế độ Trải nghiệm Ngân hàng (Demo Mode) để kiểm tra tất cả màn hình không?',
        [
          { text: 'Thử lại', style: 'cancel' },
          {
            text: 'Vào trải nghiệm',
            onPress: () => {
              loginDemo(phone || '0923158725');
              navigation.navigate('MainTabs');
            }
          }
        ]
      );
      clearError();
    }
  };

  const handlePickBackground = async () => {
    Alert.alert('Thay đổi ảnh nền', 'Bạn muốn làm gì?', [
      {
        text: 'Về mặc định',
        onPress: () => {
          setCustomBackgroundUri(null);
        }
      },
      {
        text: 'Chọn ảnh từ máy',
        onPress: async () => {
          let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permissionResult.granted === false) {
            Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để thay đổi hình nền.');
            return;
          }
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 0.8,
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            setCustomBackgroundUri(result.assets[0].uri);
          }
        }
      },
      {
        text: 'Hủy',
        style: 'cancel'
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* BACKGROUND */}
      {customBackgroundUri ? (
        <ImageBackground 
          source={{ uri: customBackgroundUri }} 
          style={StyleSheet.absoluteFill} 
          resizeMode="cover"
        />
      ) : themeColor === 'amber' ? (
        <ImageBackground
          source={require('../../assets/theme-amber-bg.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Lớp overlay nhẹ giữ độ tương phản chuẩn mực và làm nổi bật các thẻ kính */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 8, 0, 0.45)' }]} />
        </ImageBackground>
      ) : (
        <>
          <LinearGradient
            colors={[colors.heroGradEnd, colors.primaryDeep, colors.heroGradStart]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </>
      )}

      {/* TẠO LỚP OVERLAY ĐỂ CHỮ VẪN ĐỌC ĐƯỢC NẾU ẢNH QUÁ SÁNG */}
      {customBackgroundUri && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
      )}

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* FIRST SCREEN WRAP (Anchors Section 1, 2, 3 so quick actions are pinned to the bottom of the first viewport) */}
          <View style={[styles.firstScreenWrap, { minHeight: firstViewportHeight }]}>
            <View style={styles.topAndCardSection}>
              {/* 1. TOP HEADER ROW (4 Icons chuẩn MBBank: Logo MB bên trái, Cột 3 Icon bên phải) */}
              <View style={styles.topHeader}>
                {/* Icon 1: Logo Sen Hồng Bank */}
                <TouchableOpacity
                  style={styles.logoRow}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Image
                    source={require('../../assets/icon.png')}
                    style={styles.customAppLogo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Cột 3 Icon xếp dọc bên phải (Cờ 🇻🇳, Chuông 🔔, Ong 🐝 HỖ TRỢ) */}
                <View style={styles.rightHeaderActions}>
                  {/* Icon 2: Cờ đỏ sao vàng */}
                  <TouchableOpacity style={styles.headerActionCircle} activeOpacity={0.8}>
                    <View style={styles.flagInnerCircle}>
                      <Ionicons name="star" size={13} color="#FFFF00" />
                    </View>
                  </TouchableOpacity>

                  {/* Icon 3: Chuông thông báo */}
                  <TouchableOpacity
                    style={styles.headerActionCircle}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Notifications')}
                  >
                    <Ionicons name="notifications" size={19} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Icon 4: Ong hỗ trợ kèm badge HỖ TRỢ */}
                  <TouchableOpacity
                    style={[styles.headerActionCircle, { overflow: 'visible' }]}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('HelpCenter')}
                  >
                    <AppText style={{ fontSize: 21, marginTop: -2 }}>🐝</AppText>
                    <View style={styles.supportPillBadge}>
                      <AppText style={styles.supportPillText} numberOfLines={1}>HỖ TRỢ</AppText>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dynamic Spacer before login card */}
              <View style={{ height: Math.max(16, Math.min(32, (firstViewportHeight - 570) * 0.3)) }} />

              {/* 2. MAIN FROSTED GLASS LOGIN CARD */}
              <View style={styles.glassLoginCard}>
                <LinearGradient
                  colors={themeColor === 'amber' ? ['rgba(255, 255, 255, 0.38)', 'rgba(255, 255, 255, 0.18)'] : ['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.06)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: Radius.card }]}
                />

                <View style={styles.cardInnerPadding}>
                  {/* Card Header: Avatar & Greeting */}
                  {isRemembered ? (
                    <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <AppText style={[styles.greetingText, themeColor === 'amber' && { color: '#4A3B32' }]}>Xin chào,</AppText>
                        <AppText style={[styles.userNameLine1, themeColor === 'amber' && { color: '#2D231B' }]} numberOfLines={2}>
                          {toTitleCase(savedName || 'Bui Van Di')}
                        </AppText>
                      </View>
                      
                      {/* Fingerprint Button floating to the right */}
                      {hasBiometricsEnabled && (
                        <TouchableOpacity
                          style={styles.biometricBtn}
                          activeOpacity={0.8}
                          onPress={handleBiometricLogin}
                        >
                          <MaterialCommunityIcons name="fingerprint" size={32} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <AppText style={[styles.greetingText, { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 }]}>Đăng nhập</AppText>
                  )}
                  
                  <View style={styles.formContainer}>
                    {!isRemembered && (
                      <>
                        <AppText style={styles.label}>Số điện thoại</AppText>
                        <View style={[styles.inputWrapper, { marginBottom: 20 }]}>
                          <Ionicons name="call-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="Nhập số điện thoại"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="numeric"
                            returnKeyType="next"
                            onFocus={() => setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100)}
                            onSubmitEditing={() => {
                              passwordRef.current?.focus();
                              setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
                            }}
                            blurOnSubmit={false}
                          />
                        </View>
                      </>
                    )}

                    <AppText style={[styles.label, isRemembered && { display: 'none' }]}>Mật khẩu</AppText>
                    <View style={[styles.inputWrapper, isRemembered && { backgroundColor: 'transparent', borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.35)', borderRadius: 0, paddingHorizontal: 0, height: 46 }]}>
                      {!isRemembered && <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" style={styles.inputIcon} />}
                      <TextInput
                        ref={passwordRef}
                        style={[styles.input, isRemembered && { fontSize: 18, paddingLeft: 4 }]}
                        placeholder={isRemembered ? "Mật khẩu" : "Nhập mật khẩu"}
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100)}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Links Row */}
                  <View style={styles.linksRow}>
                    {isRemembered ? (
                      <TouchableOpacity activeOpacity={0.7} onPress={handleOtherAccount}>
                        <AppText style={styles.linkText}>Tài khoản khác</AppText>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Register')}>
                        <AppText style={styles.linkText}>Đăng ký ngay</AppText>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('ForgotPassword')}>
                      <AppText style={styles.linkText}>Quên mật khẩu?</AppText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bottom Attached Login Button */}
                <TouchableOpacity
                  style={styles.loginBtnAttached}
                  activeOpacity={0.9}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={themeColor === 'amber' ? ['#6A7246', '#565E37'] : [colors.primary, colors.primaryDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <AppText style={styles.loginBtnText}>Đăng nhập</AppText>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. QUICK ACTION ITEMS (Quét QR, D-OTP, Thay ảnh nền + Expand chevron) */}
            <View style={styles.bottomFooterContainer}>
              <View style={styles.bottomActionsRow}>
                {/* Quét QR */}
                <TouchableOpacity
                  style={styles.bottomActionItem}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ScanQR')}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFFFFF" />
                  <AppText style={styles.bottomActionLabel}>Quét QR</AppText>
                </TouchableOpacity>

                {/* Xác thực D-OTP */}
                <TouchableOpacity
                  style={styles.bottomActionItem}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('OtpVerification')}
                >
                  <MaterialCommunityIcons name="shield-key-outline" size={25} color="#FFFFFF" />
                  <AppText style={styles.bottomActionLabel}>Xác thực D-OTP</AppText>
                </TouchableOpacity>

                {/* Thay ảnh nền */}
                <TouchableOpacity
                  style={styles.bottomActionItem}
                  activeOpacity={0.8}
                  onPress={handlePickBackground}
                >
                  <View style={styles.iconWithBadgeWrap}>
                    <Ionicons name="images-outline" size={24} color="#FFFFFF" />
                    <View style={styles.newBadgePill}>
                      <AppText style={styles.newBadgeText}>NEW</AppText>
                    </View>
                  </View>
                  <AppText style={styles.bottomActionLabel}>Thay ảnh nền</AppText>
                </TouchableOpacity>
              </View>

              {isBottomActionsExpanded && (
                <View style={styles.expandedActionsGrid}>
                  {extraQuickActions.map((action) => (
                    <TouchableOpacity
                      key={action.key}
                      style={styles.expandedActionItem}
                      activeOpacity={0.85}
                      onPress={action.onPress}
                    >
                      <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                      <AppText style={styles.bottomActionLabel}>{action.label}</AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Bottom Expand Arrow Chevron */}
              <TouchableOpacity
                style={styles.bottomExpandArrow}
                activeOpacity={0.7}
                onPress={() => setIsBottomActionsExpanded((prev) => !prev)}
              >
                <MaterialCommunityIcons
                  name={isBottomActionsExpanded ? 'chevron-down' : 'chevron-up'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. DISCOVERY BENTO GRID (Kéo dài màn hình khi cuộn xuống - Chuẩn mẫu MBBank) */}
          <View style={styles.discoveryContainer}>
            {/* Bento Grid 2 Columns */}
            <View style={styles.bentoRow}>
              {/* CỘT TRÁI */}
              <View style={styles.bentoCol}>
                {/* Thẻ 1: Trả góp 0% */}
                <TouchableOpacity
                  style={styles.cardInstallment}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Cards')}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.06)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                  />
                  <AppText style={styles.bentoTitleWhite}>Trả góp 0%</AppText>
                  <AppText style={styles.bentoSubWhite}>Lãi suất hấp dẫn</AppText>

                  <View style={styles.installmentGraphic}>
                    <MaterialCommunityIcons name="shopping" size={44} color="#EA580C" />
                    <View style={styles.zeroPercentPill}>
                      <AppText style={styles.zeroPercentText}>0%</AppText>
                    </View>
                    <View style={styles.floatingCoin1}>
                      <MaterialCommunityIcons name="circle-multiple-outline" size={16} color="#FBBF24" />
                    </View>
                    <View style={styles.floatingCoin2}>
                      <MaterialCommunityIcons name="circle-multiple-outline" size={13} color="#FBBF24" />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Thẻ 3: Mua sắm & hoàn tiền */}
                <TouchableOpacity
                  style={styles.cardShopping}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Promotions')}
                >
                  <LinearGradient
                    colors={['#FFF8F0', '#FDEEE0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <AppText style={styles.bentoTitleDark}>{'Mua sắm\n& hoàn tiền'}</AppText>

                  <View style={styles.shoppingGraphic}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80' }}
                      style={styles.shopperImg}
                      resizeMode="cover"
                    />
                    {/* Floating Badges */}
                    <View style={[styles.appBadge, { backgroundColor: '#EE4D2D', top: 8, left: 4 }]}>
                      <Ionicons name="bag-handle" size={11} color="#FFF" />
                    </View>
                    <View style={[styles.appBadge, { backgroundColor: '#0F146D', bottom: 10, left: 4 }]}>
                      <Ionicons name="heart" size={11} color="#F43F5E" />
                    </View>
                    <View style={[styles.appBadge, { backgroundColor: '#F59E0B', top: 16, right: 6 }]}>
                      <AppText style={{ color: '#FFF', fontSize: 9, fontWeight: '900' }}>%</AppText>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* CỘT PHẢI */}
              <View style={styles.bentoCol}>
                {/* Thẻ 2: Khuyến mại hấp dẫn */}
                <TouchableOpacity
                  style={styles.cardPromo}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Promotions')}
                >
                  <LinearGradient
                    colors={['#FFF8F0', '#FDEEE0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <AppText style={styles.bentoTitleDark}>{'Khuyến mại\nhấp dẫn'}</AppText>

                  <View style={styles.promoGraphic}>
                    <MaterialCommunityIcons name="shopping" size={42} color="#8B5CF6" />
                    <View style={styles.promoBubble}>
                      <Ionicons name="chatbubble" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.promoTag}>
                      <AppText style={styles.promoTagText}>%</AppText>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Thẻ 4: Gói hội viên */}
                <TouchableOpacity
                  style={styles.cardMembership}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('UserProfile')}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.06)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                  />
                  <AppText style={styles.bentoTitleWhite}>Gói hội viên</AppText>

                  {/* 3D Segmented Donut Ring */}
                  <View style={styles.donutWrap}>
                    <Svg width={110} height={110} viewBox="0 0 100 100">
                      <Circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.1)" strokeWidth="18" fill="none" />
                      <Circle cx="50" cy="50" r="30" stroke="#FED7AA" strokeWidth="18" strokeDasharray="188" strokeDashoffset="45" strokeLinecap="round" fill="none" />
                      <Circle cx="50" cy="50" r="30" stroke="#EA580C" strokeWidth="18" strokeDasharray="188" strokeDashoffset="105" strokeLinecap="round" fill="none" />
                      <Circle cx="50" cy="50" r="30" stroke="#F59E0B" strokeWidth="18" strokeDasharray="188" strokeDashoffset="155" strokeLinecap="round" fill="none" />
                    </Svg>
                  </View>

                  <AppText style={styles.membershipSubText}>Quản lý dòng tiền</AppText>

                  {/* Carousel Pagination Dots */}
                  <View style={styles.carouselDotsRow}>
                    <View style={[styles.carouselDot, styles.carouselDotActive]} />
                    <View style={styles.carouselDot} />
                    <View style={styles.carouselDot} />
                    <View style={styles.carouselDot} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nút Tùy chỉnh ⚙️ nổi góc phải */}
            <TouchableOpacity
              style={styles.settingsFabBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings')}
            >
              <MaterialCommunityIcons name="cog-outline" size={20} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>

            {/* Thẻ 5: Banner QR Đáy */}
            <View style={styles.qrBannerCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.06)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              />
              <View style={styles.qrBannerIconWrap}>
                <Ionicons name="chatbubble-ellipses" size={26} color="rgba(255,255,255,0.4)" />
              </View>
              <AppText style={styles.qrBannerText}>
                Chưa có QR. Vui lòng cài đặt để hiển thị QR
              </AppText>
            </View>
          </View>

          <View style={{ height: Platform.OS === 'ios' ? 40 : 60 }} />
        </ScrollView>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = createThemedStyles((colors) => ({
  firstScreenWrap: {
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  topAndCardSection: {
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexGrow: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingTop: 4,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
  },
  customAppLogo: {
    width: 96,
    height: 52,
    marginLeft: -12,
  },
  rightHeaderActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  headerActionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  flagInnerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DA251D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  supportPillBadge: {
    backgroundColor: '#00BAF2',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginTop: -4,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  glassLoginCard: {
    borderRadius: Radius.card,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 0,
  },
  cardInnerPadding: {
    padding: 22,
    borderRadius: Radius.card,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
    fontWeight: '600',
  },
  userNameLine1: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2D231B',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  biometricBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
    color: '#FFFFFF',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  eyeIcon: {
    padding: 8,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 4,
  },
  linkText: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  loginBtnAttached: {
    height: 52,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bottomFooterContainer: {
    marginTop: 28,
    paddingBottom: 10,
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  bottomActionItem: {
    alignItems: 'center',
    gap: 6,
  },
  iconWithBadgeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadgePill: {
    position: 'absolute',
    top: -6,
    right: -16,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  bottomActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandedActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 10,
    gap: 16,
  },
  expandedActionItem: {
    alignItems: 'center',
    gap: 6,
    width: '28%',
  },
  bottomExpandArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginTop: 6,
  },
  discoveryContainer: {
    marginTop: 35,
    paddingBottom: 10,
  },
  bentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bentoCol: {
    width: '48.5%',
  },
  cardInstallment: {
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    padding: 14,
    minHeight: 185,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 0,
  },
  bentoTitleWhite: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bentoSubWhite: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  installmentGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    position: 'relative',
    height: 75,
  },
  zeroPercentPill: {
    position: 'absolute',
    top: 4,
    right: 10,
  },
  zeroPercentText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FBBF24',
    textShadowColor: '#D97706',
    textShadowRadius: 6,
  },
  floatingCoin1: {
    position: 'absolute',
    top: 2,
    left: 14,
  },
  floatingCoin2: {
    position: 'absolute',
    bottom: 4,
    right: 26,
  },
  cardShopping: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCE7D6',
    overflow: 'hidden',
    padding: 14,
    minHeight: 220,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bentoTitleDark: {
    fontSize: 16,
    fontWeight: '900',
    color: '#261F1A',
    lineHeight: 20,
  },
  shoppingGraphic: {
    position: 'relative',
    marginTop: 10,
    height: 135,
    borderRadius: 14,
    overflow: 'hidden',
  },
  shopperImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  appBadge: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  cardPromo: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCE7D6',
    overflow: 'hidden',
    padding: 14,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promoGraphic: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative',
    height: 65,
  },
  promoBubble: {
    position: 'absolute',
    top: 0,
    right: 10,
  },
  promoTag: {
    position: 'absolute',
    bottom: 4,
    right: 14,
    backgroundColor: '#F43F5E',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTagText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  cardMembership: {
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    padding: 14,
    minHeight: 265,
    marginTop: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 0,
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  membershipSubText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  carouselDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  carouselDotActive: {
    backgroundColor: '#FBBF24',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  settingsFabBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginVertical: 12,
    marginRight: 2,
  },
  qrBannerCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 0,
  },
  qrBannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBannerText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 12,
    lineHeight: 18,
  },
}));
