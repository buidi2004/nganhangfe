import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { scanFromURLAsync } from 'expo-camera';
import { AppText } from '../components/typography/AppText';
import { Colors } from '../theme';
import { useApp } from '../context/AppContext';
import { WalletApi } from '../services/api';

const { width } = Dimensions.get('window');

export default function ChooseRecipientScreen({ navigation }: any) {
  const { user } = useApp();
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundRecipient, setFoundRecipient] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savedRecipients, setSavedRecipients] = useState<any[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [lookupName, setLookupName] = useState('');
  const [lookupWalletId, setLookupWalletId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false);

  // Tải danh bạ người nhận đã lưu từ Core Backend
  const fetchSavedRecipients = async () => {
    try {
      setIsLoadingBeneficiaries(true);
      const res = await WalletApi.getBeneficiaries();
      if (res.data && Array.isArray(res.data)) {
        setSavedRecipients(res.data);
      }
    } catch (err) {
      console.log('Fetch beneficiaries failed:', err);
    } finally {
      setIsLoadingBeneficiaries(false);
    }
  };

  useEffect(() => {
    fetchSavedRecipients();
  }, []);

  // Tự động tra cứu tài khoản ví SenBank khi nhập số điện thoại trong modal thêm người nhận
  useEffect(() => {
    const cleanPhone = newPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      setLookupName('');
      setLookupWalletId('');
      setLookupError(null);
      setIsLookingUp(false);
      return;
    }

    if (cleanPhone === user?.phoneNumber) {
      setLookupName('');
      setLookupWalletId('');
      setLookupError('Không thể thêm chính mình vào danh bạ người nhận');
      setIsLookingUp(false);
      return;
    }

    let isMounted = true;
    setIsLookingUp(true);
    setLookupError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await WalletApi.getRecipientInfo(undefined, cleanPhone);
        if (!isMounted) return;
        if (res.data) {
          const displayName = res.data.fullName || res.data.recipientName || res.data.maskedName || 'Khách hàng SenBank';
          setLookupName(displayName);
          setLookupWalletId(res.data.walletId || '');
          setLookupError(null);
          setNewNickname(prev => prev.trim() ? prev : displayName);
        } else {
          setLookupName('');
          setLookupWalletId('');
          if (cleanPhone.length >= 10) {
            setLookupError('Không tìm thấy tài khoản SenBank với số điện thoại này');
          }
        }
      } catch (e: any) {
        if (!isMounted) return;
        setLookupName('');
        setLookupWalletId('');
        if (cleanPhone.length >= 10) {
          setLookupError('Không tìm thấy tài khoản SenBank với số điện thoại này');
        }
      } finally {
        if (isMounted) setIsLookingUp(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [newPhone, user?.phoneNumber]);

  // Lưu người nhận nội bộ SenBank vào backend
  const handleSaveBeneficiary = async () => {
    const cleanPhone = newPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }

    if (!lookupWalletId) {
      Alert.alert('Chưa xác thực', 'Vui lòng kiểm tra lại số điện thoại để SenAI xác nhận tài khoản SenBank.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await WalletApi.addBeneficiary(
        lookupWalletId,
        newNickname.trim() || lookupName || 'Người nhận SenBank',
        'SENHONG',
        cleanPhone
      );

      if (res.success || res.data) {
        await fetchSavedRecipients();
        setIsAddModalVisible(false);
        setNewPhone('');
        setNewNickname('');
        setLookupName('');
        setLookupWalletId('');
        Alert.alert('Thành công', 'Đã lưu người nhận nội bộ SenBank vào danh bạ!');
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể lưu người nhận.');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Có lỗi xảy ra khi lưu người nhận.');
    } finally {
      setIsSaving(false);
    }
  };

  // Xóa người nhận khỏi danh bạ
  const handleDeleteBeneficiary = (item: any) => {
    Alert.alert(
      'Xóa người nhận',
      `Bạn có chắc chắn muốn xóa "${item.nickname || item.accountNumber}" khỏi danh bạ người nhận đã lưu?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await WalletApi.deleteBeneficiary(item.id);
              setSavedRecipients(prev => prev.filter(b => b.id !== item.id));
            } catch (e: any) {
              Alert.alert('Lỗi', 'Không thể xóa người nhận.');
            }
          },
        },
      ]
    );
  };
  
  const isSelfTransfer = keyword.trim() === user?.phoneNumber;

  // Tra cứu tự động người nhận nội bộ SenBank khi người dùng gõ số điện thoại
  useEffect(() => {
    const cleanPhone = keyword.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 8) {
      setFoundRecipient(null);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    if (cleanPhone === user?.phoneNumber) {
      setFoundRecipient(null);
      setSearchError('Không thể chuyển tiền cho chính mình');
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await WalletApi.getRecipientInfo(undefined, cleanPhone);
        if (!isMounted) return;
        if (res.data) {
          const displayName = res.data.fullName || res.data.recipientName || res.data.maskedName || 'Khách hàng SenBank';
          setFoundRecipient({
            name: displayName,
            phone: cleanPhone,
            walletId: res.data.walletId,
            bankCode: 'SENHONG',
            bankName: 'SenBank (Nội bộ)'
          });
          setSearchError(null);
        } else {
          setFoundRecipient(null);
          if (cleanPhone.length >= 10) {
            setSearchError('Không tìm thấy tài khoản SenBank với số điện thoại này');
          }
        }
      } catch (e: any) {
        if (!isMounted) return;
        setFoundRecipient(null);
        if (cleanPhone.length >= 10) {
          setSearchError('Không tìm thấy tài khoản SenBank với số điện thoại này');
        }
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [keyword, user?.phoneNumber]);

  // Điều hướng chuyển tiền tức thì
  const handleProceedTransfer = async (target?: any) => {
    const item = target || foundRecipient;
    const cleanPhone = keyword.replace(/[^0-9]/g, '');

    if (item) {
      navigation.navigate('EnterAmount', {
        name: item.name,
        phone: item.phone || cleanPhone,
        walletId: item.walletId,
        selectedBank: 'SenBank (Nội bộ)',
        recipient: {
          name: item.name,
          phone: item.phone || cleanPhone,
          walletId: item.walletId,
        }
      });
    } else if (cleanPhone && cleanPhone !== user?.phoneNumber) {
      // Tự động thử tra cứu nhanh trước khi sang trang
      try {
        const res = await WalletApi.getRecipientInfo(undefined, cleanPhone);
        if (res.data) {
          const displayName = res.data.fullName || res.data.recipientName || res.data.maskedName || 'Khách hàng SenBank';
          navigation.navigate('EnterAmount', {
            name: displayName,
            phone: cleanPhone,
            walletId: res.data.walletId,
            selectedBank: 'SenBank (Nội bộ)',
            recipient: {
              name: displayName,
              phone: cleanPhone,
              walletId: res.data.walletId,
            }
          });
          return;
        }
      } catch (e) {}

      navigation.navigate('EnterAmount', {
        phone: cleanPhone,
        selectedBank: 'SenBank (Nội bộ)',
      });
    }
  };

  // Xử lý dữ liệu giải mã từ mã QR (senbank:// hoặc VietQR)
  const handleQrData = async (data: string) => {
    try {
      if (!data) return;

      // 1. Nếu là QR nội bộ SenBank
      if (data.startsWith('senbank://')) {
        const phoneMatch = data.match(/phone=([^&]*)/);
        const nameMatch = data.match(/name=([^&]*)/);
        const phone = phoneMatch ? phoneMatch[1] : data.replace('senbank://', '');
        let recipientName = nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : 'Khách hàng SenBank';
        let walletId = '';

        try {
          const infoRes = await WalletApi.getRecipientInfo(undefined, phone);
          if (infoRes.data?.maskedName || infoRes.data?.fullName) {
            recipientName = infoRes.data.fullName || infoRes.data.maskedName;
          }
          if (infoRes.data?.walletId) {
            walletId = infoRes.data.walletId;
          }
        } catch (err) {}

        navigation.navigate('EnterAmount', {
          name: recipientName,
          phone: phone,
          walletId: walletId,
          selectedBank: 'SenBank (Nội bộ)',
          recipient: {
            name: recipientName,
            phone: phone,
            walletId: walletId,
          },
        });
        return;
      }

      // 2. Nếu là mã VietQR / EMVCo chuẩn
      try {
        const decodeRes = await WalletApi.decodeVietQr(data);
        if (decodeRes.data) {
          const payload = decodeRes.data;
          let recipientName = 'Khách hàng';
          let walletId = '';
          const isInternal = payload.bankBin === 'SENBANK' || payload.bankBin === 'SENHONG';

          try {
            const infoRes = await WalletApi.getRecipientInfo(undefined, payload.accountNumber);
            if (infoRes.data) {
              recipientName = infoRes.data.fullName || infoRes.data.maskedName;
              walletId = infoRes.data.walletId;
            }
          } catch (e) {}

          navigation.navigate('EnterAmount', {
            name: recipientName,
            phone: payload.accountNumber,
            walletId: walletId,
            selectedBank: isInternal ? 'SenBank (Nội bộ)' : payload.bankBin,
            amount: payload.amount ? payload.amount.toString() : '',
            notes: payload.purpose || '',
            recipient: {
              name: recipientName,
              phone: payload.accountNumber,
              walletId: walletId,
            },
          });
          return;
        }
      } catch (e) {}

      // 3. Nếu là chuỗi số điện thoại
      const cleanPhone = data.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 8) {
        setKeyword(cleanPhone);
        return;
      }

      Alert.alert('Mã QR đã đọc', `Nội dung: ${data}`);
    } catch (error: any) {
      Alert.alert('Lỗi xử lý QR', error.message || 'Không thể nhận diện mã QR.');
    }
  };

  // 1. Chụp ảnh từ camera để quét QR
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Yêu cầu quyền máy ảnh', 'Vui lòng cấp quyền truy cập máy ảnh để chụp và quét mã QR.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const photoUri = result.assets[0].uri;
      try {
        const barcodes = await scanFromURLAsync(photoUri, ['qr']);
        if (barcodes && barcodes.length > 0) {
          handleQrData(barcodes[0].data);
        } else {
          Alert.alert('Không tìm thấy mã QR', 'Không phát hiện mã QR nào trong ảnh vừa chụp. Vui lòng căn góc chụp rõ nét hơn.');
        }
      } catch (scanErr) {
        Alert.alert('Thông báo', 'Không thể giải mã QR từ ảnh chụp.');
      }
    } catch (e) {
      navigation.navigate('ScanQR');
    }
  };

  // 2. Tải ảnh từ Thư viện (Gallery) để quét QR
  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Yêu cầu quyền ảnh', 'Vui lòng cho phép truy cập thư viện để chọn ảnh mã QR.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const imageUri = result.assets[0].uri;
      try {
        const barcodes = await scanFromURLAsync(imageUri, ['qr']);
        if (barcodes && barcodes.length > 0) {
          handleQrData(barcodes[0].data);
        } else {
          Alert.alert('Không tìm thấy QR', 'Không tìm thấy mã QR nào trong bức ảnh đã chọn. Vui lòng chọn ảnh chứa mã VietQR hoặc SenBank.');
        }
      } catch (scanErr) {
        Alert.alert('Thông báo', 'Không thể giải mã ảnh đã chọn.');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  // 3. Dán từ bộ nhớ tạm (Clipboard)
  const handlePaste = async () => {
    try {
      let text = '';
      try {
        const ExpoClipboard = require('expo-clipboard');
        if (ExpoClipboard?.getStringAsync) {
          text = await ExpoClipboard.getStringAsync();
        }
      } catch (nativeErr) {
        // Native module chưa được link trong build APK hiện tại
      }

      if (text && text.trim()) {
        const trimmed = text.trim();
        // Nếu trong clipboard là mã VietQR hoặc senbank://
        if (trimmed.startsWith('000201') || trimmed.startsWith('senbank://')) {
          handleQrData(trimmed);
          return;
        }

        // Nếu là số điện thoại
        const cleanPhone = trimmed.replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 8) {
          setKeyword(cleanPhone);
          return;
        }

        setKeyword(trimmed);
        return;
      }
    } catch (e) {
      console.log('Clipboard read error:', e);
    }
    // Fallback: Tự động điền số điện thoại tài khoản mẫu nội bộ SenBank
    setKeyword('0900000001');
  };

  // 5 Danh mục chuyển tiền ngang với Icon chuẩn từ Expo Vector Icons
  const TRANSFER_METHODS = [
    { id: '1', title: 'Số\ntài khoản', icon: <MaterialCommunityIcons name="bank-outline" size={26} color="#D2519D" /> },
    { id: '2', title: 'Số\nđiện thoại', icon: <Ionicons name="call-outline" size={25} color="#D2519D" /> },
    { id: '3', title: 'Số thẻ', icon: <Ionicons name="card-outline" size={26} color="#D2519D" /> },
    { id: '4', title: 'Mẫu\nchuyển', icon: <Ionicons name="receipt-outline" size={25} color="#D2519D" /> },
    { id: '5', title: 'Thẻ\nquốc tế', icon: <MaterialCommunityIcons name="earth" size={26} color="#D2519D" /> },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF2F8" />

      {/* TOP BACKGROUND SOFT LOTUS PINK GRADIENT AURA */}
      <LinearGradient
        colors={['#FDF2F8', '#FCE7F3', '#F8FAFC']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.4 }}
        style={styles.topGradientAura}
      />

      {/* 1. TOP NAVIGATION BAR */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#700F43" />
        </TouchableOpacity>

        <View style={styles.navRightActions}>
          <TouchableOpacity
            style={styles.navBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#700F43" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home-outline" size={22} color="#700F43" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. PAGE TITLE */}
        <AppText style={styles.pageHeading}>Siêu chuyển tiền</AppText>

        {/* 3. HORIZONTAL METHODS CAROUSEL */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -16 }}
          contentContainerStyle={[styles.methodsScroll, { paddingHorizontal: 16 }]}
          keyboardShouldPersistTaps="handled"
        >
          {TRANSFER_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.methodCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EnterAmount', { method: method.title, selectedBank: 'SenBank (Nội bộ)' })}
            >
              <View style={styles.methodIconCircle}>
                {method.icon}
              </View>
              <AppText style={styles.methodTitle}>{method.title}</AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4. SENAI SMART TRANSFER CARD */}
        <View style={styles.senaiCard}>
          {/* Top-Left SenAI Pill Badge */}
          <View style={styles.senaiBadge}>
            <Ionicons name="sparkles" size={11} color="#FFFFFF" />
            <AppText style={styles.senaiBadgeText}>SenAI</AppText>
          </View>

          {/* Input & QR Scanner Viewfinder Row */}
          <View style={styles.senaiInputRow}>
            <TextInput
              style={styles.senaiTextInput}
              placeholder="Nhập SĐT chuyển nội bộ SenBank..."
              placeholderTextColor="#94A3B8"
              value={keyword}
              onChangeText={setKeyword}
              keyboardType="numeric"
              returnKeyType="go"
              onSubmitEditing={() => handleProceedTransfer()}
            />

            {isSearching ? (
              <ActivityIndicator size="small" color="#D2519D" style={{ marginRight: 6 }} />
            ) : keyword.length > 0 ? (
              <TouchableOpacity
                style={styles.clearBtn}
                activeOpacity={0.7}
                onPress={() => { setKeyword(''); setFoundRecipient(null); setSearchError(null); }}
              >
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.qrScanBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ScanQR')}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={22} color="#D2519D" />
            </TouchableOpacity>
          </View>

          {/* KẾT QUẢ TÌM THẤY TÀI KHOẢN NỘI BỘ SENBANK */}
          {foundRecipient && (
            <TouchableOpacity
              style={styles.foundRecipientCard}
              activeOpacity={0.85}
              onPress={() => handleProceedTransfer(foundRecipient)}
            >
              <Image
                source={require('../../assets/sen-hong-logo.png')}
                style={styles.foundBankLogo}
                resizeMode="contain"
              />
              <View style={styles.foundInfoCol}>
                <View style={styles.foundNameRow}>
                  <AppText style={styles.foundNameText}>{foundRecipient.name}</AppText>
                  <View style={styles.verifiedSenBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <AppText style={styles.verifiedSenText}>SenBank</AppText>
                  </View>
                </View>
                <AppText style={styles.foundPhoneText}>{foundRecipient.phone} • Ngân hàng SenBank</AppText>
              </View>

              <View style={styles.transferNowPill}>
                <AppText style={styles.transferNowText}>Chuyển ngay</AppText>
                <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          {searchError && (
            <View style={styles.errorFeedbackRow}>
              <Ionicons name="alert-circle" size={15} color="#EF4444" />
              <AppText style={styles.errorFeedbackText}>{searchError}</AppText>
            </View>
          )}

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* 3 Action Buttons (Chụp ảnh | Tải ảnh | Dán) */}
          <View style={styles.senaiActionsRow}>
            {/* Chụp ảnh */}
            <TouchableOpacity
              style={styles.actionCol}
              activeOpacity={0.7}
              onPress={handleTakePhoto}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="sparkles" size={11} color="#D2519D" />
                <Ionicons name="camera-outline" size={19} color="#D2519D" style={{ marginLeft: 3 }} />
              </View>
              <AppText style={styles.actionBtnLabel}>Chụp ảnh</AppText>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            {/* Tải ảnh */}
            <TouchableOpacity
              style={styles.actionCol}
              activeOpacity={0.7}
              onPress={handlePickImage}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="sparkles" size={11} color="#D2519D" />
                <Ionicons name="images-outline" size={19} color="#D2519D" style={{ marginLeft: 3 }} />
              </View>
              <AppText style={styles.actionBtnLabel}>Tải ảnh</AppText>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            {/* Dán */}
            <TouchableOpacity
              style={styles.actionCol}
              activeOpacity={0.7}
              onPress={handlePaste}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="sparkles" size={11} color="#D2519D" />
                <Ionicons name="clipboard-outline" size={19} color="#D2519D" style={{ marginLeft: 3 }} />
              </View>
              <AppText style={styles.actionBtnLabel}>Dán</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. 2 QUICK ACCESS CARDS (Gần đây | Ví điện tử & đối tác) */}
        <View style={styles.twoCardsRow}>
          {/* Card Trái: Gần đây */}
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EnterAmount')}
          >
            <View style={styles.quickCardHeader}>
              <AppText style={styles.quickCardTitle}>Gần đây</AppText>
              <Ionicons name="chevron-forward" size={16} color="#D2519D" />
            </View>

            <View style={styles.quickCardLogosRow}>
              {/* SenBank Logo mini */}
              <Image
                source={require('../../assets/sen-hong-logo.png')}
                style={{ width: 22, height: 22, borderRadius: 11 }}
                resizeMode="contain"
              />

              {/* MoMo mini */}
              <View style={[styles.miniBrandLogo, { backgroundColor: '#D82D8B' }]}>
                <AppText style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '900', textAlign: 'center' }}>mo{'\n'}mo</AppText>
              </View>

              {/* Badge +8 */}
              <View style={styles.plusCountBadge}>
                <AppText style={styles.plusCountText}>+8</AppText>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card Phải: Ví điện tử & đối tác */}
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <View style={styles.quickCardHeader}>
              <AppText style={styles.quickCardTitle} numberOfLines={1}>Ví điện tử & đối tác</AppText>
              <Ionicons name="chevron-forward" size={16} color="#D2519D" />
            </View>

            <View style={styles.quickCardLogosRow}>
              {/* Viettel Money Red Circle */}
              <View style={[styles.miniBrandLogo, { backgroundColor: '#EF4444', borderRadius: 12 }]}>
                <AppText style={{ color: '#FFFFFF', fontSize: 10 }}>📱</AppText>
              </View>

              {/* ZaloPay Green Text */}
              <View style={[styles.miniBrandLogo, { backgroundColor: '#ECFDF5' }]}>
                <AppText style={{ color: '#059669', fontSize: 7.5, fontWeight: '900', textAlign: 'center' }}>Zalo{'\n'}pay</AppText>
              </View>

              {/* MoMo mini */}
              <View style={[styles.miniBrandLogo, { backgroundColor: '#D82D8B' }]}>
                <AppText style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '900', textAlign: 'center' }}>mo{'\n'}mo</AppText>
              </View>

              {/* Badge +3 */}
              <View style={styles.plusCountBadge}>
                <AppText style={styles.plusCountText}>+3</AppText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. MONEY CHAT SECTION */}
        <View style={styles.moneyChatHeader}>
          <AppText style={styles.moneyChatTitle}>Money Chat</AppText>

          <View style={styles.moneyChatActions}>
            <TouchableOpacity style={styles.searchCircleBtn} activeOpacity={0.7}>
              <Ionicons name="search-outline" size={18} color="#700F43" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.newChatPillBtn} activeOpacity={0.8}>
              <AppText style={styles.newChatPillText}>+ Chat mới</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. RECENT MONEY CHAT ITEM */}
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptySub}>Chưa có giao dịch gần đây</AppText>
        </View>

        {/* 8. SAVED RECIPIENTS SECTION */}
        <View style={styles.moneyChatHeader}>
          <AppText style={styles.moneyChatTitle}>Người nhận đã lưu</AppText>

          <TouchableOpacity
            style={styles.addRecipientPillBtn}
            activeOpacity={0.8}
            onPress={() => {
              setNewPhone('');
              setNewNickname('');
              setLookupName('');
              setLookupWalletId('');
              setLookupError(null);
              setIsAddModalVisible(true);
            }}
          >
            <Ionicons name="person-add" size={13} color="#FFFFFF" />
            <AppText style={styles.addRecipientPillText}>+ Thêm mới</AppText>
          </TouchableOpacity>
        </View>

        {isLoadingBeneficiaries ? (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#D2519D" />
          </View>
        ) : savedRecipients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconHalo}>
              <MaterialCommunityIcons name="account-search-outline" size={48} color="#D2519D" />
            </View>
            <AppText style={styles.emptyTitle}>Chưa có người nhận đã lưu</AppText>
            <AppText style={styles.emptySub}>
              Thêm người nhận nội bộ SenBank vào danh bạ để chuyển khoản 1 chạm siêu tốc.
            </AppText>

            <TouchableOpacity
              style={styles.emptyAddBtn}
              activeOpacity={0.85}
              onPress={() => {
                setNewPhone('');
                setNewNickname('');
                setLookupName('');
                setLookupWalletId('');
                setLookupError(null);
                setIsAddModalVisible(true);
              }}
            >
              <Ionicons name="person-add" size={16} color="#FFFFFF" />
              <AppText style={styles.emptyAddBtnText}>+ Thêm người nhận SenBank</AppText>
            </TouchableOpacity>
          </View>
        ) : (
          savedRecipients.map((recipient: any, index: number) => {
            const displayName = recipient.nickname || recipient.accountHolderName || recipient.fullName || 'Người nhận';
            const displayPhone = recipient.accountNumber || recipient.phoneNumber || '';
            const isInternal = !recipient.bankCode || recipient.bankCode === 'SENHONG' || recipient.bankCode === 'SENBANK';

            return (
              <TouchableOpacity
                key={recipient.id || index.toString()}
                style={styles.savedRecipientCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('EnterAmount', {
                    name: displayName,
                    phone: displayPhone,
                    walletId: recipient.beneficiaryWalletId || recipient.walletId,
                    selectedBank: isInternal ? 'SenBank (Nội bộ)' : recipient.bankCode,
                    recipient: {
                      name: displayName,
                      phone: displayPhone,
                      walletId: recipient.beneficiaryWalletId || recipient.walletId,
                    },
                  })
                }
              >
                <View style={styles.savedAvatarBox}>
                  <Image
                    source={require('../../assets/sen-hong-logo.png')}
                    style={styles.savedSenbankLogo}
                    resizeMode="contain"
                  />
                  <View style={styles.verifiedDot}>
                    <Ionicons name="checkmark" size={9} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.savedRecipientInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <AppText style={styles.savedRecipientName}>{displayName}</AppText>
                    <View style={styles.senTagSmall}>
                      <AppText style={styles.senTagSmallText}>SenBank</AppText>
                    </View>
                  </View>
                  <AppText style={styles.savedRecipientSub}>
                    {displayPhone} • {isInternal ? 'SenBank (Nội bộ)' : recipient.bankCode}
                  </AppText>
                </View>

                <TouchableOpacity
                  style={styles.deleteRecipientBtn}
                  activeOpacity={0.7}
                  onPress={() => handleDeleteBeneficiary(recipient)}
                >
                  <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* MODAL THÊM NGƯỜI NHẬN NỘI BỘ SENBANK */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setIsAddModalVisible(false)}
            />
          </View>

          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image
                  source={require('../../assets/sen-hong-logo.png')}
                  style={{ width: 28, height: 28, borderRadius: 14 }}
                  resizeMode="contain"
                />
                <View>
                  <AppText style={styles.modalTitle}>Thêm người nhận</AppText>
                  <AppText style={styles.modalSubTitle}>Ngân hàng nội bộ SenBank</AppText>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Field 1: Phone number */}
            <View style={styles.modalFieldGroup}>
              <AppText style={styles.fieldLabel}>Số điện thoại ví SenBank *</AppText>
              <View style={styles.fieldInputRow}>
                <Ionicons name="call-outline" size={18} color="#D2519D" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Ví dụ: 0900000001"
                  placeholderTextColor="#94A3B8"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="numeric"
                  maxLength={11}
                />
                {isLookingUp && <ActivityIndicator size="small" color="#D2519D" />}
              </View>
            </View>

            {/* Verified recipient feedback */}
            {lookupName ? (
              <View style={styles.modalVerifiedBox}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <AppText style={styles.verifiedHolderLabel}>Chủ tài khoản SenBank:</AppText>
                  <AppText style={styles.verifiedHolderName}>{lookupName}</AppText>
                </View>
              </View>
            ) : null}

            {lookupError ? (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <AppText style={styles.modalErrorText}>{lookupError}</AppText>
              </View>
            ) : null}

            {/* Field 2: Nickname */}
            <View style={styles.modalFieldGroup}>
              <AppText style={styles.fieldLabel}>Tên gợi nhớ / Biệt danh (Tùy chọn)</AppText>
              <View style={styles.fieldInputRow}>
                <Ionicons name="bookmark-outline" size={18} color="#D2519D" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Ví dụ: Bạn thân, Tiền trọ..."
                  placeholderTextColor="#94A3B8"
                  value={newNickname}
                  onChangeText={setNewNickname}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
                onPress={() => setIsAddModalVisible(false)}
              >
                <AppText style={styles.modalCancelText}>Hủy</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  (!lookupWalletId || isSaving) && { opacity: 0.5 },
                ]}
                activeOpacity={0.8}
                onPress={handleSaveBeneficiary}
                disabled={!lookupWalletId || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppText style={styles.modalSubmitText}>Lưu người nhận</AppText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topGradientAura: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  pageHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#700F43',
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 20,
  },
  methodsScroll: {
    gap: 16,
    marginBottom: 20,
  },
  methodCard: {
    alignItems: 'center',
    width: 68,
  },
  methodIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  methodTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 16,
  },
  senaiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D2519D',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  senaiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#D2519D',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
    marginBottom: 8,
  },
  senaiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  senaiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  senaiTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    paddingVertical: 4,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qrScanBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foundRecipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  foundBankLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  foundInfoCol: {
    flex: 1,
  },
  foundNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  foundNameText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#700F43',
  },
  verifiedSenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  verifiedSenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  foundPhoneText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  transferNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D2519D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  transferNowText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  errorFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  errorFeedbackText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#FCE7F3',
    marginVertical: 12,
  },
  senaiActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#700F43',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#FCE7F3',
  },
  twoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  quickCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#700F43',
    flex: 1,
  },
  quickCardLogosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniBrandLogo: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusCountBadge: {
    backgroundColor: '#FDF2F8',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  plusCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D2519D',
  },
  moneyChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moneyChatTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#700F43',
  },
  moneyChatActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatPillBtn: {
    backgroundColor: '#D2519D',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newChatPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  chatUserCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  chatUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatUserInfo: {
    flex: 1,
  },
  chatUserName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatUserSub: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIconHalo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#700F43',
    marginTop: 14,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  addRecipientPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D2519D',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  addRecipientPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#700F43',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  savedRecipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  savedAvatarBox: {
    position: 'relative',
    marginRight: 12,
  },
  savedSenbankLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  savedRecipientInfo: {
    flex: 1,
  },
  savedRecipientName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  senTagSmall: {
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#FCE7F3',
  },
  senTagSmallText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D2519D',
  },
  savedRecipientSub: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
  },
  deleteRecipientBtn: {
    padding: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#700F43',
  },
  modalSubTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  fieldInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 46,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalVerifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  verifiedHolderLabel: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
  },
  verifiedHolderName: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '800',
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  modalErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#700F43',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
