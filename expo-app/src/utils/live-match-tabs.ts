import type { MatchSummary } from "@/src/api/schemas";
import {
  matchDecisionFilter,
  type StarDecisionFilter
} from "./decision-filters";

export type LiveMatchTab = "LIVE" | "FIXTURE" | "STAR";

export function resolveLiveMatchTab(
  scope: string,
  legacyFilter: string,
  hasDecisionFilter: boolean
): LiveMatchTab {
  if (scope === "LIVE" || scope === "FIXTURE" || scope === "STAR") {
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
  starFilter: StarDecisionFilter
): boolean {
  switch (tab) {
    case "LIVE":
      return match.status === "LIVE" || match.status === "HALF_TIME";
    case "FIXTURE":
      return match.status === "NOT_STARTED";
    case "STAR":
      return matchDecisionFilter(match, starFilter);
  }
}
