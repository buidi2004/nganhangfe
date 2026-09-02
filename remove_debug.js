const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

// Remove the RAW injection that I added previously
content = content.replace(/ \+ '\\n\\nRAW: ' \+ JSON\.stringify\(it\)/g, '');
content = content.replace(/body: bodyStr\.replace\(\/RAW: \.\*\/g, ''\)\.trim\(\),/g, 'body: bodyStr,');

fs.writeFileSync('src/screens/NotificationsScreen.tsx', content, 'utf8');
