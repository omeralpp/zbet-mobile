import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, textFont, numericFont } from "@/src/theme/theme";
import { TeamLogo } from "./TeamLogo";
import { standingsOrder, standingsRecordLine, type StandingsRecord } from "./standings-view";

export type { StandingsRecord } from "./standings-view";

export type StandingsTeam = {
  team: string;
  participantId?: string | null | undefined;
  position: number | null;
  points: number | null;
  side: "HOME" | "AWAY";
  record?: StandingsRecord | null;
};

type StandingsModuleProps = {
  caption: string;
  home: StandingsTeam;
  away: StandingsTeam;
};

function sideLabel(side: StandingsTeam["side"]): string {
  return side === "HOME" ? "EV" : "DEPLASMAN";
}

function StandingsRow({ team }: { team: StandingsTeam }) {
  const accent = team.side === "HOME" ? colors.blue : colors.green;
  const rankLabel =
    team.position === null ? "sıra yok" : `${team.position}. sıra`;
  const pointsLabel = team.points === null ? "puan yok" : `${team.points} puan`;
  const record = team.record ?? null;
  const recordLabel = record
    ? `, ${record.goalsFor} gol attı, ${record.goalsAgainst} gol yedi, ${standingsRecordLine(record)}, averaj ${record.goalDifference}` +
      (record.zone ? `, ${record.zone}` : "")
    : "";

  const label = `${team.team}, ${rankLabel}, ${pointsLabel}${recordLabel}`;
  // A missing rank stays neutral: a coloured badge would imply a real
  // standing position the source never delivered.
  const rank = (
    <View style={record ? styles.metricCell : styles.metric}>
      <Text style={[styles.metricValue, team.position === null && styles.metricValueMissing]}>
        {team.position === null ? "—" : `#${team.position}`}
      </Text>
      <Text style={styles.metricLabel}>{team.position === null ? "sıra yok" : "sıra"}</Text>
    </View>
  );
  const points = (
    <View style={record ? styles.metricCell : styles.metric}>
      <Text style={[styles.metricValue, team.points === null && styles.metricValueMissing]}>
        {team.points ?? "—"}
      </Text>
      <Text style={styles.metricLabel}>{team.points === null ? "puan yok" : "puan"}</Text>
    </View>
  );

  if (record) {
    // The full table row: identity on top, the four numbers in a strip below,
    // so a phone keeps the team name on one line.
    return (
      <View accessibilityLabel={label} accessibilityRole="text" style={styles.row}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <View style={styles.stacked}>
          <View style={styles.identity}>
            <TeamLogo participantId={team.participantId} size="compact" />
            <View style={styles.identityCopy}>
              <Text numberOfLines={1} style={styles.team}>
                {team.team}
              </Text>
              <Text numberOfLines={1} style={styles.recordLine}>
                <Text style={[styles.side, { color: accent }]}>{sideLabel(team.side)}</Text>
                {` · ${standingsRecordLine(record)}${record.zone ? ` · ${record.zone}` : ""}`}
              </Text>
            </View>
          </View>
          <View style={styles.metricStrip}>
            {rank}
            <View style={styles.metricCell}>
              <Text style={styles.metricValue}>{record.goalsFor}</Text>
              <Text style={styles.metricLabel}>attığı</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={styles.metricValue}>{record.goalsAgainst}</Text>
              <Text style={styles.metricLabel}>yediği</Text>
            </View>
            {points}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View accessibilityLabel={label} accessibilityRole="text" style={styles.row}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.identity}>
        <TeamLogo participantId={team.participantId} size="compact" />
        <View style={styles.identityCopy}>
          <Text numberOfLines={2} style={styles.team}>
            {team.team}
          </Text>
          <Text style={[styles.side, { color: accent }]}>
            {sideLabel(team.side)}
          </Text>
        </View>
      </View>
      {rank}
      {points}
    </View>
  );
}

/**
 * Standalone two-team league comparison.
 *
 * The BTB contract only guarantees the two teams of the decision, so this is a
 * deliberate head-to-head module rather than a partial league table.
 *
 * The module heading is rendered by the collapsible panel that hosts this, so a
 * closed panel is genuinely just its header rather than a header with a second
 * one still showing underneath.
 */
export function StandingsModule({
  caption,
  home,
  away
}: StandingsModuleProps) {
  const pointsGap =
    home.points !== null && away.points !== null
      ? home.points - away.points
      : null;
  const leader =
    pointsGap === null || pointsGap === 0
      ? null
      : pointsGap > 0
        ? home.team
        : away.team;

  // The team higher in the table sits on top; EV / DEPLASMAN still name the side.
  const [upper, lower] = standingsOrder(home, away);

  return (
    <>
      <View style={styles.card}>
        <StandingsRow team={upper} />
        <View style={styles.gapStrip}>
          {pointsGap === null ? (
            <Text style={styles.gapText}>Puan karşılaştırması yok</Text>
          ) : (
            <Text style={styles.gapText}>
              {pointsGap === 0
                ? "Puanlar eşit"
                : `${leader} ${Math.abs(pointsGap)} puan önde`}
            </Text>
          )}
        </View>
        <StandingsRow team={lower} />
      </View>
      <Text style={styles.boundary}>{caption}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 68,
    paddingRight: spacing.lg
  },
  accent: {
    alignSelf: "stretch",
    width: 4
  },
  identity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md
  },
  identityCopy: {
    flexShrink: 1
  },
  team: {
    ...textFont("800"),
    color: colors.text,
    fontSize: 14,
    lineHeight: 19
  },
  side: {
    ...textFont("800"),
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: 2
  },
  metric: {
    alignItems: "flex-end",
    minWidth: 48
  },
  stacked: {
    flex: 1
  },
  metricStrip: {
    flexDirection: "row",
    paddingBottom: spacing.md
  },
  metricCell: {
    alignItems: "center",
    flex: 1
  },
  recordLine: {
    ...textFont("400"),
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2
  },
  metricValue: {
    ...numericFont("800"),
    color: colors.text,
    fontSize: 17,
    lineHeight: 22
  },
  metricValueMissing: {
    color: colors.textSubtle
  },
  metricLabel: {
    ...textFont("400"),
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 13,
    marginTop: 1
  },
  gapStrip: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSoft,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    minHeight: 30
  },
  gapText: {
    ...textFont("800"),
    color: colors.textMuted,
    fontSize: 11
  },
  boundary: {
    ...textFont("400"),
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 13,
    marginTop: spacing.sm,
    textAlign: "center"
  }
});
