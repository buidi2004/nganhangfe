
const fs = require("fs");
const file = "src/screens/HomeScreen.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(/resizeMode=["'"]cover["'"]/g, "contentFit=" + String.fromCharCode(34) + "cover" + String.fromCharCode(34));
content = content.replace(/resizeMode=["'"]contain["'"]/g, "contentFit=" + String.fromCharCode(34) + "contain" + String.fromCharCode(34));
content = content.replace(/resizeMode=["'"]stretch["'"]/g, "contentFit=" + String.fromCharCode(34) + "fill" + String.fromCharCode(34));
content = content.replace(/resizeMode=["'"]center["'"]/g, "contentFit=" + String.fromCharCode(34) + "none" + String.fromCharCode(34));
content = content.replace(/<Image /g, "<Image cachePolicy=" + String.fromCharCode(34) + "memory-disk" + String.fromCharCode(34) + " ");

fs.writeFileSync(file, content, "utf8");

