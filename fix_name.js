const fs = require('fs');
let content = fs.readFileSync('src/screens/HomeScreen.tsx', 'utf8');

content = content.replace(
    /\{user\?\.name \? user\.name\.split\(' '\)\.pop\(\) : 'Bn'\}/,
    `{user?.name || 'Bạn'}`
);

// If the previous regex fails due to encoding issues with the fallback string:
content = content.replace(
    /\{user\?\.name \? user\.name\.split\(' '\)\.pop\(\) : '.*?'\}/,
    `{user?.name || 'Bạn'}`
);

fs.writeFileSync('src/screens/HomeScreen.tsx', content, 'utf8');
