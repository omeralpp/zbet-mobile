import { memo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { LiveContext, LiveMatchEvent } from "@/src/api/schemas";
import { ModuleHeading } from "@/src/components/ModuleHeading";
import { LiveContextNotice } from "@/src/components/LiveContextNotice";
import {
  cardLabels,
  describeEvent,
  minuteLabel,
  resolveTimelineState
} from "@/src/components/live-context-view";
import { colors, radii, spacing } from "@/src/theme/theme";

/**
 * Match timeline.
 *
 * Renders only what the contract actually carries. The distinction that governs
 * this component: `timeline === null` means the events were never retrieved,
 * while `timeline === []` means they were retrieved and the match genuinely has
 * none. Those are different statements and are never rendered the same way.
 */

const cardColors: Record<string, string> = {
  YELLOW: colors.gold,
  SECOND_YELLOW: colors.orange,
  RED: colors.red
};

function EventIcon({ event }: { event: LiveMatchEvent }) {
  if (event.kind === "GOAL") {
    return (
      <MaterialCommunityIcons color={colors.green} name="soccer" size={16} />
    );
  }
  if (event.kind === "CARD") {
    return (
      <MaterialCommunityIcons
        color={cardColors[event.cardKind ?? "UNKNOWN"] ?? colors.textMuted}
        name="card"
        size={16}
      />
    );
  }
  if (event.kind === "SUBSTITUTION") {
    return (
      <MaterialCommunityIcons color={colors.blue} name="swap-horizontal" size={16} />
    );
  }
  return (
    <MaterialCommunityIcons color={colors.textSubtle} name="flag-outline" size={14} />
  );
}

/** A period marker reads as a divider, not as another event in the run. */
function PeriodMarker({ label }: { label: string }) {
  return (
    <View style={styles.markerRow}>
      <View style={styles.markerLine} />
      <Text style={styles.markerText}>{label}</Text>
      <View style={styles.markerLine} />
    </View>
  );
}

function accessibilityLabel(event: LiveMatchEvent): string {
  const minute = minuteLabel(event);
  const side = event.side === "HOME" ? "ev sahibi" : event.side === "AWAY" ? "deplasman" : "";
  if (event.kind === "GOAL") {
    return `${minute} gol, ${side}, ${event.scorer?.rawName ?? "bilinmeyen oyuncu"}`;
  }
  if (event.kind === "CARD") {
    return `${minute} ${cardLabels[event.cardKind ?? "UNKNOWN"] ?? "kart"}, ${side}, ${event.player?.rawName ?? ""}`;
  }
  if (event.kind === "SUBSTITUTION") {
    return `${minute} oyuncu değişikliği, ${side}, ${event.playerOn?.rawName ?? ""} girdi`;
  }
  return `${minute} ${event.displayText ?? "olay"}`;
}

function TimelineRow({ event }: { event: LiveMatchEvent }) {
  const display = describeEvent(event);

  if (display.isMarker) {
    return <PeriodMarker label={display.primary} />;
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel(event)}
      accessible
      style={styles.row}
    >
      <Text style={styles.minute}>{display.minute}</Text>
      <View style={styles.icon}>
        <EventIcon event={event} />
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.primary}>
          {display.primary}
        </Text>
        {display.secondary ? (
          <Text numberOfLines={1} style={styles.secondary}>
            {display.secondary}
          </Text>
        ) : null}
      </View>

      {display.score ? (
        <Text style={styles.score}>{display.score}</Text>
      ) : (
        <View style={styles.sideMarker}>
          {display.side ? (
            <View
              style={[
                styles.sideDot,
                display.side === "HOME" ? styles.homeDot : styles.awayDot
              ]}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

function MatchTimelineCardComponent({
  context,
  isLoading
}: {
  context?: LiveContext | undefined;
  isLoading?: boolean;
}) {
  const state = resolveTimelineState(context, isLoading);
  const events = context?.timeline ?? [];

  return (
    <>
      <ModuleHeading eyebrow="MAÇ AKIŞI" title="Olaylar" />
      <View style={styles.card}>
        {state === "LOADING" ? (
          <Text style={styles.stateBody}>Maç olayları yükleniyor…</Text>
        ) : state === "UNAVAILABLE" ? (
          // Not retrieved. Never rendered as "no events".
          <LiveContextNotice availability={context?.availability} />
        ) : state === "EMPTY" ? (
          <Text style={styles.stateBody}>
            Bu maçta henüz kayıtlı bir olay yok.
          </Text>
        ) : (
          <View style={styles.list}>
            {events.map((event) => (
              <TimelineRow event={event} key={event.eventKey} />
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
    gap: spacing.xs
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 44
  },
  minute: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    minWidth: 34,
    textAlign: "right"
  },
  icon: {
    alignItems: "center",
    width: 20
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
    fontSize: 11,
    marginTop: 1
  },
  score: {
    color: colors.text,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    minWidth: 34,
    textAlign: "right"
  },
  sideMarker: {
    alignItems: "flex-end",
    minWidth: 34
  },
  sideDot: {
    borderRadius: radii.round,
    height: 6,
    width: 6
  },
  homeDot: {
    backgroundColor: colors.blue
  },
  awayDot: {
    backgroundColor: colors.green
  },
  markerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  markerLine: {
    backgroundColor: colors.borderSoft,
    flex: 1,
    height: 1
  },
  markerText: {
    color: colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  stateBody: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    paddingVertical: spacing.md
  }
});
