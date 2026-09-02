const fs = require('fs');
let content = fs.readFileSync('src/screens/ConfirmTransferScreen.tsx', 'utf8');

content = content.replace(
    /setTimeout\(\(\) => \{\s*handleKeyPress\('1'\);\s*handleKeyPress\('2'\);\s*handleKeyPress\('3'\);\s*handleKeyPress\('4'\);\s*handleKeyPress\('5'\);\s*handleKeyPress\('6'\);\s*\}, 100\);/,
    `setTimeout(() => {
                                setPinDigits(['1', '2', '3', '4', '5', '6']);
                                submitPin('123456');
                              }, 100);`
);

fs.writeFileSync('src/screens/ConfirmTransferScreen.tsx', content, 'utf8');
