const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
    /else if \(msg\.type === 'WITHDRAWAL'\) notifTitle = '🔴 Rút tiền';/,
    `else if (msg.type === 'WITHDRAWAL') notifTitle = '🔴 Rút tiền';
                else if (msg.type === 'BILL_PAYMENT') notifTitle = '🔴 Thanh toán hóa đơn';
                else if (msg.type === 'TOPUP') notifTitle = '🔴 Nạp tiền điện thoại';`
);

fs.writeFileSync('src/context/AppContext.tsx', content, 'utf8');
