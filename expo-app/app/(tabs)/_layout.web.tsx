import { useMemo } from "react";
import TopTabs from "expo-router/js-top-tabs";
import { StyleSheet, useWindowDimensions } from "react-native";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { BottomTabBar, type TopTabBarProps } from "@/src/navigation/BottomTabBar";
import { colors } from "@/src/theme/theme";

/**
 * Web twin of the tab navigator: the same five routes, without the page
 * swipe or slide (a desktop switches instantly). From 768 px the desktop
 * sidebar in AppShell replaces the bottom bar; a narrow window keeps it.
 */
export default function TabLayout() {
  const { width } = useWindowDimensions();
  const breakpoint = useBreakpoint();
  const initialLayout = useMemo(() => ({ width }), [width]);
  const desktop = isAtLeast(breakpoint, "medium");

  return (
    <TopTabs
      animationEnabled={false}
      initialLayout={initialLayout}
      lazy={false}
      sceneContainerStyle={styles.scene}
      screenOptions={{
        animationEnabled: false,
        lazy: false,
        sceneStyle: styles.scene,
        swipeEnabled: false
      }}
      swipeEnabled={false}
      // The tab view calls this inline. Returning an element (never calling
      // BottomTabBar directly) keeps its hooks in their own component, so
      // crossing the 768 px edge cannot change the host's hook order.
      tabBar={(props: unknown) => (desktop ? null : <BottomTabBar {...(props as TopTabBarProps)} />)}
      tabBarPosition="bottom"
    >
      <TopTabs.Screen name="index" options={{ title: "Özet" }} />
      <TopTabs.Screen name="live" options={{ title: "Canlı" }} />
      <TopTabs.Screen name="super" options={{ title: "Super" }} />
      <TopTabs.Screen name="toto" options={{ title: "Toto" }} />
      <TopTabs.Screen name="more" options={{ title: "Daha Fazla" }} />
    </TopTabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: colors.background
  }
});
