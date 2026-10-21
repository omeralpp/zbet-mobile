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
  onToggleExpanded: () => void;
};

/** The rail hides labels, so hovering an icon names it beside the rail. */
function RailTooltip({ label, hint }: { label: string; hint?: string | undefined }) {
  return (
    <View pointerEvents="none" style={styles.tooltip}>
      <Text style={styles.tooltipText}>{label}</Text>
      {hint ? <Text style={styles.tooltipHint}>{hint}</Text> : null}
    </View>
  );
}

/**
 * Desktop navigation. Open it carries labels, the live-match count and the `g`
 * chord hints; as a rail it keeps icons only and names them on hover. The edge
 * handle switches between the two and the choice is kept on this device (see
 * sidebar-preference.ts). It addresses the same five routes as the phone's
 * bottom bar, which has no collapsed form: that is the platform exception.
 */
export function DesktopSidebar({ expanded, onOpenPalette, onOpenHelp, onToggleExpanded }: DesktopSidebarProps) {
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
        accessibilityLabel={expanded ? "Kenar çubuğunu daralt" : "Kenar çubuğunu genişlet"}
        accessibilityRole="button"
        aria-expanded={expanded}
        onPress={onToggleExpanded}
        style={styles.handle}
      >
        {({ hovered }) => (
          <View style={[styles.handleDisc, hovered && styles.handleDiscHover]}>
            <MaterialCommunityIcons
              color={hovered ? colors.text : colors.textMuted}
              name={expanded ? "chevron-left" : "chevron-right"}
              size={iconSizes.inline}
            />
          </View>
        )}
      </Pressable>

      <Pressable
        accessibilityHint="Maç, Super kararı veya Toto programı arar"
        accessibilityLabel="Ara"
        accessibilityRole="search"
        onPress={onOpenPalette}
        style={({ hovered }) => [styles.search, !expanded && styles.searchRail, hovered && styles.hover]}
      >
        {({ hovered }) => (
          <>
            <MaterialCommunityIcons color={colors.textMuted} name="magnify" size={iconSizes.control} />
            {expanded ? (
              <>
                <Text style={styles.searchText}>Ara</Text>
                <Text style={styles.kbd}>Ctrl K</Text>
              </>
            ) : hovered ? <RailTooltip hint="Ctrl K" label="Ara" /> : null}
          </>
        )}
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
              {({ hovered }) => (
                <>
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
                        <View accessibilityLabel={`${liveCount} canlı maç`} style={styles.liveBadge}>
                          <Text style={styles.liveText}>{liveCount}</Text>
                        </View>
                      ) : (
                        <Text style={styles.chord}>g {destination.chordKey}</Text>
                      )}
                    </>
                  ) : (
                    <>
                      {destination.route === "live" && liveCount > 0 ? (
                        <View style={styles.railBadge}>
                          <Text style={styles.railBadgeText}>{liveCount}</Text>
                        </View>
                      ) : null}
                      {hovered ? <RailTooltip hint={`g ${destination.chordKey}`} label={destination.label} /> : null}
                    </>
                  )}
                </>
              )}
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
    paddingVertical: spacing.lg,
    // Above the page so the edge handle and rail tooltips can overhang it.
    zIndex: 3
  },
  // 44 px target centred on the sidebar's right edge, level with the brand row.
  handle: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: -22,
    top: 14,
    width: 44,
    zIndex: 4
  },
  handleDisc: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  handleDiscHover: {
    backgroundColor: colors.surfaceStrong
  },
  tooltip: {
    alignItems: "center",
    backgroundColor: colors.text,
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: spacing.sm,
    left: "100%",
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    position: "absolute"
  },
  tooltipText: {
    ...typeScale.bodyCompact,
    color: colors.background,
    fontWeight: "700"
  },
  tooltipHint: {
    ...typeScale.micro,
    color: colors.background,
    opacity: 0.7
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
    fontWeight: "800"
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
  // The v40 board's round live count, the same badge as the phone tab bar.
  liveBadge: {
    alignItems: "center",
    backgroundColor: semantic.live,
    borderRadius: radii.round,
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: 5
  },
  liveText: {
    ...typeScale.micro,
    color: colors.background,
    fontWeight: "800"
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
