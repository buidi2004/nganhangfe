import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '../components/typography/AppText';
import { Colors } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { WalletApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { Linking } from 'react-native';

interface Transaction {
  id?: string;
  transactionId?: string;
  type: string;
  amount: number;
  currency?: string;
  status: string;
  referenceId?: string;
  description?: string;
  note?: string;
  createdAt?: string;
  timestamp?: string;
  feeAmount?: number;
  runningBalance?: number;
  isInternal?: boolean;
  bankCode?: string;
  senderName?: string;
  recipientName?: string;
  counterpartyName?: string;
  counterpartyAccount?: string;
  senderAccount?: string;
  recipientAccount?: string;
  counterpartyBankName?: string;
}

const MemoizedTransactionItem = React.memo(({ item, onPress }: { item: Transaction, onPress: (id: string) => void }) => {
  const { colors, isDark } = useTheme();
  const isPositive = ['DEPOSIT', 'TRANSFER_IN', 'REWARD'].includes(item.type);
  const amountPrefix = isPositive ? '+' : '-';
  const amountColor = isPositive ? '#10B981' : colors.textPrimary;
  
  let typeIcon = 'swap-horizontal';
  let iconBg = isDark ? '#1E293B' : '#F1F5F9';
  let iconColor = '#64748B';

  if (item.type === 'DEPOSIT') {
    typeIcon = 'arrow-down';
    iconBg = isDark ? '#064E3B' : '#DCFCE7';
    iconColor = '#10B981';
  } else if (item.type === 'WITHDRAWAL') {
    typeIcon = 'arrow-up';
    iconBg = isDark ? '#450A0A' : '#FEE2E2';
    iconColor = '#EF4444';
  } else if (item.type === 'BILL_PAYMENT') {
    typeIcon = 'receipt-outline';
    iconBg = isDark ? '#451A03' : '#FEF3C7';
    iconColor = '#F59E0B';
  } else if (item.type === 'TOPUP') {
    typeIcon = 'phone-portrait-outline';
    iconBg = isDark ? '#3B0764' : '#F3E8FF';
    iconColor = '#A855F7';
  } else if (item.type.includes('TRANSFER')) {
    typeIcon = 'swap-horizontal';
    iconBg = isDark ? '#082F49' : '#E0F2FE';
    iconColor = '#0EA5E9';
  }

  return (
    <TouchableOpacity 
      style={[styles.txCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]} 
      activeOpacity={0.7}
      onPress={() => onPress(item.transactionId || item.id || '')}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
        <Ionicons name={typeIcon as any} size={20} color={iconColor} />
      </View>
      
      <View style={styles.txInfo}>
        <AppText style={[styles.txDesc, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.description || item.note || item.type}
        </AppText>
        <AppText style={[styles.txDate, { color: colors.textSecondary }]}>
          {new Date(item.timestamp || item.createdAt || '').toLocaleString('vi-VN')}
        </AppText>
        {item.counterpartyName && (
          <AppText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
            {item.counterpartyName} {item.counterpartyBankName ? `(${item.counterpartyBankName})` : ''} - {item.counterpartyAccount || item.referenceId || ''}
          </AppText>
        )}
      </View>

      <View style={styles.txAmountCol}>
        <AppText style={[styles.txAmount, { color: amountColor }]}>
          {amountPrefix}{item.amount.toLocaleString('vi-VN')} {item.currency || 'VND'}
        </AppText>
        {item.runningBalance !== undefined && (
          <AppText style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'right' }}>
            SD: {item.runningBalance.toLocaleString('vi-VN')}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function TransactionHistoryScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { wallet } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT' | 'BILL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (wallet?.walletId) {
      loadTransactions(0, true);
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [wallet?.walletId]);

  const loadTransactions = async (pageIndex: number, reset = false) => {
    if (!wallet?.walletId) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    
    if (reset) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const res = await WalletApi.getTransactionHistory(wallet.walletId, pageIndex, 20);
      const data: any = res.data;
      const newItems = Array.isArray(data) ? data : (data?.content || []);
      if (newItems.length > 0) {
        if (reset) {
          setTransactions(newItems);
        } else {
          setTransactions(prev => [...prev, ...newItems]);
        }
      } else if (reset) {
        setTransactions([]);
      }
      setHasMore(Array.isArray(data) ? data.length >= 20 : !(data?.last ?? data?.isLast ?? false));
      setPage(pageIndex);
    } catch (error) {
      console.warn('Failed to load transactions:', error);
      if (reset) setTransactions([]);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const filteredTransactions = React.useMemo(() => {
    if (filterType === 'ALL') return transactions;
    if (filterType === 'IN') {
      return transactions.filter(t => ['DEPOSIT', 'TRANSFER_IN', 'REWARD'].includes(t.type));
    }
    if (filterType === 'OUT') {
      return transactions.filter(t => ['WITHDRAWAL', 'TRANSFER_OUT', 'TOPUP'].includes(t.type));
    }
    if (filterType === 'BILL') {
      return transactions.filter(t => t.type === 'BILL_PAYMENT' || t.type === 'TOPUP');
    }
    return transactions;
  }, [transactions, filterType]);

  const handleExport = async () => {
    if (!wallet?.walletId) {
      Alert.alert('Thông báo', 'Sao kê tài khoản đã được kết xuất và sẵn sàng tải về.');
      return;
    }
    setIsExporting(true);
    try {
      const url = WalletApi.exportStatement(wallet.walletId, 'pdf');
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết để tải file.');
      }
    } catch (error: any) {
      Alert.alert('Lỗi xuất sao kê', error.message || 'Không xác định');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTxPress = React.useCallback((item: Transaction) => {
    navigation.navigate('TransactionDetail', { 
      transactionId: item.transactionId || item.id,
      transaction: item,
    });
  }, [navigation]);

  const renderItem = React.useCallback(({ item }: { item: Transaction }) => {
    return <MemoizedTransactionItem item={item} onPress={() => handleTxPress(item)} />;
  }, [handleTxPress]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]} edges={['top']}>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.cardBackground} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <AppText style={[styles.headerTitle, { color: colors.primary }]}>Lịch sử giao dịch</AppText>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={isExporting}>
          {isExporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialCommunityIcons name="file-download-outline" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterTabsRow, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'IN', label: 'Tiền vào (+)' },
          { key: 'OUT', label: 'Tiền ra (-)' },
          { key: 'BILL', label: 'Hóa đơn' },
        ].map((tab) => {
          const isActive = filterType === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTabItem,
                isActive && [styles.filterTabItemActive, { backgroundColor: colors.badgePinkSoft, borderColor: colors.primary }]
              ]}
              onPress={() => setFilterType(tab.key as any)}
            >
              <AppText style={[
                styles.filterTabText,
                { color: isActive ? colors.primary : colors.textSecondary, fontWeight: isActive ? '700' : '500' }
              ]}>
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {isLoading && page === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item, index) => item.transactionId || item.id || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            onEndReached={() => {
              if (hasMore && !isLoading && !isFetchingMore) {
                loadTransactions(page + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
                  <Ionicons name="receipt-outline" size={38} color={colors.primary} />
                </View>
                <AppText style={[styles.emptyTitle, { color: colors.textPrimary }]}>Chưa có biến động giao dịch</AppText>
                <AppText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {filterType === 'ALL'
                    ? 'Mọi biến động nạp, rút, chuyển khoản hoặc thanh toán hóa đơn của bạn sẽ được lưu vết an toàn tại đây.'
                    : 'Không tìm thấy giao dịch nào phù hợp với bộ lọc này.'}
                </AppText>
                {filterType === 'ALL' && (
                  <TouchableOpacity
                    style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('ChooseRecipient')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <AppText style={styles.emptyActionText}>Chuyển tiền ngay</AppText>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  exportBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  filterTabItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabItemActive: {
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 13,
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 40,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  txDesc: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 13,
    color: '#64748B',
  },
  txAmountCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  txStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
