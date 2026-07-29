import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MatchSummary } from "@/src/api/schemas";
import { colors, radii, shadows, spacing } from "@/src/theme/theme";
import {
  formatElapsed,
  formatFixtureDateTime,
  formatRate,
  formatSigned
} from "@/src/utils/format";
import { RatingStars } from "./RatingStars";

export function MatchCard({ match }: { match: MatchSummary }) {
  const pathname = usePathname();
  const router = useRouter();
  const live = match.status === "LIVE" || match.status === "HALF_TIME";

  return (
    <Pressable
      accessibilityHint="Maç detayını açar"
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/match/[key]",
          params: {
            key: match.key,
            from: pathname
          }
        } as never)
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text numberOfLines={1} style={styles.league}>
          {match.league}
        </Text>
        <View style={[styles.timePill, live && styles.livePill]}>
          {live ? <View style={styles.liveDot} /> : null}
          <Text style={[styles.timeText, live && styles.liveText]}>
            {formatFixtureDateTime(match.matchDate, match.matchTime)}
            {live || match.status === "FINISHED"
              ? ` · ${formatElapsed(match.status, match.elapsed)}`
              : ""}
          </Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.teams}>
          <Text numberOfLines={1} style={styles.team}>
            {match.homeTeam}
          </Text>
          <Text numberOfLines={1} style={styles.team}>
            {match.awayTeam}
          </Text>
        </View>
        <View style={styles.scores}>
          <Text style={styles.score}>{match.homeScore}</Text>
          <Text style={styles.score}>{match.awayScore}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <RatingStars rating={match.rating} />
          <Text style={styles.odd}>
            {match.selectedOdd || "Aday bekleniyor"}
          </Text>
        </View>
        <View style={styles.rateBlock}>
          <Text style={styles.rate}>{formatRate(match.liveRate)}</Text>
          <Text style={styles.rateLabel}>canlı oran</Text>
        </View>
        <View style={styles.pressureBlock}>
          <MaterialCommunityIcons
            color={match.pressureDiff >= 0 ? colors.green : colors.red}
            name={match.pressureDiff >= 0 ? "trending-up" : "trending-down"}
            size={18}
          />
          <View>
            <Text
              style={[
                styles.pressure,
                {
                  color: match.pressureDiff >= 0 ? colors.green : colors.red
                }
              ]}
            >
              {formatSigned(match.pressureDiff, 1)}
            </Text>
            <Text style={styles.pressureLabel}>baskı farkı</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.995 }]
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  league: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  timePill: {
    minHeight: 26,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  livePill: {
    backgroundColor: colors.redSoft
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900"
  },
  liveText: {
    color: colors.red
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg
  },
  teams: {
    flex: 1,
    gap: spacing.sm
  },
  team: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700"
  },
  scores: {
    alignItems: "center",
    gap: spacing.sm,
    marginLeft: spacing.lg
  },
  score: {
    color: colors.white,
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900"
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginVertical: spacing.lg
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  odd: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3
  },
  rateBlock: {
    alignItems: "flex-end",
    marginLeft: "auto"
  },
  rate: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  rateLabel: {
    color: colors.textSubtle,
    fontSize: 9,
    marginTop: 1
  },
  pressureBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  pressure: {
    fontSize: 13,
    fontWeight: "900"
  },
  pressureLabel: {
    color: colors.textSubtle,
    fontSize: 8,
    marginTop: 1
  }
});
