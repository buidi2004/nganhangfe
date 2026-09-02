import { Image } from 'expo-image';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { useTheme } from '../context/ThemeContext';

interface BillPaymentScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 32 - 48) / 4; // 4 items per row with gaps

const PROVIDERS = [
  { id: '1', icon: 'flash', label: 'Điện' },
  { id: '2', icon: 'water', label: 'Nước' },
  { id: '3', icon: 'wifi', label: 'Internet' },
  { id: '4', icon: 'cellphone', label: 'Di động' },
  { id: '5', icon: 'television-classic', label: 'Truyền hình' },
  { id: '6', icon: 'school', label: 'Học phí' },
  { id: '7', icon: 'shield-check', label: 'Bảo hiểm' },
  { id: '8', icon: 'home-city', label: 'Chung cư' },
];

const SAVED_BILLS = [
  { 
    id: '1', 
    provider: 'Điện lực Miền Nam', 
    customerCode: 'PE01928374',
    amount: '350.000 đ', 
    dueDate: '15/10/2024',
    icon: 'flash',
    color: '#D97706',
    bg: '#FEF3C7',
    status: 'Chưa thanh toán'
  },
  { 
    id: '2', 
    provider: 'Nước sạch Chợ Lớn', 
    customerCode: 'WA98273645',
    amount: '180.000 đ', 
    dueDate: '20/10/2024',
    icon: 'water',
    color: '#0284C7',
    bg: '#E0F2FE',
    status: 'Đã thanh toán'
  },
];

export default function BillPaymentScreen({ navigation }: BillPaymentScreenProps) {
  const { isDark, colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#FCE7F3', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.25, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#700F43" />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Thanh toán hoá đơn</AppText>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="receipt-outline" size={22} color="#700F43" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <AppText style={styles.searchText}>Tìm kiếm dịch vụ, nhà cung cấp...</AppText>
          </View>

          {/* PROVIDER GRID */}
          <View style={styles.sectionContainer}>
            <AppText style={styles.sectionTitle}>Danh mục dịch vụ</AppText>
            <View style={styles.providerGrid}>
              {PROVIDERS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.providerItem}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('BillInput', { provider: p.label })}
                >
                  <View style={[
                    styles.providerIconBg, 
                    { 
                      backgroundColor: isDark ? 'rgba(244, 114, 182, 0.12)' : 'rgba(112, 15, 67, 0.06)',
                      borderColor: isDark ? 'rgba(244, 114, 182, 0.2)' : 'rgba(112, 15, 67, 0.1)',
                      borderWidth: 1,
                    }
                  ]}>
                    <MaterialCommunityIcons name={p.icon as any} size={24} color={isDark ? colors.primary : '#700F43'} />
                  </View>
                  <AppText style={[styles.providerLabel, { color: colors.textPrimary }]}>{p.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SAVED BILLS */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <AppText style={styles.sectionTitle}>Hoá đơn đã lưu</AppText>
              <TouchableOpacity>
                <AppText style={styles.seeAllText}>Quản lý</AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.billsList}>
              {SAVED_BILLS.map((bill) => {
                const isUnpaid = bill.status === 'Chưa thanh toán';
                return (
                  <TouchableOpacity
                    key={bill.id}
                    style={styles.billCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('BillInput', { provider: bill.provider })}
                  >
                    <View style={[
                      styles.billIconWrap, 
                      { 
                        backgroundColor: isDark ? 'rgba(244, 114, 182, 0.12)' : 'rgba(112, 15, 67, 0.06)',
                        borderColor: isDark ? 'rgba(244, 114, 182, 0.2)' : 'rgba(112, 15, 67, 0.1)',
                        borderWidth: 1,
                      }
                    ]}>
                      <MaterialCommunityIcons name={bill.icon as any} size={26} color={isDark ? colors.primary : '#700F43'} />
                    </View>

                    <View style={styles.billCenter}>
                      <AppText style={styles.billProviderName}>{bill.provider}</AppText>
                      <AppText style={styles.billCustomerCode}>{bill.customerCode}</AppText>
                      <AppText style={styles.billDueDate}>Kỳ cước: {bill.dueDate}</AppText>
                    </View>

                    <View style={styles.billRight}>
                      <AppText style={[styles.billAmount, !isUnpaid && { color: '#64748B' }]}>
                        {bill.amount}
                      </AppText>
                      <View style={[styles.statusBadge, isUnpaid ? styles.statusBadgeUnpaid : styles.statusBadgePaid]}>
                        <AppText style={[styles.statusText, isUnpaid ? styles.statusTextUnpaid : styles.statusTextPaid]}>
                          {bill.status}
                        </AppText>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          {/* AUTO PAY BANNER */}
          <TouchableOpacity style={styles.autoPayBanner} activeOpacity={0.9}>
            <LinearGradient
              colors={['#700F43', '#D2519D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.autoPayContent}>
              <View style={styles.autoPayTextWrap}>
                <AppText style={styles.autoPayTitle}>Đăng ký Trích nợ tự động</AppText>
                <AppText style={styles.autoPaySub}>Không lo trễ hạn, rảnh rang tận hưởng.</AppText>
              </View>
              <View style={styles.autoPayBtn}>
                <AppText style={styles.autoPayBtnText}>Đăng ký ngay</AppText>
              </View>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#700F43',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  searchText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D2519D',
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  providerItem: {
    width: GRID_ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 4,
  },
  providerIconBg: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH,
    borderRadius: 18, // Squircle
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  providerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  billsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  billIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billCenter: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  billProviderName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  billCustomerCode: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  billDueDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  billRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D2519D',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeUnpaid: {
    backgroundColor: '#FFE4E6',
  },
  statusBadgePaid: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextUnpaid: {
    color: '#E11D48',
  },
  statusTextPaid: {
    color: '#64748B',
  },
  autoPayBanner: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#700F43',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  autoPayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  autoPayTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  autoPayTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  autoPaySub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12.5,
    lineHeight: 18,
  },
  autoPayBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  autoPayBtnText: {
    color: '#700F43',
    fontSize: 12,
    fontWeight: '800',
  },
});
