import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/src/theme/theme";
import type { TeamLogoSize } from "@/src/utils/team-logo";
import { TeamLogo } from "./TeamLogo";

type TeamIdentityLineProps = {
  homeTeam: string;
  awayTeam: string;
  homeParticipantId?: string | null | undefined;
  awayParticipantId?: string | null | undefined;
  size?: TeamLogoSize | undefined;
};

/**
 * One-line match identity where each crest belongs to the team beside it.
 *
 * The row prefers a single compact line and only wraps the away side onto a
 * second line when the two names cannot share one, so a crest is never detached
 * from its team and long club names are not cut mid-word.
 */
export function TeamIdentityLine({
  homeTeam,
  awayTeam,
  homeParticipantId,
  awayParticipantId,
  size = "compact"
}: TeamIdentityLineProps) {
  return (
    <View
      accessibilityLabel={`${homeTeam} - ${awayTeam}`}
      accessibilityRole="text"
      style={styles.row}
    >
      <View style={styles.team}>
        <TeamLogo participantId={homeParticipantId} size={size} />
        <Text numberOfLines={1} style={styles.name}>
          {homeTeam}
        </Text>
      </View>
      <Text style={styles.separator}>–</Text>
      <View style={styles.team}>
        <TeamLogo participantId={awayParticipantId} size={size} />
        <Text numberOfLines={1} style={styles.name}>
          {awayTeam}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    columnGap: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.xs
  },
  team: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 6
  },
  name: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21
  },
  separator: {
    color: colors.textSubtle,
    fontSize: 13,
    fontWeight: "900"
  }
});
