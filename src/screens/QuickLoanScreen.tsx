import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useApp } from '../context/AppContext';
import { WalletApi } from '../services/api';

const { width } = Dimensions.get('window');

interface LoanProduct {
  id: string;
  badge: string;
  name: string;
  maxAmountText: string;
  maxAmountNum: number;
  rateMonth: string;
  highlight: string;
}

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'loan_nhugio',
    badge: 'NHƯ GIÓ 💨 • DUYỆT 1 PHÚT',
    name: 'Vay Tiêu Dùng Siêu Tốc',
    maxAmountText: '20.000.000 đ',
    maxAmountNum: 20000000,
    rateMonth: '0.85%/tháng',
    highlight: 'Miễn lãi 10 ngày đầu • Tiền về ví ngay',
  },
  {
    id: 'loan_thauchi',
    badge: '⚡ THẤU CHI TỰ ĐỘNG',
    name: 'Hạn Mức Thấu Chi SenBank',
    maxAmountText: '50.000.000 đ',
    maxAmountNum: 50000000,
    rateMonth: '0.99%/tháng',
    highlight: 'Chi tiêu trước, trả sau • Miễn lãi 45 ngày',
  },
  {
    id: 'loan_tragop',
    badge: '🏆 LINH HOẠT TỚI 24 THÁNG',
    name: 'Vay Trả Góp Đa Tiện Ích',
    maxAmountText: '100.000.000 đ',
    maxAmountNum: 100000000,
    rateMonth: '0.75%/tháng',
    highlight: 'Hạn mức cao nhất • Trả góp nhẹ nhàng',
  },
];

