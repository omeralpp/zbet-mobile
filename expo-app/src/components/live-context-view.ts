import type {
  LiveContext,
  LiveContextAvailability,
  LiveMatchEvent,
  LiveRedCardType
} from "@/src/api/schemas";

/**
 * Presentation decisions for live context, kept pure so they can be tested
 * without a renderer — the same shape as the rest of this codebase's tests.
 *
 * The rule these functions exist to enforce: `timeline === null` (not
 * retrieved) and `timeline === []` (retrieved, and the match genuinely has no
 * goal or red card) are different statements and must never resolve to the same
 * UI state.
 *
 * The module shows goals and red cards only. It is not a commentary feed and
 * does not imitate the provider's timeline.
 */

export type TimelineState = "LOADING" | "UNAVAILABLE" | "EMPTY" | "EVENTS";

export const periodLabels: Record<string, string> = {
  FIRST_HALF: "İlk yarı",
  HALF_TIME: "Devre arası",
  SECOND_HALF: "İkinci yarı",
  FULL_TIME: "Maç sonu",
  EXTRA_TIME: "Uzatma",
  PENALTIES: "Penaltılar"
};

/**
 * Red-card wording.
 *
 * Both types are red cards and read as such. The distinction is preserved
 * because a second yellow and a straight red are materially different
 * disciplinary events, and the accessible label is where a user who cannot see
 * the colour learns which one it was.
 *
 * `UNKNOWN` means the source proved a dismissal without naming which kind, so
 * the plain wording is correct. A card whose dismissal meaning could not be
 * proven never reaches this app at all — it is excluded server-side rather than
 * published as a red card — so this label can never stand for a guess.
 */
export const redCardLabels: Record<string, string> = {
  DIRECT_RED: "Kırmızı kart",
  SECOND_YELLOW_RED: "İkinci sarıdan kırmızı",
  UNKNOWN: "Kırmızı kart"
};

export function resolveTimelineState(
  context: LiveContext | undefined,
  isLoading?: boolean
): TimelineState {
  if (isLoading) {
    return "LOADING";
  }
  const timeline = context?.timeline ?? null;
  if (timeline === null) {
    // Not retrieved. Deliberately never "EMPTY".
    return "UNAVAILABLE";
  }
  return visibleEvents(timeline).length === 0 ? "EMPTY" : "EVENTS";
}

/**
 * An event this build knows how to draw.
 *
 * Narrowing the kind here is what stops an unrecognised event from being
 * silently rendered as a goal: `describeEvent` only accepts this type, so a row
 * has to pass through `visibleEvents` before it can reach a renderer.
 */
export type VisibleEvent = LiveMatchEvent & { kind: "GOAL" | "RED_CARD" };

/**
 * Events this build can actually draw.
 *
 * A kind this build does not recognise is dropped rather than rendered: the
 * contract is narrow by design, so an unrecognised row means the contract
 * changed, and drawing a placeholder for it would be inventing an event.
 */
export function visibleEvents(
  timeline: readonly LiveMatchEvent[] | null | undefined
): VisibleEvent[] {
  if (!timeline) {
    return [];
  }
  return timeline.filter(
    (event): event is VisibleEvent =>
      event.kind === "GOAL" || event.kind === "RED_CARD"
  );
}

/**
 * User-facing unavailability copy.
 *
 * `UNAVAILABLE` and `FAILED` read identically on purpose — to the user both mean
 * "nothing to show right now", and the difference only matters to telemetry. No
 * provider name, status code or implementation hint ever appears here.
 */
export function unavailableMessage(
  availability?: LiveContextAvailability | undefined
): string {
  return availability === "DEGRADED"
    ? "Maç olaylarının bir bölümü şu anda alınamadı."
    : "Gol ve kırmızı kart bilgisi şu anda kullanılamıyor.";
}

export function minuteLabel(event: LiveMatchEvent): string {
  if (event.minuteLabel) {
    return event.minuteLabel;
  }
  return event.minute === null || event.minute === undefined
    ? ""
    : `${event.minute}'`;
}

export interface EventTeams {
  home?: string | null | undefined;
  away?: string | null | undefined;
}

export interface EventDisplay {
  kind: "GOAL" | "RED_CARD";
  minute: string;
  /** Top line. Null when the feed did not say which side the event belongs to. */
  team: string | null;
  /** Second line. */
  player: string | null;
  /** Running score after a goal; never shown for a red card. */
  score: string | null;
  side: "HOME" | "AWAY" | null;
  redCardType: LiveRedCardType | null;
}

function teamName(
  side: LiveMatchEvent["side"],
  teams: EventTeams | undefined
): string | null {
  if (side === "HOME") {
    return teams?.home ?? null;
  }
  if (side === "AWAY") {
    return teams?.away ?? null;
  }
  return null;
}

/**
 * Flattens one event into exactly what a row renders.
 *
 * Team on top, player beneath, score on the right for a goal. Nothing is
 * inferred: a missing scorer stays missing rather than being replaced by a
 * guess, and an own goal is only ever labelled as one when the contract says so.
 */
export function describeEvent(
  event: VisibleEvent,
  teams?: EventTeams
): EventDisplay {
  const side = event.side ?? null;
  const base = {
    minute: minuteLabel(event),
    side,
    team: teamName(side, teams)
  };

  if (event.kind === "RED_CARD") {
    return {
      ...base,
      kind: "RED_CARD",
      player: event.player?.rawName ?? null,
      score: null,
      redCardType: event.redCardType ?? "UNKNOWN"
    };
  }

  return {
    ...base,
    kind: "GOAL",
    player: event.scorer?.rawName ?? null,
    score: event.scoreAfter
      ? `${event.scoreAfter.home}-${event.scoreAfter.away}`
      : null,
    redCardType: null
  };
}

/** Spoken description for a row, used only as the accessibility label. */
export function describeEventForAccessibility(
  event: VisibleEvent,
  teams?: EventTeams
): string {
  const display = describeEvent(event, teams);
  const kind =
    display.kind === "GOAL"
      ? event.goalKind === "OWN_GOAL"
        ? "kendi kalesine gol"
        : "gol"
      : redCardLabels[display.redCardType ?? "UNKNOWN"];

  return [
    display.minute,
    kind,
    display.team,
    display.player,
    display.score ? `skor ${display.score}` : null
  ]
    .filter(Boolean)
    .join(", ");
}

export interface FreshnessNotice {
  visible: boolean;
  message: string | null;
}

/**
 * `stale` and `refreshFailed` are separate contract signals and stay separate
 * here: age past the threshold is not the same as being unable to reach the
 * source to confirm the value. Neither is ever shown as confirmed current data.
 */
export function resolveFreshnessNotice(
  freshness?: LiveContext["freshness"] | undefined
): FreshnessNotice {
  const stale = freshness?.stale ?? false;
  const refreshFailed = freshness?.refreshFailed ?? false;
  if (!stale && !refreshFailed) {
    return { visible: false, message: null };
  }

  const ageSeconds = freshness?.ageSeconds;
  const age =
    ageSeconds === null || ageSeconds === undefined
      ? null
      : ageSeconds < 60
        ? `${Math.round(ageSeconds)} sn`
        : `${Math.round(ageSeconds / 60)} dk`;

  const message = refreshFailed
    ? age
      ? `Güncellenemedi · ${age} önceki veri`
      : "Güncellenemedi · veri doğrulanmadı"
    : age
      ? `${age} önceki veri olabilir`
      : "Veri güncel olmayabilir";

  return { visible: true, message };
}
