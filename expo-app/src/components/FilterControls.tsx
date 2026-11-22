import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type ComponentProps, useRef, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { colors, iconSizes, interaction, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import { decisionFilterMenuLayout } from "./decision-filter-menu";

/**
 * The compact filter language of Karar günlüğü (owner direction 2026-11-17:
 * "top class and compact"). Controls draw at 36 points and keep the 44-point
 * touch target through hit slop, so a phone spends one short line per group
 * instead of a row of full-height pills.
 */
export const controlHeight = 36;
export const controlRadius = 10;
export const controlHitSlop = { top: (interaction.minTouchTarget - controlHeight) / 2, bottom: (interaction.minTouchTarget - controlHeight) / 2 };

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type Key = string | number;

/**
 * The view switch, drawn like Canlı's Canlı/Tümü switch (owner direction
 * 2026-11-17): an oval track whose selected segment is raised. On a phone the
 * segments share the full width; on medium web and up the track hugs them.
 */
export function ViewTabs<T extends Key>({ label, options, value, onChange }: {
  label: string;
  options: readonly { id: T; label: string; note?: string; icon?: IconName }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const breakpoint = useBreakpoint();
  const hugs = Platform.OS === "web" && isAtLeast(breakpoint, "medium");
  return (
    <View accessibilityLabel={label} accessibilityRole="tablist" style={[styles.tabs, hugs && styles.tabsHug]}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            accessibilityLabel={option.note ? `${option.label}, ${option.note}` : option.label}
            accessibilityRole="tab"
            aria-selected={selected}
            accessibilityState={{ selected }}
            key={String(option.id)}
            onPress={() => onChange(option.id)}
            style={({ pressed, hovered }) => [styles.tab, hugs ? styles.tabHug : styles.tabFill,
              hovered && !selected && styles.tabHover, selected && styles.tabSelected, pressed && styles.pressed]}
          >
            {option.icon ? <MaterialCommunityIcons color={selected ? colors.actionFill : colors.textMuted} name={option.icon} size={iconSizes.small} /> : null}
            <Text numberOfLines={1} style={[styles.tabText, selected && styles.tabTextSelected]}>{option.label}</Text>
            {option.note ? <Text numberOfLines={1} style={styles.tabNote}>{option.note}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** One choice out of a few, side by side; `fill` stretches it over the row. */
export function SegmentedControl<T extends Key>({ label, options, value, onChange, fill = false }: {
  label: string;
  options: readonly { id: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  fill?: boolean;
}) {
  return (
    <View accessibilityLabel={label} accessibilityRole="radiogroup" style={[styles.track, fill ? styles.trackFill : null]}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            accessibilityLabel={option.count === undefined ? option.label : `${option.label}, ${option.count} kayıt`}
            accessibilityRole="radio"
            aria-checked={selected}
            accessibilityState={{ selected, checked: selected }}
            hitSlop={controlHitSlop}
            key={String(option.id)}
            onPress={() => onChange(option.id)}
            style={({ pressed, hovered }) => [styles.segment, fill ? styles.segmentFill : null,
              hovered && !selected && styles.segmentHover, selected && styles.segmentSelected, pressed && styles.pressed]}
          >
            <Text numberOfLines={1} style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
            {option.count === undefined ? null : (
              <Text style={[styles.segmentCount, selected && styles.segmentTextSelected]}>{option.count}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** A compact dropdown: the current choice on a 36-point button, the options in an anchored menu. */
export function SelectMenu<T extends Key>({ label, options, value, onChange, icon }: {
  label: string;
  options: readonly { id: T; label: string; short?: string }[];
  value: T;
  onChange: (value: T) => void;
  icon?: IconName;
}) {
  const reduceMotion = useReducedMotion();
  const trigger = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const current = options.find((option) => option.id === value) ?? options[0];
  const layout = decisionFilterMenuLayout({ anchor, window, insets, contentHeight: options.length * interaction.minTouchTarget + spacing.xs * 2 + 2 });
  // The menu opens under the button's own left edge, kept inside the window.
  const menuWidth = Math.min(layout.width, 220);
  const menuLeft = Math.max(spacing.lg, Math.min(anchor.x, window.width - spacing.lg - menuWidth));
  const show = () => trigger.current?.measureInWindow((x, y, width, height) => {
    setAnchor({ x, y, width, height });
    setOpen(true);
  });
  return (
    <View>
      <Pressable
        accessibilityLabel={`${label}: ${current?.label ?? ""}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        hitSlop={controlHitSlop}
        onPress={() => (open ? setOpen(false) : show())}
        ref={trigger}
        style={({ pressed, hovered }) => [styles.select, hovered && styles.segmentHover, pressed && styles.pressed]}
      >
        {icon ? <MaterialCommunityIcons color={semantic.intelligence} name={icon} size={iconSizes.small} /> : null}
        <Text numberOfLines={1} style={styles.selectText}>{current?.short ?? current?.label}</Text>
        <MaterialCommunityIcons color={colors.textMuted} name={open ? "chevron-up" : "chevron-down"} size={iconSizes.inline} />
      </Pressable>
      <Modal animationType={reduceMotion ? "none" : "fade"} onRequestClose={() => setOpen(false)} statusBarTranslucent transparent visible={open}>
        <View style={StyleSheet.absoluteFill}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${label} menüsünü kapat`} onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View accessibilityLabel={label} accessibilityRole="menu" style={[styles.menu, { left: menuLeft, top: layout.top, width: menuWidth, height: layout.height }]}>
            <ScrollView bounces={false} contentContainerStyle={styles.menuContent}>
              {options.map((option) => {
                const selected = option.id === value;
                return (
                  <Pressable
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                    key={String(option.id)}
                    onPress={() => {
                      setOpen(false);
                      onChange(option.id);
                    }}
                    style={({ pressed, hovered }) => [styles.option, hovered && !selected && styles.segmentHover, selected && styles.optionSelected, pressed && styles.pressed]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                    {selected ? <MaterialCommunityIcons color={colors.onAction} name="check" size={iconSizes.small} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    padding: 3,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated
  },
  tabsHug: { alignSelf: "flex-start" },
  tab: {
    minHeight: interaction.minTouchTarget - 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radii.round
  },
  tabFill: { flexGrow: 1, flexShrink: 1, flexBasis: "auto", minWidth: 0, paddingHorizontal: spacing.sm },
  tabHug: { minWidth: 96, paddingHorizontal: spacing.lg },
  tabHover: { backgroundColor: colors.surface },
  tabSelected: { backgroundColor: colors.surfaceStrong },
  tabText: { color: colors.textMuted, ...typeScale.bodyCompact, fontWeight: "700", flexShrink: 1 },
  tabTextSelected: { color: colors.text },
  tabNote: { color: colors.textMuted, ...typeScale.label, fontSize: 11, letterSpacing: 0, opacity: 0.8 },
  track: {
    height: controlHeight,
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "stretch",
    padding: 3,
    gap: 2,
    borderRadius: controlRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  trackFill: { alignSelf: "stretch" },
  segment: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 11, borderRadius: controlRadius - 3 },
  segmentFill: { flex: 1, minWidth: 0, paddingHorizontal: 4 },
  segmentHover: { backgroundColor: colors.surfaceStrong },
  segmentSelected: { backgroundColor: colors.actionFill },
  segmentText: { color: colors.textMuted, ...typeScale.bodyCompact, fontSize: 13, lineHeight: 18, fontWeight: "700", flexShrink: 1 },
  segmentTextSelected: { color: colors.onAction },
  segmentCount: { color: colors.text, ...typeScale.metricCompact, fontSize: 13, lineHeight: 18 },
  select: {
    height: controlHeight,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: controlRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  selectText: { color: colors.text, ...typeScale.bodyCompact, fontSize: 13, lineHeight: 18, fontWeight: "700", flexShrink: 1 },
  menu: { position: "absolute", borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceStrong, ...shadows.card },
  menuContent: { padding: spacing.xs },
  option: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingHorizontal: spacing.md, borderRadius: radii.sm },
  optionSelected: { backgroundColor: colors.actionFill },
  optionText: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  optionTextSelected: { color: colors.onAction },
  pressed: { opacity: 0.7 }
});
