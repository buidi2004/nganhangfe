const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf8');

content = content.replace(
    /try \{\s*const fs = require\('fs'\);\s*fs\.writeFileSync\('\/sdcard\/Download\/token\.txt', authToken, 'utf8'\);\s*\} catch \(e\) \{\}/,
    ''
);

fs.writeFileSync('src/services/api.ts', content, 'utf8');
