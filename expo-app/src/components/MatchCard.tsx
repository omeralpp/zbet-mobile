import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MatchInsight, MatchSummary } from "@/src/api/schemas";
import { colors, radii, shadows, spacing } from "@/src/theme/theme";
import { deriveLiveRateTrend } from "@/src/utils/live-card-indicators";
import { derivePressureBalance } from "@/src/utils/pressure-balance";
import {
  formatElapsed,
  formatCurrentMarketRate,
  formatFixtureDateTime,
  formatSigned
} from "@/src/utils/format";
import { RatingStars } from "./RatingStars";
import { TeamLogo } from "./TeamLogo";

function TeamName({
  name,
  participantId,
  position,
  redCards
}: {
  name: string;
  participantId?: string | null | undefined;
  position?: number | null | undefined;
  redCards?: number | undefined;
}) {
  return (
    <View style={styles.teamRow}>
      <TeamLogo participantId={participantId} size={20} />
      <Text numberOfLines={1} style={styles.team}>
        {name}
      </Text>
      {position ? (
        <Text accessibilityLabel={`Lig sırası ${position}`} style={styles.rank}>
          #{position}
        </Text>
      ) : null}
      {redCards && redCards > 0 ? (
        <View
          accessibilityLabel={`${name}, ${redCards} kırmızı kart`}
          style={styles.redCardBadge}
        >
          <MaterialCommunityIcons color={colors.red} name="card" size={13} />
          {redCards > 1 ? (
            <Text style={styles.redCardCount}>{redCards}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function MatchCard({
  insight,
  match
}: {
  insight?: MatchInsight | undefined;
  match: MatchSummary;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const live = match.status === "LIVE" || match.status === "HALF_TIME";
  const currentMarket = formatCurrentMarketRate(
    match.currentRate,
    match.selectedOdd,
    "canlı oran"
  );
  const rateTrend = deriveLiveRateTrend(match.liveRate, match.currentRate);
  const rateTrendIcon =
    rateTrend === "UP"
      ? "trending-up"
      : rateTrend === "DOWN"
        ? "trending-down"
        : "minus";
  const rateTrendColor =
    rateTrend === "UP"
      ? colors.green
      : rateTrend === "DOWN"
        ? colors.red
        : colors.textSubtle;
  const pressureBalance = derivePressureBalance(
    match.pressureSource === "CURRENT_MATCH" ? match.totalPressure : null,
    match.pressureSource === "CURRENT_MATCH" ? match.pressureDiff : null
  );
  const pressureIcon =
    pressureBalance.direction === "HOME"
      ? "home-variant-outline"
      : pressureBalance.direction === "AWAY"
        ? "airplane"
        : "scale-balance";
  const pressureColor =
    pressureBalance.direction === "HOME"
      ? colors.blue
      : pressureBalance.direction === "AWAY"
        ? colors.green
        : colors.textSubtle;

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
          <TeamName
            name={match.homeTeam}
            participantId={match.homeParticipantId}
            position={insight?.homeStandingPosition}
            redCards={insight?.homeRedCards}
          />
          <TeamName
            name={match.awayTeam}
            participantId={match.awayParticipantId}
            position={insight?.awayStandingPosition}
            redCards={insight?.awayRedCards}
          />
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
        <View
          accessibilityLabel={`Canlı oran ${currentMarket.value}, ${
            rateTrend === "UP"
              ? "seçim oranından yüksek"
              : rateTrend === "DOWN"
                ? "seçim oranından düşük"
                : "değişim yok veya oran kapalı"
          }`}
          style={styles.rateBlock}
        >
          <View style={styles.rateHeadline}>
            {rateTrend !== "UNAVAILABLE" ? (
              <MaterialCommunityIcons
                color={rateTrendColor}
                name={rateTrendIcon}
                size={17}
              />
            ) : null}
            <Text style={[styles.rate, { color: rateTrendColor }]}>
              {currentMarket.value}
            </Text>
          </View>
          <Text style={styles.rateLabel}>{currentMarket.label}</Text>
        </View>
        <View
          accessibilityLabel={
            pressureBalance.hasData
              ? `Güncel baskı farkı ${formatSigned(match.pressureDiff ?? 0, 1)}, ${
                  pressureBalance.direction === "HOME"
                    ? "ev sahibi baskıda"
                    : pressureBalance.direction === "AWAY"
                      ? "deplasman baskıda"
                      : "dengeli"
                }`
              : "Baskı verisi bekleniyor"
          }
          style={styles.pressureBlock}
        >
          <MaterialCommunityIcons
            color={pressureColor}
            name={pressureIcon}
            size={18}
          />
          <View>
            <Text
              style={[
                styles.pressure,
                {
                  color: pressureColor
                }
              ]}
            >
              {pressureBalance.hasData
                ? formatSigned(match.pressureDiff ?? 0, 1)
                : "—"}
            </Text>
            <Text style={styles.pressureLabel}>
              {pressureBalance.hasData ? "güncel baskı farkı" : "güncel veri bekleniyor"}
            </Text>
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
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700"
  },
  teamRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minWidth: 0
  },
  rank: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "900"
  },
  redCardBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  redCardCount: {
    color: colors.red,
    fontSize: 9,
    fontWeight: "900"
  },
  scores: {
    alignItems: "center",
    gap: spacing.sm,
    marginLeft: spacing.lg
  },
  score: {
    color: colors.text,
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
  rateHeadline: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3
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
