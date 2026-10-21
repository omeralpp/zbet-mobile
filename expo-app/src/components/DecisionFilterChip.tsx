import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import {
  colors,
  iconSizes,
  interaction,
  radii,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";
import {
  decisionFilterLabel,
  superStarSortOptions,
  starFilterOptions,
  type StarDecisionFilter,
  type SuperStarSort
} from "@/src/utils/decision-filters";

export function DecisionFilterChip({
  value,
  count,
  active,
  open,
  onActivate,
  onOpenChange,
  onChange,
  sortValue,
  onSortChange
}: {
  value: StarDecisionFilter;
  count?: number;
  active: boolean;
  open: boolean;
  onActivate: () => void;
  onOpenChange: (open: boolean) => void;
  onChange: (value: StarDecisionFilter) => void;
  sortValue?: SuperStarSort;
  onSortChange?: (value: SuperStarSort) => void;
}) {
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const { width: windowWidth } = useWindowDimensions();
  const menuWidth = Math.min(280, windowWidth - spacing.lg * 2);
  const menuLeft = Math.max(
    spacing.lg,
    Math.min(
      anchor.x + anchor.width - menuWidth,
      windowWidth - menuWidth - spacing.lg
    )
  );

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      onOpenChange(true);
    });
  };

  return (
    <View style={styles.wrapper}>
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
          if (open) {
            onOpenChange(false);
            return;
          }
          openMenu();
        }}
        ref={triggerRef}
        style={({ pressed }) => [
          styles.chip,
          active && styles.chipSelected,
          pressed && styles.pressed
        ]}
      >
        <Text style={[styles.chipText, styles.chipStars, active && styles.chipTextSelected]}>
          {decisionFilterLabel(value)}
        </Text>
        {count === undefined ? null : (
          <Text style={[styles.chipCount, active && styles.chipTextSelected]}>{count}</Text>
        )}
        {sortValue && sortValue !== "DEFAULT" ? (
          <MaterialCommunityIcons
            accessibilityLabel={
              sortValue === "RATING_DESC"
                ? "Yıldız azalan sıralı"
                : "Yıldız artan sıralı"
            }
            color={active ? colors.onAction : colors.gold}
            name={sortValue === "RATING_DESC" ? "arrow-down" : "arrow-up"}
            size={iconSizes.small}
          />
        ) : null}
        <MaterialCommunityIcons
          color={active ? colors.onAction : colors.textMuted}
          name={open ? "chevron-up" : "chevron-down"}
          size={iconSizes.inline}
        />
      </Pressable>

      <Modal
        animationType="none"
        onRequestClose={() => onOpenChange(false)}
        statusBarTranslucent
        transparent
        visible={open}
      >
        <View style={styles.modalLayer}>
          <Pressable
            accessibilityLabel="Filtre menüsünü kapat"
            onPress={() => onOpenChange(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            accessibilityRole="menu"
            style={[
              styles.menu,
              {
                left: menuLeft,
                top: anchor.y + anchor.height + spacing.xs,
                width: menuWidth
              }
            ]}
          >
          {sortValue && onSortChange ? (
            <Text style={styles.sectionLabel}>Yıldız filtresi</Text>
          ) : null}
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
          {sortValue && onSortChange ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Sıralama</Text>
              {superStarSortOptions.map((option) => (
                <Pressable
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: sortValue === option.value }}
                  key={option.value}
                  onPress={() => {
                    onSortChange(option.value);
                    onOpenChange(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    sortValue === option.value && styles.optionSelected,
                    pressed && styles.pressed
                  ]}
                >
                  <View style={styles.sortOption}>
                    <Text
                      style={[
                        styles.optionText,
                        sortValue === option.value && styles.optionTextSelected
                      ]}
                    >
                      {option.label}
                    </Text>
                    {sortValue === option.value ? (
                      <MaterialCommunityIcons
                        color={colors.onAction}
                        name="check"
                        size={iconSizes.small}
                      />
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </>
          ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative"
  },
  chip: {
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent"
  },
  chipSelected: {
    borderColor: colors.actionFill,
    backgroundColor: colors.actionFill
  },
  chipText: {
    color: colors.text,
    ...typeScale.bodyCompact,
    fontWeight: "700"
  },
  chipStars: {
    color: colors.gold,
    letterSpacing: 1
  },
  chipCount: {
    color: colors.text,
    ...typeScale.metricCompact
  },
  chipTextSelected: {
    color: colors.onAction
  },
  menu: {
    position: "absolute",
    padding: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadows.card
  },
  modalLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  sectionLabel: {
    color: colors.textSubtle,
    ...typeScale.eyebrow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginVertical: spacing.xs
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  option: {
    minHeight: interaction.minTouchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radii.md
  },
  optionSelected: {
    backgroundColor: colors.actionFill
  },
  optionText: {
    color: colors.text,
    ...typeScale.bodyCompact,
    fontWeight: "700"
  },
  optionTextSelected: {
    color: colors.onAction
  },
  pressed: {
    opacity: 0.7
  }
});
