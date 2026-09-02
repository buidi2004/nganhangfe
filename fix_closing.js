
const fs = require("fs");
const file = "src/screens/HomeScreen.tsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace("</Svg>\n      </Animated.View>", "</Svg>\n      </Reanimated.View>");
fs.writeFileSync(file, content, "utf8");

