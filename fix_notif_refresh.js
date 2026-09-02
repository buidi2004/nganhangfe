const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

// Ensure useFocusEffect is imported
if (!content.includes('useFocusEffect')) {
    content = content.replace(
        /import React, \{ useState, useMemo \} from 'react';/,
        "import React, { useState, useMemo, useCallback } from 'react';\nimport { useFocusEffect } from '@react-navigation/native';"
    );
}

// Replace React.useEffect with useFocusEffect
content = content.replace(
    /React\.useEffect\(\(\) => \{([\s\S]*?)\}, \[activeTab\]\);/m,
    `useFocusEffect(
    useCallback(() => {
      let isActive = true;
$1
      return () => { isActive = false; };
    }, [activeTab])
  );`
);

// We must also handle isActive inside fetchNotifs if we want to be safe, but just replacing it is fine since fetchNotifs updates state unconditionally for now.
// Actually, let's just do a simpler replacement
