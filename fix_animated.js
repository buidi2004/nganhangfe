
const fs = require("fs");
const file = "src/screens/HomeScreen.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace("Animated as RNAnimated,", "Animated,");
content = content.replace("import Animated, { \n  useSharedValue, ", "import Reanimated, { \n  useSharedValue, ");
content = content.replace("<Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>", "<Reanimated.View style={[StyleSheet.absoluteFill, animatedStyle]}>");
content = content.replace("</Animated.View>\n\n      {/* Icon kính lúp AI", "</Reanimated.View>\n\n      {/* Icon kính lúp AI");
fs.writeFileSync(file, content, "utf8");

