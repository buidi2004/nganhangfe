const fs = require('fs');
let content = fs.readFileSync('src/screens/EnterAmountScreen.tsx', 'utf8');

content = content.replace(
    /return bankList\.filter\(\s*\(b: BankItem\) => b\.shortName\.toLowerCase\(\)\.includes\(q\) \|\| b\.fullName\.toLowerCase\(\)\.includes\(q\)\s*\);/,
    `return bankList.filter(
      (b: BankItem) => (b.shortName || '').toLowerCase().includes(q) || (b.fullName || '').toLowerCase().includes(q)
    );`
);

fs.writeFileSync('src/screens/EnterAmountScreen.tsx', content, 'utf8');
