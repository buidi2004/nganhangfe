const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Ensure DeviceEventEmitter is imported
if (!content.includes('DeviceEventEmitter')) {
    content = content.replace(
        /import \{ AppState, AppStateStatus, Platform \} from 'react-native';/,
        "import { AppState, AppStateStatus, Platform, DeviceEventEmitter } from 'react-native';"
    );
}

// Add the listener inside the AppProvider
const search = `  const authValue = React.useMemo<AuthContextValue>(() => ({`;
const replace = `
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('forceLogout', () => {
      logout();
    });
    return () => sub.remove();
  }, [logout]);

  const authValue = React.useMemo<AuthContextValue>(() => ({`;

if (!content.includes('DeviceEventEmitter.addListener(\'forceLogout\'')) {
    content = content.replace(search, replace);
}

fs.writeFileSync('src/context/AppContext.tsx', content, 'utf8');
