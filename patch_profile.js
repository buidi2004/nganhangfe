const fs = require('fs');
let content = fs.readFileSync('src/screens/UserProfileScreen.tsx', 'utf8');

// Add useState, useEffect imports
content = content.replace(
    /import React from 'react';/,
    "import React, { useState, useEffect } from 'react';"
);

// Add WalletApi import
content = content.replace(
    /import \{ useApp \} from '\.\.\/context\/AppContext';/,
    "import { useApp } from '../context/AppContext';\nimport { WalletApi } from '../services/api';"
);

// Add state and effect
const searchState = `export default function UserProfileScreen({ navigation }: any) {
  const { user, logout, updateAvatar } = useApp();`;
const replaceState = `export default function UserProfileScreen({ navigation }: any) {
  const { user, logout, updateAvatar } = useApp();
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
content = content.replace(searchState, replaceState);

// Replace render
content = content.replace(
    /<AppText style=\{styles\.userNameText\}>\{user\?\.name \|\| 'TAm ng\?\?i dA1ng'\}<\/AppText>/,
    "<AppText style={styles.userNameText}>{realName}</AppText>"
);
content = content.replace(
    /<AppText style=\{styles\.userNameText\}>\{user\?\.name \|\| 'Tên người dùng'\}<\/AppText>/,
    "<AppText style={styles.userNameText}>{realName}</AppText>"
);
content = content.replace(
    /<AppText style=\{styles\.userNameText\}>\{user\?\.name \|\| '.*?'\}<\/AppText>/,
    "<AppText style={styles.userNameText}>{realName}</AppText>"
);


fs.writeFileSync('src/screens/UserProfileScreen.tsx', content, 'utf8');
