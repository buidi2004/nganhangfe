
const fs = require("fs");
const file = "src/screens/PromotionsScreen.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace("styles.adBannerSubtitle", "styles.adBannerDesc");
fs.writeFileSync(file, content, "utf8");

