import type { CouponEntry } from "@/src/components/daily-coupon-view";
import type { SelectionDecisionRecord } from "@/src/api/selection-decisions-schema";

/**
 * One row of a Rapor ayrıntısı table (owner 2026-11-25): a star, market or
 * coupon group with its settled results, hit rate and the metric it is
 * judged by. `impact` is that metric signed (units won or lost, or a negative
 * count of coupons a leg market lost); it drives the order and the bar.
 */
export interface BreakdownGroup {
  key: string;
  label: string;
  /** Won plus lost: the sample the hit rate and impact stand on. */
  results: number;
  /** Still pending, unresolved or void: shown, never counted as a result. */
  open: number;
  hitRate: number | null;
  /** The value column; null when nothing is settled yet. */
  value: number | null;
  impact: number;
}

export type BreakdownSort = "IMPACT" | "COUNT";

export interface BreakdownView {
  rows: BreakdownGroup[];
  /** Every group is below the threshold: they are shown, with a caution. */
  allFew: boolean;
  few: { groups: BreakdownGroup[]; results: number; value: number | null };
  /** Largest |impact| among shown rows, so bars share one scale (never 0). */
  scale: number;
}

/** Groups below this many results read as anecdotes and fold away. */
export const MIN_RESULTS = 3;

const byImpact = (a: BreakdownGroup, b: BreakdownGroup) =>
  Math.abs(b.impact) - Math.abs(a.impact) || b.results - a.results || a.label.localeCompare(b.label, "tr");
const byCount = (a: BreakdownGroup, b: BreakdownGroup) =>
  b.results - a.results || Math.abs(b.impact) - Math.abs(a.impact) || a.label.localeCompare(b.label, "tr");

/**
 * Shown rows (enough results), the folded "Az örnek" group and the bar scale.
 * `keepOrder` keeps a natural order (stars, coupon tiers) instead of sorting.
 */
export function breakdownView(groups: readonly BreakdownGroup[], sort: BreakdownSort, keepOrder = false): BreakdownView {
  const present = groups.filter((group) => group.results + group.open > 0);
  let rows = present.filter((group) => group.results >= MIN_RESULTS || keepOrder);
  let fewGroups = keepOrder ? [] : present.filter((group) => group.results < MIN_RESULTS);
  // Folding everything would leave an empty table: show the groups instead.
  const allFew = !rows.length && fewGroups.length > 0;
  if (allFew) { rows = fewGroups; fewGroups = []; }
  if (!keepOrder) rows.sort(sort === "IMPACT" ? byImpact : byCount);
  fewGroups.sort(byImpact);
  const settledFew = fewGroups.filter((group) => group.value !== null);
  const scale = Math.max(1e-9, ...rows.map((row) => Math.abs(row.impact)), ...fewGroups.map((row) => Math.abs(row.impact)));
  return { rows, allFew, scale, few: { groups: fewGroups, results: fewGroups.reduce((sum, group) => sum + group.results, 0),
    value: settledFew.length ? round2(settledFew.reduce((sum, group) => sum + (group.value ?? 0), 0)) : null } };
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Şampiyon: the backend's star or market aggregate. */
export function reportGroup(key: string, label: string, aggregate: {
  wins: number; losses: number; pending: number; unresolved: number; voids: number; settled: number; net: string; hitRate: number | null;
}): BreakdownGroup {
  const net = Number(aggregate.net);
  const results = aggregate.wins + aggregate.losses;
  return { key, label, results, open: aggregate.pending + aggregate.unresolved + aggregate.voids, hitRate: aggregate.hitRate,
    value: aggregate.settled ? net : null, impact: aggregate.settled && Number.isFinite(net) ? net : 0 };
}

/** Lab: rule decisions by a key (stars or market), one unit each. */
export function recordGroups(records: readonly SelectionDecisionRecord[], keyOf: (record: SelectionDecisionRecord) => string,
  labelOf: (key: string) => string): BreakdownGroup[] {
  const groups = new Map<string, { wins: number; losses: number; open: number; net: number }>();
  for (const record of records) {
    const key = keyOf(record);
    const group = groups.get(key) ?? { wins: 0, losses: 0, open: 0, net: 0 };
    if (record.result.state === "WIN") group.wins++;
    else if (record.result.state === "LOSS") group.losses++;
    else group.open++;
    if (record.result.net !== null) group.net += Number(record.result.net);
    groups.set(key, group);
  }
  return [...groups].map(([key, g]) => {
    const results = g.wins + g.losses;
    return { key, label: labelOf(key), results, open: g.open, hitRate: results ? g.wins / results : null,
      value: results ? round2(g.net) : null, impact: results ? round2(g.net) : 0 };
  });
}

/** Günlük kupon: coupons by tier, one unit at the published total odds. */
export function couponTierGroups(entries: readonly CouponEntry[], names: Readonly<Record<string, string>>, order: readonly string[]): BreakdownGroup[] {
  return order.map((tier) => {
    let wins = 0, losses = 0, open = 0, net = 0;
    for (const { tier: coupon } of entries) {
      if (coupon.tier !== tier) continue;
      if (coupon.settlement === "WON") { wins++; net += coupon.totalOdds - 1; }
      else if (coupon.settlement === "LOST") { losses++; net -= 1; }
      else open++;
    }
    const results = wins + losses;
    return { key: tier, label: names[tier] ?? tier, results, open, hitRate: results ? wins / results : null,
      value: results ? round2(net) : null, impact: results ? round2(net) : 0 };
  });
}

/**
 * Günlük kupon legs by market and side: how often the leg held, and how many
 * coupons it lost (the value; impact is its negative, so the worst lead).
 */
export function couponLegGroups(entries: readonly CouponEntry[]): BreakdownGroup[] {
  const groups = new Map<string, { label: string; wins: number; losses: number; open: number; lostCoupons: number }>();
  for (const { tier } of entries) {
    for (const leg of tier.legs) {
      const key = `${leg.market}|${leg.selection}`;
      const group = groups.get(key) ?? { label: `${leg.market} · ${leg.selection}`, wins: 0, losses: 0, open: 0, lostCoupons: 0 };
      if (leg.result === "WON") group.wins++;
      else if (leg.result === "LOST") { group.losses++; if (tier.settlement === "LOST") group.lostCoupons++; }
      else group.open++;
      groups.set(key, group);
    }
  }
  return [...groups].map(([key, g]) => {
    const results = g.wins + g.losses;
    return { key, label: g.label, results, open: g.open, hitRate: results ? g.wins / results : null,
      value: results ? g.lostCoupons : null, impact: -g.lostCoupons };
  });
}
