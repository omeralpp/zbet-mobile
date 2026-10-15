import { useMemo } from "react";
import TopTabs from "expo-router/js-top-tabs";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BottomTabBar } from "@/src/navigation/BottomTabBar";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import { colors } from "@/src/theme/theme";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const initialLayout = useMemo(() => ({ width }), [width]);

  return (
    <TopTabs
      animationEnabled={!reduceMotion}
      initialLayout={initialLayout}
      keyboardDismissMode="on-drag"
      lazy={false}
      overScrollMode="never"
      sceneContainerStyle={styles.scene}
      screenOptions={{
        animationEnabled: !reduceMotion,
        lazy: false,
        sceneStyle: styles.scene,
        swipeEnabled: !reduceMotion
      }}
      swipeEnabled={!reduceMotion}
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
