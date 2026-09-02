const fs = require('fs');
let content = fs.readFileSync('src/services/api.ts', 'utf8');

// Add DeviceEventEmitter import if not present
if (!content.includes('DeviceEventEmitter')) {
    content = content.replace(
        /let authToken: string \| null = null;/,
        "import { DeviceEventEmitter } from 'react-native';\nlet authToken: string | null = null;"
    );
}

// Replace the response.json() part
const search = `    const json = await response.json();`;

const replace = `
    let json;
    try {
      const text = await response.text();
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      if (response.status === 401) {
        DeviceEventEmitter.emit('forceLogout');
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new Error(\`Lỗi phản hồi từ server (\${response.status})\`);
    }

    if (response.status === 401) {
      DeviceEventEmitter.emit('forceLogout');
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
`;

if (!content.includes('DeviceEventEmitter.emit(\'forceLogout\')')) {
    content = content.replace(search, replace);
}

fs.writeFileSync('src/services/api.ts', content, 'utf8');
