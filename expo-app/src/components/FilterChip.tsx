import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, interaction, radii, spacing, typeScale } from "@/src/theme/theme";
import { controlHeight, controlHitSlop, controlRadius } from "./FilterControls";

export function FilterChip({
  label,
  count,
  selected,
  onPress,
  dot,
  compact = false
}: {
  label: string;
  count?: number;
  selected: boolean;
  onPress: () => void;
  /** Status colour of what the chip filters to, drawn as a leading dot. */
  dot?: string | undefined;
  /** The 36-point Karar günlüğü size (touch target kept by hit slop). */
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={count === undefined ? label : `${label}, ${count} kayıt`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-pressed={selected}
      hitSlop={compact ? controlHitSlop : undefined}
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.chip,
        compact && styles.compact,
        hovered && !selected && styles.hovered,
        selected && styles.selected,
        pressed && styles.pressed
      ]}
    >
      {dot && !selected ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <Text style={[styles.label, compact && styles.compactLabel, selected && styles.selectedLabel]}>{label}</Text>
      {count === undefined ? null : (
        <Text style={[styles.count, compact && styles.compactCount, selected && styles.selectedLabel]}>{count}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  compact: { minHeight: controlHeight, height: controlHeight, paddingHorizontal: 12, borderRadius: controlRadius },
  compactLabel: { fontSize: 13, lineHeight: 18 },
  compactCount: { fontSize: 14, lineHeight: 18 },
  hovered: {
    backgroundColor: colors.surfaceStrong
  },
  selected: {
    backgroundColor: colors.actionFill,
    borderColor: colors.actionFill
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  label: {
    color: colors.text,
    ...typeScale.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  count: {
    color: colors.text,
    ...typeScale.metricCompact,
    fontSize: 16
  },
  selectedLabel: {
    color: colors.onAction
  },
  pressed: {
    opacity: 0.7
  }
});
