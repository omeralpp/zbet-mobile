import { useMemo, type ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs, usePathname, useRouter } from "expo-router";
import {
  PanResponder,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
  type ColorValue
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/theme/theme";
import { adjacentMainTab } from "@/src/navigation/main-tabs";

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
  const pathname = usePathname();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = 58 + bottomPadding;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          const horizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5;
          const direction = gesture.dx < 0 ? "NEXT" : "PREVIOUS";
          return (
            gesture.y0 < height - tabBarHeight - 8 &&
            Math.abs(gesture.dx) > 18 &&
            horizontal &&
            adjacentMainTab(pathname, direction) !== null
          );
        },
        onPanResponderRelease: (_, gesture) => {
          if (
            Math.abs(gesture.dx) < 72 &&
            Math.abs(gesture.vx) < 0.65
          ) {
            return;
          }
          const direction = gesture.dx < 0 ? "NEXT" : "PREVIOUS";
          const target = adjacentMainTab(pathname, direction);
          if (!target) {
            return;
          }
          if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => undefined);
          }
          router.navigate(target as never);
        }
      }),
    [height, pathname, router, tabBarHeight]
  );

  return (
    <View {...panResponder.panHandlers} style={styles.root}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
