import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SurfaceMaterial } from "./SurfaceMaterial";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { isAtLeast, resolveBreakpoint } from "@/src/layout/breakpoints";
import {
  colors,
  iconSizes,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type MetricTileProps = {
  icon: IconName;
  /** Identity colour of the tile's icon: what kind of figure this is. */
  accent: string;
  label: string;
  value: string;
  /** Colour of the figure itself, only when the figure is a judgement. */
  valueColor?: string | undefined;
  detail?: string | undefined;
  accessibilityLabel?: string | undefined;
  onPress?: (() => void) | undefined;
};

/**
 * One figure in the Overview strip. The icon carries the tile's identity and
 * the number stays text-coloured unless it is itself a result, so three tiles
 * side by side never spend three accent colours on the same glance.
 */
export function MetricTile({
  icon,
  accent,
  label,
  value,
  valueColor,
  detail,
  accessibilityLabel,
  onPress
}: MetricTileProps) {
  const { width } = useWindowDimensions();
  const roomy = Platform.OS === "web" && isAtLeast(resolveBreakpoint(width), "medium");
  const content = (
    <>
      <MaterialCommunityIcons color={accent} name={icon} size={iconSizes.inline} />
      <Text numberOfLines={1} style={[styles.value, roomy && styles.valueRoomy, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </>
  );
  if (!onPress) {
    return <View style={styles.tile}>{content}</View>;
  }
  return (
    <Pressable
      accessibilityHint={`${label} ekranını açar`}
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.tile, hovered && styles.hovered, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

/** The tiles as one surface, divided by hairlines rather than gaps. */
export function MetricStrip({ children }: { children: ReactNode }) {
  const tiles = Children.toArray(children).filter(isValidElement);
  return (
    <View style={styles.strip}>
      <SurfaceMaterial radius={18} />
      {tiles.map((tile, index) => (
        <View key={tile.key ?? index} style={[styles.cell, index > 0 && styles.cellDivided]}>
          {tile}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    borderColor: colors.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    width: "100%",
    ...shadows.card
  },
  cell: {
    flex: 1,
    minWidth: 0
  },
  cellDivided: {
    borderLeftColor: colors.border,
    borderLeftWidth: 1
  },
  tile: {
    flex: 1,
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: 18
  },
  hovered: {
    backgroundColor: colors.surfaceStrong
  },
  pressed: {
    opacity: 0.78
  },
  value: {
    color: colors.text,
    ...typeScale.metric,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  valueRoomy: {
    fontSize: 40,
    lineHeight: 44
  },
  label: {
    color: colors.text,
    ...typeScale.label,
    letterSpacing: 0,
    lineHeight: 16
  },
  detail: {
    color: colors.textMuted,
    ...typeScale.label,
    letterSpacing: 0,
    lineHeight: 16
  }
});
