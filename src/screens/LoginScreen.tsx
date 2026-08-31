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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Rect, G, Defs, LinearGradient as SvgLinearGradient, Stop, Path } from 'react-native-svg';
import { AppText } from '../components/typography/AppText';
import { Colors } from '../theme';
import { useApp } from '../context/AppContext';
import { ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { saveCredentials, getCredentials, getSavedCredentialsInfo, clearCredentials, checkBiometricSupport } from '../services/secureStore';
import { WalletApi } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// 3D Floating Stadium Capsules Background (Atmosphere)
function Floating3DCapsules() {
  return (
    <Svg width={width} height={520} viewBox="0 0 380 520" fill="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgLinearGradient id="capsuleGrad1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#F472B6" stopOpacity="0.4" />
          <Stop offset="50%" stopColor="#D2519D" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#700F43" stopOpacity="0.15" />
        </SvgLinearGradient>
        <SvgLinearGradient id="capsuleGrad2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#E4ACB2" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#700F43" stopOpacity="0.12" />
        </SvgLinearGradient>
      </Defs>

      {/* Upper Tilted Stadium Shape */}
      <G transform="translate(100, 110) rotate(-16)">
        <Rect x="0" y="0" width="300" height="75" rx="37.5" fill="url(#capsuleGrad1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <Path d="M37.5 12h225" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
      </G>

      {/* Lower Tilted Stadium Shape */}
      <G transform="translate(110, 260) rotate(-16)">
        <Rect x="0" y="0" width="280" height="70" rx="35" fill="url(#capsuleGrad2)" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
        <Path d="M35 10h210" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" />
      </G>
    </Svg>
  );
}

export default function LoginScreen({ navigation }: any) {
  const { login, isLoading, lastError, clearError, customBackgroundUri, setCustomBackgroundUri } = useApp();
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [hasBiometricsEnabled, setHasBiometricsEnabled] = useState(false);
  const passwordRef = React.useRef<TextInput>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

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
        Alert.alert('Đăng nhập thất bại', lastError || e.message);
        clearError();
      }
    } else if (credentials && credentials.phone) {
      setPhone(credentials.phone);
      setIsRemembered(true);
      // Nếu chỉ có phone mà không có pass, yêu cầu nhập pass
    }
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
      Alert.alert('Đăng nhập thất bại', lastError || e.message);
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
      <StatusBar barStyle="light-content" backgroundColor="#1F0413" translucent />
      {/* BACKGROUND */}
      {customBackgroundUri ? (
        <ImageBackground 
          source={{ uri: customBackgroundUri }} 
          style={StyleSheet.absoluteFill} 
          resizeMode="cover"
        />
      ) : (
        <>
          <LinearGradient
            colors={['#1F0413', '#700F43', '#3B0724']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Floating3DCapsules />
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
        {/* 1. TOP HEADER ROW */}
        <View style={styles.topHeader}>
          {/* Logo Custom */}
          <View style={styles.logoRow}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.customAppLogo} 
              resizeMode="contain" 
            />
          </View>

          {/* Right Action Icons (Flag 🇻🇳, Bell 🔔, Bee 🐝 Hỗ trợ) */}
          <View style={styles.rightHeaderActions}>
            <TouchableOpacity style={styles.flagBtn} activeOpacity={0.8}>
              <AppText style={{ fontSize: 20 }}>🇻🇳</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleHeaderBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportBeeBtn} activeOpacity={0.8}>
              <AppText style={{ fontSize: 22 }}>🐝</AppText>
              <View style={styles.supportPillBadge}>
                <AppText style={styles.supportPillText}>HỖ TRỢ</AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ height: 40 }} />

          {/* 2. MAIN FROSTED GLASS LOGIN CARD */}
          <View style={styles.glassLoginCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.cardInnerPadding}>
              {/* Top Row: Shield Check */}
              <View style={[styles.cardTopRow, { justifyContent: 'flex-start', marginBottom: 8 }]}>
                <MaterialCommunityIcons name="shield-check" size={28} color="#10B981" />
              </View>

              {/* Greeting & Name */}
              {isRemembered ? (
                <View style={{ marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <AppText style={styles.greetingText}>Xin chào,</AppText>
                    <AppText style={[styles.userNameLine1, { fontSize: 36, lineHeight: 42 }]} numberOfLines={2} adjustsFontSizeToFit>{savedName || phone}</AppText>
                  </View>
                  
                  {/* Fingerprint Button floating to the right */}
                  {hasBiometricsEnabled && (
                    <TouchableOpacity
                      style={[styles.biometricBtn, { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(210, 81, 157, 0.2)', borderColor: 'rgba(244, 114, 182, 0.4)' }]}
                      activeOpacity={0.8}
                      onPress={handleBiometricLogin}
                    >
                      <MaterialCommunityIcons name="fingerprint" size={32} color="#F472B6" />
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
                      <Ionicons name="call-outline" size={20} color="#700F43" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Nhập số điện thoại"
                        placeholderTextColor="#94A3B8"
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
                <View style={[styles.inputWrapper, isRemembered && { backgroundColor: 'transparent', borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 1, borderRadius: 0, paddingHorizontal: 0, height: 46 }]}>
                  {!isRemembered && <Ionicons name="lock-closed-outline" size={20} color="#F472B6" style={styles.inputIcon} />}
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
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Links Row */}
              <View style={styles.linksRow}>
                {isRemembered ? (
                  <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                    await clearCredentials();
                    setIsRemembered(false);
                    setHasBiometricsEnabled(false);
                    setPhone('');
                    setPassword('');
                  }}>
                    <AppText style={styles.linkText}>Đăng nhập tài khoản khác</AppText>
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
                colors={['#D2519D', '#E11D48']}
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
          {/* DUMMY SPACER ĐỂ KÉO DÀI MÀN HÌNH GIÚP TRƯỢT LÊN KHỎI BÀN PHÍM */}
          <View style={{ height: Platform.OS === 'ios' ? 40 : 250 }} />
        </ScrollView>

        {/* 3. BOTTOM 3 ACTION ITEMS (REAL VECTOR ICONS) */}
        <View style={styles.bottomFooterContainer}>
          <View style={styles.bottomActionsRow}>
            {/* Quét QR */}
            <TouchableOpacity
              style={styles.bottomActionItem}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('QR')}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#E4ACB2" />
              <AppText style={styles.bottomActionLabel}>Quét QR</AppText>
            </TouchableOpacity>

            {/* Xác thực D-OTP */}
            <TouchableOpacity
              style={styles.bottomActionItem}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('OtpVerification')}
            >
              <MaterialCommunityIcons name="shield-key-outline" size={25} color="#E4ACB2" />
              <AppText style={styles.bottomActionLabel}>Xác thực D-OTP</AppText>
            </TouchableOpacity>

            {/* Thay ảnh nền */}
            <TouchableOpacity
              style={styles.bottomActionItem}
              activeOpacity={0.8}
              onPress={handlePickBackground}
            >
              <View style={styles.iconWithBadgeWrap}>
                <Ionicons name="images-outline" size={24} color="#E4ACB2" />
                <View style={styles.newBadgePill}>
                  <AppText style={styles.newBadgeText}>NEW</AppText>
                </View>
              </View>
              <AppText style={styles.bottomActionLabel}>Thay ảnh nền</AppText>
            </TouchableOpacity>
          </View>

          {/* Bottom Expand Arrow Chevron */}
          <TouchableOpacity style={styles.bottomExpandArrow} activeOpacity={0.7}>
            <MaterialCommunityIcons name="chevron-double-up" size={24} color="#E4ACB2" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customAppLogo: {
    width: 130,
    height: 130,
    marginLeft: -35, // Bù trừ viền trong suốt bên trái của ảnh
    marginVertical: -40, // Ép lại chiều cao thực tế để không đẩy các thành phần khác xuống
  },
  rightHeaderActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  flagBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportBeeBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 18,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  supportPillBadge: {
    backgroundColor: '#D2519D',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: -4,
  },
  supportPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  glassLoginCard: {
    backgroundColor: 'rgba(112, 15, 67, 0.65)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  cardInnerPadding: {
    padding: 22,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  biometricBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(244, 114, 182, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E4ACB2',
    marginBottom: 4,
  },
  userNameLine1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  userNameLine2: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 26,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 6,
    marginBottom: 16,
  },
  passwordInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
    color: '#F472B6',
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  eyeIcon: {
    padding: 8,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  linkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginBtnAttached: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
  },
  loginBtnText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  bottomFooterContainer: {
    paddingBottom: 10,
    alignItems: 'center',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bottomActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  iconWithBadgeWrap: {
    position: 'relative',
  },
  newBadgePill: {
    position: 'absolute',
    top: -6,
    right: -14,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bottomActionLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomExpandArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
