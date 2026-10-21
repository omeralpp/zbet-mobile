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
  deriveLiveRateTrend
} from "@/src/utils/live-card-indicators";
import type { PressureDirection } from "@/src/utils/pressure-balance";
import { matchPressureSide } from "@/src/utils/match-pressure";
import { deriveMatchMinuteProgress } from "@/src/utils/match-minute-progress";
import {
  formatCurrentMarketRate,
  formatFixtureDateTime,
  formatRate,
  formatSelection,
} from "@/src/utils/format";
import { LiveDot } from "./LiveDot";
import { ChangeEmphasis } from "./ChangeEmphasis";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { RatingStars } from "./RatingStars";
import { TeamLogo } from "./TeamLogo";
import { useRebuildClock } from "./RebuildEvidencePanel";
import { currentRebuild } from "@/src/utils/rebuild-current";

/**
 * Home pressure is drawn in intelligence blue and away pressure in orange, the
 * same pair the pressure chart uses, so the arrow beside a team name and the bar
 * on the detail screen are one vocabulary.
 */
export const pressureSide = {
  HOME: { icon: "home-variant-outline", color: semantic.intelligence, label: "ev sahibinde" },
  AWAY: { icon: "airplane", color: colors.orange, label: "deplasmanda" }
} as const;

function TeamName({
  name,
  participantId,
  position,
  redCards,
  compact,
  pressure,
  pressureEstimated
}: {
  name: string;
  participantId?: string | null | undefined;
  position?: number | null | undefined;
  redCards?: number | undefined;
  compact: boolean;
  /** Set only on the side that currently has the pressure. */
  pressure?: Exclude<PressureDirection, "BALANCED"> | undefined;
  pressureEstimated: boolean;
}) {
  const side = pressure ? pressureSide[pressure] : null;
  // The name takes the row, so red cards and the pressure mark sit against the
  // score as on the v40 board.
  return (
    <View style={styles.teamRow}>
      <TeamLogo name={name} participantId={participantId} size={compact ? "compact" : "standard"} />
      <Text numberOfLines={1} style={styles.team}>
        {name}
        {position ? (
          <Text accessibilityLabel={`Lig sırası ${position}`} style={styles.rank}>
            {` #${position}`}
          </Text>
        ) : null}
      </Text>
      {redCards && redCards > 0 ? (
        <View
          accessibilityLabel={`${name}, ${redCards} kırmızı kart`}
          style={styles.redCardBadge}
        >
          <View style={styles.redCard} />
          {redCards > 1 ? (
            <Text style={styles.redCardCount}>{redCards}</Text>
          ) : null}
        </View>
      ) : null}
      {side ? (
        <MaterialCommunityIcons
          accessibilityLabel={`${pressureEstimated ? "Tahmini baskı" : "Baskı"} ${side.label}`}
          color={side.color}
          name={side.icon}
          size={compact ? iconSizes.small : 17}
          style={pressureEstimated ? styles.estimated : undefined}
        />
      ) : null}
    </View>
  );
}

