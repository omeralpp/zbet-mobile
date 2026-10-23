import type { Dashboard, MatchSummary } from "../api/schemas";
import type { RebuildRecommendation } from "../api/rebuild-schemas";
import { currentRebuild } from "./rebuild-current";
import { rebuildHero } from "./rebuild-hero";

/** With publication history, use the same active last selection as its card. */
export function activeMatch(match: MatchSummary, now: number, records?: readonly RebuildRecommendation[], error = false): MatchSummary {
  if (!match.rebuild) return match;
  if (records) {
    const hero = rebuildCardHero(match, records, now, error);
    const active = hero?.playable || (hero?.active && hero.record.result.state === "PENDING" && !match.rebuildQuotes && !!hero.currentQuote);
    return active && hero ? { ...match, selectedOdd:hero.record.market, rating:hero.record.stars,
      liveRate:Number(hero.record.quote),currentRate:Number(hero.currentQuote) }
      : { ...match, selectedOdd:"",rating:0,liveRate:null,currentRate:null };
  }
  const active = ["LIVE", "HALF_TIME"].includes(match.status) ? currentRebuild(match.rebuild, now) : null;
  return active ? { ...match, selectedOdd: active.market, rating: active.stars, currentRate: Number(active.quote) }
    : { ...match, selectedOdd: "", rating: 0, liveRate: null, currentRate: null };
}

export function rebuildCardHero(match: MatchSummary, records: readonly RebuildRecommendation[], now: number, error = false) {
  if (!match.rebuild) return null;
  const quotes = match.rebuildQuotes?.matchKey === match.key ? match.rebuildQuotes : null;
  const hero = rebuildHero({ data: { ...match.rebuild, asOf: quotes?.asOf ?? match.rebuild.asOf,
    history: records, candidates: quotes?.candidates ?? [] }, matchKey: match.key, status: match.status, now, error });
  // Older BFFs expose only an active quote with a verified expiry. They do not
  // provide an independently available price for an inactive recommendation.
  const current = currentRebuild(match.rebuild, now);
  return hero && !match.rebuildQuotes && hero.active && current ? { ...hero, currentQuote: current.quote, quoteLabel: "güncel oran" } : hero;
}

/** One latest active publication per fixture, using its frozen stars. */
export function publishedStarCounts(matches: readonly MatchSummary[], records: readonly RebuildRecommendation[], now: number, error = false) {
  const counts = { ALL:0,STAR_1:0,STAR_2:0,STAR_3:0,STAR_4:0,STAR_5:0,STAR_3_PLUS:0 };
  const seen = new Set<string>();
  for (const match of matches) {
    const fixture=match.key.split(":").slice(0,2).join(":");
    if (seen.has(fixture) || !["LIVE","HALF_TIME"].includes(match.status)) continue;
    seen.add(fixture);
    const selection=activeMatch(match,now,records,error);
    if (!selection.selectedOdd || selection.rating < 1 || selection.rating > 5) continue;
    counts.ALL++;
    counts[`STAR_${selection.rating}` as "STAR_1"|"STAR_2"|"STAR_3"|"STAR_4"|"STAR_5"]++;
    if (selection.rating >= 3) counts.STAR_3_PLUS++;
  }
  return counts;
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
