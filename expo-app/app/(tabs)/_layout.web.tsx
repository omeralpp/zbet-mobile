import { useEffect, useMemo } from "react";
import TopTabs from "expo-router/js-top-tabs";
import { usePathname } from "expo-router";
import { Keyboard, StyleSheet, useWindowDimensions } from "react-native";
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
  const pathname = usePathname();
  // Dismiss an old page's text input on navigation, while retaining focus
  // when the browser changes width on the same page.
  useEffect(() => { Keyboard.dismiss(); }, [pathname]);

  return (
    <TopTabs
      animationEnabled={false}
      initialLayout={initialLayout}
      lazy={false}
      // The native default dismisses keyboards on every width change.
      // Browser resizing must preserve focus in the current search field.
      keyboardDismissMode="none"
      sceneContainerStyle={styles.scene}
      screenOptions={{
        animationEnabled: false,
        lazy: false,
        sceneStyle: styles.scene,
        swipeEnabled: false
      }}
      swipeEnabled={false}
      style={styles.viewport}
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
  // `hidden` remains a scroll container: browser focus can scroll the wide
  // page strip while resizing. Web CSS `clip` prevents that offset without
  // remounting routes or touching Android's native pager. RN's shared type
  // only names the native overflow values; the web renderer accepts `clip`.
  viewport: { overflow: "clip" as "hidden" },
  scene: {
    backgroundColor: colors.background
  }
});
