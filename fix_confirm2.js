const fs = require('fs');
let content = fs.readFileSync('src/screens/ConfirmTransferScreen.tsx', 'utf8');

content = content.replace(
    /selectedBank,                          \/\/ bankCode/,
    "bankCode || 'SENHONG',                          // bankCode"
);

fs.writeFileSync('src/screens/ConfirmTransferScreen.tsx', content, 'utf8');
