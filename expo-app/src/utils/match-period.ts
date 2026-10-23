import type { MatchSummary } from "../api/schemas";

/** Match lifecycle is authoritative; a pressure phase may be from regulation. */
export function matchPeriodLabel(match: Pick<MatchSummary,"status"|"elapsed"|"clock">, observedPhase?: string) {
  if (match.status !== "LIVE") return null;
  if (match.clock) return {"1H":"1. YARI","2H":"2. YARI",ET:"UZATMA"}[match.clock.period as "1H"|"2H"|"ET"] ?? null;
  // Older BFFs cannot distinguish 90+ from extra time. Do not infer a period
  // from a minute beyond regulation or resurrect an old 2H pressure phase.
  return observedPhase === "1H" && match.elapsed <= 60 ? "1. YARI"
    : observedPhase === "2H" && match.elapsed >= 45 && match.elapsed <= 90 ? "2. YARI"
    : match.elapsed < 45 ? "1. YARI" : null;
}
