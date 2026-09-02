const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf8');

content = content.replace(
    /\{ userId: string; fullName: string; email: string; dob: string; avatarUrl: string; kycStatus: string \}/,
    "{ userId: string; fullName: string; name?: string; email: string; dob: string; avatarUrl: string; kycStatus: string }"
);

fs.writeFileSync('src/services/api.ts', content, 'utf8');
