import { memo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { LiveContext } from "@/src/api/schemas";
import { ModuleHeading } from "@/src/components/ModuleHeading";
import { LiveContextNotice } from "@/src/components/LiveContextNotice";
import {
  describeEvent,
  describeEventForAccessibility,
  resolveTimelineState,
  visibleEvents,
  type EventTeams,
  type VisibleEvent
} from "@/src/components/live-context-view";
import { colors, radii, spacing } from "@/src/theme/theme";

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
  return <MaterialCommunityIcons color={colors.green} name="soccer" size={15} />;
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

  return (
    <View
      accessibilityLabel={describeEventForAccessibility(event, teams)}
      accessible
      style={styles.row}
    >
      <Text style={styles.minute}>{display.minute}</Text>
      <View style={styles.mark}>
        <EventMark kind={display.kind} />
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.primary}>
          {primary ?? "—"}
        </Text>
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
      <ModuleHeading eyebrow="MAÇ AKIŞI" title="Goller ve kırmızı kartlar" />
      <View style={styles.card}>
        {state === "LOADING" ? (
          <Text style={styles.stateBody}>Maç olayları yükleniyor…</Text>
        ) : state === "UNAVAILABLE" ? (
          // Not retrieved. Never rendered as "no events".
          <LiveContextNotice availability={context?.availability} />
        ) : state === "EMPTY" ? (
          <Text style={styles.stateBody}>
            Bu maçta henüz gol veya kırmızı kart yok.
          </Text>
        ) : (
          <View style={styles.list}>
            {events.map((event) => (
              <TimelineRow event={event} key={event.eventKey} teams={teams} />
            ))}
          </View>
        )}
      </View>
    </>
  );
}

export const MatchTimelineCard = memo(MatchTimelineCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg
  },
  list: {
    gap: spacing.md
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  minute: {
    color: colors.textMuted,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    minWidth: 30,
    textAlign: "right"
  },
  mark: {
    alignItems: "center",
    width: 18
  },
  redCard: {
    backgroundColor: colors.red,
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
    fontSize: 13,
    fontWeight: "800"
  },
  secondary: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1
  },
  score: {
    color: colors.text,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    minWidth: 36,
    textAlign: "right"
  },
  stateBody: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    paddingVertical: spacing.md
  }
});
