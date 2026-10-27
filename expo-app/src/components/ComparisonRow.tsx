import { StyleSheet, Text, View } from "react-native";
import { colors, numericFont, radii, spacing, textFont, typeScale } from "@/src/theme/theme";
import { relativeComparisonWidths } from "@/src/utils/statistical-geometry";

/**
 * One home/away statistic: values at the sides, the label between them and a
 * dual bar only when both sides are measured. A missing side is "—" and the
 * suffix never attaches to it.
 */
export function ComparisonRow({
  label,
  home,
  away,
  suffix = "",
  formatter,
  homeText,
  awayText,
  note
}: {
  label: string;
  home: number | null;
  away: number | null;
  suffix?: string;
  formatter?: (value: number) => string;
  /** Pre-formatted values, when the caller owns the formatting. */
  homeText?: string;
  awayText?: string;
  note?: string | null;
}) {
  const widths = relativeComparisonWidths(home, away);
  const homeWidth: `${number}%` = `${widths.home}%`;
  const awayWidth: `${number}%` = `${widths.away}%`;
  const format = (value: number | null) => (value === null ? "—" : `${(formatter ?? String)(value)}${suffix}`);

  return (
    <View accessible accessibilityLabel={`${label}, ev sahibi ${homeText ?? format(home)}, deplasman ${awayText ?? format(away)}${note ? `. ${note}` : ""}`} style={styles.comparison}>
      <View style={styles.comparisonLabels}>
        <Text style={[styles.statValue, home === null && styles.missingValue]}>{homeText ?? format(home)}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, styles.awayValue, away === null && styles.missingValue]}>{awayText ?? format(away)}</Text>
      </View>
      {home !== null && away !== null ? <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.dualBar}>
        <View style={[styles.homeBar, { width: homeWidth }]} />
        <View style={[styles.awayBar, { width: awayWidth }]} />
      </View> : null}
      {note ? <Text style={styles.statNote}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  comparison: {
    gap: 6
  },
  comparisonLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statValue: {
    ...numericFont("800"),
    color: colors.blue,
    minWidth: 42,
    maxWidth: "28%",
    flexShrink: 1,
    fontSize: 16
  },
  statLabel: {
    ...textFont("700"),
    color: colors.textMuted,
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: spacing.sm
  },
  awayValue: { textAlign: "right", color: colors.orange },
  missingValue: { color: colors.textMuted },
  dualBar: {
    flexDirection: "row",
    height: 6,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    overflow: "hidden"
  },
  homeBar: {
    height: "100%",
    backgroundColor: colors.blue,
    borderRadius: radii.round
  },
  // Away in orange, the pair the pressure marks and chart use (v40 board).
  awayBar: {
    height: "100%",
    backgroundColor: colors.orange,
    borderRadius: radii.round
  },
  statNote: {
    color: colors.textMuted,
    ...typeScale.label,
    marginTop: spacing.xs,
    textAlign: "center"
  }
});
