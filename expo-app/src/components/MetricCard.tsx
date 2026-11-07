import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { ChangeEmphasis } from "./ChangeEmphasis";
import { LiveDot } from "./LiveDot";
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
  valueCaption?: string | undefined;
  detail?: string | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  onPress?: (() => void) | undefined;
  /** A breathing live dot beside the icon while the figure counts matches in play. */
  live?: boolean | undefined;
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
  valueCaption,
  detail,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  live = false
}: MetricTileProps) {
  const { width } = useWindowDimensions();
  const roomy = Platform.OS === "web" && isAtLeast(resolveBreakpoint(width), "medium");
  // A changed figure announces itself once; the first value stays still.
  const figure = (
    <ChangeEmphasis style={styles.valueRow} token={value}>
      <Text numberOfLines={1} style={[styles.value, roomy ? styles.valueRoomy : styles.valueCompact, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </ChangeEmphasis>
  );
  const chevron = onPress ? <MaterialCommunityIcons accessible={false} color={colors.textMuted} name="chevron-right" size={iconSizes.inline} /> : null;
  const identity = (
    <>
      <MaterialCommunityIcons color={accent} name={icon} size={roomy ? iconSizes.inline : iconSizes.small} />
      {live ? <LiveDot size={7} /> : null}
    </>
  );
  // Phones read the tile as a sentence (label on top, the figure beside what it
  // counts), which keeps the strip about 40 pt shorter; roomy web keeps the
  // tall figure-first tile.
  const content = roomy ? (
    <>
      <View style={styles.iconRow}>
        <View style={styles.identity}>{identity}</View>
        {chevron}
      </View>
      {figure}
      {valueCaption ? <Text style={styles.detail}>{valueCaption}</Text> : null}
      <Text style={styles.label}>{label}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </>
  ) : (
    <>
      <View style={styles.iconRow}>
        <View style={[styles.identity, styles.identityCompact]}>
          {identity}
          <Text numberOfLines={1} style={[styles.label, styles.labelCompact]}>{label}</Text>
        </View>
        {chevron}
      </View>
      <View style={styles.figureRow}>
        {figure}
        <View style={styles.figureText}>
          {valueCaption ? <Text style={styles.detail}>{valueCaption}</Text> : null}
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        </View>
      </View>
    </>
  );
  if (!onPress) {
    return <View style={styles.tile}>{content}</View>;
  }
  return (
    <Pressable
      accessibilityHint={accessibilityHint ?? `${label} ekranını açar`}
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}${valueCaption ? ` ${valueCaption}` : ""}`}
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
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  identityCompact: {
    flex: 1,
    minWidth: 0,
    gap: 5
  },
  labelCompact: {
    flexShrink: 1,
    fontWeight: "700"
  },
  figureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6
  },
  figureText: {
    flex: 1,
    minWidth: 0
  },
  valueRow: {
    alignSelf: "flex-start"
  },
  hovered: {
    backgroundColor: colors.surfaceStrong
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }]
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
  valueCompact: {
    marginTop: 0
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
