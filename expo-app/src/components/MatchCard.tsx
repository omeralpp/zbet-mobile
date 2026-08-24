import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MatchInsight, MatchSummary } from "@/src/api/schemas";
import {
  colors,
  iconSizes,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";
import {
  deriveLiveCardFooter,
  deriveLiveRateTrend,
  pressureFooterCaption
} from "@/src/utils/live-card-indicators";
import { derivePressureBalance } from "@/src/utils/pressure-balance";
import { deriveMatchMinuteProgress } from "@/src/utils/match-minute-progress";
import {
  formatAbsolute,
  formatCurrentMarketRate,
  formatFixtureDateTime,
} from "@/src/utils/format";
import { LiveDot } from "./LiveDot";
import { ChangeEmphasis } from "./ChangeEmphasis";
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
          <MaterialCommunityIcons
            color={semantic.negative}
            name="card"
            size={iconSizes.micro}
          />
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
  match,
  onTogglePinned,
  pinned = false
}: {
  insight?: MatchInsight | undefined;
  match: MatchSummary;
  onTogglePinned?: (() => void) | undefined;
  pinned?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const live = match.status === "LIVE" || match.status === "HALF_TIME";
  const minuteProgress = deriveMatchMinuteProgress(match.status, match.elapsed);
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
      ? semantic.positive
      : rateTrend === "DOWN"
        ? semantic.negative
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
    pressureBalance.direction === "BALANCED"
      ? semantic.neutral
      : semantic.intelligence;
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
        <View style={styles.topActions}>
          <View style={[styles.timePill, live && styles.livePill]}>
            {live ? <LiveDot /> : null}
            <Text style={[styles.timeText, live && styles.liveText]}>
              {formatFixtureDateTime(match.matchDate, match.matchTime)}
            </Text>
          </View>
          {onTogglePinned ? (
            <Pressable
              accessibilityLabel={pinned ? "Sabitlemeyi kaldır" : "Maçı sabitle"}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: pinned }}
              hitSlop={4}
              onPress={(event) => {
                event.stopPropagation();
                onTogglePinned();
              }}
              style={({ pressed }) => [
                styles.pinButton,
                pinned && styles.pinButtonActive,
                pressed && styles.pinButtonPressed
              ]}
            >
              <MaterialCommunityIcons
                color={pinned ? colors.white : semantic.intelligence}
                name={pinned ? "pin" : "pin-outline"}
                size={iconSizes.control}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {minuteProgress.visible ? (
        <View
          accessibilityLabel="Maç süresi"
          accessibilityRole="progressbar"
          accessibilityValue={{
            max: 90,
            min: 0,
            now: Math.min(90, minuteProgress.minute),
            text: minuteProgress.label
          }}
          style={styles.minuteProgress}
        >
          <View style={styles.minuteProgressTrack}>
            <View
              style={[
                styles.minuteProgressFill,
                { width: `${minuteProgress.ratio * 100}%` }
              ]}
            />
          </View>
          <Text style={[styles.minuteProgressValue, live && styles.liveText]}>
            {minuteProgress.label}
          </Text>
        </View>
      ) : null}

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
          <ChangeEmphasis kind="alert" token={match.homeScore}>
            <Text style={styles.score}>{match.homeScore}</Text>
          </ChangeEmphasis>
          <ChangeEmphasis kind="alert" token={match.awayScore}>
            <Text style={styles.score}>{match.awayScore}</Text>
          </ChangeEmphasis>
        </View>
      </View>

      <SurfaceDivider
        {...(live ? { accent: semantic.live } : {})}
        style={styles.divider}
      />

      <View style={styles.bottomRow}>
        <View style={styles.decisionBlock}>
          <Text style={styles.decisionEyebrow}>BTB SEÇİMİ</Text>
          <Text numberOfLines={1} style={styles.odd}>
            {match.selectedOdd || "Aday bekleniyor"}
          </Text>
          <View style={styles.ratingRow}>
            <RatingStars rating={match.rating} />
            <Text style={styles.ratingLabel}>
              {match.rating > 0
                ? `BTB rating · ${Math.min(5, match.rating)}/5`
                : "BTB rating"}
            </Text>
          </View>
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
            <ChangeEmphasis
              style={styles.rateHeadline}
              token={currentMarket.value}
            >
              {rateTrend !== "UNAVAILABLE" ? (
                <MaterialCommunityIcons
                  color={rateTrendColor}
                  name={rateTrendIcon}
                  size={iconSizes.inline}
                />
              ) : null}
              <Text style={[styles.rate, { color: rateTrendColor }]}>
                {currentMarket.value}
              </Text>
            </ChangeEmphasis>
            <Text style={styles.rateLabel}>{currentMarket.label}</Text>
          </View>
        ) : null}
        {footer.showsPressure ? (
          <View
            // The spoken label keeps `Güncel` that the visible caption drops.
            // Speech has no row width to lose, and a listener cannot see the
            // live card framing that makes the figure's currency obvious.
            accessibilityLabel={
              pressureBalance.hasData
                ? `Güncel baskı farkı ${formatAbsolute(match.pressureDiff ?? 0, 1)}, ${
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
              size={iconSizes.control}
            />
            <View style={styles.pressureCopy}>
              <Text style={[styles.pressure, { color: pressureColor }]}>
                {pressureBalance.hasData
                  ? formatAbsolute(match.pressureDiff ?? 0, 1)
                  : "—"}
              </Text>
              {/* Two lines, not one: the waiting caption is the only footer
                  caption wider than the row's proven ceiling, and it earns the
                  wrap rather than being truncated into a different claim. */}
              <Text numberOfLines={2} style={styles.pressureLabel}>
                {pressureFooterCaption(pressureBalance.hasData)}
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
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
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
  pinButton: {
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSoft,
    borderRadius: radii.round,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  pinButtonActive: {
    backgroundColor: semantic.intelligence,
    borderColor: semantic.intelligence
  },
  pinButtonPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.94 }]
  },
  minuteProgress: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  minuteProgressValue: {
    color: colors.textMuted,
    minWidth: 44,
    textAlign: "right",
    ...typeScale.micro
  },
  minuteProgressTrack: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    flex: 1,
    height: 3,
    overflow: "hidden"
  },
  minuteProgressFill: {
    backgroundColor: semantic.live,
    borderRadius: radii.round,
    height: "100%"
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
    color: semantic.neutral,
    ...typeScale.micro
  },
  redCardBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  redCardCount: {
    color: semantic.negative,
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
  decisionEyebrow: {
    color: colors.bronze,
    ...typeScale.eyebrow
  },
  odd: {
    color: colors.text,
    ...typeScale.decision,
    marginTop: spacing.xs
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  ratingLabel: {
    color: colors.textSubtle,
    ...typeScale.label
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
