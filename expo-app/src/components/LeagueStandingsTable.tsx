import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/src/theme/theme";
import { hasAnyTeamLogo } from "@/src/utils/team-logo";
import { TeamLogo } from "./TeamLogo";

export type LeagueStandingRow = {
  team: string;
  participantId?: string | null | undefined;
  position: number | null;
  points: number | null;
  side: "HOME" | "AWAY";
};

export function LeagueStandingsTable({
  contextLabel,
  rows
}: {
  contextLabel: string;
  rows: LeagueStandingRow[];
}) {
  // Keep the crest column out of the table entirely when neither team has a
  // usable identity, so legacy rows stay clean instead of showing two blanks.
  const showCrests = hasAnyTeamLogo(...rows.map((row) => row.participantId));
  const orderedRows = [...rows].sort((left, right) => {
    const leftPosition = left.position ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = right.position ?? Number.MAX_SAFE_INTEGER;
    return leftPosition - rightPosition || left.team.localeCompare(right.team);
  });

  return (
    <View style={styles.table}>
      <View style={styles.captionRow}>
        <Text style={styles.caption}>PUAN DURUMU</Text>
        <Text style={styles.context}>{contextLabel}</Text>
      </View>
      <View style={styles.header}>
        <Text style={[styles.headerText, styles.positionColumn]}>Sıra</Text>
        <Text style={[styles.headerText, styles.teamColumn]}>Takım</Text>
        <Text style={[styles.headerText, styles.pointsColumn]}>P</Text>
      </View>
      {orderedRows.map((row, index) => {
        const accent = row.side === "HOME" ? colors.blue : colors.green;
        return (
          <View
            accessibilityLabel={`${row.team}, ${
              row.position === null ? "sıra bilinmiyor" : `${row.position}. sıra`
            }, ${row.points === null ? "puan bilinmiyor" : `${row.points} puan`}`}
            key={`${row.side}-${row.team}`}
            style={[styles.row, index > 0 && styles.divider]}
          >
            <View style={styles.positionColumn}>
              <View style={[styles.positionBadge, { backgroundColor: accent }]}>
                <Text style={styles.positionText}>{row.position ?? "—"}</Text>
              </View>
            </View>
            <View style={[styles.teamColumn, styles.teamCell]}>
              {showCrests ? (
                <TeamLogo participantId={row.participantId} size="compact" />
              ) : null}
              <Text numberOfLines={1} style={styles.teamText}>
                {row.team}
              </Text>
            </View>
            <Text style={[styles.pointsText, styles.pointsColumn]}>
              {row.points ?? "—"}
            </Text>
          </View>
        );
      })}
      <Text style={styles.boundary}>
        Yalnızca SAP servisinin doğruladığı iki takım gösterilir.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden"
  },
  captionRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 36,
    paddingHorizontal: spacing.md
  },
  caption: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7
  },
  context: {
    color: colors.textSubtle,
    fontSize: 9,
    fontWeight: "800"
  },
  header: {
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
    flexDirection: "row",
    minHeight: 30,
    paddingHorizontal: spacing.md
  },
  headerText: {
    color: colors.textSubtle,
    fontSize: 9,
    fontWeight: "900"
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  divider: {
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1
  },
  positionColumn: {
    width: 48
  },
  positionBadge: {
    alignItems: "center",
    borderRadius: radii.sm,
    justifyContent: "center",
    minHeight: 25,
    minWidth: 30,
    paddingHorizontal: 5,
    width: 30
  },
  positionText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900"
  },
  teamColumn: {
    flex: 1
  },
  teamCell: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  teamText: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "800"
  },
  pointsColumn: {
    textAlign: "right",
    width: 36
  },
  pointsText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  boundary: {
    backgroundColor: colors.backgroundElevated,
    color: colors.textSubtle,
    fontSize: 9,
    lineHeight: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlign: "center"
  }
});
