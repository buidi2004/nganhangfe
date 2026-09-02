const fs = require('fs');
let content = fs.readFileSync('src/screens/TransactionDetailScreen.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  /import React from 'react';/,
  "import React, { useState, useEffect } from 'react';"
);

content = content.replace(
  /import { useApp } from '\.\.\/context\/AppContext';/,
  "import { useApp } from '../context/AppContext';\nimport { WalletApi } from '../services/api';\nimport { ActivityIndicator, Alert } from 'react-native';"
);

// 2. Fetch Logic
const search2 = `  const { user } = useApp();
  const { transaction } = route.params || {};
  
  const isCredit = transaction?.type === 'DEPOSIT' || (transaction?.type === 'TRANSFER' && transaction?.targetWalletId === user?.walletId);
  const typeText = transaction?.type === 'DEPOSIT' ? 'Nạp tiền' : (transaction?.type === 'WITHDRAWAL' ? 'Rút tiền' : 'Chuyển tiền');
  const amountStr = \`\${isCredit ? '+' : '-'}\${transaction?.amount?.toLocaleString('vi-VN') || 0} đ\`;
  
  const txDateStr = transaction?.timestamp || transaction?.createdAt;
  const dateStr = txDateStr ? new Date(txDateStr).toLocaleString('vi-VN') : '—';
  
  const txId = transaction?.transactionId || transaction?.id || '—';`;

const replace2 = `  const { user } = useApp();
  const { transaction: initialTransaction, transactionId } = route.params || {};
  const [transaction, setTransaction] = useState(initialTransaction || null);
  const [isLoading, setIsLoading] = useState(!initialTransaction && !!transactionId);

  useEffect(() => {
    if (!initialTransaction && transactionId) {
      const fetchTx = async () => {
        try {
          const res = await WalletApi.getTransaction(transactionId);
          if (res.data) setTransaction(res.data);
        } catch (error: any) {
          Alert.alert('Lỗi', 'Không thể tải chi tiết giao dịch');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTx();
    }
  }, [initialTransaction, transactionId]);
  
  const isCredit = transaction?.type === 'DEPOSIT' || (transaction?.type === 'TRANSFER' && transaction?.targetWalletId === user?.walletId) || (transaction?.type === 'TRANSFER_IN');
  const typeText = transaction?.type === 'DEPOSIT' ? 'Nạp tiền' : (transaction?.type === 'WITHDRAWAL' ? 'Rút tiền' : 'Chuyển tiền');
  const amountStr = \`\${isCredit ? '+' : '-'}\${transaction?.amount?.toLocaleString('vi-VN') || 0} VND\`;
  
  const txDateStr = transaction?.timestamp || transaction?.createdAt;
  const dateStr = txDateStr ? new Date(txDateStr).toLocaleString('vi-VN') : '—';
  
  const txId = transaction?.transactionId || transaction?.id || '—';
  const feeStr = transaction?.feeAmount ? \`\${transaction.feeAmount.toLocaleString('vi-VN')} VND\` : 'Miễn phí';
  const runningBalanceStr = transaction?.runningBalance ? \`\${transaction.runningBalance.toLocaleString('vi-VN')} VND\` : '';`;

content = content.replace(/  const \{ user \} = useApp\(\);[\s\S]*?const txId = transaction\?\.transactionId \|\| transaction\?\.id \|\| '.*?';/, replace2);

// 3. Update Detail Card
const search3 = `          {[
            { label: 'Loại giao dịch', value: typeText },
            { label: 'Người nhận/Gửi', value: transaction?.targetWalletId || 'N/A' },
            { label: 'Số tiền', value: amountStr },
            { label: 'Thời gian', value: dateStr },
            { label: 'Mã giao dịch', value: txId },
            { label: 'Phí', value: transaction?.feeAmount ? \`\${transaction.feeAmount.toLocaleString('vi-VN')} đ\` : 'Miễn phí' },
          ].map((item, i) => (
            <View key={i} style={styles.detailRow}>
              <AppText style={styles.detailLabel}>{item.label}</AppText>
              <AppText style={[styles.detailValue, item.label === 'Số tiền' && styles.amountValue]}>
                {item.value}
              </AppText>
              {i < 5 && <View style={styles.divider} />}
            </View>
          ))}`;
const replace3 = `          {isLoading ? (
            <ActivityIndicator size="large" color="#D2519D" style={{ marginVertical: 40 }} />
          ) : (
            [
              { label: 'Loại giao dịch', value: typeText },
              { label: isCredit ? 'Người gửi' : 'Người nhận', value: transaction?.counterpartyName || transaction?.targetWalletId || 'N/A' },
              { label: 'Ngân hàng', value: transaction?.counterpartyBankName || (transaction?.isInternal ? 'SenBank' : '') },
              { label: 'Số tiền', value: amountStr },
              { label: 'Nội dung', value: transaction?.note || transaction?.description || 'N/A' },
              { label: 'Thời gian', value: dateStr },
              { label: 'Mã giao dịch', value: txId },
              { label: 'Phí', value: feeStr },
              { label: 'Số dư hiện tại', value: runningBalanceStr },
            ].filter(item => !!item.value).map((item, i, arr) => (
              <View key={i} style={styles.detailRow}>
                <AppText style={styles.detailLabel}>{item.label}</AppText>
                <AppText style={[
                  styles.detailValue, 
                  item.label === 'Số tiền' && styles.amountValue,
                  item.label === 'Số dư hiện tại' && { color: '#64748B' }
                ]}>
                  {item.value}
                </AppText>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          )}`;

content = content.replace(/          \{\[[\s\S]*?\}\)\}/, replace3);

fs.writeFileSync('src/screens/TransactionDetailScreen.tsx', content, 'utf8');
console.log('Done TransactionDetailScreen');
