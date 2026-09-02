const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

// Replace the body rendering with JSON stringify of the entire object
content = content.replace(
    /body: it\.content \|\| it\.message \|\| '',/,
    `body: (it.content || it.message || '') + '\\n\\nRAW: ' + JSON.stringify(it),`
);

fs.writeFileSync('src/screens/NotificationsScreen.tsx', content, 'utf8');
