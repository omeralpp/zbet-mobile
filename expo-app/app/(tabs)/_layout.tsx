import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { Platform, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function tabIcon(name: IconName) {
  return function TabIcon({
    color,
    size
  }: {
    color: ColorValue;
    size: number;
  }) {
    return <MaterialCommunityIcons color={color} name={name} size={size} />;
  };
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => undefined);
          }
        }
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 58 + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
          borderTopColor: colors.border,
          backgroundColor: colors.backgroundElevated
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Özet",
          tabBarIcon: tabIcon("view-dashboard-outline")
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: "Canlı",
          tabBarIcon: tabIcon("soccer")
        }}
      />
      <Tabs.Screen
        name="super"
        options={{
          title: "Super",
          tabBarIcon: tabIcon("star-outline")
        }}
      />
      <Tabs.Screen
        name="toto"
        options={{
          title: "Toto",
          tabBarIcon: tabIcon("ticket-confirmation-outline")
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Daha Fazla",
          tabBarIcon: tabIcon("dots-horizontal-circle-outline")
        }}
      />
    </Tabs>
  );
}
