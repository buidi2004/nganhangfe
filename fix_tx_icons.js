const fs = require('fs');
let content = fs.readFileSync('src/screens/TransactionHistoryScreen.tsx', 'utf8');

content = content.replace(
    /\} else if \(item\.type\.includes\('TRANSFER'\)\) \{/,
    `} else if (item.type === 'BILL_PAYMENT') {
    typeIcon = 'receipt-outline';
    iconBg = '#FEF3C7';
    iconColor = '#D97706';
  } else if (item.type === 'TOPUP') {
    typeIcon = 'phone-portrait-outline';
    iconBg = '#F3E8FF';
    iconColor = '#9333EA';
  } else if (item.type.includes('TRANSFER')) {`
);

fs.writeFileSync('src/screens/TransactionHistoryScreen.tsx', content, 'utf8');
