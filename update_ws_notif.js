const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const search = `                setNotifications(prev => [{
                  id: \`ws-\${Date.now()}\`,
                  title: msg.type === 'DEBIT' ? '🔴 Tiền ra' : '🟢 Tiền vào',
                  body: msg.message,
                  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  isUnread: true,
                  type: msg.type,
                }, ...prev]);
                
                // Bắn luôn thông báo Push Notification Native ra ngoài màn hình
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: msg.type === 'DEBIT' ? '🔴 Biến động số dư' : '🟢 Tiền vào tài khoản',`;

const replace = `
                let notifTitle = 'Thông báo';
                if (msg.type === 'TRANSFER_IN' || msg.type === 'CREDIT' || msg.title?.includes('TRANSFER_IN')) notifTitle = '🟢 Nhận tiền';
                else if (msg.type === 'TRANSFER_OUT' || msg.type === 'DEBIT' || msg.title?.includes('TRANSFER_OUT')) notifTitle = '🔴 Chuyển tiền';
                else if (msg.type === 'DEPOSIT') notifTitle = '🟢 Nạp tiền';
                else if (msg.type === 'WITHDRAWAL') notifTitle = '🔴 Rút tiền';

                setNotifications(prev => [{
                  id: \`ws-\${Date.now()}\`,
                  title: notifTitle,
                  body: msg.message || msg.content || '',
                  time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  isUnread: true,
                  type: msg.type,
                }, ...prev]);
                
                // Bắn luôn thông báo Push Notification Native ra ngoài màn hình
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: \`Biến động số dư: \${notifTitle.replace(/🟢 |🔴 /g, '')}\`,
`;

// Regex to replace properly in case of small encoding differences
content = content.replace(/setNotifications\(prev => \[\{[\s\S]*?title: msg\.type === 'DEBIT' \? '🔴 Biến động số dư' : '🟢 Tiền vào tài khoản',/, replace);

fs.writeFileSync('src/context/AppContext.tsx', content, 'utf8');
