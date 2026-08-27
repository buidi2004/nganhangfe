import React, { useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LiquidGlassView } from "react-native-liquid-glassmorphism";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ScanQRScreen from "../screens/ScanQRScreen";
import PromotionsScreen from "../screens/PromotionsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const TABS = [
  { name: "HomeTab", label: "Trang chu", icon: "home-outline", iconFocused: "home", lib: "Ionicons" },
  { name: "Card", label: "Lich su", icon: "credit-card-multiple-outline", iconFocused: "credit-card-multiple", lib: "MaterialCommunityIcons" },
  { name: "QR", label: "", icon: "qrcode-scan", iconFocused: "qrcode-scan", lib: "MaterialCommunityIcons", isCenter: true },
  { name: "Gift", label: "Uu dai", icon: "gift-outline", iconFocused: "gift", lib: "Ionicons" },
  { name: "More", label: "Ca nhan", icon: "account-outline", iconFocused: "account", lib: "MaterialCommunityIcons" },
];

function GlassTabBar({ state, navigation }: { state: any; navigation: any }) {
  const focusedDescriptor = Object.values(Object.fromEntries(
    state.routes.map((r: any) => [r.key, r])
  ))[state.index];

  const handlePress = useCallback(
    (route: any, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation]
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.shadowContainer} pointerEvents="box-none">
        <LiquidGlassView
          preset="floatingTabBar"
          // 1. ĐỘ TRONG SUỐT / ĐỤC CỦA CHẤT KÍNH:
          // Dùng "regular" nếu muốn kính đục mờ (frosted). Dùng "clear" nếu muốn kính trong vắt.
          variant="clear"

          // 2. CHỈNH MÀU SẮC VÀ ĐỘ MỜ CỦA LỚP KÍNH:
          // Thay đổi số cuối cùng (0.12) để chỉnh độ trong suốt. 
          // Tăng lên (vd: 0.3, 0.5) kính sẽ đặc màu hồng hơn và bớt trong suốt. 
          // Giảm xuống (vd: 0.05, 0.0) kính sẽ trong suốt hoàn toàn.
          tintColor="rgba(210,81,157,0.12)"

          // 3. LÀM TỐI NỀN PHÍA SAU KÍNH:
          // Chỉnh số (0.05) này. Tăng lên 0.2, 0.3 nền đằng sau sẽ tối đen lại giúp kính nổi bật hơn.
          dim={0.15}

          // 4. BÍ QUYẾT TẠO CHIỀU SÂU SIÊU THỰC TRÊN NỀN TRẮNG PHẲNG (DÀNH RIÊNG CHO ANDROID):
          grain={0.08} // Thêm hạt nhiễu li ti (film grain) để mặt kính có chất liệu vật lý thay vì phẳng lì.
          iridescence={0.35} // Tán sắc ánh sáng (cầu vồng) ở viền kính. Tạo độ khối cực kỳ mạnh dù không có nền.
          ior={2.0} // Chỉ số khúc xạ (Index of Refraction). Tăng lên 2.0 (gần bằng kim cương) để gờ kính bẻ cong gắt hơn.
          edgeReflectionStrength={1.5} // Kéo mạnh độ phản chiếu ngược ở mép kính.
          specularSharpness={2} // Thu hẹp điểm bắt sáng (specular hotspot) giúp kính trông như được đánh bóng loáng.

          interactive
          tilt={true}
          thickness={15}
          blurRadius={15}
          borderRadius={BAR_HEIGHT / 2}
          onPipelineReady={(e) => console.log("GLASS TIER:", e.nativeEvent.tier)}
          style={styles.pillContent}
        >
          {/* Subtle diagonal glass shine overlay to make it look like a physical glass surface */}
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.1)']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Subtle inner border */}
          <View style={styles.innerBorder} pointerEvents="none" />

          {/* Tab buttons rendered as children so they are crisp */}
          <View style={styles.tabRow}>
            {state.routes.map((route: any, index: number) => {
              const isFocused = state.index === index;
              const tabDef = TABS[index] || TABS[0];
              const IconComp =
                tabDef.lib === "Ionicons" ? Ionicons : MaterialCommunityIcons;
              const iconName = isFocused ? tabDef.iconFocused : tabDef.icon;

              if (tabDef.isCenter) {
                return (
                  <TouchableOpacity
                    key={route.key}
                    style={styles.centerBtn}
                    onPress={() => handlePress(route, isFocused)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <LinearGradient
                      colors={["#D2519D", "#700F43"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.centerCircle}
                    >
                      <IconComp name={iconName as any} size={26} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.tabItem}
                  onPress={() => handlePress(route, isFocused)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      isFocused && styles.iconWrapActive,
                    ]}
                  >
                    <IconComp
                      name={iconName as any}
                      size={22}
                      color={isFocused ? "#D2519D" : "#8E8E93"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.label,
                      { color: isFocused ? "#D2519D" : "#8E8E93" },
                      isFocused && styles.labelFocused,
                    ]}
                  >
                    {tabDef.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LiquidGlassView>
      </View>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Trang chu" }} />
      <Tab.Screen name="Card" component={HistoryScreen} options={{ title: "Lich su" }} />
      <Tab.Screen name="QR" component={ScanQRScreen} options={{ tabBarStyle: { display: "none" } }} />
      <Tab.Screen name="Gift" component={PromotionsScreen} options={{ title: "Uu dai" }} />
      <Tab.Screen name="More" component={ProfileScreen} options={{ title: "Ca nhan" }} />
    </Tab.Navigator>
  );
}

const BAR_HEIGHT = 64;
const BOTTOM = Platform.OS === "ios" ? 24 : 8;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: BOTTOM,
    left: 16,
    right: 16,
    height: BAR_HEIGHT + 12, // extra for QR button overflow
    alignItems: "center",
    justifyContent: "flex-end",
  },
  shadowContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    shadowColor: "#D2519D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  pillContent: {
    height: BAR_HEIGHT,
    width: "100%",
  },
  innerBorder: {
    ...StyleSheet.absoluteFill as any,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.2)",
    borderTopWidth: 1.5,
    borderTopColor: "rgba(255,255,255,0.95)", // Apple's Inner Highlight (bắt sáng cạnh trên)
  },
  tabRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: BAR_HEIGHT,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(210, 81, 157, 0.12)",
  },
  label: {
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.1,
    fontWeight: "600",
  },
  labelFocused: {
    fontWeight: "800",
  },
  centerBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    bottom: 6,
    zIndex: 15,
    elevation: 15,
    shadowColor: "transparent",
  },
  centerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
});