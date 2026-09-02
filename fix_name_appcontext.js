const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace(
    /name: d\.fullName \|\| realName,/,
    "name: d.fullName || d.name || realName,"
);

content = content.replace(
    /if \(meRes\.data\?\.fullName\) \{\s*realName = meRes\.data\.fullName;\s*\}/,
    `if (meRes.data?.fullName) {
              realName = meRes.data.fullName;
            } else if (meRes.data?.name) {
              realName = meRes.data.name;
            }`
);

fs.writeFileSync('src/context/AppContext.tsx', content, 'utf8');