export function MatchCard({
  compact = false,
  dense = false,
  horizontal = false,
  insight,
  match: sourceMatch,
  onTogglePinned,
  pinned = false,
  onSelect,
  selected = false
}: {
  compact?: boolean;
  /** Desktop Canlı list row (v40 W-Canlı): kickoff beside the league, stars beside the market. */
  dense?: boolean;
  /** Desktop Özet feature (v40 W-Özet): the match on the left, the BTB selection panel on the right. */
  horizontal?: boolean;
  insight?: MatchInsight | undefined;
  match: MatchSummary;
  onTogglePinned?: (() => void) | undefined;
  pinned?: boolean;
  /** Desktop split view: select the match into the side pane instead of navigating. */
  onSelect?: (() => void) | undefined;
  selected?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const now = useRebuildClock();
  const match = sourceMatch.rebuild && !currentRebuild(sourceMatch.rebuild, now)
    ? { ...sourceMatch, selectedOdd: "", rating: 0, liveRate: null, currentRate: null } : sourceMatch;
  const live = match.status === "LIVE" || match.status === "HALF_TIME";
  const minuteProgress = deriveMatchMinuteProgress(match.status, match.elapsed);
  const kickoff = formatFixtureDateTime(match.matchDate, match.matchTime);
  const currentMarket = formatCurrentMarketRate(
    match.currentRate,
    match.selectedOdd,
    "canlı oran"
  );
  const rateTrend = deriveLiveRateTrend(match.liveRate, match.currentRate);
  const rateTrendIcon =
    rateTrend === "UP"
      ? "arrow-top-right"
      : rateTrend === "DOWN"
        ? "arrow-bottom-right"
        : "minus";
  const rateTrendColor = rateTrend === "UP" || rateTrend === "DOWN" ? semantic.intelligence : colors.textSubtle;
  const pressure = matchPressureSide(match);
  const pressureEstimated = pressure.estimated;
  const pressureDirection = pressure.direction;
  const footer = deriveLiveCardFooter(
    match.selectedOdd,
    match.currentRate,
    pressure.hasData
  );
  const leader =
    match.homeScore === match.awayScore ? null : match.homeScore > match.awayScore ? "HOME" : "AWAY";
  // Spelled in capitals here rather than left to `textTransform`, which follows
  // the device locale on Android and would print a dotless I in SEÇİMİ. The
  // v40 board names the current selection plainly; an RB1 match without one
  // says it is waiting for confirmation. The stars keep their meaning in the
  // spoken label (consistency and evidence quality).
  const eyebrow = match.rebuild && !match.selectedOdd ? "TEYİT BEKLENİYOR" : "BTB SEÇİMİ";
  const starsSpoken = match.rebuild ? "tutarlılık ve kanıt kalitesi" : "BTB rating";
  const rateSpoken = `${currentMarket.label} ${currentMarket.value}, ${
    rateTrend === "UP"
      ? "seçim oranından yüksek"
      : rateTrend === "DOWN"
        ? "seçim oranından düşük"
        : "değişim yok veya güncel oran bulunamadı"
  }`;
  const trendGlyph = rateTrend !== "UNAVAILABLE" ? (
    <MaterialCommunityIcons
      color={rateTrendColor}
      name={rateTrendIcon}
      size={compact ? iconSizes.small : iconSizes.inline}
    />
  ) : null;

  return (
    <View style={[styles.card, compact && styles.cardCompact, selected && styles.cardSelected]}>
      <SurfaceMaterial {...(live ? { accent: semantic.live } : {})} radius={compact ? radii.lg : 20} />
    <Pressable
      accessibilityHint={onSelect ? "Maç detayını yandaki panelde gösterir" : "Maç detayını açar"}
      accessibilityRole="button"
      accessibilityState={onSelect ? { selected } : undefined}
      aria-pressed={onSelect ? selected : undefined}
      onPress={() =>
        onSelect
          ? onSelect()
          : router.push({
              pathname: "/match/[key]",
              params: {
                key: match.key,
                from: pathname
              }
            } as never)
      }
      style={({ pressed }) => [styles.cardAction, compact && styles.cardActionCompact, horizontal && styles.cardActionHorizontal, pressed && styles.pressed]}
    >
      <View style={horizontal ? styles.horizontalMain : styles.verticalMain}>
      <View style={[styles.topRow, onTogglePinned ? styles.pinSpace : null]}>
        <View style={styles.leagueBlock}>
          <Text numberOfLines={1} style={styles.league}>
            {dense ? `${match.league} · ${match.matchTime}` : match.league}
          </Text>
          {!compact && (live || minuteProgress.visible) ? (
            <Text numberOfLines={1} style={styles.kickoff}>{kickoff}</Text>
          ) : null}
        </View>
        <View
          accessibilityLabel={live ? `Maç süresi ${minuteProgress.label}` : undefined}
          style={[styles.timePill, live && styles.livePill]}
        >
          {live ? <LiveDot /> : null}
          <Text numberOfLines={1} style={[styles.timeText, live && styles.liveText]}>
            {minuteProgress.visible ? minuteProgress.label : kickoff}
          </Text>
        </View>
      </View>

      <View style={[styles.teams, compact && styles.teamsCompact]}>
        <View style={styles.participantRow}>
          <TeamName
            compact={compact}
            name={match.homeTeam}
            participantId={match.homeParticipantId}
            position={insight?.homeStandingPosition}
            pressure={pressureDirection === "HOME" ? "HOME" : undefined}
            pressureEstimated={pressureEstimated}
            redCards={insight?.homeRedCards}
          />
          <ChangeEmphasis kind="alert" token={match.homeScore}>
            <Text style={[styles.score, compact && styles.scoreCompact, leader === "AWAY" && styles.scoreTrailing]}>{match.homeScore}</Text>
          </ChangeEmphasis>
        </View>
        <View style={styles.participantRow}>
          <TeamName
            compact={compact}
            name={match.awayTeam}
            participantId={match.awayParticipantId}
            position={insight?.awayStandingPosition}
            pressure={pressureDirection === "AWAY" ? "AWAY" : undefined}
            pressureEstimated={pressureEstimated}
            redCards={insight?.awayRedCards}
          />
          <ChangeEmphasis kind="alert" token={match.awayScore}>
            <Text style={[styles.score, compact && styles.scoreCompact, leader === "HOME" && styles.scoreTrailing]}>{match.awayScore}</Text>
          </ChangeEmphasis>
        </View>
      </View>
      </View>

      {horizontal ? (
        <View style={styles.sidePanel}>
          <Text numberOfLines={1} style={styles.decisionEyebrow}>{eyebrow}</Text>
          <Text numberOfLines={2} style={styles.sideOdd}>
            {formatSelection(match.selectedOdd) || "Şu anda seçim yok"}
          </Text>
          <View style={styles.sideFoot}>
            {match.selectedOdd ? (
              <View accessibilityLabel={`${match.rating} / 5 yıldız, ${starsSpoken}`} accessible>
                <RatingStars rating={match.rating} size={12} />
              </View>
            ) : <View />}
            {footer.showsRate ? (
              <View accessibilityLabel={`${match.selectedOdd ? `Seçim oranı ${formatRate(match.liveRate)}, ` : ""}${rateSpoken}`} style={styles.compactRates}>
                {match.selectedOdd ? <Text style={styles.compactRate}>{formatRate(match.liveRate)}</Text> : null}
                <ChangeEmphasis style={styles.rateHeadline} token={currentMarket.value}>
                  {trendGlyph}
                  <Text style={[styles.compactRate, { color: rateTrendColor }]}>{currentMarket.value}</Text>
                </ChangeEmphasis>
              </View>
            ) : null}
          </View>
        </View>
      ) : compact ? (
        <View style={styles.compactDecision}>
          <View accessibilityLabel={match.selectedOdd ? `${formatSelection(match.selectedOdd)}, ${match.rating} yıldız, ${starsSpoken}` : undefined} style={[styles.compactDecisionCopy, dense && styles.compactDecisionInline]}>
            <Text numberOfLines={1} style={styles.compactOdd}>
              {formatSelection(match.selectedOdd) || "Şu anda seçim yok"}
            </Text>
            {match.selectedOdd ? <RatingStars rating={match.rating} size={12} /> : null}
          </View>
          {footer.showsRate ? (
            <View accessibilityLabel={`${match.selectedOdd ? `Seçim oranı ${formatRate(match.liveRate)}, ` : ""}${rateSpoken}`} style={styles.compactRates}>
              {match.selectedOdd ? <Text style={styles.compactRate}>{formatRate(match.liveRate)}</Text> : null}
              <ChangeEmphasis style={styles.rateHeadline} token={currentMarket.value}>
                {trendGlyph}
                <Text style={[styles.compactRate, { color: rateTrendColor }]}>{currentMarket.value}</Text>
              </ChangeEmphasis>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.decisionPanel}>
          <View style={styles.decisionHeader}>
            <Text numberOfLines={1} style={styles.decisionEyebrow}>{eyebrow}</Text>
            {match.selectedOdd ? (
              <View accessibilityLabel={`${match.rating} / 5 yıldız, ${starsSpoken}`} accessible>
                <RatingStars rating={match.rating} size={13} />
              </View>
            ) : null}
          </View>
          <Text style={styles.odd}>
            {formatSelection(match.selectedOdd) || "Şu anda seçim yok"}
          </Text>
          {footer.showsRate ? (
            <View style={styles.rateRow}>
              {match.selectedOdd ? (
                <View accessibilityLabel={`Seçim oranı ${formatRate(match.liveRate)}`} style={styles.rateBlock}>
                  <Text style={styles.rate}>{formatRate(match.liveRate)}</Text>
                  <Text style={styles.rateLabel}>seçim oranı</Text>
                </View>
              ) : null}
              <View accessibilityLabel={rateSpoken} style={[styles.rateBlock, styles.rateBlockEnd]}>
                <ChangeEmphasis style={styles.rateHeadline} token={currentMarket.value}>
                  {trendGlyph}
                  <Text style={[styles.rate, { color: rateTrendColor }]}>
                    {currentMarket.value}
                  </Text>
                </ChangeEmphasis>
                <Text style={styles.rateLabel}>{currentMarket.label}</Text>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
    {onTogglePinned ? <Pressable
      accessibilityLabel={pinned ? "Sabitlemeyi kaldır" : "Maçı sabitle"}
      accessibilityRole="button" accessibilityState={{ selected: pinned }} aria-pressed={pinned}
      onPress={onTogglePinned}
      style={({ pressed }) => [styles.pinButton, pinned && styles.pinButtonActive, pressed && styles.pinButtonPressed]}>
      <MaterialCommunityIcons color={pinned ? colors.white : semantic.intelligence}
        name={pinned ? "pin" : "pin-outline"} size={19} />
    </Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // The fill is the Intelligence Noir material, so the card clips its corners
    // and lets that layer paint. The border stays soft even when the card is
    // live: the energy is the short edge bar, never a lit outline.
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: spacing.md,
    ...shadows.card
  },
  cardCompact: {
    borderRadius: radii.lg
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.995 }]
  },
  // The match shown in the desktop side pane. Intelligence blue rather than the
  // live teal, so "selected" never reads as "live".
  cardSelected: {
    borderColor: semantic.intelligence,
    borderWidth: 2
  },
  cardAction: {
    paddingTop: spacing.md,
    paddingRight: spacing.md,
    paddingBottom: 14,
    paddingLeft: 14,
    borderRadius: 20,
    gap: spacing.sm
  },
  cardActionCompact: {
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radii.lg
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 28
  },
  pinSpace: {
    minHeight: 44,
    paddingRight: 52
  },
  leagueBlock: {
    flex: 1,
    minWidth: 0
  },
  league: {
    color: colors.textMuted,
    ...typeScale.eyebrow
  },
  kickoff: {
    color: colors.textMuted,
    ...typeScale.label,
    letterSpacing: 0,
    lineHeight: 16
  },
  timePill: {
    minHeight: 24,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  livePill: {
    // Live state used loss red, so a match in progress and a decision that lost
    // were the same colour. It carries BTB's own live signature and says only
    // that the match is happening.
    backgroundColor: semantic.liveSoft
  },
  timeText: {
    color: colors.textMuted,
    ...typeScale.eyebrow
  },
  liveText: {
    color: semantic.live
  },
  pinButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: colors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  pinButtonActive: {
    backgroundColor: semantic.intelligence,
    borderColor: semantic.intelligence
  },
  pinButtonPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.94 }]
  },
  teams: {
    gap: 6,
    marginTop: 2
  },
  teamsCompact: {
    gap: spacing.xs,
    marginTop: 0
  },
  participantRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minWidth: 0 },
  teamRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minWidth: 0,
    flex: 1
  },
  team: {
    color: colors.text,
    flex: 1,
    minWidth: 0,
    ...typeScale.identity,
    lineHeight: 19
  },
  rank: {
    color: colors.textMuted,
    ...typeScale.label,
    fontWeight: "700",
    letterSpacing: 0
  },
  redCardBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3
  },
  redCard: {
    width: 9,
    height: 13,
    borderRadius: 2,
    backgroundColor: semantic.negative
  },
  redCardCount: {
    color: semantic.negative,
    ...typeScale.micro
  },
  estimated: {
    opacity: 0.6
  },
  score: {
    color: colors.text,
    ...typeScale.score,
    minWidth: 24,
    textAlign: "right"
  },
  scoreCompact: {
    fontSize: 26,
    lineHeight: 28,
    minWidth: 22
  },
  // The trailing side dims so the leading score reads first at a glance; a
  // level score keeps both at full strength.
  scoreTrailing: {
    color: colors.textMuted
  },
  decisionPanel: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: 2
  },
  decisionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  decisionEyebrow: {
    color: colors.bronze,
    flexShrink: 1,
    ...typeScale.eyebrow
  },
  odd: {
    color: colors.text,
    ...typeScale.decision
  },
  caption: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: -spacing.xs
  },
  rateRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    // Last line of defence: a long market label next to a three-digit rate can
    // still outgrow a 360dp card, and wrapping is the only failure mode here
    // that neither truncates a Turkish label nor pushes past the card edge.
    flexWrap: "wrap"
  },
  rateBlock: {
    minWidth: 0
  },
  rateBlockEnd: {
    alignItems: "flex-end",
    marginLeft: "auto"
  },
  rateHeadline: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  rate: {
    color: colors.text,
    ...typeScale.metric
  },
  rateLabel: {
    color: colors.textMuted,
    ...typeScale.label,
    letterSpacing: 0
  },
  pressureLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm
  },
  pressureValue: {
    color: colors.text,
    ...typeScale.metricCompact,
    fontSize: 15,
    lineHeight: 18
  },
  pressureLabel: {
    color: colors.textMuted,
    flexShrink: 1,
    ...typeScale.label,
    letterSpacing: 0
  },
  compactDecision: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: 2
  },
  compactDecisionCopy: {
    flex: 1,
    minWidth: 0
  },
  // Desktop list row (v40 W-Canlı): the market with its stars on one line.
  compactDecisionInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  verticalMain: {
    gap: spacing.sm
  },
  cardActionHorizontal: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md
  },
  horizontalMain: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm
  },
  // Desktop Özet feature (v40 W-Özet): the selection on its own panel.
  sidePanel: {
    width: "44%",
    justifyContent: "center",
    gap: 6,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surfaceStrong
  },
  sideOdd: {
    color: colors.text,
    ...typeScale.decision,
    fontSize: 15,
    lineHeight: 20
  },
  sideFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  compactOdd: {
    color: colors.text,
    flexShrink: 1,
    ...typeScale.decision,
    fontSize: 14,
    lineHeight: 19
  },
  compactRates: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  compactRate: {
    color: colors.text,
    ...typeScale.metric,
    fontSize: 20,
    lineHeight: 22
  }
});
