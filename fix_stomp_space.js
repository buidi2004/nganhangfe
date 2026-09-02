const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
    /Authorization:Bearer \$\{token\}/,
    'Authorization: Bearer ${token}'
);

fs.writeFileSync('src/context/AppContext.tsx', content, 'utf8');
