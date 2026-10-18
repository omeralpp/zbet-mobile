import type { AnalysisContext, MatchJourneyPoint } from "@/src/api/schemas";
import type { JinxMotionAction } from "./jinx-motion";

type ObservedEvent = Extract<JinxMotionAction, { type: "event" }>;
type CapturedPoint = { point: MatchJourneyPoint; at: number };

function timestamp(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function score(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Availability is transport/source state, never model certainty. */
function consistentAvailability(context: AnalysisContext): boolean {
  return Object.entries(context.sources).every(([name, source]) => {
    const expected = source === null ? "UNAVAILABLE"
      : typeof source === "object" && "availability" in source ? source.availability : "OK";
    return context.sourceAvailability[name] === expected;
  });
}

function observedContext(context: AnalysisContext | undefined, now: number) {
  if (!context || !context.matchKey.trim() || !context.evidenceRevision.trim() || !Number.isFinite(now)) return undefined;
  const acquired = timestamp(context.acquiredAt), expires = timestamp(context.expiresAt);
  if (acquired === undefined || expires === undefined || acquired > now || expires <= now || expires <= acquired) return undefined;
  const core = context.sources.matchDetail, journey = context.sources.matchJourney;
  if (!core.currentMatchRecord || core.key !== context.matchKey || !score(core.homeScore) || !score(core.awayScore)
    || !["LIVE", "HALF_TIME"].includes(core.status) || !consistentAvailability(context)
    || context.sourceAvailability.matchDetail !== "OK" || context.sourceAvailability.matchJourney !== "OK"
    || !journey || journey.matchKey !== context.matchKey || journey.origin !== "LIVE" || journey.availability !== "OK") return undefined;
  const ttl = expires - acquired;
  // acquiredAt is a response acquisition, not proof that sources measured together.
  const freshCapture = (at: number) => at <= acquired && now - at <= ttl;
  const journeyAt = timestamp(journey.capturedAt);
  if (journeyAt === undefined || !freshCapture(journeyAt)) return undefined;
  const keys = new Set<string>();
  const captures: CapturedPoint[] = [];
  for (const point of journey.points) {
    if (!point.key.trim() || keys.has(point.key)) return undefined;
    keys.add(point.key);
    if (point.capturedAt === null) continue;
    const at = timestamp(point.capturedAt);
    if (at === undefined || at > acquired || at > journeyAt || (captures.length && at < captures[captures.length - 1]!.at)) return undefined;
    captures.push({ point, at });
  }
  const last = captures[captures.length - 1];
  if (!last || !freshCapture(last.at)) return undefined;
  return { context, core, acquired, captures, keys, last, freshCapture };
}

/**
 * React only to newly observed, identity-matched LIVE records. First load and
 * navigation establish a baseline; a score rise alone never creates a goal.
 * Synthetic lab scenes dispatch to the reducer explicitly, outside this adapter.
 */
export function observedJinxEvent(
  previous: AnalysisContext | undefined,
  current: AnalysisContext | undefined,
  now = Date.now()
): ObservedEvent | undefined {
  const before = observedContext(previous, now), after = observedContext(current, now);
  if (!before || !after || before.context.matchKey !== after.context.matchKey
    || after.acquired < before.acquired || before.context.evidenceRevision === after.context.evidenceRevision
    || before.last.point.home !== before.core.homeScore || before.last.point.away !== before.core.awayScore) return undefined;
  const context = { matchKey: after.context.matchKey, revision: after.context.evidenceRevision };
  const correction = (): ObservedEvent => ({ type: "event", context, kind: "SCORE_CORRECTION", verified: true,
    eventId: `correction:${context.revision}:${after.core.homeScore}-${after.core.awayScore}` });
  // Cancellation takes priority even when the journey has not captured the corrected score yet.
  if (after.core.homeScore < before.core.homeScore || after.core.awayScore < before.core.awayScore) return correction();
  const newlyCaptured = after.captures.filter(({ point, at }) => !before.keys.has(point.key)
    && at > before.last.at && after.freshCapture(at));
  // A correction anywhere in this newly observed segment cancels a reaction,
  // including an intermediate correction followed by a later goal/state record.
  if (newlyCaptured.some(({ point }) => point.kind === "CORRECTION")) return correction();
  const added = newlyCaptured.filter(({ point }) => point.home === after.core.homeScore
    && point.away === after.core.awayScore && point.status === after.core.status);
  const event = [...added].reverse().find(({ point }) => point.kind === "GOAL" || point.kind === "HALF_TIME")?.point;
  if (!event) return undefined;
  if (event.kind === "HALF_TIME") {
    if (before.core.status !== "LIVE" || after.core.status !== "HALF_TIME") return undefined;
  } else if (after.core.status !== "LIVE"
    || after.core.homeScore + after.core.awayScore <= before.core.homeScore + before.core.awayScore) return undefined;
  return { type: "event", context, eventId: event.key, kind: event.kind === "GOAL" ? "GOAL" : "HALF_TIME", verified: true };
}
