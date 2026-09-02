const fs = require('fs');
let content = fs.readFileSync('src/screens/ConfirmTransferScreen.tsx', 'utf8');

// Replace navigation in handleKeyPress
content = content.replace(
    /navigation\.navigate\('TransferResult', \{\s*success: true,\s*amount: displayAmount,\s*recipient,\s*selectedBank,\s*notes,\s*transactionId: initRes\.data\.transactionId,\s*timestamp: new Date\(\)\.toISOString\(\),\s*\}\);/,
    `navigation.navigate('TransferResult', {
            success: true,
            receipt: confirmRes.data,
          });`
);

// Replace biometric mock
content = content.replace(
    /setTimeout\(\(\) => \{\s*setIsOtpModalVisible\(false\);\s*navigation\.navigate\('TransferResult', \{\s*success: true,\s*amount: displayAmount,\s*recipient,\s*selectedBank,\s*notes,\s*\}\);\s*\}, 250\);/,
    `// MOCK BIOMETRIC BY FORCING PIN SUBMIT
                              setTimeout(() => {
                                handleKeyPress('1');
                                handleKeyPress('2');
                                handleKeyPress('3');
                                handleKeyPress('4');
                                handleKeyPress('5');
                                handleKeyPress('6');
                              }, 100);`
);

fs.writeFileSync('src/screens/ConfirmTransferScreen.tsx', content, 'utf8');
