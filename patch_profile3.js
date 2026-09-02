const fs = require('fs');
let content = fs.readFileSync('src/screens/UserProfileScreen.tsx', 'utf8');

const anchor = "const { user, updateAvatar } = useApp();";
const toInsert = `
  const [realName, setRealName] = useState(user?.name || 'Tên người dùng');

  useEffect(() => {
    setRealName(user?.name || 'Tên người dùng');
    if (user?.name === user?.phoneNumber || user?.name === 'Tên người dùng') {
      WalletApi.getMe().then(res => {
        if (res.data?.fullName) setRealName(res.data.fullName);
        else if (res.data?.name) setRealName(res.data.name);
      }).catch(() => {});
    }
  }, [user]);
`;

if (!content.includes('const [realName')) {
  content = content.replace(anchor, anchor + toInsert);
}

fs.writeFileSync('src/screens/UserProfileScreen.tsx', content, 'utf8');
