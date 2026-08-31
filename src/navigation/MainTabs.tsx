import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DeviceEventEmitter, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import CardsScreen from "../screens/CardsScreen";
import ScanQRScreen from "../screens/ScanQRScreen";
import PromotionsScreen from "../screens/PromotionsScreen";
import { GlassBottomNavbar } from "../components/GlassBottomNavbar";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SideMenuDrawer } from "../components/SideMenuDrawer";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

function GlassTabBar(props: BottomTabBarProps) {
  return <GlassBottomNavbar {...props} />;
}

export default function MainTabs() {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('openSideMenu', () => {
      setMenuVisible(true);
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <GlassTabBar {...props} />}
        screenOptions={{ 
          headerShown: false, 
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          }
        }}
      >
        <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Trang chu" }} />
        <Tab.Screen name="Card" component={CardsScreen} options={{ title: "The" }} />
        <Tab.Screen name="QR" component={ScanQRScreen} options={{ tabBarStyle: { display: "none" } }} />
        <Tab.Screen name="Gift" component={PromotionsScreen} options={{ title: "Uu dai" }} />
        <Tab.Screen 
          name="Menu" 
          component={HomeScreen} // Dummy component, never actually rendered
          options={{ title: "Menu" }} 
          listeners={{
            tabPress: (e) => {
              // Prevent default action (navigation)
              e.preventDefault();
              // Emit event to open side menu drawer globally
              DeviceEventEmitter.emit('openSideMenu');
            },
          }}
        />
      </Tab.Navigator>

      <SideMenuDrawer 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
        navigation={navigation} 
      />
    </View>
  );
}