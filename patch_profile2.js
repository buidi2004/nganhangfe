const fs = require('fs');
let content = fs.readFileSync('src/screens/UserProfileScreen.tsx', 'utf8');

// Ensure useEffect is imported
if (!content.includes('import React, { useState, useEffect } from')) {
    content = content.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
}

// Replace top of component
const search = `export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const { user, updateAvatar } = useApp();`;
const replace = `export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const { user, updateAvatar } = useApp();
  const [realName, setRealName] = useState(user?.name || 'Tên người dùng');

  useEffect(() => {
    setRealName(user?.name || 'Tên người dùng');
    if (user?.name === user?.phoneNumber || user?.name === 'Tên người dùng') {
      WalletApi.getMe().then(res => {
        if (res.data?.fullName) setRealName(res.data.fullName);
        else if (res.data?.name) setRealName(res.data.name);
      }).catch(() => {});
    }
  }, [user]);`;

content = content.replace(search, replace);
fs.writeFileSync('src/screens/UserProfileScreen.tsx', content, 'utf8');
