const fs = require('fs');
let content = fs.readFileSync('src/screens/NotificationsScreen.tsx', 'utf8');

// Insert renderNotificationBody function before the return statement of NotificationsScreen
const renderFunc = `
  const renderNotificationBody = (body: string) => {
    if (!body.includes('Tài khoản:') && !body.includes('PS:')) {
      return <AppText style={styles.itemBodyText}>{body}</AppText>;
    }
    const lines = body.split('\\n');
    return (
      <View style={{ marginTop: 4, marginBottom: 4 }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          let color = '#475569';
          let fontWeight = '500';
          if (line.startsWith('PS: +')) {
            color = '#10B981'; // Green
            fontWeight = '700';
          } else if (line.startsWith('PS: -')) {
            color = '#EF4444'; // Red
            fontWeight = '700';
          } else if (line.startsWith('Số dư cuối:')) {
            fontWeight = '700';
          }
          return (
            <AppText key={idx} style={{ fontSize: 13, color, lineHeight: 18, fontWeight: fontWeight as any }}>
              {line}
            </AppText>
          );
        })}
      </View>
    );
  };

  return (
`;

content = content.replace(/  return \(\s*<SafeAreaView/, renderFunc + '    <SafeAreaView');
content = content.replace(/<AppText style=\{styles\.itemBodyText\}>\{item\.body\}<\/AppText>/g, '{renderNotificationBody(item.body)}');

fs.writeFileSync('src/screens/NotificationsScreen.tsx', content, 'utf8');
