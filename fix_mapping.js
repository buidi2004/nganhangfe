const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

const search = `          let displayTitle = it.title || '';
          if (displayTitle.includes('TRANSFER')) displayTitle = displayTitle.replace('TRANSFER', 'Chuyn ti?n');
          else if (displayTitle.includes('DEPOSIT')) displayTitle = displayTitle.replace('DEPOSIT', 'Np ti?n');
          else if (displayTitle.includes('WITHDRAWAL')) displayTitle = displayTitle.replace('WITHDRAWAL', 'RAt ti?n');

          grouped[dateStr].push({
            id: it.id,
            title: displayTitle,
            body: it.content || it.message || '',`;

const replace = `          let displayTitle = it.title || '';
          const bodyStr = it.content || it.message || '';
          
          if (displayTitle.includes('TRANSFER')) {
            if (bodyStr.includes('PS: +')) {
              displayTitle = displayTitle.replace('TRANSFER', 'Nhận tiền');
            } else {
              displayTitle = displayTitle.replace('TRANSFER', 'Chuyển tiền');
            }
          }
          else if (displayTitle.includes('DEPOSIT')) displayTitle = displayTitle.replace('DEPOSIT', 'Nạp tiền');
          else if (displayTitle.includes('WITHDRAWAL')) displayTitle = displayTitle.replace('WITHDRAWAL', 'Rút tiền');

          grouped[dateStr].push({
            id: it.id,
            title: displayTitle,
            body: bodyStr.replace(/RAW: .*/g, '').trim(),`;

// Regex replacement because of encoding characters in Vietnamese
content = content.replace(/          let displayTitle = it\.title \|\| '';[\s\S]*?body: it\.content \|\| it\.message \|\| '',/, replace);

fs.writeFileSync('src/screens/NotificationsScreen.tsx', content, 'utf8');
