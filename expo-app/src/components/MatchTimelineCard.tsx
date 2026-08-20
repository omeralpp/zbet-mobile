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
import {
  isInset,
  resolveSideAlignment,
  resolveSideLabel,
  spokenSide
} from "./timeline-attribution";

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
  teams
}: {
  event: VisibleEvent;
  teams: EventTeams;
}) {
  const display = describeEvent(event, teams);
  // Team on top, player beneath. When the feed did not say which side scored,
  // the player moves up rather than leaving an empty line or inventing a team.
  const primary = display.team ?? display.player;
  const secondary = display.team ? display.player : null;
  const alignment = resolveSideAlignment(display.side);
  const sideLabel = resolveSideLabel(display.side);
  const inset = isInset(display.side);
  const spoken = spokenSide(display.side);

  return (
    <View
      accessibilityLabel={[describeEventForAccessibility(event, teams), spoken]
        .filter(Boolean)
        .join(", ")}
      accessible
      style={styles.rowWrap}
    >
      {/* The minute stays in a fixed column so the time axis remains straight
          to scan; only the event body shifts by side. */}
      <Text style={styles.minute}>{display.minute}</Text>
      <View
        style={[
          styles.row,
          alignment !== "UNKNOWN" && styles.rowAttributed,
          inset && styles.rowInset
        ]}
      >
        <View style={styles.mark}>
          <EventMark kind={display.kind} />
        </View>
        <View style={styles.body}>
          <View style={styles.primaryLine}>
            {sideLabel ? (
              <View style={styles.sideChip}>
                <Text style={styles.sideChipText}>{sideLabel}</Text>
              </View>
            ) : null}
            <Text numberOfLines={1} style={styles.primary}>
              {primary ?? "—"}
            </Text>
          </View>
          {secondary ? (
            <Text numberOfLines={1} style={styles.secondary}>
              {secondary}
            </Text>
          ) : null}
        </View>
        {display.score ? (
          <Text style={styles.score}>{display.score}</Text>
        ) : null}
      </View>
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
      {events.map((event) => (
        <ChangeEmphasis
          announceOnMount={!initialEventKeys.has(event.eventKey)}
          key={event.eventKey}
          kind="alert"
          token={event.eventKey}
        >
          <TimelineRow event={event} teams={teams} />
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
    gap: spacing.md
  },
  rowWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  row: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    minWidth: 0
  },
  // A neutral rail, not a coloured one. Home and away are not semantic states
  // in this palette, and no reliable team-colour data exists in the contract.
  rowAttributed: {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: spacing.md
  },
  // Away events sit inset, so a run of same-side goals forms a column and an
  // alternating sequence reads as a staircase before any text is read.
  rowInset: {
    marginLeft: spacing.xl
  },
  minute: {
    color: colors.textMuted,
    ...typeScale.meta,
    fontVariant: ["tabular-nums"],
    minWidth: 30,
    textAlign: "right"
  },
  primaryLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minWidth: 0
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
    width: 18
  },
  redCard: {
    backgroundColor: semantic.negative,
    borderRadius: 2,
    height: 15,
    width: 11
  },
  body: {
    flex: 1,
    minWidth: 0
  },
  primary: {
    color: colors.text,
    flexShrink: 1,
    ...typeScale.identityCompact
  },
  secondary: {
    color: colors.textMuted,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  score: {
    color: colors.text,
    ...typeScale.metricCompact,
    fontVariant: ["tabular-nums"],
    minWidth: 36,
    textAlign: "right"
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
