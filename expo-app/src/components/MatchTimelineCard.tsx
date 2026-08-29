import { memo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import type { LiveContext, SuperLog } from "@/src/api/schemas";
import { LiveContextNotice } from "@/src/components/LiveContextNotice";
import { ChangeEmphasis } from "@/src/components/ChangeEmphasis";
import { RatingStars } from "@/src/components/RatingStars";
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
import { buildMatchTimelineFeed } from "@/src/components/match-timeline-feed";
import { buildSuperRatingMarker } from "@/src/components/super-rating-marker";
import {
  describeEvent,
  describeEventForAccessibility,
  resolveTimelineState,
  visibleEvents,
  type EventTeams,
  type VisibleEvent
} from "@/src/components/live-context-view";
import {
  colors,
  iconSizes,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { resolveSideLabel, spokenSide } from "./timeline-attribution";

/**
 * Match events — goals and red cards.
 *
 * Deliberately not a commentary feed and not a copy of the provider's timeline.
 * These are the two event classes that carry decision weight, rendered in BTB's
 * own visual language: minute, mark, team, player, and the running score.
 *
 * The distinction that governs this component: `timeline === null` means the
 * events were never retrieved, while `timeline === []` means they were
 * retrieved and the match genuinely has neither. Those are different statements
 * and are never rendered the same way.
 */

/** A filled square reads as a card at this size; a glyph would not. */
function RedCardMark() {
  return <View style={styles.redCard} />;
}

function EventMark({ kind }: { kind: "GOAL" | "RED_CARD" }) {
  if (kind === "RED_CARD") {
    return <RedCardMark />;
  }
  return (
    <MaterialCommunityIcons
      color={colors.text}
      name="soccer"
      size={iconSizes.small}
    />
  );
}

function TimelineRow({
  event,
  isFirst,
  isLast,
  isLatest,
  teams
}: {
  event: VisibleEvent;
  isFirst: boolean;
  isLast: boolean;
  isLatest: boolean;
  teams: EventTeams;
}) {
  const display = describeEvent(event, teams);
  const primary = display.team ?? display.player;
  const secondary = display.team ? display.player : null;
  const sideLabel = resolveSideLabel(display.side);
  const spoken = spokenSide(display.side);
  const copy = (
    <View
      style={[
        styles.eventCard,
        display.side === "HOME" ? styles.eventCardHome : styles.eventCardAway,
        isLatest && styles.eventCardLatest
      ]}
    >
      <View
        style={[
          styles.eventMeta,
          display.side === "HOME" ? styles.alignEnd : styles.alignStart
        ]}
      >
        {sideLabel ? (
          <View style={styles.sideChip}>
            <Text style={styles.sideChipText}>{sideLabel}</Text>
          </View>
        ) : null}
        <Text style={styles.kindLabel}>
          {display.kind === "GOAL" ? "GOL" : "KIRMIZI KART"}
        </Text>
      </View>
      <Text
        numberOfLines={2}
        style={[
          styles.primary,
          display.side === "HOME" ? styles.textEnd : styles.textStart
        ]}
      >
        {primary ?? "Olay tarafı belirtilmedi"}
      </Text>
      {secondary ? (
        <Text
          numberOfLines={1}
          style={[
            styles.secondary,
            display.side === "HOME" ? styles.textEnd : styles.textStart
          ]}
        >
          {secondary}
        </Text>
      ) : null}
      {isLatest ? <Text style={styles.latestLabel}>SON OLAY</Text> : null}
    </View>
  );

  return (
    <View
      accessibilityLabel={[
        describeEventForAccessibility(event, teams),
        spoken,
        isLatest ? "son olay" : null
      ]
        .filter(Boolean)
        .join(", ")}
      accessible
      style={styles.rowWrap}
    >
      <View style={styles.lane}>
        {display.side === "HOME" ? copy : null}
      </View>
      <View style={styles.axis}>
        <View
          style={[
            styles.rail,
            isFirst && styles.railFirst,
            isLast && styles.railLast
          ]}
        />
        <View
          style={[
            styles.minutePill,
            isLatest && styles.minutePillLatest
          ]}
        >
          <Text
            style={[styles.minute, isLatest && styles.minuteLatest]}
          >
            {display.minute}
          </Text>
        </View>
        <View style={[styles.mark, isLatest && styles.markLatest]}>
          <EventMark kind={display.kind} />
        </View>
        {display.score ? (
          <View style={styles.scorePill}>
            <Text style={styles.score}>{display.score}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.lane}>
        {display.side === "AWAY" ? copy : null}
      </View>
      {display.side === null ? (
        <View style={styles.unknownEvent}>{copy}</View>
      ) : null}
    </View>
  );
}

function SuperDecisionRow({
  decision,
  isCurrent,
  isFirst,
  isLast,
  onPress,
  sharesMinute
}: {
  decision: SuperLog;
  isCurrent: boolean;
  isFirst: boolean;
  isLast: boolean;
  onPress: ((decision: SuperLog) => void) | undefined;
  sharesMinute: boolean;
}) {
  const ratingMarker = buildSuperRatingMarker(decision.rating);

  return (
    <Pressable
      accessibilityHint="Super karar detayını açar"
      accessibilityLabel={[
        `${decision.elapsed}. dakika Super tercihi`,
        ratingMarker.accessibilityLabel,
        decision.selectedOdd,
        isCurrent ? "güncel tercih" : null,
        sharesMinute ? "başka bir olayla aynı dakika; kesin sıralama bilinmiyor" : null
      ]
        .filter(Boolean)
        .join(", ")}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={() => onPress?.(decision)}
      style={({ pressed }) => [
        styles.rowWrap,
        styles.superRow,
        pressed && styles.superRowPressed
      ]}
    >
      <View style={[styles.lane, styles.superMeta]}>
        <Text style={styles.superLabel}>SUPER</Text>
      </View>
      <View style={styles.axis}>
        <View
          style={[
            styles.rail,
            styles.superRail,
            isFirst && styles.railFirst,
            isLast && styles.railLast
          ]}
        />
        <View style={[styles.minutePill, styles.superMinutePill]}>
          <Text style={[styles.minute, styles.superMinute]}>
            {decision.elapsed}&apos;
          </Text>
        </View>
        <View style={[styles.mark, styles.superMark]}>
          <RatingStars rating={ratingMarker.starCount} size={iconSizes.micro} />
        </View>
      </View>
      <View style={[styles.lane, styles.superSelection]}>
        <Text numberOfLines={2} style={styles.superOdd}>
          {decision.selectedOdd}
        </Text>
        <View style={styles.superAction}>
          {isCurrent ? (
            <Text style={styles.currentDecision}>GÜNCEL</Text>
          ) : null}
          <MaterialCommunityIcons
            color={colors.textMuted}
            name="chevron-right"
            size={iconSizes.inline}
          />
        </View>
      </View>
    </Pressable>
  );
}

function TimelineList({
  currentDecisionKey,
  decisions,
  events,
  onDecisionPress,
  teams
}: {
  currentDecisionKey: string | null | undefined;
  decisions: SuperLog[];
  events: VisibleEvent[];
  onDecisionPress: ((decision: SuperLog) => void) | undefined;
  teams: EventTeams;
}) {
  // The first content payload is the quiet baseline. A later event gets a new
  // keyed row and is the only row allowed to announce its arrival.
  const [initialEventKeys] = useState(
    () => new Set(events.map((event) => event.eventKey))
  );
  const feed = buildMatchTimelineFeed(events, decisions, currentDecisionKey);

  return (
    <View style={styles.list}>
      {feed.map((entry, index) =>
        entry.kind === "EVENT" ? (
          <ChangeEmphasis
            announceOnMount={!initialEventKeys.has(entry.event.eventKey)}
            key={entry.key}
            kind="alert"
            token={entry.event.eventKey}
          >
            <TimelineRow
              event={entry.event}
              isFirst={index === 0}
              isLast={index === feed.length - 1}
              isLatest={entry.isLatestEvent}
              teams={teams}
            />
          </ChangeEmphasis>
        ) : (
          <SuperDecisionRow
            decision={entry.decision}
            isCurrent={entry.isCurrent}
            isFirst={index === 0}
            isLast={index === feed.length - 1}
            key={entry.key}
            onPress={onDecisionPress}
            sharesMinute={entry.sharesMinute}
          />
        )
      )}
    </View>
  );
}

function MatchTimelineCardComponent({
  awayScore,
  awayTeam,
  context,
  currentDecisionKey,
  decisions = [],
  homeScore,
  homeTeam,
  isLoading,
  onDecisionPress
}: {
  awayScore?: number | null | undefined;
  awayTeam?: string | null | undefined;
  context?: LiveContext | undefined;
  currentDecisionKey?: string | null;
  decisions?: SuperLog[];
  homeScore?: number | null | undefined;
  homeTeam?: string | null | undefined;
  isLoading?: boolean;
  onDecisionPress?: (decision: SuperLog) => void;
}) {
  const state = resolveTimelineState(context, isLoading);
  const events = visibleEvents(context?.timeline);
  const teams: EventTeams = { home: homeTeam, away: awayTeam };
  // The scoreboard and the Live Context timeline are independent upstreams
  // (see NXT-OBS-118/117): the score can advance while the event feed is
  // genuinely empty. `state === "EMPTY"` already means the timeline was
  // retrieved and has neither goals nor red cards, so this only decides
  // which empty-state copy is honest: "no goals" is false once the score
  // itself proves otherwise.
  const scoreAdvanced = (homeScore ?? 0) + (awayScore ?? 0) > 0;
  const emptyStateBody = scoreAdvanced
    ? "Skor ilerledi ama olay detayı henüz gelmedi."
    : "Bu maçta henüz gol veya kırmızı kart yok.";
  const emptyNoticeText = scoreAdvanced
    ? "Skor ilerledi ama olay detayı henüz gelmedi."
    : "Henüz gol veya kırmızı kart yok.";

  return (
    <>
      <View style={styles.card}>
        <SurfaceMaterial radius={radii.lg} />
        {state === "LOADING" && decisions.length === 0 ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="progressbar"
            style={styles.stateRow}
          >
            <ActivityIndicator color={semantic.live} />
            <Text style={styles.stateBody}>Maç akışı verisi bekleniyor</Text>
          </View>
        ) : state === "UNAVAILABLE" && decisions.length === 0 ? (
          // Not retrieved. Never rendered as "no events".
          <LiveContextNotice availability={context?.availability} />
        ) : state === "EMPTY" && decisions.length === 0 ? (
          <View style={styles.stateRow}>
            <MaterialCommunityIcons
              color={semantic.neutral}
              name="timeline-outline"
              size={iconSizes.navigation}
            />
            <Text style={styles.stateBody}>{emptyStateBody}</Text>
          </View>
        ) : (
          <>
            {state === "LOADING" ? (
              <View style={styles.sourceNotice}>
                <ActivityIndicator color={semantic.live} size="small" />
                <Text style={styles.sourceNoticeText}>
                  Maç olayları yükleniyor; Super tercihleri hazır.
                </Text>
              </View>
            ) : state === "UNAVAILABLE" ? (
              <View style={styles.sourceNotice}>
                <Text style={styles.sourceNoticeText}>
                  Maç olayları alınamadı; Super tercihleri gösteriliyor.
                </Text>
              </View>
            ) : state === "EMPTY" ? (
              <View style={styles.sourceNotice}>
                <Text style={styles.sourceNoticeText}>{emptyNoticeText}</Text>
              </View>
            ) : null}
            <TimelineList
              currentDecisionKey={currentDecisionKey}
              decisions={decisions}
              events={events}
              onDecisionPress={onDecisionPress}
              teams={teams}
            />
          </>
        )}
      </View>
    </>
  );
}

export const MatchTimelineCard = memo(MatchTimelineCardComponent);

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg
  },
  list: {
    gap: 0
  },
  rowWrap: {
    alignItems: "stretch",
    flexDirection: "row",
    minHeight: 108,
    position: "relative"
  },
  lane: {
    flex: 1,
    minWidth: 0
  },
  axis: {
    alignItems: "center",
    minWidth: 92,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
    position: "relative"
  },
  rail: {
    backgroundColor: colors.bronze,
    bottom: 0,
    left: "50%",
    opacity: 0.55,
    position: "absolute",
    top: 0,
    width: 2
  },
  railFirst: {
    top: 24
  },
  railLast: {
    bottom: 52
  },
  minutePill: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    minWidth: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    zIndex: 2
  },
  minutePillLatest: {
    backgroundColor: semantic.liveSoft,
    borderColor: semantic.live
  },
  minute: {
    color: colors.textMuted,
    ...typeScale.meta,
    fontVariant: ["tabular-nums"],
    textAlign: "center"
  },
  minuteLatest: {
    color: semantic.live
  },
  eventCard: {
    borderColor: colors.borderSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    marginVertical: spacing.sm,
    minHeight: 80,
    padding: spacing.sm
  },
  eventCardHome: {
    alignItems: "flex-end"
  },
  eventCardAway: {
    alignItems: "flex-start"
  },
  eventCardLatest: {
    borderColor: semantic.live
  },
  eventMeta: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  alignEnd: {
    justifyContent: "flex-end"
  },
  alignStart: {
    justifyContent: "flex-start"
  },
  kindLabel: {
    color: colors.textSubtle,
    ...typeScale.micro
  },
  latestLabel: {
    color: semantic.live,
    ...typeScale.micro,
    marginTop: spacing.xs
  },
  sideChip: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1
  },
  sideChipText: {
    color: colors.textMuted,
    ...typeScale.micro
  },
  mark: {
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    marginTop: spacing.xs,
    width: 30,
    zIndex: 2
  },
  markLatest: {
    borderColor: semantic.live
  },
  redCard: {
    backgroundColor: semantic.negative,
    borderRadius: 2,
    height: 15,
    width: 11
  },
  primary: {
    color: colors.text,
    ...typeScale.identityCompact,
    marginTop: spacing.xs
  },
  secondary: {
    color: colors.textMuted,
    ...typeScale.label,
    marginTop: 2
  },
  textEnd: {
    textAlign: "right"
  },
  textStart: {
    textAlign: "left"
  },
  scorePill: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.bronze,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    zIndex: 2
  },
  score: {
    color: colors.text,
    ...typeScale.meta,
    fontVariant: ["tabular-nums"],
    textAlign: "center"
  },
  unknownEvent: {
    bottom: spacing.sm,
    left: 76,
    position: "absolute",
    right: 0,
    top: spacing.sm
  },
  stateRow: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.md
  },
  stateBody: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    textAlign: "center"
  },
  sourceNotice: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.sm
  },
  sourceNoticeText: {
    color: colors.textMuted,
    flex: 1,
    ...typeScale.label
  },
  superRow: {
    borderRadius: radii.md
  },
  superRowPressed: {
    backgroundColor: colors.goldSoft,
    opacity: 0.82
  },
  superMeta: {
    alignItems: "flex-end",
    justifyContent: "center"
  },
  superLabel: {
    color: colors.gold,
    ...typeScale.micro
  },
  superRail: {
    backgroundColor: colors.gold
  },
  superMinutePill: {
    borderColor: colors.gold
  },
  superMinute: {
    color: colors.gold
  },
  superMark: {
    borderColor: colors.gold,
    height: 36,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    width: "auto"
  },
  superSelection: {
    alignItems: "flex-start",
    justifyContent: "center"
  },
  superOdd: {
    color: colors.text,
    ...typeScale.identityCompact
  },
  superAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  currentDecision: {
    color: semantic.positive,
    ...typeScale.micro
  }
});
