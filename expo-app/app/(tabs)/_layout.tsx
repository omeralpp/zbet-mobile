import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { Platform, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, typeScale } from "@/src/theme/theme";

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

  // The horizontal tab gesture lives in `Screen` so the drag moves the screen
  // content with the finger and leaves the tab bar anchored. Keeping it out of
  // the navigator also stops a capture responder from sitting above every list.
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
        animation: "shift",
        // The navigator paints its own scene container, and without this it
        // uses React Navigation's default theme background (`rgb(242,242,242)`).
        // During the shift transition that container is briefly visible between
        // the two translated screens, which reads as a white flash on the dark
        // theme. `Screen` paints the BTB background *inside* each scene, so it
        // cannot cover the container behind them.
        //
        // The stack in `app/_layout.tsx` already sets `contentStyle` for exactly
        // this reason, which is why Detail -> List swipe-back never flashed.
        sceneStyle: { backgroundColor: colors.background },
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
        // The label was 10pt/800: under the readable floor, and on a weight the
        // Android system family has no face for. `micro` is the smallest role
        // the scale allows and renders at a weight that actually exists.
        tabBarLabelStyle: typeScale.micro
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
