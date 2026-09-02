const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

const replaceStr = `          if (it.type === 'TRANSFER_IN' || displayTitle.includes('TRANSFER_IN')) displayTitle = displayTitle.replace('TRANSFER_IN', 'Nhận tiền');
          else if (it.type === 'TRANSFER_OUT' || displayTitle.includes('TRANSFER_OUT')) displayTitle = displayTitle.replace('TRANSFER_OUT', 'Chuyển tiền');
          else if (it.type === 'DEPOSIT' || displayTitle.includes('DEPOSIT')) displayTitle = displayTitle.replace('DEPOSIT', 'Nạp tiền');
          else if (it.type === 'WITHDRAWAL' || displayTitle.includes('WITHDRAWAL')) displayTitle = displayTitle.replace('WITHDRAWAL', 'Rút tiền');
          else if (it.type === 'BILL_PAYMENT' || displayTitle.includes('BILL_PAYMENT')) displayTitle = displayTitle.replace('BILL_PAYMENT', 'Thanh toán hóa đơn');
          else if (it.type === 'TOPUP' || displayTitle.includes('TOPUP')) displayTitle = displayTitle.replace('TOPUP', 'Nạp tiền điện thoại');
          else if (displayTitle.includes('TRANSFER')) {
             if (bodyStr.includes('PS: +')) displayTitle = displayTitle.replace('TRANSFER', 'Nhận tiền');
             else displayTitle = displayTitle.replace('TRANSFER', 'Chuyển tiền');
          }`;

content = content.replace(
    /if \(it\.type === 'TRANSFER_IN'\) displayTitle = 'Nhận tiền';[\s\S]*?else displayTitle = displayTitle\.replace\('TRANSFER', 'Chuyển tiền'\);\n          \}/,
    replaceStr
);

fs.writeFileSync('src/screens/NotificationsScreen.tsx', content, 'utf8');
