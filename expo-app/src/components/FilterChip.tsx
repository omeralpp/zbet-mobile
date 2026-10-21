import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, interaction, radii, spacing, typeScale } from "@/src/theme/theme";

export function FilterChip({
  label,
  count,
  selected,
  onPress,
  dot
}: {
  label: string;
  count?: number;
  selected: boolean;
  onPress: () => void;
  /** Status colour of what the chip filters to, drawn as a leading dot. */
  dot?: string | undefined;
}) {
  return (
    <Pressable
      accessibilityLabel={count === undefined ? label : `${label}, ${count} kayıt`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.chip,
        hovered && !selected && styles.hovered,
        selected && styles.selected,
        pressed && styles.pressed
      ]}
    >
      {dot && !selected ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
      {count === undefined ? null : (
        <Text style={[styles.count, selected && styles.selectedLabel]}>{count}</Text>
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
