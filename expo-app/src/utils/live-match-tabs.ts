import type { MatchSummary } from "@/src/api/schemas";
import {
  matchDecisionFilter,
  type StarDecisionFilter
} from "./decision-filters";

export type LiveMatchTab = "LIVE" | "SELECTED" | "ALL" | "STAR";

export function matchLiveTab(
  match: MatchSummary,
  tab: LiveMatchTab,
  starFilter: StarDecisionFilter
): boolean {
  switch (tab) {
    case "LIVE":
      return match.status === "LIVE" || match.status === "HALF_TIME";
    case "SELECTED":
      return matchDecisionFilter(match, "SELECTED");
    case "STAR":
      return matchDecisionFilter(match, starFilter);
    default:
      return true;
  }
}
