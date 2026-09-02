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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

interface SavingPackage {
  id: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  name: string;
  rate: number; // percentage
  term: string;
  minAmount: number;
  highlight: string;
  desc: string;
}

const PACKAGES: SavingPackage[] = [
  {
    id: 'pkg_tailoc',
    badge: '🧧 TÀI LỘC • LÃI CAO NHẤT',
    badgeBg: '#FFE4E6',
    badgeColor: '#E11D48',
    name: 'Tiết Kiệm Phát Tài SenBank',
    rate: 7.8,
    term: '12 Tháng',
    minAmount: 1000000,
    highlight: 'Nhận lãi cuối kỳ • Tặng voucher 100K',
    desc: 'Lãi suất dẫn đầu thị trường, bảo hiểm tiền gửi Nhà nước bảo lãnh 100%.',
  },
  {
    id: 'pkg_linhhoat',
    badge: '✨ SINH LỜI MỖI NGÀY',
    badgeBg: '#FDF2F8',
    badgeColor: '#D2519D',
    name: 'Tích Lũy Không Kỳ Hạn',
    rate: 5.5,
    term: 'Không kỳ hạn',
    minAmount: 10000,
    highlight: 'Rút tiền bất kỳ lúc nào không mất lãi',
    desc: 'Tiền nhàn rỗi sinh lời mỗi ngày 00:00, rút về ví tức thì khi cần chi tiêu.',
  },
  {
    id: 'pkg_muctieu',
    badge: '🎯 TÍCH LŨY MỤC TIÊU',
    badgeBg: '#F0FDF4',
    badgeColor: '#16A34A',
    name: 'Gửi Góp Định Kỳ',
    rate: 6.8,
    term: '6 Tháng',
    minAmount: 500000,
    highlight: 'Tự động trích tiền theo tuần/tháng',
    desc: 'Dễ dàng tích lũy mua xe, du lịch, lập kế hoạch tài chính tương lai bền vững.',
  },
];

