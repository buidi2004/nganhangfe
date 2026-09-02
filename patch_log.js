const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

if (!content.includes('console.log(\'Raw notif:\'')) {
    content = content.replace(
        /const rawItems = res\.data\?\.content \|\| res\.data \|\| \[\];/,
        `const rawItems = res.data?.content || res.data || [];
        console.log('Raw notif:', JSON.stringify(rawItems[0]));`
    );
    fs.writeFileSync('src/screens/NotificationsScreen.tsx', content, 'utf8');
}
