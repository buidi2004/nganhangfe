const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf8');

content = content.replace(
    /body: JSON\.stringify\(\{ requestId: generateUUID\(\), sourceWalletId, targetWalletId, bankCode, amount, currency, note \}\)/,
    "body: JSON.stringify({ requestId: generateUUID(), sourceWalletId, targetWalletId, bankCode: bankCode || 'SENHONG', amount, currency, note })"
);

fs.writeFileSync('src/services/api.ts', content, 'utf8');
