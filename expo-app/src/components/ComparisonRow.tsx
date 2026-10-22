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
    <View style={styles.comparison}>
      <View style={styles.comparisonLabels}>
        <Text style={styles.statValue}>{homeText ?? format(home)}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{awayText ?? format(away)}</Text>
      </View>
      {home !== null && away !== null ? <View style={styles.dualBar}>
        <View style={styles.homeTrack}>
          <View style={[styles.homeBar, { width: homeWidth }]} />
        </View>
        <View style={styles.awayTrack}>
          <View style={[styles.awayBar, { width: awayWidth }]} />
        </View>
      </View> : null}
      {note ? <Text style={styles.statNote}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  comparison: {
    gap: spacing.sm
  },
  comparisonLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statValue: {
    ...numericFont("800"),
    color: colors.text,
    width: 54,
    fontSize: 14
  },
  statLabel: {
    ...textFont("700"),
    color: colors.textMuted,
    flex: 1,
    textAlign: "center",
    fontSize: 11
  },
  dualBar: {
    flexDirection: "row",
    gap: spacing.xs
  },
  homeTrack: {
    flex: 1,
    height: 5,
    alignItems: "flex-end",
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    overflow: "hidden"
  },
  awayTrack: {
    flex: 1,
    height: 5,
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
