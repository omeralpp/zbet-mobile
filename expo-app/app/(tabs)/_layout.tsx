import { useMemo } from "react";
import TopTabs from "expo-router/js-top-tabs";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import { BottomTabBar } from "@/src/navigation/BottomTabBar";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import { colors } from "@/src/theme/theme";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  // Web changes destinations through its tabs/rail. Avoid retaining a moving
  // swipe offset across responsive width changes; Android keeps native swipes.
  const animatePages = Platform.OS !== "web" && !reduceMotion;
  const initialLayout = useMemo(() => ({ width }), [width]);

  return (
    <TopTabs
      animationEnabled={animatePages}
      initialLayout={initialLayout}
      keyboardDismissMode="on-drag"
      lazy={false}
      overScrollMode="never"
      sceneContainerStyle={styles.scene}
      screenOptions={{
        animationEnabled: animatePages,
        lazy: false,
        sceneStyle: styles.scene,
        swipeEnabled: animatePages
      }}
      swipeEnabled={animatePages}
      tabBar={BottomTabBar}
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
