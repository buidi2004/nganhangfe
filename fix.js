const fs = require('fs');
let content = fs.readFileSync('src/screens/TransferResultScreen.tsx', 'utf8');

content = content.replace(
    /\$\{recipient\?\.name \|\| 'Ng.*?'\}/,
    '${recipientName}'
);

content = content.replace(
    /const sbLower = selectedBank\.toLowerCase\(\);/,
    'const sbLower = cleanBankName.toLowerCase();'
);

fs.writeFileSync('src/screens/TransferResultScreen.tsx', content, 'utf8');
