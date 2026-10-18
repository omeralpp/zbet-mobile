import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { matchesQuery } from "@/src/api/queries";
import { runtimeConfig } from "@/src/config/runtime";
import { tabPresentation } from "@/src/navigation/BottomTabBar";
import { btbBrandMark } from "@/src/theme/brand-mark";
import {
  applyThemeMode,
  colors,
  iconSizes,
  radii,
  semantic,
  spacing,
  themeMode,
  typeScale
} from "@/src/theme/theme";
import { activeDestination, desktopDestinations } from "./desktop-nav";

type DesktopSidebarProps = {
  expanded: boolean;
  onOpenPalette: () => void;
  onOpenHelp: () => void;
};

/**
 * Desktop navigation. Expanded (≥1200 px) it carries labels, the live-match
 * count and the `g` chord hints; as a rail (768–1199 px) it keeps icons only.
 * It addresses the same five routes as the phone's bottom bar.
 */
export function DesktopSidebar({ expanded, onOpenPalette, onOpenHelp }: DesktopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const active = activeDestination(pathname);
  const matches = useQuery(matchesQuery);
  const liveCount = (matches.data ?? []).filter(
    (match) => match.status === "LIVE" || match.status === "HALF_TIME"
  ).length;
  const [themeChanging, setThemeChanging] = useState(false);

  return (
    <View
      aria-label="BTB gezinme"
      role="navigation"
      style={[styles.sidebar, expanded ? styles.expanded : styles.rail]}
    >
      <View style={[styles.brand, !expanded && styles.brandRail]}>
        <Image accessibilityIgnoresInvertColors source={btbBrandMark} style={styles.mark} />
        {expanded ? (
          <View>
            <Text style={styles.brandTitle}>BTB</Text>
            <Text style={styles.brandTagline}>BETTER THAN BET</Text>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityHint="Maç, Super kararı veya Toto programı arar"
        accessibilityLabel="Ara"
        accessibilityRole="search"
        onPress={onOpenPalette}
        style={({ hovered }) => [styles.search, !expanded && styles.searchRail, hovered && styles.hover]}
      >
        <MaterialCommunityIcons color={colors.textMuted} name="magnify" size={iconSizes.control} />
        {expanded ? (
          <>
            <Text style={styles.searchText}>Ara</Text>
            <Text style={styles.kbd}>Ctrl K</Text>
          </>
        ) : null}
      </Pressable>

      <View style={styles.items}>
        {desktopDestinations.map((destination) => {
          const selected = active === destination.route;
          const presentation = tabPresentation[destination.route];
          const color = selected ? semantic.positive : colors.textMuted;
          return (
            <Pressable
              accessibilityLabel={destination.label}
              accessibilityRole="link"
              accessibilityState={{ selected }}
              key={destination.route}
              onPress={() => router.navigate(destination.path)}
              style={({ hovered }) => [
                styles.item,
                !expanded && styles.itemRail,
                hovered && styles.hover,
                selected && styles.itemSelected
              ]}
            >
              {selected ? <View style={styles.selectedBar} /> : null}
              <MaterialCommunityIcons
                color={color}
                name={presentation?.icon ?? "circle-outline"}
                size={iconSizes.navigation}
              />
              {expanded ? (
                <>
                  <Text style={[styles.itemLabel, selected && styles.itemLabelSelected]}>
                    {destination.label}
                  </Text>
                  {destination.route === "live" && liveCount > 0 ? (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>{liveCount}</Text>
                    </View>
                  ) : (
                    <Text style={styles.chord}>g {destination.chordKey}</Text>
                  )}
                </>
              ) : destination.route === "live" && liveCount > 0 ? (
                <View style={styles.railBadge}>
                  <Text style={styles.railBadgeText}>{liveCount}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityLabel={themeMode === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
          accessibilityRole="button"
          disabled={themeChanging}
          onPress={() => {
            setThemeChanging(true);
            applyThemeMode(themeMode === "dark" ? "light" : "dark").catch(() => setThemeChanging(false));
          }}
          style={({ hovered }) => [styles.footerButton, !expanded && styles.itemRail, hovered && styles.hover]}
        >
          <MaterialCommunityIcons
            color={colors.textMuted}
            name={themeMode === "dark" ? "white-balance-sunny" : "weather-night"}
            size={iconSizes.control}
          />
          {expanded ? (
            <Text style={styles.footerText}>{themeMode === "dark" ? "Açık tema" : "Koyu tema"}</Text>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityLabel="Klavye kısayolları"
          accessibilityRole="button"
          onPress={onOpenHelp}
          style={({ hovered }) => [styles.footerButton, !expanded && styles.itemRail, hovered && styles.hover]}
        >
          <MaterialCommunityIcons color={colors.textMuted} name="keyboard-outline" size={iconSizes.control} />
          {expanded ? (
            <>
              <Text style={styles.footerText}>Kısayollar</Text>
              <Text style={styles.kbd}>?</Text>
            </>
          ) : null}
        </Pressable>
        {expanded ? (
          <View style={styles.mode}>
            <View
              style={[
                styles.modeDot,
                { backgroundColor: runtimeConfig.useMocks ? semantic.warning : semantic.neutral }
              ]}
            />
            <Text style={styles.modeText}>
              {runtimeConfig.useMocks ? "Önizleme verisi" : "Maç verisi"}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: colors.backgroundElevated,
    borderRightColor: colors.borderSoft,
    borderRightWidth: 1,
    gap: spacing.lg,
    paddingVertical: spacing.lg
  },
  expanded: {
    paddingHorizontal: spacing.md,
    width: 248
  },
  rail: {
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    width: 76
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.sm
  },
  brandRail: {
    paddingHorizontal: 0
  },
  mark: {
    height: 40,
    width: 40
  },
  brandTitle: {
    ...typeScale.moduleTitle,
    color: colors.text,
    fontWeight: "900"
  },
  brandTagline: {
    ...typeScale.micro,
    color: semantic.positive,
    letterSpacing: 1.6
  },
  search: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  searchRail: {
    justifyContent: "center",
    paddingHorizontal: 0,
    width: 48
  },
  searchText: {
    ...typeScale.bodyCompact,
    color: colors.textMuted,
    flex: 1
  },
  kbd: {
    ...typeScale.micro,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.textSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1
  },
  items: {
    gap: spacing.xs
  },
  item: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  itemRail: {
    justifyContent: "center",
    paddingHorizontal: 0,
    width: 52
  },
  itemSelected: {
    backgroundColor: colors.greenSoft
  },
  hover: {
    backgroundColor: colors.borderSoft
  },
  selectedBar: {
    backgroundColor: colors.actionFill,
    borderRadius: radii.round,
    bottom: 10,
    left: 0,
    position: "absolute",
    top: 10,
    width: 3
  },
  itemLabel: {
    ...typeScale.identity,
    color: colors.textMuted,
    flex: 1
  },
  itemLabelSelected: {
    color: colors.text,
    fontWeight: "700"
  },
  chord: {
    ...typeScale.micro,
    color: colors.textSubtle
  },
  liveBadge: {
    alignItems: "center",
    backgroundColor: colors.tealSoft,
    borderRadius: radii.round,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  liveDot: {
    backgroundColor: semantic.live,
    borderRadius: radii.round,
    height: 7,
    width: 7
  },
  liveText: {
    ...typeScale.micro,
    color: semantic.live
  },
  railBadge: {
    alignItems: "center",
    backgroundColor: semantic.live,
    borderRadius: radii.round,
    minWidth: 18,
    paddingHorizontal: 4,
    position: "absolute",
    right: 4,
    top: 4
  },
  railBadgeText: {
    ...typeScale.micro,
    color: colors.background
  },
  footer: {
    gap: spacing.xs,
    marginTop: "auto"
  },
  footerButton: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 40,
    paddingHorizontal: spacing.md
  },
  footerText: {
    ...typeScale.bodyCompact,
    color: colors.textMuted,
    flex: 1
  },
  mode: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm
  },
  modeDot: {
    borderRadius: radii.round,
    height: 8,
    width: 8
  },
  modeText: {
    ...typeScale.meta,
    color: colors.textSubtle
  }
});
