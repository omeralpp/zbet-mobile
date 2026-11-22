import { useEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors, iconSizes, interaction, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { canStepDay, choiceForDay, periodTitle, shiftDay, type LogPeriod, type LogPeriodChoice } from "@/src/utils/rebuild-log";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { decisionFilterMenuLayout } from "./decision-filter-menu";
import { controlHeight, controlHitSlop, controlRadius } from "./FilterControls";

const periodOptions: readonly { choice: LogPeriodChoice; label: string }[] = [
  { choice: { kind: "today" }, label: "Bugün" },
  { choice: { kind: "yesterday" }, label: "Dün" },
  { choice: { kind: "last", days: 7 }, label: "Son 7 gün" },
  { choice: { kind: "last", days: 30 }, label: "Son 30 gün" }
];
const sameChoice = (a: LogPeriodChoice, b: LogPeriodChoice) => JSON.stringify(a) === JSON.stringify(b);

function StepButton({ icon, label, disabled, onPress }: { icon: "chevron-left" | "chevron-right"; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={controlHitSlop}
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.stepButton, hovered && !disabled && styles.hover, pressed && styles.pressed, disabled && styles.stepDisabled]}
    >
      <MaterialCommunityIcons color={semantic.intelligence} name={icon} size={iconSizes.control} />
    </Pressable>
  );
}

/**
 * Istanbul calendar views from the backend's own day bounds: today, yesterday,
 * the last 7 or 30 days, and single days stepped back up to a year. The menu
 * opens from the control's outer edge: left on a phone, where the control
 * starts the row, right on desktop, where it ends the toolbar. A 7/30-day view
 * hides the day steps, so the control is then narrower than its menu (owner
 * screenshot 2026-11-03: a right-anchored menu ran off the phone's left edge).
 */
export function LogPeriodControl({ align, choice, period, today, open, onOpenChange, onChange }: {
  align: "left" | "right"; choice: LogPeriodChoice; period: LogPeriod; today: string; open: boolean;
  onOpenChange: (open: boolean) => void; onChange: (choice: LogPeriodChoice) => void;
}) {
  const title = periodTitle(period, today);
  const row = useRef<View>(null);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const web = Platform.OS === "web";
  const toggleMenu = () => {
    if (web || open) {
      onOpenChange(!open);
      return;
    }
    row.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      onOpenChange(true);
    });
  };
  useEffect(() => {
    if (!open || Platform.OS !== "web") return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [onOpenChange, open]);
  const step = (delta: -1 | 1) => {
    onOpenChange(false);
    onChange(choiceForDay(shiftDay(period.through, delta), today));
  };
  const options = periodOptions.map((option) => {
      const selected = sameChoice(option.choice, choice);
      return (
        <Pressable
          accessibilityLabel={option.label}
          accessibilityRole="menuitem"
          accessibilityState={{ selected }}
          key={option.label}
          onPress={() => {
            onOpenChange(false);
            onChange(option.choice);
          }}
          style={({ pressed }) => [styles.periodOption, selected && styles.periodOptionSelected, pressed && styles.pressed]}
        >
          <Text style={[styles.periodOptionText, selected && styles.periodOptionTextSelected]}>{option.label}</Text>
          {selected ? <MaterialCommunityIcons accessible={false} color={colors.onAction} name="check" size={iconSizes.inline} /> : null}
        </Pressable>
      );
  });
  // Native portals keep options tappable beyond the height of the toolbar.
  const layout = decisionFilterMenuLayout({
    anchor, window, insets, contentHeight: periodOptions.length * interaction.minTouchTarget + spacing.xs * 2 + 2
  });
  const width = Math.min(168, layout.width);
  const left = align === "left"
    ? Math.max(insets.left + spacing.lg, Math.min(anchor.x, window.width - insets.right - spacing.lg - width))
    : Math.max(insets.left + spacing.lg, anchor.x + anchor.width - width);
  return (
    <View style={[styles.periodWrapper, open && styles.periodWrapperOpen]}>
      <View collapsable={false} ref={row} style={styles.periodRow}>
        {period.days === 1 ? <StepButton disabled={!canStepDay(period, today, -1)} icon="chevron-left" label="Önceki gün" onPress={() => step(-1)} /> : null}
        <Pressable
          accessibilityLabel={`Dönem: ${title}, İstanbul saati`}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          aria-expanded={open}
          hitSlop={controlHitSlop}
          onPress={toggleMenu}
          style={({ pressed, hovered }) => [styles.periodButton, hovered && styles.hover, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={semantic.intelligence} name="calendar-blank-outline" size={iconSizes.small} />
          <Text numberOfLines={1} style={styles.periodText}>{title}</Text>
          <MaterialCommunityIcons color={colors.textMuted} name={open ? "chevron-up" : "chevron-down"} size={iconSizes.inline} />
        </Pressable>
        {period.days === 1 ? <StepButton disabled={!canStepDay(period, today, 1)} icon="chevron-right" label="Sonraki gün" onPress={() => step(1)} /> : null}
      </View>
      {open && web ? (
        <View accessibilityRole="menu" style={[styles.periodMenu, align === "left" ? styles.periodMenuLeft : styles.periodMenuRight]}>
          {options}
        </View>
      ) : null}
      {open && !web ? (
        <Modal transparent statusBarTranslucent animationType="none" onRequestClose={() => onOpenChange(false)}>
          <View style={StyleSheet.absoluteFill}>
            <Pressable accessibilityRole="button" accessibilityLabel="Dönem menüsünü kapat"
              onPress={() => onOpenChange(false)} style={StyleSheet.absoluteFill} />
            <View accessibilityRole="menu" style={[styles.periodMenu, styles.nativeMenu, { left, top: layout.top, width, height: layout.height }]}>
              <ScrollView bounces={false} contentContainerStyle={styles.nativeMenuOptions}>{options}</ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.72 },
  periodWrapper: { position: "relative", zIndex: 10, alignSelf: "flex-start" },
  periodWrapperOpen: { zIndex: 40, elevation: 40 },
  periodRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  periodButton: {
    height: controlHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: controlRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  periodText: { color: colors.text, ...typeScale.bodyCompact, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  stepButton: {
    width: controlHeight,
    height: controlHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: controlRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  stepDisabled: { opacity: 0.38 },
  periodMenu: {
    position: "absolute",
    top: controlHeight + 6,
    minWidth: 168,
    padding: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadows.card
  },
  nativeMenu: { minWidth: 0, padding: 0 },
  nativeMenuOptions: { padding: spacing.xs },
  periodMenuLeft: { left: 0 },
  periodMenuRight: { right: 0 },
  periodOption: {
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md
  },
  periodOptionSelected: { backgroundColor: colors.actionFill },
  periodOptionText: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  periodOptionTextSelected: { color: colors.onAction },
});