export default function QuickLoanScreen({ navigation }: any) {
  const { user, refreshBalance } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct>(LOAN_PRODUCTS[0]);

  // Bộ chọn khoản vay
  const [loanAmount, setLoanAmount] = useState('10000000');
  const [loanTerm, setLoanTerm] = useState(6); // 6 tháng

  // Modal giải ngân
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const numLoan = parseInt(loanAmount.replace(/[^0-9]/g, ''), 10) || 0;
  const monthlyPrincipal = Math.round(numLoan / loanTerm);
  const monthlyInterest = Math.round(numLoan * 0.0085); // 0.85%/tháng
  const monthlyTotal = monthlyPrincipal + monthlyInterest;

  const handleConfirmDisburse = async () => {
    setIsProcessing(true);
    try {
      // Giả lập giải ngân tức thì vào ví SenBank của user qua Deposit API nếu có walletId
      if (user?.walletId) {
        try {
          await WalletApi.deposit(user.walletId, numLoan, 'VND');
          await refreshBalance();
        } catch (e) {
          // Bỏ qua nếu là offline/mock
        }
      }

      setIsProcessing(false);
      setIsModalVisible(false);

      Alert.alert(
        'Giải ngân thành công! 🌪️',
        `Chúc mừng bạn! Khoản vay ${numLoan.toLocaleString('vi-VN')} đ đã được giải ngân thành công trực tiếp vào số dư ví SenBank.\n\nHạn trả kỳ 1: 30 ngày sau.`,
        [
          {
            text: 'Kiểm tra số dư',
            onPress: () => navigation.navigate('HomeTab'),
          },
        ]
      );
    } catch (err: any) {
      setIsProcessing(false);
      Alert.alert('Thông báo', 'Hồ sơ đã được gửi phê duyệt thành công!');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header Gradient */}
      <LinearGradient
        colors={['#700F43', '#9D174D', '#D2519D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBar}
      >
        <TouchableOpacity
          style={styles.headerBackBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleCenter}>
          <AppText style={styles.headerTitleText}>Vay Nhanh Như Gió</AppText>
          <AppText style={styles.headerSubText}>Giải ngân 1 phút • Duyệt tự động SenAI</AppText>
        </View>

        <TouchableOpacity
          style={styles.headerRightBtn}
          activeOpacity={0.7}
          onPress={() => Alert.alert('Điều kiện vay', '• Là công dân Việt Nam từ 18 tuổi\n• Đã liên kết tài khoản định danh SenBank\n• Không nợ xấu CIC')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* HERO APPROVED LIMIT CARD */}
        <LinearGradient
          colors={['#500724', '#700F43', '#831843']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadgeTop}>
            <Ionicons name="flash" size={13} color="#FDE047" />
            <AppText style={styles.heroBadgeTopText}>SENAI ĐÃ PHÊ DUYỆT SẴN</AppText>
          </View>

          <AppText style={styles.heroLabel}>Hạn mức vay khả dụng tối đa</AppText>
          <AppText style={styles.heroMaxAmount}>50.000.000 đ</AppText>

          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <AppText style={styles.featureText}>Không thế chấp</AppText>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <AppText style={styles.featureText}>Không cần gặp mặt</AppText>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <AppText style={styles.featureText}>Tiền về ví tức thì</AppText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyNowBtn}
            activeOpacity={0.85}
            onPress={() => setIsModalVisible(true)}
          >
            <LinearGradient
              colors={['#F43F5E', '#E11D48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyNowGradient}
            >
              <AppText style={styles.applyNowText}>NHẬN TIỀN NGAY ➔</AppText>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* SECTION: BỘ TÍNH KHOẢN VAY VÀ TRẢ GÓP */}
        <View style={styles.calcCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MaterialCommunityIcons name="calculator" size={22} color="#D2519D" />
            <AppText style={styles.calcTitle}>Tùy chỉnh số tiền vay & Kỳ hạn</AppText>
          </View>

          <AppText style={styles.calcLabel}>Số tiền bạn cần vay (VNĐ)</AppText>
          <View style={styles.calcInputRow}>
            <TextInput
              style={styles.calcInput}
              keyboardType="numeric"
              value={numLoan.toLocaleString('vi-VN')}
              onChangeText={(txt) => setLoanAmount(txt.replace(/[^0-9]/g, ''))}
            />
            <AppText style={{ fontWeight: '800', color: '#D2519D' }}>VND</AppText>
          </View>

          {/* Quick Amount Chips */}
          <View style={styles.chipsRow}>
            {['5000000', '10000000', '20000000', '50000000'].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.calcChip, loanAmount === amt && styles.calcChipActive]}
                onPress={() => setLoanAmount(amt)}
              >
                <AppText style={[styles.calcChipText, loanAmount === amt && styles.calcChipTextActive]}>
                  {parseInt(amt, 10) / 1000000} Tr
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Term Selector */}
          <AppText style={[styles.calcLabel, { marginTop: 16 }]}>Thời gian trả góp</AppText>
          <View style={styles.termsRow}>
            {[
              { t: 3, label: '3 Tháng' },
              { t: 6, label: '6 Tháng' },
              { t: 12, label: '12 Tháng' },
              { t: 24, label: '24 Tháng' },
            ].map((term) => (
              <TouchableOpacity
                key={term.t}
                style={[styles.termItem, loanTerm === term.t && styles.termItemActive]}
                onPress={() => setLoanTerm(term.t)}
              >
                <AppText style={[styles.termText, loanTerm === term.t && styles.termTextActive]}>
                  {term.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Monthly Breakdown Box */}
          <View style={styles.breakdownBox}>
            <View style={styles.breakdownRow}>
              <AppText style={styles.breakdownLabel}>Gốc trả mỗi tháng:</AppText>
              <AppText style={styles.breakdownValue}>{monthlyPrincipal.toLocaleString('vi-VN')} đ</AppText>
            </View>
            <View style={styles.breakdownRow}>
              <AppText style={styles.breakdownLabel}>Lãi tạm tính (0.85%/tháng):</AppText>
              <AppText style={styles.breakdownValue}>{monthlyInterest.toLocaleString('vi-VN')} đ</AppText>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <AppText style={styles.breakdownTotalLabel}>Tổng thanh toán/tháng:</AppText>
              <AppText style={styles.breakdownTotalValue}>{monthlyTotal.toLocaleString('vi-VN')} đ</AppText>
            </View>
          </View>
        </View>

        {/* SECTION: 3 GÓI VAY ĐA DẠNG */}
        <View style={styles.sectionHeaderRow}>
          <AppText style={styles.sectionHeading}>Các gói vay SenBank phù hợp</AppText>
        </View>

        {LOAN_PRODUCTS.map((prod) => {
          const isChosen = selectedProduct.id === prod.id;
          return (
            <TouchableOpacity
              key={prod.id}
              style={[styles.productCard, isChosen && styles.productCardActive]}
              activeOpacity={0.9}
              onPress={() => {
                setSelectedProduct(prod);
                setLoanAmount(prod.maxAmountNum.toString());
              }}
            >
              <View style={styles.productTop}>
                <View style={styles.productBadge}>
                  <AppText style={styles.productBadgeText}>{prod.badge}</AppText>
                </View>
                <AppText style={styles.productRate}>{prod.rateMonth}</AppText>
              </View>

              <AppText style={styles.productName}>{prod.name}</AppText>
              <AppText style={styles.productHighlight}>⚡ {prod.highlight}</AppText>

              <View style={styles.productFooter}>
                <View>
                  <AppText style={{ fontSize: 11, color: '#64748B' }}>Hạn mức tới</AppText>
                  <AppText style={styles.productLimit}>{prod.maxAmountText}</AppText>
                </View>

                <TouchableOpacity
                  style={[styles.productBtn, isChosen && styles.productBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedProduct(prod);
                    setIsModalVisible(true);
                  }}
                >
                  <AppText style={[styles.productBtnText, isChosen && { color: '#FFFFFF' }]}>
                    {isChosen ? 'Vay gói này ➔' : 'Chọn gói'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* SECTION: 3 BƯỚC NHẬN TIỀN */}
        <View style={styles.stepsCard}>
          <AppText style={styles.stepsCardTitle}>Quy trình vay đơn giản</AppText>
          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}><AppText style={styles.stepNumberText}>1</AppText></View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.stepItemTitle}>Chọn số tiền và thời hạn</AppText>
              <AppText style={styles.stepItemSub}>Tùy chỉnh số tiền vay linh hoạt theo nhu cầu</AppText>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}><AppText style={styles.stepNumberText}>2</AppText></View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.stepItemTitle}>Duyệt tự động 1 phút</AppText>
              <AppText style={styles.stepItemSub}>Hệ thống SenAI xét duyệt tự động hoàn toàn trực tuyến</AppText>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumberBadge}><AppText style={styles.stepNumberText}>3</AppText></View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.stepItemTitle}>Tiền về ví SenBank</AppText>
              <AppText style={styles.stepItemSub}>Tiền giải ngân tức thì, sử dụng chuyển tiền hoặc rút về ngân hàng</AppText>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MODAL XÁC NHẬN KHOẢN VAY */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={require('../../assets/sen-hong-logo.png')} style={{ width: 28, height: 28, borderRadius: 14 }} />
                <AppText style={styles.modalTitle}>Xác nhận hồ sơ vay</AppText>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.confirmDetailsBox}>
              <View style={styles.confirmRow}>
                <AppText style={styles.confirmLabel}>Gói vay:</AppText>
                <AppText style={styles.confirmValBold}>{selectedProduct.name}</AppText>
              </View>
              <View style={styles.confirmRow}>
                <AppText style={styles.confirmLabel}>Số tiền giải ngân:</AppText>
                <AppText style={styles.confirmValBig}>{numLoan.toLocaleString('vi-VN')} đ</AppText>
              </View>
              <View style={styles.confirmRow}>
                <AppText style={styles.confirmLabel}>Thời gian vay:</AppText>
                <AppText style={styles.confirmValBold}>{loanTerm} tháng</AppText>
              </View>
              <View style={styles.confirmRow}>
                <AppText style={styles.confirmLabel}>Trả mỗi tháng:</AppText>
                <AppText style={styles.confirmValProfit}>{monthlyTotal.toLocaleString('vi-VN')} đ / tháng</AppText>
              </View>
              <View style={styles.confirmRow}>
                <AppText style={styles.confirmLabel}>Hình thức nhận:</AppText>
                <AppText style={{ color: '#10B981', fontWeight: '800' }}>Vào ví SenBank tức thì</AppText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.finalSubmitBtn}
              activeOpacity={0.85}
              onPress={handleConfirmDisburse}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={['#700F43', '#E11D48']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.finalGradient}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppText style={styles.finalText}>Xác nhận & Nhận tiền về ví ➔</AppText>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCenter: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFE4E6',
    marginTop: 2,
  },
  headerRightBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  heroBadgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(254, 224, 71, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 0.8,
    borderColor: 'rgba(254, 224, 71, 0.4)',
  },
  heroBadgeTopText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FEF08A',
  },
  heroLabel: {
    fontSize: 13,
    color: '#FCE7F3',
    fontWeight: '600',
    marginTop: 12,
  },
  heroMaxAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  applyNowBtn: {
    marginTop: 18,
    borderRadius: 14,
    overflow: 'hidden',
  },
  applyNowGradient: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  applyNowText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  calcCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  calcTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#700F43',
  },
  calcLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  calcInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 48,
  },
  calcInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  calcChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  calcChipActive: {
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#F43F5E',
  },
  calcChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  calcChipTextActive: {
    color: '#BE185D',
  },
  termsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  termItem: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  termItemActive: {
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
  },
  termText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  termTextActive: {
    color: '#BE185D',
    fontWeight: '800',
  },
  breakdownBox: {
    backgroundColor: '#FDF2F8',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  breakdownLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#FBCFE8',
    marginVertical: 8,
  },
  breakdownTotalLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#E11D48',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#D2519D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productCardActive: {
    borderColor: '#E11D48',
    backgroundColor: '#FFFDFE',
  },
  productTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productBadge: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  productBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E11D48',
  },
  productRate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E11D48',
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  productHighlight: {
    fontSize: 12.5,
    color: '#700F43',
    fontWeight: '700',
    marginTop: 4,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  productLimit: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  productBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  productBtnActive: {
    backgroundColor: '#700F43',
  },
  productBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepsCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D2519D',
  },
  stepItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  stepItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#700F43',
  },
  confirmDetailsBox: {
    backgroundColor: '#FDF2F8',
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  confirmLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  confirmValBold: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  confirmValBig: {
    fontSize: 16,
    fontWeight: '900',
    color: '#700F43',
  },
  confirmValProfit: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E11D48',
  },
  finalSubmitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  finalGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  finalText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
