import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { WalletApi } from '../services/api';
import {
  SUPPORT_CONTACTS,
  FAQ_CATEGORIES,
  BANK_FAQS,
  BANK_BRANCHES,
  FAQItem,
} from '../data/helpCenterData';

const { width } = Dimensions.get('window');

export default function HelpCenterScreen({ navigation }: { navigation: any }) {
  const { isDark, colors } = useTheme();
  const { user } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('f1');
  const [faqFeedback, setFaqFeedback] = useState<Record<string, 'yes' | 'no'>>({});

  // Remote FAQs (tải từ API nếu backend có)
  const [remoteFaqs, setRemoteFaqs] = useState<FAQItem[]>([]);

  // Modal Chi nhánh & SmartBank
  const [isBranchModalVisible, setIsBranchModalVisible] = useState(false);
  const [selectedBranchType, setSelectedBranchType] = useState<'ALL' | 'BRANCH' | 'ATM_SMARTBANK'>('ALL');

  // Modal Tạo Phiếu khiếu nại (Support Ticket)
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('TRANSACTION_ISSUE');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Modal Live Chat AI SenBot
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `Kính chào ${user?.name || 'Quý khách'}! Tôi là SenBot — Trợ lý số của SenBank. Tôi có thể hỗ trợ quý khách về kiểm tra giao dịch, sinh trắc học theo QĐ 2345, kích hoạt & khóa thẻ khẩn cấp. Quý khách cần hỗ trợ nội dung gì hôm nay?`,
      time: 'Vừa xong',
    },
  ]);
  const [chatInputText, setChatInputText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

  // Đồng nhất màu thương hiệu SenBank cho icon
  const brandIconColor = isDark ? colors.primary : '#700F43';
  const brandIconBoxBg = isDark ? 'rgba(244, 114, 182, 0.12)' : 'rgba(112, 15, 67, 0.06)';
  const brandIconBoxBorder = isDark ? 'rgba(244, 114, 182, 0.22)' : 'rgba(112, 15, 67, 0.12)';

  // Tải FAQs từ server ngầm (nếu có)
  useEffect(() => {
    let isMounted = true;
    const loadFaqs = async () => {
      try {
        const res = await WalletApi.getFaq();
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted: FAQItem[] = res.data.map((item: any, idx: number) => ({
            id: `remote_${idx}`,
            category: 'transfer',
            question: item.question || item.title || '',
            answer: item.answer || item.content || '',
          }));
          setRemoteFaqs(formatted);
        }
      } catch (e) {
        // Sử dụng BANK_FAQS offline
      }
    };
    loadFaqs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tổng hợp danh sách FAQs
  const allFaqs = useMemo(() => {
    if (remoteFaqs.length > 0) {
      return [...BANK_FAQS, ...remoteFaqs];
    }
    return BANK_FAQS;
  }, [remoteFaqs]);

  // Lọc FAQs theo danh mục và tìm kiếm
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allFaqs.filter((faq) => {
      const matchCat = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchQuery =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [allFaqs, selectedCategory, searchQuery]);

  // Thực hiện cuộc gọi điện thoại
  const handleCallHotline = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Thông báo', `Vui lòng bấm gọi đến số tổng đài: ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Thông báo', `Vui lòng bấm gọi đến số tổng đài: ${phone}`);
      });
  };

  // Mở ứng dụng Email
  const handleSendEmail = () => {
    const subject = encodeURIComponent(`[Hỗ trợ SenBank] Yêu cầu từ khách hàng ${user?.name || ''}`);
    const body = encodeURIComponent(
      `Kính gửi Bộ phận Chăm sóc Khách hàng SenBank,\n\nTôi cần hỗ trợ vấn đề sau:\n\n- Họ và tên: ${user?.name || ''}\n- Số điện thoại đăng ký: \n- Nội dung yêu cầu:\n\nTrân trọng cảm ơn!`
    );
    const url = `mailto:${SUPPORT_CONTACTS.supportEmail}?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Email hỗ trợ', `Quý khách vui lòng gửi thư đến: ${SUPPORT_CONTACTS.supportEmail}`);
    });
  };

  // Gửi đánh giá FAQ
  const handleRateFaq = (faqId: string, rating: 'yes' | 'no') => {
    setFaqFeedback((prev) => ({ ...prev, [faqId]: rating }));
    Alert.alert(
      'Cảm ơn quý khách',
      rating === 'yes'
        ? 'SenBank rất vui vì thông tin này hữu ích cho quý khách!'
        : 'SenBank ghi nhận phản hồi để cải thiện nội dung giải đáp tốt hơn.'
    );
  };

  // Gửi Ticket Khiếu nại
  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập đầy đủ tiêu đề và nội dung yêu cầu hỗ trợ.');
      return;
    }

    setIsSubmittingTicket(true);
    const ticketCode = `TK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      await WalletApi.createSupportTicket(ticketSubject, ticketCategory, ticketMessage);
    } catch (e) {
      // Hỗ trợ lưu trữ offline
    } finally {
      setIsSubmittingTicket(false);
      setIsTicketModalVisible(false);
      setTicketSubject('');
      setTicketMessage('');

      Alert.alert(
        'Tiếp nhận yêu cầu thành công',
        `Yêu cầu của quý khách đã được chuyển tới Bộ phận Tra soát & Xử lý Khiếu nại SenBank.\n\n• Mã phiếu tiếp nhận: ${ticketCode}\n• Thời gian phản hồi: Trong vòng 15 - 30 phút\n\nSenBank sẽ gửi thông báo kết quả xử lý trực tiếp trên ứng dụng.`,
        [{ text: 'Đã hiểu' }]
      );
    }
  };

  // Gửi tin nhắn Live Chat SenBot
  const handleSendChatMessage = () => {
    if (!chatInputText.trim()) return;

    const userText = chatInputText.trim();
    setChatInputText('');

    const newMsg = {
      sender: 'user' as const,
      text: userText,
      time: 'Vừa xong',
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Trả lời tự động của SenBot
    setTimeout(() => {
      let reply = 'Cảm ơn quý khách đã gửi tin nhắn. Yêu cầu của quý khách đã được tiếp nhận. Chuyên viên tư vấn SenBank sẽ phản hồi trong ít phút.';
      const lower = userText.toLowerCase();

      if (lower.includes('chuyển tiền') || lower.includes('chưa nhận')) {
        reply = 'Nếu giao dịch chuyển tiền đã bị trừ số dư nhưng bên nhận chưa nhận được, quý khách vui lòng đợi từ 15-30 phút để đối soát Napas. Nếu sau 30 phút vẫn chưa có tiền, quý khách hãy bấm "Tra soát khiếu nại" để được kiểm tra tự động nhé!';
      } else if (lower.includes('sinh trắc') || lower.includes('nfc') || lower.includes('2345')) {
        reply = 'Theo Quyết định 2345/QĐ-NHNN, giao dịch chuyển tiền từ 10 triệu đồng/lần hoặc trên 20 triệu đồng/ngày bắt buộc phải xác thực khuôn mặt sinh trắc học qua chip CCCD NFC. Quý khách vào Cài đặt > Định danh sinh trắc học để cập nhật ngay trong 1 phút!';
      } else if (lower.includes('khóa thẻ') || lower.includes('mất thẻ') || lower.includes('lộ')) {
        reply = 'Quý khách hãy vào ngay mục Phương thức thanh toán trên ứng dụng để bấm nút "Khóa thẻ tạm thời", hoặc gọi Tổng đài Khẩn cấp 1900 8888 (bấm phím 1) để nhân viên khóa tài khoản ngay lập tức!';
      } else if (lower.includes('phí')) {
        reply = 'SenBank áp dụng chính sách Miễn phí 100% trọn đời cho mọi giao dịch chuyển tiền nội bộ và chuyển khoản liên ngân hàng 24/7 qua VietQR. Không mất phí duy trì tài khoản!';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: reply,
          time: 'Vừa xong',
        },
      ]);
    }, 600);
  };

  // Lọc chi nhánh
  const filteredBranches = useMemo(() => {
    if (selectedBranchType === 'ALL') return BANK_BRANCHES;
    return BANK_BRANCHES.filter((b) => b.type === selectedBranchType);
  }, [selectedBranchType]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.surface} />

      {/* 1. TOP HEADER */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.background }]}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>Trung tâm Trợ giúp</AppText>
          <AppText style={[styles.headerSubTitle, { color: colors.textSecondary }]}>Hỗ trợ khách hàng 24/7</AppText>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.headerCallBtn, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}
            activeOpacity={0.8}
            onPress={() => handleCallHotline(SUPPORT_CONTACTS.generalHotline)}
          >
            <Ionicons name="headset-outline" size={15} color={brandIconColor} />
            <AppText style={[styles.headerCallBtnText, { color: brandIconColor }]}>1900 8888</AppText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. LUXURY 24/7 HOTLINE BANNER (Chuẩn ngân hàng thương mại Việt Nam) */}
        <View style={styles.bannerWrapper}>
          <LinearGradient
            colors={['#3B0724', '#700F43', '#831843', '#A21D62']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerTopRow}>
              <View style={styles.bannerBadgePill}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#FFFFFF" />
                <AppText style={styles.bannerBadgeText}>Tổng đài Hỗ trợ 24/7</AppText>
              </View>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <AppText style={styles.liveText}>Trực tuyến</AppText>
              </View>
            </View>

            <AppText style={styles.bannerHeading}>
              SenBank luôn đồng hành và hỗ trợ quý khách mọi lúc, mọi nơi
            </AppText>

            <AppText style={styles.bannerSubText}>
              Miễn cước toàn quốc cho các yêu cầu bảo mật, khóa thẻ và tra soát khẩn cấp.
            </AppText>

            {/* 2 Nút Hotline đồng bộ phong cách Frosted Glass cao cấp */}
            <View style={styles.bannerCallRow}>
              <TouchableOpacity
                style={styles.callCardTollFree}
                activeOpacity={0.85}
                onPress={() => handleCallHotline(SUPPORT_CONTACTS.tollFreeHotline)}
              >
                <View style={styles.callCardIconBoxRuby}>
                  <Ionicons name="headset-outline" size={17} color="#700F43" />
                </View>
                <View>
                  <AppText style={styles.callCardLabel}>MIỄN CƯỚC 24/7</AppText>
                  <AppText style={styles.callCardNumber}>{SUPPORT_CONTACTS.tollFreeHotline}</AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callCardGeneral}
                activeOpacity={0.85}
                onPress={() => handleCallHotline(SUPPORT_CONTACTS.generalHotline)}
              >
                <View style={styles.callCardIconBoxGlass}>
                  <Ionicons name="call-outline" size={17} color="#FFFFFF" />
                </View>
                <View>
                  <AppText style={styles.callCardLabelGlass}>TỔNG ĐÀI CSKH</AppText>
                  <AppText style={styles.callCardNumberGlass}>{SUPPORT_CONTACTS.generalHotline}</AppText>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* 3. 4 EMERGENCY QUICK ACTIONS (Đồng nhất tone màu thương hiệu SenBank) */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="shield-half-outline" size={17} color={brandIconColor} />
            <AppText style={[styles.sectionHeading, { color: colors.textPrimary }]}>Hỗ trợ khẩn cấp</AppText>
          </View>
          <AppText style={[styles.sectionSubHeading, { color: colors.textSecondary }]}>Xử lý tức thì</AppText>
        </View>

        <View style={styles.emergencyGrid}>
          {/* Action 1: Khóa thẻ khẩn cấp */}
          <TouchableOpacity
            style={[styles.emergencyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <View style={[styles.emergencyIconBox, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color={brandIconColor} />
            </View>
            <AppText style={[styles.emergencyTitle, { color: colors.textPrimary }]}>Khóa thẻ khẩn cấp</AppText>
            <AppText style={[styles.emergencySub, { color: colors.textSecondary }]}>Khóa tức thì tránh phát sinh giao dịch</AppText>
          </TouchableOpacity>

          {/* Action 2: Tra soát khiếu nại */}
          <TouchableOpacity
            style={[styles.emergencyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => setIsTicketModalVisible(true)}
          >
            <View style={[styles.emergencyIconBox, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
              <Ionicons name="receipt-outline" size={20} color={brandIconColor} />
            </View>
            <AppText style={[styles.emergencyTitle, { color: colors.textPrimary }]}>Tra soát khiếu nại</AppText>
            <AppText style={[styles.emergencySub, { color: colors.textSecondary }]}>Tạo phiếu tra soát lệnh trừ tiền sai</AppText>
          </TouchableOpacity>

          {/* Action 3: Cấp lại PIN / Mật khẩu */}
          <TouchableOpacity
            style={[styles.emergencyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <View style={[styles.emergencyIconBox, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
              <Ionicons name="key-outline" size={20} color={brandIconColor} />
            </View>
            <AppText style={[styles.emergencyTitle, { color: colors.textPrimary }]}>Quên mật khẩu / PIN</AppText>
            <AppText style={[styles.emergencySub, { color: colors.textSecondary }]}>Lấy lại mật khẩu qua eKYC nhanh</AppText>
          </TouchableOpacity>

          {/* Action 4: Quản lý thiết bị lạ */}
          <TouchableOpacity
            style={[styles.emergencyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DeviceManagement')}
          >
            <View style={[styles.emergencyIconBox, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={brandIconColor} />
            </View>
            <AppText style={[styles.emergencyTitle, { color: colors.textPrimary }]}>Quản lý thiết bị</AppText>
            <AppText style={[styles.emergencySub, { color: colors.textSecondary }]}>Đăng xuất khỏi các máy không nhận biết</AppText>
          </TouchableOpacity>
        </View>

        {/* 4. KÊNH LIÊN HỆ TRỰC TIẾP (Đồng nhất tone màu thương hiệu) */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="chatbubbles-outline" size={17} color={brandIconColor} />
            <AppText style={[styles.sectionHeading, { color: colors.textPrimary }]}>Kênh liên hệ trực tiếp</AppText>
          </View>
        </View>

        <View style={[styles.channelsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Kênh 1: Live Chat AI SenBot */}
          <TouchableOpacity
            style={styles.channelRow}
            activeOpacity={0.7}
            onPress={() => setIsChatModalVisible(true)}
          >
            <View style={[styles.channelIconBox, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={19} color={brandIconColor} />
            </View>
            <View style={styles.channelCenterCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText style={[styles.channelTitle, { color: colors.textPrimary }]}>Chat với Trợ lý SenBot</AppText>
                <View style={[styles.botBadge, { backgroundColor: brandIconBoxBg }]}>
                  <AppText style={[styles.botBadgeText, { color: brandIconColor }]}>24/7 AI</AppText>
                </View>
              </View>
              <AppText style={[styles.channelSub, { color: colors.textSecondary }]}>Giải đáp tự động trong 2 giây</AppText>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.channelDivider, { backgroundColor: colors.border }]} />

          {/* Kênh 2: Gửi Ticket khiếu nại */}
          <TouchableOpacity
            style={styles.channelRow}
            activeOpacity={0.7}
            onPress={() => setIsTicketModalVisible(true)}
          >
            <View style={[styles.channelIconBox, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
              <Ionicons name="document-text-outline" size={19} color={brandIconColor} />
            </View>
            <View style={styles.channelCenterCol}>
              <AppText style={[styles.channelTitle, { color: colors.textPrimary }]}>Gửi phiếu yêu cầu hỗ trợ</AppText>
              <AppText style={[styles.channelSub, { color: colors.textSecondary }]}>Nhận phản hồi từ Chuyên viên trong 15-30 phút</AppText>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.channelDivider, { backgroundColor: colors.border }]} />

          {/* Kênh 3: Mạng lưới Chi nhánh & ATM SmartBank */}
          <TouchableOpacity
            style={styles.channelRow}
            activeOpacity={0.7}
            onPress={() => setIsBranchModalVisible(true)}
          >
            <View style={[styles.channelIconBox, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
              <Ionicons name="business-outline" size={19} color={brandIconColor} />
            </View>
            <View style={styles.channelCenterCol}>
              <AppText style={[styles.channelTitle, { color: colors.textPrimary }]}>Chi nhánh & SmartBank 24/7</AppText>
              <AppText style={[styles.channelSub, { color: colors.textSecondary }]}>Tra cứu điểm giao dịch trên toàn quốc</AppText>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.channelDivider, { backgroundColor: colors.border }]} />

          {/* Kênh 4: Email hỗ trợ */}
          <TouchableOpacity
            style={styles.channelRow}
            activeOpacity={0.7}
            onPress={handleSendEmail}
          >
            <View style={[styles.channelIconBox, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
              <Ionicons name="mail-outline" size={19} color={brandIconColor} />
            </View>
            <View style={styles.channelCenterCol}>
              <AppText style={[styles.channelTitle, { color: colors.textPrimary }]}>Email chăm sóc khách hàng</AppText>
              <AppText style={[styles.channelSub, { color: colors.textSecondary }]}>{SUPPORT_CONTACTS.supportEmail}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 5. TÌM KIẾM & KHO TRI THỨC FAQ NGÂN HÀNG */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="help-circle-outline" size={17} color={brandIconColor} />
            <AppText style={[styles.sectionHeading, { color: colors.textPrimary }]}>Câu hỏi thường gặp (FAQ)</AppText>
          </View>
          <AppText style={[styles.sectionSubHeading, { color: colors.textSecondary }]}>{filteredFaqs.length} câu hỏi</AppText>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBarWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Tìm kiếm: chuyển nhầm, 2345, mã OTP, khóa thẻ..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {FAQ_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                  isSelected && { backgroundColor: brandIconBoxBg, borderColor: brandIconColor },
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <AppText
                  style={[
                    styles.categoryPillText,
                    { color: colors.textSecondary },
                    isSelected && { color: brandIconColor, fontWeight: '800' },
                  ]}
                >
                  {cat.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FAQ Accordion List */}
        <View style={[styles.faqAccordionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {filteredFaqs.length === 0 ? (
            <View style={styles.faqEmptyBox}>
              <Ionicons name="search-outline" size={32} color={colors.textMuted} />
              <AppText style={[styles.faqEmptyTitle, { color: colors.textPrimary }]}>Không tìm thấy câu hỏi phù hợp</AppText>
              <AppText style={[styles.faqEmptySub, { color: colors.textSecondary }]}>
                Quý khách có thể bấm "Chat với Trợ lý SenBot" hoặc gọi 1900 8888 để được hỗ trợ trực tiếp.
              </AppText>
              <TouchableOpacity
                style={[styles.faqEmptyBtn, { backgroundColor: brandIconBoxBg }]}
                onPress={() => setIsChatModalVisible(true)}
              >
                <AppText style={[styles.faqEmptyBtnText, { color: brandIconColor }]}>Hỏi SenBot ngay</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedFaqId === faq.id;
              const feedback = faqFeedback[faq.id];

              return (
                <View
                  key={faq.id}
                  style={[
                    styles.faqItemBlock,
                    idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.faqHeaderRow}
                    activeOpacity={0.7}
                    onPress={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  >
                    <View style={styles.faqHeaderLeft}>
                      {faq.popular && (
                        <View style={[styles.popularBadge, { backgroundColor: brandIconBoxBg }]}>
                          <AppText style={[styles.popularBadgeText, { color: brandIconColor }]}>Phổ biến</AppText>
                        </View>
                      )}
                      <AppText style={[styles.faqQuestionText, { color: colors.textPrimary }]}>
                        {faq.question}
                      </AppText>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={17}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.faqBody}>
                      <AppText style={[styles.faqAnswerText, { color: isDark ? '#CBD5E1' : '#334155' }]}>
                        {faq.answer}
                      </AppText>

                      {/* Helpful Rating Bar */}
                      <View style={[styles.feedbackBar, { borderTopColor: colors.border }]}>
                        <AppText style={[styles.feedbackPrompt, { color: colors.textSecondary }]}>
                          Thông tin này có hữu ích cho quý khách không?
                        </AppText>
                        <View style={styles.feedbackActionsRow}>
                          <TouchableOpacity
                            style={[
                              styles.feedbackBtn,
                              { borderColor: colors.border },
                              feedback === 'yes' && { backgroundColor: brandIconBoxBg, borderColor: brandIconColor },
                            ]}
                            onPress={() => handleRateFaq(faq.id, 'yes')}
                          >
                            <Ionicons
                              name="thumbs-up-outline"
                              size={13}
                              color={feedback === 'yes' ? brandIconColor : colors.textSecondary}
                            />
                            <AppText
                              style={[
                                styles.feedbackBtnText,
                                { color: feedback === 'yes' ? brandIconColor : colors.textSecondary },
                              ]}
                            >
                              Hữu ích
                            </AppText>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.feedbackBtn,
                              { borderColor: colors.border },
                              feedback === 'no' && { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: '#EF4444' },
                            ]}
                            onPress={() => handleRateFaq(faq.id, 'no')}
                          >
                            <Ionicons
                              name="thumbs-down-outline"
                              size={13}
                              color={feedback === 'no' ? '#EF4444' : colors.textSecondary}
                            />
                            <AppText
                              style={[
                                styles.feedbackBtnText,
                                { color: feedback === 'no' ? '#EF4444' : colors.textSecondary },
                              ]}
                            >
                              Chưa rõ
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Footer Cảnh báo An toàn Ngân hàng */}
        <View style={styles.footerDisclaimer}>
          <Ionicons name="shield-checkmark-outline" size={15} color={colors.textMuted} />
          <AppText style={[styles.footerDisclaimerText, { color: colors.textMuted }]}>
            Ngân hàng SenBank không bao giờ yêu cầu quý khách cung cấp Mật khẩu, Mã PIN hoặc Mã Smart OTP dưới bất kỳ hình thức nào.
          </AppText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ============================================================ */}
      {/* 6. MODAL: TẠO PHIẾU TRA SOÁT & KHIẾU NẠI (SUPPORT TICKET) */}
      {/* ============================================================ */}
      <Modal
        visible={isTicketModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTicketModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
        >
          <View style={[styles.modalContentSheet, { backgroundColor: colors.modalBackground }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.modalLotusBox, { backgroundColor: brandIconColor }]}>
                  <Ionicons name="receipt-outline" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <AppText style={[styles.modalSheetTitle, { color: colors.textPrimary }]}>Tạo phiếu tra soát & hỗ trợ</AppText>
                  <AppText style={[styles.modalSheetSub, { color: colors.textSecondary }]}>Cam kết xử lý trong 15-30 phút</AppText>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsTicketModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Phân loại vấn đề */}
            <AppText style={[styles.inputLabel, { color: colors.textSecondary }]}>Phân loại vấn đề</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {[
                { id: 'TRANSACTION_ISSUE', label: 'Tra soát giao dịch' },
                { id: 'SECURITY_EKYC', label: 'Bảo mật & Sinh trắc học' },
                { id: 'CARD_ACCOUNT', label: 'Thẻ & Tài khoản' },
                { id: 'APP_TECH', label: 'Lỗi ứng dụng / OTP' },
                { id: 'GENERAL', label: 'Khác' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.ticketCatPill,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                    ticketCategory === cat.id && { backgroundColor: brandIconBoxBg, borderColor: brandIconColor },
                  ]}
                  onPress={() => setTicketCategory(cat.id)}
                >
                  <AppText
                    style={[
                      styles.ticketCatPillText,
                      { color: colors.textSecondary },
                      ticketCategory === cat.id && { color: brandIconColor, fontWeight: '800' },
                    ]}
                  >
                    {cat.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tiêu đề yêu cầu */}
            <AppText style={[styles.inputLabel, { color: colors.textSecondary }]}>Tiêu đề khiếu nại / yêu cầu</AppText>
            <View style={[styles.inputBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="VD: Tra soát lệnh chuyển tiền ngày 03/09"
                placeholderTextColor={colors.textMuted}
                value={ticketSubject}
                onChangeText={setTicketSubject}
              />
            </View>

            {/* Nội dung chi tiết */}
            <AppText style={[styles.inputLabel, { color: colors.textSecondary }]}>Nội dung chi tiết (Số tiền, thời gian, mô tả sự cố)</AppText>
            <View style={[styles.textAreaBox, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
              <TextInput
                style={[styles.textAreaInput, { color: colors.textPrimary }]}
                placeholder="Vui lòng mô tả chi tiết: số tiền, mã giao dịch (nếu có) để Chuyên viên SenBank tra soát nhanh nhất..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={ticketMessage}
                onChangeText={setTicketMessage}
              />
            </View>

            {/* Nút gửi yêu cầu */}
            <TouchableOpacity
              style={styles.submitTicketBtn}
              activeOpacity={0.85}
              disabled={isSubmittingTicket}
              onPress={handleSubmitTicket}
            >
              <LinearGradient
                colors={['#700F43', '#831843', '#A21D62']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isSubmittingTicket ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <AppText style={styles.submitTicketBtnText}>Gửi yêu cầu hỗ trợ ngay</AppText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ============================================================ */}
      {/* 7. MODAL: TRA CỨU CHI NHÁNH & SMARTBANK 24/7 */}
      {/* ============================================================ */}
      <Modal
        visible={isBranchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsBranchModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContentSheet, { backgroundColor: colors.modalBackground, maxHeight: '82%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.modalLotusBox, { backgroundColor: brandIconColor }]}>
                  <Ionicons name="business-outline" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <AppText style={[styles.modalSheetTitle, { color: colors.textPrimary }]}>Chi nhánh & SmartBank 24/7</AppText>
                  <AppText style={[styles.modalSheetSub, { color: colors.textSecondary }]}>Mạng lưới điểm giao dịch SenBank toàn quốc</AppText>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsBranchModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Bộ lọc loại điểm giao dịch */}
            <View style={styles.branchFilterRow}>
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'BRANCH', label: 'Chi nhánh / PGD' },
                { id: 'ATM_SMARTBANK', label: 'SmartBank 24/7' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.branchFilterPill,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border },
                    selectedBranchType === f.id && { backgroundColor: brandIconBoxBg, borderColor: brandIconColor },
                  ]}
                  onPress={() => setSelectedBranchType(f.id as any)}
                >
                  <AppText
                    style={[
                      styles.branchFilterPillText,
                      { color: colors.textSecondary },
                      selectedBranchType === f.id && { color: brandIconColor, fontWeight: '800' },
                    ]}
                  >
                    {f.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Danh sách các chi nhánh */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
              {filteredBranches.map((branch) => (
                <View
                  key={branch.id}
                  style={[styles.branchCardItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.branchCardTopRow}>
                    <View style={[styles.branchIconWrapper, { backgroundColor: brandIconBoxBg, borderColor: brandIconBoxBorder }]}>
                      <Ionicons
                        name={branch.type === 'BRANCH' ? 'business-outline' : 'cash-outline'}
                        size={18}
                        color={brandIconColor}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText style={[styles.branchNameText, { color: colors.textPrimary }]}>{branch.name}</AppText>
                      {branch.is247 && (
                        <View style={[styles.badge247, { backgroundColor: brandIconBoxBg }]}>
                          <AppText style={[styles.badge247Text, { color: brandIconColor }]}>Mở cửa 24/7</AppText>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.branchMetaRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <AppText style={[styles.branchAddressText, { color: colors.textSecondary }]}>
                      {branch.address}
                    </AppText>
                  </View>

                  <View style={styles.branchMetaRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <AppText style={[styles.branchHoursText, { color: colors.textSecondary }]}>
                      {branch.workingHours}
                    </AppText>
                  </View>

                  <View style={[styles.branchActionRow, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      style={[styles.branchCallBtn, { backgroundColor: brandIconBoxBg }]}
                      onPress={() => handleCallHotline(branch.phone)}
                    >
                      <Ionicons name="call-outline" size={13} color={brandIconColor} />
                      <AppText style={[styles.branchCallBtnText, { color: brandIconColor }]}>{branch.phone}</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.branchMapBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                      onPress={() => {
                        const query = encodeURIComponent(`${branch.name} ${branch.address}`);
                        Linking.openURL(`https://maps.google.com/?q=${query}`);
                      }}
                    >
                      <Ionicons name="navigate-outline" size={13} color={colors.textPrimary} />
                      <AppText style={[styles.branchMapBtnText, { color: colors.textPrimary }]}>Chỉ đường</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 8. MODAL: LIVE CHAT TRỢ LÝ SỐ SENBOT 24/7 */}
      {/* ============================================================ */}
      <Modal
        visible={isChatModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsChatModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
        >
          <View style={[styles.modalContentSheet, { backgroundColor: colors.modalBackground, height: '85%' }]}>
            {/* Chat Header */}
            <View style={styles.chatModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.chatBotAvatar, { backgroundColor: '#700F43' }]}>
                  <Ionicons name="headset-outline" size={18} color="#FFFFFF" />
                  <View style={styles.chatOnlineDot} />
                </View>
                <View>
                  <AppText style={[styles.chatBotName, { color: colors.textPrimary }]}>Trợ lý số SenBot</AppText>
                  <AppText style={styles.chatBotStatus}>Trực tuyến 24/7 • SenBank Digital</AppText>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsChatModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Chat Messages List */}
            <ScrollView style={styles.chatMessagesArea} contentContainerStyle={{ paddingVertical: 12 }}>
              {chatMessages.map((msg, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.chatBubbleRow,
                    msg.sender === 'user' ? styles.chatBubbleRowUser : styles.chatBubbleRowBot,
                  ]}
                >
                  {msg.sender === 'bot' && (
                    <View style={[styles.chatAvatarMini, { backgroundColor: brandIconBoxBg }]}>
                      <Ionicons name="headset-outline" size={12} color={brandIconColor} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.chatBubble,
                      msg.sender === 'user'
                        ? [styles.chatBubbleUser, { backgroundColor: '#700F43' }]
                        : [styles.chatBubbleBot, { backgroundColor: colors.surface, borderColor: colors.border }],
                    ]}
                  >
                    <AppText
                      style={[
                        styles.chatBubbleText,
                        { color: msg.sender === 'user' ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {msg.text}
                    </AppText>
                    <AppText
                      style={[
                        styles.chatBubbleTime,
                        { color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                      ]}
                    >
                      {msg.time}
                    </AppText>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Quick Prompt Chips */}
            <View style={styles.quickPromptRow}>
              {[
                'Chuyển tiền bị trừ nhưng chưa nhận',
                'Cách quét sinh trắc học NFC',
                'Khóa thẻ khẩn cấp',
              ].map((prompt, pIdx) => (
                <TouchableOpacity
                  key={pIdx}
                  style={[styles.quickPromptPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    setChatInputText(prompt);
                  }}
                >
                  <AppText style={[styles.quickPromptText, { color: brandIconColor }]}>{prompt}</AppText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chat Input Bar */}
            <View style={[styles.chatInputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <TextInput
                style={[styles.chatTextInput, { color: colors.textPrimary }]}
                placeholder="Nhập câu hỏi của quý khách..."
                placeholderTextColor={colors.textMuted}
                value={chatInputText}
                onChangeText={setChatInputText}
                onSubmitEditing={handleSendChatMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.chatSendBtn, { backgroundColor: '#700F43' }]}
                onPress={handleSendChatMessage}
              >
                <Ionicons name="send" size={15} color="#FFFFFF" />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerCallBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  bannerWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  bannerGradient: {
    padding: 16,
    position: 'relative',
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bannerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#4ADE80',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerHeading: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
    lineHeight: 22,
    marginBottom: 6,
    marginTop: 4,
  },
  bannerSubText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  bannerCallRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callCardTollFree: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callCardIconBoxRuby: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callCardLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#700F43',
    letterSpacing: 0.2,
  },
  callCardNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#700F43',
  },
  callCardGeneral: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  callCardIconBoxGlass: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callCardLabelGlass: {
    fontSize: 9.5,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.2,
  },
  callCardNumberGlass: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubHeading: {
    fontSize: 12,
    fontWeight: '500',
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  emergencyCard: {
    width: (width - 42) / 2,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  emergencyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  emergencySub: {
    fontSize: 11,
    lineHeight: 15,
  },
  channelsCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    marginBottom: 20,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  channelIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelCenterCol: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  channelSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  botBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  botBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  channelDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
  },
  categoryScroll: {
    gap: 8,
    marginBottom: 12,
    paddingVertical: 2,
  },
  categoryPill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  faqAccordionContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  faqItemBlock: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  faqHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  popularBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  faqQuestionText: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 19,
    flex: 1,
  },
  faqBody: {
    marginTop: 10,
    paddingTop: 8,
  },
  faqAnswerText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  feedbackBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  feedbackPrompt: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  feedbackActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  faqEmptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  faqEmptyTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginTop: 10,
  },
  faqEmptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  faqEmptyBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  faqEmptyBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  footerDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
    marginTop: 4,
  },
  footerDisclaimerText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContentSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalLotusBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheetTitle: {
    fontSize: 15.5,
    fontWeight: '900',
  },
  modalSheetSub: {
    fontSize: 11.5,
    marginTop: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  ticketCatPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  ticketCatPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  inputBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  textInput: {
    fontSize: 13.5,
    fontWeight: '600',
    paddingVertical: 0,
  },
  textAreaBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    height: 90,
  },
  textAreaInput: {
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
    textAlignVertical: 'top',
    height: '100%',
  },
  submitTicketBtn: {
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitTicketBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  branchFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  branchFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  branchFilterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  branchCardItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  branchCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  branchIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchNameText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  badge247: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badge247Text: {
    fontSize: 10,
    fontWeight: '800',
  },
  branchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  branchAddressText: {
    fontSize: 12,
    flex: 1,
  },
  branchHoursText: {
    fontSize: 11.5,
    flex: 1,
  },
  branchActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  branchCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  branchCallBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  branchMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  branchMapBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  chatBotAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chatOnlineDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    bottom: 0,
    right: 0,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatBotName: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  chatBotStatus: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
  },
  chatMessagesArea: {
    flex: 1,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
    gap: 6,
  },
  chatBubbleRowBot: {
    justifyContent: 'flex-start',
  },
  chatBubbleRowUser: {
    justifyContent: 'flex-end',
  },
  chatAvatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chatBubbleBot: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  chatBubbleUser: {
    borderBottomRightRadius: 4,
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 19,
  },
  chatBubbleTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  quickPromptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: 6,
  },
  quickPromptPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 8,
    marginTop: 4,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  chatSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
