import type {
  LiveContext,
  LiveContextAvailability,
  LiveLineupSide,
  LiveMatchEvent
} from "@/src/api/schemas";

/**
 * Presentation decisions for live context, kept pure so they can be tested
 * without a renderer — the same shape as the rest of this codebase's tests.
 *
 * The rule these functions exist to enforce: `timeline === null` (not
 * retrieved) and `timeline === []` (retrieved, genuinely empty) are different
 * statements and must never resolve to the same UI state.
 */

export type TimelineState = "LOADING" | "UNAVAILABLE" | "EMPTY" | "EVENTS";
export type LineupsState = "LOADING" | "UNAVAILABLE" | "PRESENT";

export const periodLabels: Record<string, string> = {
  FIRST_HALF: "İlk yarı",
  HALF_TIME: "Devre arası",
  SECOND_HALF: "İkinci yarı",
  FULL_TIME: "Maç sonu",
  EXTRA_TIME: "Uzatma",
  PENALTIES: "Penaltılar"
};

/** Index lookups return a definite string; the map has an UNKNOWN fallback. */
function label(map: Record<string, string>, key: string | null | undefined): string {
  return (key && map[key]) || map.UNKNOWN || "";
}

export const cardLabels: Record<string, string> = {
  YELLOW: "Sarı kart",
  SECOND_YELLOW: "İkinci sarı",
  RED: "Kırmızı kart",
  UNKNOWN: "Kart"
};

export const positionLabels: Record<string, string> = {
  GOALKEEPER: "Kaleci",
  DEFENCE: "Defans",
  MIDFIELD: "Orta saha",
  ATTACK: "Forvet",
  BENCH: "Yedek",
  UNKNOWN: "Diğer"
};

export const positionGroupOrder = [
  "GOALKEEPER",
  "DEFENCE",
  "MIDFIELD",
  "ATTACK",
  "UNKNOWN"
] as const;

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
  return timeline.length === 0 ? "EMPTY" : "EVENTS";
}

export function resolveLineupsState(
  context: LiveContext | undefined,
  isLoading?: boolean
): LineupsState {
  if (isLoading) {
    return "LOADING";
  }
  return context?.lineups ? "PRESENT" : "UNAVAILABLE";
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
    : "Canlı maç olayları şu anda kullanılamıyor.";
}

export function minuteLabel(event: LiveMatchEvent): string {
  if (event.minuteLabel) {
    return event.minuteLabel;
  }
  return event.minute === null || event.minute === undefined
    ? ""
    : `${event.minute}'`;
}

export interface EventDisplay {
  kind: LiveMatchEvent["kind"];
  minute: string;
  primary: string;
  secondary: string | null;
  score: string | null;
  side: "HOME" | "AWAY" | null;
  isMarker: boolean;
}

/**
 * Flattens one event into exactly what a row renders.
 *
 * A status marker carries only a localized sentence; its numbers are never
 * parsed out, because structured period scores already come from a stronger
 * source and a regex over display text would manufacture a second one.
 */
export function describeEvent(event: LiveMatchEvent): EventDisplay {
  const base = {
    kind: event.kind,
    minute: minuteLabel(event),
    side: event.side ?? null,
    score: null as string | null,
    isMarker: false
  };

  if (event.kind === "GOAL") {
    return {
      ...base,
      primary: event.scorer?.rawName ?? "Gol",
      secondary: event.assist?.rawName ? `Asist: ${event.assist.rawName}` : null,
      score: event.scoreAfter
        ? `${event.scoreAfter.home}-${event.scoreAfter.away}`
        : null
    };
  }

  if (event.kind === "CARD") {
    return {
      ...base,
      primary: event.player?.rawName ?? "Kart",
      secondary: label(cardLabels, event.cardKind)
    };
  }

  if (event.kind === "SUBSTITUTION") {
    return {
      ...base,
      primary: event.playerOn?.rawName ?? "Giren oyuncu",
      secondary: `Çıkan: ${event.playerOff?.rawName ?? "—"}`
    };
  }

  if (event.kind === "STATUS_MARKER") {
    return {
      ...base,
      isMarker: true,
      primary:
        (event.period?.normalized && periodLabels[event.period.normalized]) ||
        event.displayText ||
        "Bölüm",
      secondary: null
    };
  }

  // An unrecognised kind still renders — a gap in the run is worse than a row
  // the app could not classify.
  return {
    ...base,
    primary: event.displayText ?? "Olay",
    secondary: null
  };
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

export interface StarterGroup {
  group: string;
  label: string;
  players: NonNullable<LiveLineupSide>["starters"];
}

export function groupStarters(side: LiveLineupSide): StarterGroup[] {
  if (!side) {
    return [];
  }
  return positionGroupOrder
    .map((group) => ({
      group,
      label: label(positionLabels, group),
      players: side.starters.filter((slot) => slot.positionGroup === group)
    }))
    .filter((entry) => entry.players.length > 0);
}

export function benchCount(context: LiveContext | undefined): number {
  return (
    (context?.lineups?.home?.substitutes.length ?? 0) +
    (context?.lineups?.away?.substitutes.length ?? 0)
  );
}
