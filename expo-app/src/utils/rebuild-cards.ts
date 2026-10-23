import type { Dashboard, MatchSummary } from "../api/schemas";
import type { RebuildRecommendation } from "../api/rebuild-schemas";
import { currentRebuild } from "./rebuild-current";
import { rebuildHero } from "./rebuild-hero";

/** Eligibility stays independent of any historical publication displayed. */
export function activeMatch(match: MatchSummary, now: number): MatchSummary {
  if (!match.rebuild) return match;
  const active = ["LIVE", "HALF_TIME"].includes(match.status) ? currentRebuild(match.rebuild, now) : null;
  return active ? { ...match, selectedOdd: active.market, rating: active.stars, currentRate: Number(active.quote) }
    : { ...match, selectedOdd: "", rating: 0, liveRate: null, currentRate: null };
}

export function rebuildCardHero(match: MatchSummary, records: readonly RebuildRecommendation[], now: number) {
  if (!match.rebuild) return null;
  const quotes = match.rebuildQuotes?.matchKey === match.key ? match.rebuildQuotes : null;
  const hero = rebuildHero({ data: { ...match.rebuild, asOf: quotes?.asOf ?? match.rebuild.asOf,
    history: records, candidates: quotes?.candidates ?? [] }, matchKey: match.key, status: match.status, now });
  // Older BFFs expose only an active quote with a verified expiry. They do not
  // provide an independently available price for an inactive recommendation.
  const current = currentRebuild(match.rebuild, now);
  return hero && !quotes && hero.active && current ? { ...hero, currentQuote: current.quote, quoteLabel: "güncel oran" } : hero;
}

export function activeStarCounts(dashboard: Dashboard, now: number) {
  if (!dashboard.liveStarSelections) return dashboard.liveStarCounts;
  const counts = { ALL: 0, STAR_1: 0, STAR_2: 0, STAR_3: 0, STAR_4: 0, STAR_5: 0, STAR_3_PLUS: 0 };
  const seen = new Set<string>();
  for (const item of dashboard.liveStarSelections) {
    if (seen.has(item.matchKey) || (item.validUntil !== null && Date.parse(item.validUntil) < now)) continue;
    seen.add(item.matchKey);
    counts.ALL++;
    counts[`STAR_${item.stars}` as "STAR_1" | "STAR_2" | "STAR_3" | "STAR_4" | "STAR_5"]++;
    if (item.stars >= 3) counts.STAR_3_PLUS++;
  }
  return counts;
}
