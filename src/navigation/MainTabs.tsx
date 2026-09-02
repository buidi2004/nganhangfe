import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DeviceEventEmitter, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import CardsScreen from "../screens/CardsScreen";
import ScanQRScreen from "../screens/ScanQRScreen";
import PromotionsScreen from "../screens/PromotionsScreen";
import MoreScreen from "../screens/MoreScreen";
import { GlassBottomNavbar } from "../components/GlassBottomNavbar";
import { SideMenuDrawer } from "../components/SideMenuDrawer";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

// Cấu hình chuyển cảnh mượt mà chuẩn ngân hàng hiện đại
const tabTransitionSpec = {
  animation: 'timing' as const,
  config: {
    duration: 260,
  },
};

// Hiệu ứng chuyển màn hình: Trượt ngang nhẹ kết hợp fade mờ ảo và phóng nhẹ
const forSmoothTabShift = ({ current }: { current: { progress: any } }) => {
  return {
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 0],
      }),
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-35, 0, 35],
          }),
        },
        {
          scale: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [0.97, 1, 0.97],
          }),
        },
      ],
    },
  };
};

function GlassTabBar(props: BottomTabBarProps) {
  return <GlassBottomNavbar {...props} />;
}

export default function MainTabs() {
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('openSideMenu', () => setMenuVisible(true));
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
        <Tab.Screen 
          name="HomeTab" 
          component={HomeScreen} 
          options={{ 
            title: "Trang chủ",
            transitionSpec: tabTransitionSpec,
            sceneStyleInterpolator: forSmoothTabShift,
          }} 
        />
        <Tab.Screen 
          name="Card" 
          component={CardsScreen} 
          options={{ 
            title: "Thẻ",
            transitionSpec: tabTransitionSpec,
            sceneStyleInterpolator: forSmoothTabShift,
          }} 
        />
        <Tab.Screen
          name="QR"
          component={ScanQRScreen}
          options={{ 
            tabBarStyle: { display: "none" },
            animation: 'none', // Trừ mã QR: mở tức thì không hoạt ảnh
          }}
        />
        <Tab.Screen 
          name="Gift" 
          component={PromotionsScreen} 
          options={{ 
            title: "Ưu đãi",
            transitionSpec: tabTransitionSpec,
            sceneStyleInterpolator: forSmoothTabShift,
          }} 
        />
        <Tab.Screen 
          name="Menu" 
          component={MoreScreen} 
          options={{ 
            title: "Menu",
            transitionSpec: tabTransitionSpec,
            sceneStyleInterpolator: forSmoothTabShift,
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
