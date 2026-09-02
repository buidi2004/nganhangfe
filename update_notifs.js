const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

const search = `          if (displayTitle.includes('TRANSFER')) {
            if (bodyStr.includes('PS: +')) {
              displayTitle = displayTitle.replace('TRANSFER', 'Nhận tiền');
            } else {
              displayTitle = displayTitle.replace('TRANSFER', 'Chuyển tiền');
            }
          }
          else if (displayTitle.includes('DEPOSIT')) displayTitle = displayTitle.replace('DEPOSIT', 'Nạp tiền');
          else if (displayTitle.includes('WITHDRAWAL')) displayTitle = displayTitle.replace('WITHDRAWAL', 'Rút tiền');`;

const replace = `          // Use type if available from the backend update
          if (it.type === 'TRANSFER_IN') displayTitle = 'Nhận tiền';
          else if (it.type === 'TRANSFER_OUT') displayTitle = 'Chuyển tiền';
          else if (it.type === 'DEPOSIT' || displayTitle.includes('DEPOSIT')) displayTitle = displayTitle.replace('DEPOSIT', 'Nạp tiền');
          else if (it.type === 'WITHDRAWAL' || displayTitle.includes('WITHDRAWAL')) displayTitle = displayTitle.replace('WITHDRAWAL', 'Rút tiền');
          else if (displayTitle.includes('TRANSFER')) {
             // Fallback just in case old data has TRANSFER
             if (bodyStr.includes('PS: +')) displayTitle = displayTitle.replace('TRANSFER', 'Nhận tiền');
             else displayTitle = displayTitle.replace('TRANSFER', 'Chuyển tiền');
          }`;

content = content.replace(search, replace);

fs.writeFileSync('src/screens/NotificationsScreen.tsx', content, 'utf8');
