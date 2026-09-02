const fs = require('fs');
let content = fs.readFileSync('src/screens/TransactionHistoryScreen.tsx', 'utf8');

content = content.replace(
    /onPress=\{\(\) => onPress\(item\.id\)\}/,
    "onPress={() => onPress(item.transactionId || item.id || '')}"
);

content = content.replace(
    /keyExtractor=\{\(item\) => item\.id\}/,
    "keyExtractor={(item, index) => item.transactionId || item.id || index.toString()}"
);

fs.writeFileSync('src/screens/TransactionHistoryScreen.tsx', content, 'utf8');
