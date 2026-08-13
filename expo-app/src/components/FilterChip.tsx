import { Pressable, StyleSheet, Text } from "react-native";
import { colors, interaction, radii, spacing } from "@/src/theme/theme";

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
    backgroundColor: colors.blueSoft,
    borderColor: colors.blue
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  selectedLabel: {
    color: colors.white
  },
  pressed: {
    opacity: 0.7
  }
});
