import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  colors,
  interaction,
  radii,
  shadows,
  spacing
} from "@/src/theme/theme";
import {
  decisionFilterLabel,
  starFilterOptions,
  type StarDecisionFilter
} from "@/src/utils/decision-filters";

export function DecisionFilterChip({
  value,
  count,
  active,
  open,
  onActivate,
  onOpenChange,
  onChange
}: {
  value: StarDecisionFilter;
  count?: number;
  active: boolean;
  open: boolean;
  onActivate: () => void;
  onOpenChange: (open: boolean) => void;
  onChange: (value: StarDecisionFilter) => void;
}) {
  return (
    <View style={[styles.wrapper, open && styles.wrapperOpen]}>
      <Pressable
        accessibilityLabel={`${decisionFilterLabel(value)} yıldız filtresi${
          count === undefined ? "" : `, ${count} kayıt`
        }${
          active ? ", seçenekleri aç" : ", filtreyi etkinleştir"
        }`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, selected: active }}
        onPress={() => {
          if (!active) {
            onActivate();
            onOpenChange(false);
            return;
          }
          onOpenChange(!open);
        }}
        style={({ pressed }) => [
          styles.chip,
          active && styles.chipSelected,
          pressed && styles.pressed
        ]}
      >
        <MaterialCommunityIcons
          color={active ? colors.white : colors.gold}
          name="star-four-points"
          size={15}
        />
        <Text style={[styles.chipText, active && styles.chipTextSelected]}>
          {decisionFilterLabel(value)}{count === undefined ? "" : ` ${count}`}
        </Text>
        <MaterialCommunityIcons
          color={active ? colors.white : colors.textMuted}
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
        />
      </Pressable>

      {open ? (
        <View accessibilityRole="menu" style={styles.menu}>
          {starFilterOptions.map((option) => (
            <Pressable
              accessibilityLabel={option.accessibilityLabel}
              accessibilityRole="menuitem"
              key={option.value}
              onPress={() => {
                onChange(option.value);
                onOpenChange(false);
              }}
              style={({ pressed }) => [
                styles.option,
                value === option.value && styles.optionSelected,
                pressed && styles.pressed
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  value === option.value && styles.optionTextSelected
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 10
  },
  wrapperOpen: {
    zIndex: 30,
    elevation: 30
  },
  chip: {
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.backgroundElevated
  },
  chipSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.blueSoft
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  chipTextSelected: {
    color: colors.white
  },
  menu: {
    position: "absolute",
    top: interaction.minTouchTarget + 6,
    right: 0,
    minWidth: 190,
    padding: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadows.card
  },
  option: {
    minHeight: interaction.minTouchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radii.md
  },
  optionSelected: {
    backgroundColor: colors.blueSoft
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  optionTextSelected: {
    color: colors.white
  },
  pressed: {
    opacity: 0.7
  }
});
