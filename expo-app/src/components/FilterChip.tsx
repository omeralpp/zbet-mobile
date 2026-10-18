import { Pressable, StyleSheet, Text } from "react-native";
import { colors, interaction, radii, spacing, typeScale } from "@/src/theme/theme";

export function FilterChip({
  label,
  count,
  selected,
  onPress
}: {
  label: string;
  count?: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={count === undefined ? label : `${label}, ${count} kayıt`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}{count === undefined ? "" : ` ${count}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: interaction.minTouchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  selected: {
    backgroundColor: colors.actionFill,
    borderColor: colors.blue
  },
  label: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    fontWeight: "700"
  },
  selectedLabel: {
    color: colors.onAction
  },
  pressed: {
    opacity: 0.7
  }
});
