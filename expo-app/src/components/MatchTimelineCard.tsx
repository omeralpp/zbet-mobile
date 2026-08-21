import { memo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { LiveContext } from "@/src/api/schemas";
import { LiveContextNotice } from "@/src/components/LiveContextNotice";
import { ChangeEmphasis } from "@/src/components/ChangeEmphasis";
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
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

function TimelineList({
  events,
  teams
}: {
  events: VisibleEvent[];
  teams: EventTeams;
}) {
  // The first content payload is the quiet baseline. A later event gets a new
  // keyed row and is the only row allowed to announce its arrival.
  const [initialEventKeys] = useState(
    () => new Set(events.map((event) => event.eventKey))
  );

  return (
    <View style={styles.list}>
      {events.map((event, index) => (
        <ChangeEmphasis
          announceOnMount={!initialEventKeys.has(event.eventKey)}
          key={event.eventKey}
          kind="alert"
          token={event.eventKey}
        >
          <TimelineRow
            event={event}
            isFirst={index === 0}
            isLast={index === events.length - 1}
            isLatest={index === events.length - 1}
            teams={teams}
          />
        </ChangeEmphasis>
      ))}
    </View>
  );
}

function MatchTimelineCardComponent({
  awayTeam,
  context,
  homeTeam,
  isLoading
}: {
  awayTeam?: string | null | undefined;
  context?: LiveContext | undefined;
  homeTeam?: string | null | undefined;
  isLoading?: boolean;
}) {
  const state = resolveTimelineState(context, isLoading);
  const events = visibleEvents(context?.timeline);
  const teams: EventTeams = { home: homeTeam, away: awayTeam };

  return (
    <>
      <View style={styles.card}>
        <SurfaceMaterial radius={radii.lg} />
        {state === "LOADING" ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="progressbar"
            style={styles.stateRow}
          >
            <ActivityIndicator color={semantic.live} />
            <Text style={styles.stateBody}>Maç akışı verisi bekleniyor</Text>
          </View>
        ) : state === "UNAVAILABLE" ? (
          // Not retrieved. Never rendered as "no events".
          <LiveContextNotice availability={context?.availability} />
        ) : state === "EMPTY" ? (
          <View style={styles.stateRow}>
            <MaterialCommunityIcons
              color={semantic.neutral}
              name="timeline-outline"
              size={iconSizes.navigation}
            />
            <Text style={styles.stateBody}>
              Bu maçta henüz gol veya kırmızı kart yok.
            </Text>
          </View>
        ) : (
          <TimelineList events={events} teams={teams} />
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
    minWidth: 68,
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
  }
});
