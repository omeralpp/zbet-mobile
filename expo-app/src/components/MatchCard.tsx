import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MatchInsight, MatchSummary } from "@/src/api/schemas";
import { colors, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import {
  deriveLiveCardFooter,
  deriveLiveRateTrend
} from "@/src/utils/live-card-indicators";
import { derivePressureBalance } from "@/src/utils/pressure-balance";
import {
  formatElapsed,
  formatCurrentMarketRate,
  formatFixtureDateTime,
  formatSigned
} from "@/src/utils/format";
import { LiveDot } from "./LiveDot";
import { SurfaceDivider, SurfaceMaterial } from "./SurfaceMaterial";
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
      <TeamLogo participantId={participantId} size="standard" />
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
  const footer = deriveLiveCardFooter(
    match.selectedOdd,
    match.currentRate,
    pressureBalance.hasData
  );

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
      <SurfaceMaterial
        {...(live ? { accent: semantic.live } : {})}
        radius={radii.lg}
      />
      <View style={styles.topRow}>
        <Text numberOfLines={1} style={styles.league}>
          {match.league}
        </Text>
        <View style={[styles.timePill, live && styles.livePill]}>
          {live ? <LiveDot /> : null}
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

      <SurfaceDivider
        {...(live ? { accent: semantic.live } : {})}
        style={styles.divider}
      />

      <View style={styles.bottomRow}>
        <View style={styles.decisionBlock}>
          <RatingStars rating={match.rating} />
          <Text numberOfLines={1} style={styles.odd}>
            {match.selectedOdd || "Aday bekleniyor"}
          </Text>
        </View>
        {footer.showsRate ? (
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
        ) : null}
        {footer.showsPressure ? (
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
            <View style={styles.pressureCopy}>
              <Text style={[styles.pressure, { color: pressureColor }]}>
                {pressureBalance.hasData
                  ? formatSigned(match.pressureDiff ?? 0, 1)
                  : "—"}
              </Text>
              <Text style={styles.pressureLabel}>
                {pressureBalance.hasData
                  ? "güncel baskı farkı"
                  : "güncel veri bekleniyor"}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // The fill is the Intelligence Noir material, so the card clips its corners
    // and lets that layer paint. The border stays soft even when the card is
    // live: the energy is the edge trace, never a lit outline.
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
    ...typeScale.micro,
    textTransform: "uppercase"
  },
  timePill: {
    minHeight: 28,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  livePill: {
    // Live state used loss red, so a match in progress and a decision that lost
    // were the same colour. It now carries BTB's own live signature and says
    // only that the match is happening.
    backgroundColor: semantic.liveSoft,
    borderWidth: 1,
    borderColor: semantic.live
  },
  timeText: {
    color: colors.textMuted,
    ...typeScale.micro
  },
  liveText: {
    color: semantic.live
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
    ...typeScale.identity
  },
  teamRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minWidth: 0
  },
  rank: {
    color: colors.green,
    ...typeScale.micro
  },
  redCardBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  redCardCount: {
    color: colors.red,
    ...typeScale.micro
  },
  scores: {
    alignItems: "center",
    gap: spacing.sm,
    marginLeft: spacing.lg
  },
  score: {
    color: colors.text,
    ...typeScale.score
  },
  divider: {
    marginVertical: spacing.lg
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    // Last line of defence. The footer drops the blocks that have nothing to
    // report, but a long selection string next to a three-digit pressure value
    // can still outgrow a 360dp card, and wrapping to a second line is the only
    // failure mode here that neither truncates a Turkish label into nonsense nor
    // pushes content past the card edge.
    flexWrap: "wrap"
  },
  decisionBlock: {
    flexShrink: 1,
    minWidth: 0
  },
  odd: {
    color: colors.text,
    ...typeScale.metricCompact,
    marginTop: spacing.xs
  },
  rateBlock: {
    alignItems: "flex-end",
    flexShrink: 1,
    // Keeps the two market and pressure blocks grouped at the right edge while
    // the decision block holds the left, which is the reading order the card
    // shipped with.
    marginLeft: "auto",
    minWidth: 0
  },
  rateHeadline: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3
  },
  rate: {
    color: colors.text,
    ...typeScale.metricCompact
  },
  rateLabel: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  pressureBlock: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 3,
    minWidth: 0
  },
  pressureCopy: {
    flexShrink: 1,
    minWidth: 0
  },
  pressure: {
    ...typeScale.micro
  },
  pressureLabel: {
    color: colors.textSubtle,
    ...typeScale.label
  }
});
