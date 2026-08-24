import { useMemo, type ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import TopTabs from "expo-router/js-top-tabs";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import {
  colors,
  iconSizes,
  interaction,
  semantic,
  typeScale
} from "@/src/theme/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type TopTabBarProps = {
  navigation: {
    emit: (event: {
      canPreventDefault?: boolean;
      target: string;
      type: "tabLongPress" | "tabPress";
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
};

const tabPresentation: Record<
  string,
  { icon: IconName; label: string }
> = {
  index: { icon: "view-dashboard-outline", label: "Özet" },
  live: { icon: "soccer", label: "Canlı" },
  super: { icon: "star-outline", label: "Super" },
  toto: { icon: "ticket-confirmation-outline", label: "Toto" },
  more: { icon: "dots-horizontal-circle-outline", label: "Daha Fazla" }
};

function BottomTabBar({ navigation, state }: TopTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.tabBar,
        { height: 58 + bottomPadding, paddingBottom: bottomPadding }
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const presentation = tabPresentation[route.name] ?? {
          icon: "circle-outline" as const,
          label: route.name
        };
        const color = focused ? semantic.positive : colors.textSubtle;

        return (
          <Pressable
            accessibilityLabel={presentation.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            key={route.key}
            onLongPress={() =>
              navigation.emit({
                type: "tabLongPress",
                target: route.key
              })
            }
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true
              });
              if (Platform.OS !== "web") {
                Haptics.selectionAsync().catch(() => undefined);
              }
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && styles.tabItemPressed
            ]}
          >
            <MaterialCommunityIcons
              color={color}
              name={presentation.icon}
              size={focused ? iconSizes.navigation : iconSizes.control}
            />
            <Text style={[styles.tabLabel, { color }]}>{presentation.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

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
  },
  tabBar: {
    alignItems: "flex-start",
    backgroundColor: colors.backgroundElevated,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingTop: 6
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: interaction.minTouchTarget
  },
  tabItemPressed: {
    opacity: 0.68
  },
  tabLabel: {
    ...typeScale.micro
  }
});
