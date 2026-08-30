import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ScanQRScreen from "../screens/ScanQRScreen";
import PromotionsScreen from "../screens/PromotionsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { GlassBottomNavbar } from "../components/GlassBottomNavbar";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

function GlassTabBar(props: BottomTabBarProps) {
  return <GlassBottomNavbar {...props} />;
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { paddingBottom: 100 } }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Trang chu" }} />
      <Tab.Screen name="Card" component={HistoryScreen} options={{ title: "Lich su" }} />
      <Tab.Screen name="QR" component={ScanQRScreen} options={{ tabBarStyle: { display: "none" } }} />
      <Tab.Screen name="Gift" component={PromotionsScreen} options={{ title: "Uu dai" }} />
      <Tab.Screen name="More" component={ProfileScreen} options={{ title: "Ca nhan" }} />
    </Tab.Navigator>
  );
}