import type { MatchSummary } from "@/src/api/schemas";
import {
  matchDecisionFilter,
  type StarDecisionFilter
} from "./decision-filters";

export type LiveMatchTab = "LIVE" | "FIXTURE" | "STAR";

/**
 * How long a `NOT_STARTED` match is still trusted as genuinely upcoming after
 * its scheduled kickoff passes, before the provider/SAP status is treated as
 * stale rather than as a real delayed start. Bounded rather than open-ended:
 * a short provider lag should not drop a match, but an indefinitely stale
 * `NOT_STARTED` must not sit in the fixture list forever either.
 */
const FIXTURE_STALE_TOLERANCE_MS = 90 * 60 * 1000;

/**
 * `matchDate`/`matchTime` carry no offset of their own; the API's kickoff
 * times are Europe/Istanbul local, the same assumption `formatFixtureDateTime`
 * already makes for display. No kickoff parses: return null and let the
 * caller keep its prior behaviour rather than guess a time.
 */
function kickoffInstant(matchDate: string, matchTime: string): number | null {
  if (!matchDate || !matchTime) {
    return null;
  }
  const parsed = new Date(`${matchDate}T${matchTime}:00+03:00`);
  return Number.isFinite(parsed.getTime()) ? parsed.getTime() : null;
}

export function resolveLiveMatchTab(
  scope: string,
  legacyFilter: string,
  hasDecisionFilter: boolean
): LiveMatchTab {
  if (
    scope === "LIVE" ||
    scope === "FIXTURE" ||
    scope === "STAR"
  ) {
    return scope;
  }
  // Older links called this surface ALL. It now has the narrower, truthful
  // meaning "upcoming fixture" rather than silently reviving finished games.
  if (scope === "ALL" || legacyFilter === "ALL") {
    return "FIXTURE";
  }
  if (scope === "SELECTED" || legacyFilter === "SELECTED") {
    return "STAR";
  }
  if (legacyFilter === "HIGH_STAR" || hasDecisionFilter) {
    return "STAR";
  }
  return "LIVE";
}

export function matchLiveTab(
  match: MatchSummary,
  tab: LiveMatchTab,
  starFilter: StarDecisionFilter,
  now: number = Date.now(),
): boolean {
  switch (tab) {
    case "LIVE":
      return match.status === "LIVE" || match.status === "HALF_TIME";
    case "FIXTURE": {
      // A postponed, abandoned, cancelled or awarded match belongs here: it is
      // the tab a user checks to ask whether a game is on, and the honest
      // answer is that it is not. It bypasses the staleness tolerance on
      // purpose - that bound exists because NOT_STARTED can be a stale
      // provider reading, whereas NOT_PLAYED is a decided outcome that no
      // amount of elapsed time makes less true.
      if (match.status === "NOT_PLAYED") {
        return true;
      }
      if (match.status !== "NOT_STARTED") {
        return false;
      }
      const kickoff = kickoffInstant(match.matchDate, match.matchTime);
      if (kickoff === null) {
        return true;
      }
      return now - kickoff < FIXTURE_STALE_TOLERANCE_MS;
    }
    case "STAR":
      return matchDecisionFilter(match, starFilter);
  }
}
