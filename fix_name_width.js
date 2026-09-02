const fs = require('fs');
let content = fs.readFileSync('src/screens/HomeScreen.tsx', 'utf8');

content = content.replace(
    /<AppText style=\{\{ color: Colors\.white, fontSize: 12, fontWeight: 'bold', marginTop: 4 \}\}>/g,
    `<AppText style={{ color: Colors.white, fontSize: 12, fontWeight: 'bold', marginTop: 4, maxWidth: 100, textAlign: 'center' }} numberOfLines={1} ellipsizeMode="tail">`
);

fs.writeFileSync('src/screens/HomeScreen.tsx', content, 'utf8');
