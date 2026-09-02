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
  const isPositive = ['DEPOSIT', 'TRANSFER_IN', 'REWARD'].includes(item.type);
  const amountPrefix = isPositive ? '+' : '-';
  const amountColor = isPositive ? '#10B981' : '#0F172A';
  
  let typeIcon = 'swap-horizontal';
  let iconBg = '#F1F5F9';
  let iconColor = '#64748B';

  if (item.type === 'DEPOSIT') {
    typeIcon = 'arrow-down';
    iconBg = '#DCFCE7';
    iconColor = '#10B981';
  } else if (item.type === 'WITHDRAWAL') {
    typeIcon = 'arrow-up';
    iconBg = '#FEE2E2';
    iconColor = '#EF4444';
  } else if (item.type === 'BILL_PAYMENT') {
    typeIcon = 'receipt-outline';
    iconBg = '#FEF3C7';
    iconColor = '#D97706';
  } else if (item.type === 'TOPUP') {
    typeIcon = 'phone-portrait-outline';
    iconBg = '#F3E8FF';
    iconColor = '#9333EA';
  } else if (item.type.includes('TRANSFER')) {
    typeIcon = 'swap-horizontal';
    iconBg = '#E0F2FE';
    iconColor = '#0EA5E9';
  }

  return (
    <TouchableOpacity 
      style={styles.txCard} 
      activeOpacity={0.7}
      onPress={() => onPress(item.transactionId || item.id || '')}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
        <Ionicons name={typeIcon as any} size={20} color={iconColor} />
      </View>
      
      <View style={styles.txInfo}>
        <AppText style={styles.txDesc} numberOfLines={1}>
          {item.description || item.note || item.type}
        </AppText>
        <AppText style={styles.txDate}>
          {new Date(item.timestamp || item.createdAt || '').toLocaleString('vi-VN')}
        </AppText>
        {item.counterpartyName && (
          <AppText style={{fontSize: 12, color: '#64748B', marginTop: 2}} numberOfLines={1}>
            {item.counterpartyName} {item.counterpartyBankName ? `(${item.counterpartyBankName})` : ''} - {item.counterpartyAccount || item.referenceId || ''}
          </AppText>
        )}
      </View>

      <View style={styles.txAmountCol}>
        <AppText style={[styles.txAmount, { color: amountColor }]}>
          {amountPrefix}{item.amount.toLocaleString('vi-VN')} {item.currency || 'VND'}
        </AppText>
        {item.runningBalance !== undefined && (
          <AppText style={{fontSize: 11, color: '#94A3B8', marginTop: 2, textAlign: 'right'}}>
            SD: {item.runningBalance.toLocaleString('vi-VN')}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function TransactionHistoryScreen({ navigation }: any) {
  const { wallet } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (wallet?.walletId) {
      loadTransactions(0, true);
    }
  }, [wallet?.walletId]);

  const loadTransactions = async (pageIndex: number, reset = false) => {
    if (!wallet?.walletId) return;
    
    if (reset) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const res = await WalletApi.getTransactionHistory(wallet.walletId, pageIndex, 20);
      const data: any = res.data;
      const newItems = Array.isArray(data) ? data : (data?.content || []);
      if (reset) {
        setTransactions(newItems);
      } else {
        setTransactions(prev => [...prev, ...newItems]);
      }
      setHasMore(Array.isArray(data) ? data.length >= 20 : !data?.isLast);
      setPage(pageIndex);
    } catch (error) {
      console.warn('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleExport = async () => {
    if (!wallet?.walletId) return;
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

  const handleTxPress = React.useCallback((id: string) => {
    navigation.navigate('TransactionDetail', { transactionId: id });
  }, [navigation]);

  const renderItem = React.useCallback(({ item }: { item: Transaction }) => {
    return <MemoizedTransactionItem item={item} onPress={handleTxPress} />;
  }, [handleTxPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Lịch sử giao dịch</AppText>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={isExporting}>
          {isExporting ? (
            <ActivityIndicator size="small" color="#D2519D" />
          ) : (
            <MaterialCommunityIcons name="file-download-outline" size={24} color="#D2519D" />
          )}
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {isLoading && page === 0 ? (
          <ActivityIndicator size="large" color="#D2519D" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={transactions}
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
                <Ionicons name="receipt-outline" size={48} color="#CBD5E1" style={{ marginBottom: 12 }} />
                <AppText style={styles.emptyText}>Chưa có giao dịch nào</AppText>
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
  },
  emptyText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#64748B',
  },
});
