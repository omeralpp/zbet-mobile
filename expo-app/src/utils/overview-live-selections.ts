import type { MatchSummary } from "../api/schemas";
import type { RebuildRecommendation } from "../api/rebuild-schemas";
import type { StarDecisionFilter } from "./decision-filters";
import { matchLiveTab } from "./live-match-tabs";
import { activeMatch } from "./rebuild-cards";

/** Overview and Live apply the same publication, market and star rule. */
export function overviewLiveSelections(matches: readonly MatchSummary[], records: readonly RebuildRecommendation[],
  filter: StarDecisionFilter, now: number, error = false) {
  const seen = new Set<string>();
  return matches.filter(match=>{
    const fixture=match.key.split(":").slice(0,2).join(":");
    if (seen.has(fixture) || !matchLiveTab(match,"STAR",filter,now,records,error)) return false;
    seen.add(fixture);
    return true;
  }).sort((a,b)=>activeMatch(b,now,records,error).rating-activeMatch(a,now,records,error).rating);
}
