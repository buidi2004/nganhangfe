const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

content = content.replace(
    /else if \(it\.type === 'WITHDRAWAL' \|\| displayTitle\.includes\('WITHDRAWAL'\)\) displayTitle = displayTitle\.replace\('WITHDRAWAL', 'Rút tiền'\);/,
    `else if (it.type === 'WITHDRAWAL' || displayTitle.includes('WITHDRAWAL')) displayTitle = displayTitle.replace('WITHDRAWAL', 'Rút tiền');
          else if (it.type === 'BILL_PAYMENT') displayTitle = 'Thanh toán hóa đơn';
          else if (it.type === 'TOPUP') displayTitle = 'Nạp tiền điện thoại';`
);

fs.writeFileSync('src/screens/NotificationsScreen.tsx', content, 'utf8');
