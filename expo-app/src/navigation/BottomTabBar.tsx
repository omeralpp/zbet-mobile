import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, iconSizes, interaction, semantic, typeScale } from "@/src/theme/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type TopTabBarProps = {
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

export const tabPresentation: Record<string, { icon: IconName; label: string }> = {
  index: { icon: "view-dashboard-outline", label: "Özet" },
  live: { icon: "soccer", label: "Canlı" },
  super: { icon: "star-outline", label: "Super" },
  toto: { icon: "ticket-confirmation-outline", label: "Toto" },
  more: { icon: "dots-horizontal-circle-outline", label: "Daha Fazla" }
};

export function BottomTabBar({ navigation, state }: TopTabBarProps) {
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
            {/* The active tab sits on a soft action pill, so the selection
                reads by shape as well as colour. */}
            <View style={[styles.iconPill, focused && styles.iconPillActive]}>
              <MaterialCommunityIcons
                color={color}
                name={presentation.icon}
                size={iconSizes.control}
              />
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive, { color }]}>{presentation.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 3,
    justifyContent: "center",
    minHeight: interaction.minTouchTarget
  },
  tabItemPressed: {
    opacity: 0.68
  },
  // Transparent and clipped from the first frame: on Android a fill added to
  // a view that mounted without one dropped the radius and drew a rectangle.
  iconPill: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 16,
    height: 30,
    justifyContent: "center",
    overflow: "hidden",
    width: 52
  },
  iconPillActive: {
    backgroundColor: colors.greenSoft
  },
  tabLabel: {
    ...typeScale.label,
    letterSpacing: 0,
    lineHeight: 16
  },
  tabLabelActive: {
    fontWeight: "700"
  }
});
