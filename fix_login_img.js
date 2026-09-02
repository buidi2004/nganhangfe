
const fs = require("fs");
const file = "src/screens/LoginScreen.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace("  Image,\n", "");
content = content.replace("  Dimensions,\n  StatusBar,\n  ScrollView,", "  Dimensions,\n  StatusBar,\n  ScrollView,\n  ActivityIndicator,\n  Alert,\n  ImageBackground,");
content = content.replace("import { ActivityIndicator, Alert, ImageBackground } from " + String.fromCharCode(39) + "react-native" + String.fromCharCode(39) + ";\n", "");

if (!content.includes("expo-image")) {
    content = content.replace("import { SafeAreaView }", "import { Image } from " + String.fromCharCode(39) + "expo-image" + String.fromCharCode(39) + ";\nimport { SafeAreaView }");
}

content = content.replace("<Image \n              source={require(" + String.fromCharCode(39) + "../../assets/icon.png" + String.fromCharCode(39) + ")} \n              style={styles.customAppLogo} \n              resizeMode=" + String.fromCharCode(34) + "contain" + String.fromCharCode(34) + " \n            />", "<Image \n              source={require(" + String.fromCharCode(39) + "../../assets/icon.png" + String.fromCharCode(39) + ")} \n              style={styles.customAppLogo} \n              contentFit=" + String.fromCharCode(34) + "contain" + String.fromCharCode(34) + " \n              cachePolicy=" + String.fromCharCode(34) + "memory-disk" + String.fromCharCode(34) + "\n            />");

fs.writeFileSync(file, content, "utf8");
console.log("Updated LoginScreen");