export default function SavingsScreen({ navigation }: any) {
  const { wallet } = useApp();
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<SavingPackage>(PACKAGES[0]);

  // Bộ tính toán tiền lãi
  const [calcAmount, setCalcAmount] = useState('20000000');
  const [calcMonths, setCalcMonths] = useState(12);

  // Modal mở sổ
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('5000000');

  // Tính tiền lãi ước tính
  const numAmount = parseInt(calcAmount.replace(/[^0-9]/g, ''), 10) || 0;
  const rateForCalc = calcMonths === 12 ? 7.8 : calcMonths === 6 ? 6.8 : calcMonths === 3 ? 5.2 : 4.5;
  const estimatedProfit = Math.round((numAmount * (rateForCalc / 100) * calcMonths) / 12);
  const totalMaturity = numAmount + estimatedProfit;

  const handleOpenSavingsBook = () => {
    const amt = parseInt(depositAmount.replace(/[^0-9]/g, ''), 10) || 0;
    if (amt < selectedPkg.minAmount) {
      Alert.alert('Số tiền chưa đủ', `Số tiền gửi tối thiểu cho gói này là ${selectedPkg.minAmount.toLocaleString('vi-VN')} đ.`);
      return;
    }

    if (wallet && wallet.balance < amt) {
      Alert.alert('Số dư ví không đủ', 'Vui lòng nạp thêm tiền vào ví SenBank để mở sổ tiết kiệm.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Nạp tiền ngay', onPress: () => navigation.navigate('Deposit') },
      ]);
      return;
    }

    setIsModalVisible(false);
    Alert.alert(
      'Mở sổ thành công! 🎉',
      `Chúc mừng bạn đã mở thành công sổ "${selectedPkg.name}" với số tiền ${amt.toLocaleString('vi-VN')} đ.\nLãi suất: ${selectedPkg.rate}%/năm.`,
      [{ text: 'Xem danh sách sổ', onPress: () => {} }]
    );
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
          <AppText style={styles.headerTitleText}>Tiết Kiệm & Tiền Gửi</AppText>
          <AppText style={styles.headerSubText}>Sinh lời an toàn • Ngân hàng SenBank</AppText>
        </View>

        <TouchableOpacity
          style={styles.headerRightBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('HelpCenter')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* HERO TOTAL SAVINGS CARD */}
        <LinearGradient
          colors={['#500724', '#700F43', '#9D174D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="piggy-bank" size={20} color="#FCE7F3" />
              <AppText style={styles.heroCardLabel}>Tổng tích lũy hiện có</AppText>
            </View>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={20} color="#FCE7F3" />
            </TouchableOpacity>
          </View>

          <AppText style={styles.heroBalanceText}>
            {showBalance ? '35.850.000 đ' : '•••••••• đ'}
          </AppText>

          <View style={styles.profitBadgeRow}>
            <View style={styles.profitBadge}>
              <Ionicons name="trending-up" size={13} color="#10B981" />
              <AppText style={styles.profitBadgeText}>+186.200 đ lãi tạm tính tháng này</AppText>
            </View>
          </View>

          {/* 2 Action Buttons */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.heroOpenBtn}
              activeOpacity={0.85}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add-circle" size={16} color="#700F43" />
              <AppText style={styles.heroOpenBtnText}>Mở sổ mới ngay</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroHistoryBtn}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Lịch sử', 'Tiền lãi được cộng tự động vào ngày 1 hàng tháng.')}
            >
              <MaterialCommunityIcons name="history" size={16} color="#FFFFFF" />
              <AppText style={styles.heroHistoryBtnText}>Lịch sử sinh lời</AppText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* SECTION 1: CÁC GÓI TIẾT KIỆM NỔI BẬT */}
        <View style={styles.sectionHeaderRow}>
          <AppText style={styles.sectionHeading}>Gói tiết kiệm đặc quyền</AppText>
          <View style={styles.badgeLotus}>
            <AppText style={styles.badgeLotusText}>Lãi suất tới 7.8%</AppText>
          </View>
        </View>

        {PACKAGES.map((pkg) => {
          const isChosen = selectedPkg.id === pkg.id;
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.pkgCard, isChosen && styles.pkgCardActive]}
              activeOpacity={0.9}
              onPress={() => setSelectedPkg(pkg)}
            >
              <View style={styles.pkgTopRow}>
                <View style={[styles.pkgBadge, { backgroundColor: pkg.badgeBg }]}>
                  <AppText style={[styles.pkgBadgeText, { color: pkg.badgeColor }]}>{pkg.badge}</AppText>
                </View>
                <View style={styles.pkgRateBox}>
                  <AppText style={styles.pkgRateNumber}>{pkg.rate}%</AppText>
                  <AppText style={styles.pkgRateUnit}>/năm</AppText>
                </View>
              </View>

              <AppText style={styles.pkgTitle}>{pkg.name}</AppText>
              <AppText style={styles.pkgHighlight}>✨ {pkg.highlight}</AppText>
              <AppText style={styles.pkgDesc}>{pkg.desc}</AppText>

              <View style={styles.pkgFooterRow}>
                <AppText style={styles.pkgMinTerm}>Kỳ hạn: <AppText style={{ fontWeight: '800', color: '#1E293B' }}>{pkg.term}</AppText></AppText>
                <TouchableOpacity
                  style={[styles.pkgChooseBtn, isChosen && styles.pkgChooseBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedPkg(pkg);
                    setIsModalVisible(true);
                  }}
                >
                  <AppText style={[styles.pkgChooseBtnText, isChosen && { color: '#FFFFFF' }]}>
                    {isChosen ? 'Gửi ngay ➔' : 'Chọn gói'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* SECTION 2: CÔNG CỤ DỰ TÍNH TIỀN LÃI */}
        <View style={styles.calcCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MaterialCommunityIcons name="calculator-variant" size={22} color="#D2519D" />
            <AppText style={styles.calcHeading}>Dự tính tiền lãi nhận được</AppText>
          </View>

          {/* Amount Input */}
          <AppText style={styles.calcLabel}>Số tiền dự định gửi (VNĐ)</AppText>
          <View style={styles.calcInputRow}>
            <TextInput
              style={styles.calcInput}
              keyboardType="numeric"
              value={numAmount.toLocaleString('vi-VN')}
              onChangeText={(txt) => setCalcAmount(txt.replace(/[^0-9]/g, ''))}
            />
            <AppText style={styles.calcCurrency}>VND</AppText>
          </View>

          {/* Chips */}
          <View style={styles.chipsRow}>
            {['10000000', '20000000', '50000000', '100000000'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={[styles.calcChip, calcAmount === chip && styles.calcChipActive]}
                onPress={() => setCalcAmount(chip)}
              >
                <AppText style={[styles.calcChipText, calcAmount === chip && styles.calcChipTextActive]}>
                  {parseInt(chip, 10) / 1000000} Tr
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Months selector */}
          <AppText style={[styles.calcLabel, { marginTop: 14 }]}>Kỳ hạn gửi</AppText>
          <View style={styles.monthsGrid}>
            {[
              { m: 1, label: '1 Tháng', r: '4.5%' },
              { m: 3, label: '3 Tháng', r: '5.2%' },
              { m: 6, label: '6 Tháng', r: '6.8%' },
              { m: 12, label: '12 Tháng', r: '7.8%' },
            ].map((item) => (
              <TouchableOpacity
                key={item.m}
                style={[styles.monthItem, calcMonths === item.m && styles.monthItemActive]}
                onPress={() => setCalcMonths(item.m)}
              >
                <AppText style={[styles.monthLabel, calcMonths === item.m && styles.monthLabelActive]}>
                  {item.label}
                </AppText>
                <AppText style={[styles.monthRate, calcMonths === item.m && styles.monthRateActive]}>
                  {item.r}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Result Box */}
          <View style={styles.calcResultBox}>
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>Lãi suất áp dụng:</AppText>
              <AppText style={styles.resultValueHighlight}>{rateForCalc}% / năm</AppText>
            </View>
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabel}>Tiền lãi ước tính:</AppText>
              <AppText style={styles.resultValueProfit}>+{estimatedProfit.toLocaleString('vi-VN')} đ</AppText>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <AppText style={styles.resultLabelBold}>Tổng nhận khi đáo hạn:</AppText>
              <AppText style={styles.resultValueTotal}>{totalMaturity.toLocaleString('vi-VN')} đ</AppText>
            </View>
          </View>
        </View>

        {/* SECTION 3: SỔ TIẾT KIỆM HIỆN TẠI CỦA TÔI */}
        <View style={styles.sectionHeaderRow}>
          <AppText style={styles.sectionHeading}>Sổ tiết kiệm của bạn (1)</AppText>
        </View>

        <View style={styles.myBookCard}>
          <View style={styles.myBookHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={require('../../assets/sen-hong-logo.png')} style={{ width: 28, height: 28, borderRadius: 14 }} />
              <View>
                <AppText style={styles.myBookTitle}>Sổ Tài Lộc #SEN-8892</AppText>
                <AppText style={styles.myBookSub}>Mở ngày: 15/01/2026 • Kỳ hạn 12T</AppText>
              </View>
            </View>
            <View style={styles.myBookActivePill}>
              <AppText style={styles.myBookActiveText}>Đang sinh lời</AppText>
            </View>
          </View>

          <View style={styles.myBookNumbers}>
            <View>
              <AppText style={styles.myBookNumLabel}>Số tiền gốc</AppText>
              <AppText style={styles.myBookNumValue}>35.000.000 đ</AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText style={styles.myBookNumLabel}>Lãi suất</AppText>
              <AppText style={styles.myBookRateValue}>7.8%/năm</AppText>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL MỞ SỔ TIẾT KIỆM */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={require('../../assets/sen-hong-logo.png')} style={{ width: 28, height: 28, borderRadius: 14 }} />
                <AppText style={styles.modalSheetTitle}>Mở sổ tiết kiệm</AppText>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedPkgSummary}>
              <AppText style={styles.summaryPkgName}>{selectedPkg.name}</AppText>
              <AppText style={styles.summaryRate}>Lãi suất ưu đãi: <AppText style={{ color: '#D2519D', fontWeight: '800' }}>{selectedPkg.rate}%/năm</AppText></AppText>
            </View>

            <AppText style={styles.sheetInputLabel}>Nhập số tiền muốn gửi (VNĐ)</AppText>
            <View style={styles.sheetInputRow}>
              <TextInput
                style={styles.sheetInput}
                keyboardType="numeric"
                value={parseInt(depositAmount.replace(/[^0-9]/g, '') || '0', 10).toLocaleString('vi-VN')}
                onChangeText={(t) => setDepositAmount(t.replace(/[^0-9]/g, ''))}
              />
              <AppText style={{ fontWeight: '800', color: '#700F43' }}>VND</AppText>
            </View>

            <View style={styles.walletBalanceNote}>
              <AppText style={{ fontSize: 12, color: '#64748B' }}>
                Số dư khả dụng ví SenBank:{' '}
                <AppText style={{ fontWeight: '700', color: '#1E293B' }}>
                  {wallet ? wallet.balance.toLocaleString('vi-VN') : '0'} đ
                </AppText>
              </AppText>
            </View>

            <TouchableOpacity
              style={styles.confirmOpenBtn}
              activeOpacity={0.85}
              onPress={handleOpenSavingsBook}
            >
              <LinearGradient
                colors={['#700F43', '#D2519D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <AppText style={styles.confirmText}>Xác nhận mở sổ ➔</AppText>
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
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FCE7F3',
  },
  heroBalanceText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: -0.5,
  },
  profitBadgeRow: {
    marginTop: 8,
  },
  profitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 0.8,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  profitBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  heroOpenBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroOpenBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#700F43',
  },
  heroHistoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroHistoryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
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
  badgeLotus: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeLotusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BE185D',
  },
  pkgCard: {
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
  pkgCardActive: {
    borderColor: '#D2519D',
    backgroundColor: '#FFFDFE',
  },
  pkgTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pkgBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pkgBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pkgRateBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pkgRateNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D2519D',
  },
  pkgRateUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 2,
  },
  pkgTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  pkgHighlight: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#700F43',
    marginTop: 4,
  },
  pkgDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },
  pkgFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pkgMinTerm: {
    fontSize: 12,
    color: '#64748B',
  },
  pkgChooseBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  pkgChooseBtnActive: {
    backgroundColor: '#700F43',
  },
  pkgChooseBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
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
  calcHeading: {
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
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  calcCurrency: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D2519D',
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
  monthsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  monthItem: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  monthItemActive: {
    borderColor: '#D2519D',
    backgroundColor: '#FDF2F8',
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  monthLabelActive: {
    color: '#700F43',
    fontWeight: '800',
  },
  monthRate: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  monthRateActive: {
    color: '#D2519D',
  },
  calcResultBox: {
    backgroundColor: '#FDF2F8',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  resultLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  resultValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#700F43',
  },
  resultValueProfit: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#FBCFE8',
    marginVertical: 8,
  },
  resultLabelBold: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  resultValueTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D2519D',
  },
  myBookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  myBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myBookTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  myBookSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  myBookActivePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  myBookActiveText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  myBookNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  myBookNumLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  myBookNumValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  myBookRateValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D2519D',
    marginTop: 2,
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
  modalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#700F43',
  },
  selectedPkgSummary: {
    backgroundColor: '#FDF2F8',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  summaryPkgName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  summaryRate: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  sheetInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  sheetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    height: 48,
  },
  sheetInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  walletBalanceNote: {
    marginTop: 8,
    marginBottom: 20,
  },
  confirmOpenBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
