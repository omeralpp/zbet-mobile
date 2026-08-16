import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/src/theme/theme";
import { ModuleHeading } from "./ModuleHeading";
import { TeamLogo } from "./TeamLogo";

export type StandingsTeam = {
  team: string;
  participantId?: string | null | undefined;
  position: number | null;
  points: number | null;
  side: "HOME" | "AWAY";
};

type StandingsModuleProps = {
  title: string;
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

  return (
    <View
      accessibilityLabel={`${team.team}, ${rankLabel}, ${pointsLabel}`}
      accessibilityRole="text"
      style={styles.row}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.identity}>
        <TeamLogo participantId={team.participantId} size="standard" />
        <View style={styles.identityCopy}>
          <Text numberOfLines={2} style={styles.team}>
            {team.team}
          </Text>
          <Text style={[styles.side, { color: accent }]}>
            {sideLabel(team.side)}
          </Text>
        </View>
      </View>
      <View style={styles.metric}>
        {/* A missing rank stays neutral: a coloured badge would imply a real
            standing position the SAP record never delivered. */}
        <Text
          style={[
            styles.metricValue,
            team.position === null && styles.metricValueMissing
          ]}
        >
          {team.position === null ? "—" : `#${team.position}`}
        </Text>
        <Text style={styles.metricLabel}>
          {team.position === null ? "sıra yok" : "sıra"}
        </Text>
      </View>
      <View style={styles.metric}>
        <Text
          style={[
            styles.metricValue,
            team.points === null && styles.metricValueMissing
          ]}
        >
          {team.points ?? "—"}
        </Text>
        <Text style={styles.metricLabel}>
          {team.points === null ? "puan yok" : "puan"}
        </Text>
      </View>
    </View>
  );
}

/**
 * Standalone two-team league comparison.
 *
 * The BTB contract only guarantees the two teams of the decision, so this is a
 * deliberate head-to-head module rather than a partial league table.
 */
export function StandingsModule({
  title,
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

  return (
    <>
      <ModuleHeading eyebrow="PUAN DURUMU" title={title} />
      <View style={styles.card}>
        <StandingsRow team={home} />
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
        <StandingsRow team={away} />
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
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19
  },
  side: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 2
  },
  metric: {
    alignItems: "flex-end",
    minWidth: 48
  },
  metricValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22
  },
  metricValueMissing: {
    color: colors.textSubtle
  },
  metricLabel: {
    color: colors.textSubtle,
    fontSize: 9,
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
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800"
  },
  boundary: {
    color: colors.textSubtle,
    fontSize: 9,
    lineHeight: 13,
    marginTop: spacing.sm,
    textAlign: "center"
  }
});
