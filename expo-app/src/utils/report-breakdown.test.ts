import assert from "node:assert/strict";
import test from "node:test";
import type { CouponEntry } from "@/src/components/daily-coupon-view";
import type { SelectionDecisionRecord } from "@/src/api/selection-decisions-schema";
import { breakdownView, couponLegGroups, couponTierGroups, recordGroups, reportGroup, type BreakdownGroup } from "./report-breakdown";

const group = (key: string, results: number, impact: number, open = 0): BreakdownGroup =>
  ({ key, label: key, results, open, hitRate: results ? 0.5 : null, value: results ? impact : null, impact });

test("groups sort by absolute impact, small samples fold with their total", () => {
  const view = breakdownView([group("a", 7, -2.67), group("b", 12, 0.84), group("c", 8, -2.21), group("d", 1, 0.26), group("e", 2, -2), group("f", 0, 0, 3)], "IMPACT");
  assert.deepEqual(view.rows.map((r) => r.key), ["a", "c", "b"]);
  assert.deepEqual(view.few.groups.map((r) => r.key), ["e", "d", "f"]);
  assert.equal(view.few.results, 3);
  assert.equal(view.few.value, -1.74);
  assert.equal(view.scale, 2.67);
});

test("count sort and natural order are both available", () => {
  const groups = [group("a", 7, -2.67), group("b", 12, 0.84), group("c", 1, -1)];
  assert.deepEqual(breakdownView(groups, "COUNT").rows.map((r) => r.key), ["b", "a"]);
  assert.deepEqual(breakdownView(groups, "IMPACT", true).rows.map((r) => r.key), ["a", "b", "c"]);
  assert.equal(breakdownView([], "IMPACT").scale > 0, true);
  const thin = breakdownView([group("x", 1, 1.37), group("y", 2, -0.94)], "IMPACT");
  assert.deepEqual([thin.allFew, thin.rows.map((r) => r.key), thin.few.groups.length], [true, ["x", "y"], 0]);
});

test("Şampiyon aggregates keep open results apart and show no value before any result", () => {
  const settled = reportGroup("Ms15u", "Toplam gol 1,5 üstü", { wins: 2, losses: 2, pending: 1, unresolved: 0, voids: 1, settled: 4, net: "-0.05", hitRate: 0.5 });
  assert.deepEqual([settled.results, settled.open, settled.value, settled.impact], [4, 2, -0.05, -0.05]);
  const open = reportGroup("Ms05a", "x", { wins: 0, losses: 0, pending: 2, unresolved: 0, voids: 0, settled: 0, net: "0", hitRate: null });
  assert.deepEqual([open.results, open.value, open.impact], [0, null, 0]);
});

test("Lab records group by stars and market with summed units", () => {
  const record = (stars: number, market: string, state: "WIN" | "LOSS" | "PENDING", net: string | null) =>
    ({ stars, market, result: { state, net } }) as unknown as SelectionDecisionRecord;
  const groups = recordGroups([record(2, "Ms15u", "WIN", "0.30"), record(2, "Ms15u", "LOSS", "-1.00"), record(3, "Ms25a", "PENDING", null)],
    (r) => String(r.stars), (k) => `${k} yıldız`);
  const two = groups.find((g) => g.key === "2")!, three = groups.find((g) => g.key === "3")!;
  assert.deepEqual([two.results, two.hitRate, two.value], [2, 0.5, -0.7]);
  assert.deepEqual([three.results, three.open, three.value], [0, 1, null]);
});

test("coupon tiers count units at total odds; leg markets count the coupons they lost", () => {
  const entry = (tier: string, settlement: string, totalOdds: number, legs: { market: string; selection: string; result: string | null }[]) =>
    ({ day: "2026-11-25", tier: { tier, settlement, totalOdds, legs } }) as unknown as CouponEntry;
  const entries = [
    entry("BANKO", "WON", 1.85, [{ market: "Çifte Şans", selection: "1X", result: "WON" }, { market: "Toplam Gol 2,5", selection: "Alt", result: "WON" }]),
    entry("RISKLI", "LOST", 4.2, [{ market: "Toplam Gol 2,5", selection: "Alt", result: "LOST" }, { market: "Maç Sonucu", selection: "1", result: "WON" }]),
    entry("DENGELI", "PENDING", 2.4, [{ market: "Çifte Şans", selection: "1X", result: "PENDING" }])
  ];
  const tiers = couponTierGroups(entries, { BANKO: "Banko", DENGELI: "Dengeli", RISKLI: "Riskli" }, ["BANKO", "DENGELI", "RISKLI"]);
  assert.deepEqual(tiers.map((t) => [t.label, t.results, t.open, t.value]), [["Banko", 1, 0, 0.85], ["Dengeli", 0, 1, null], ["Riskli", 1, 0, -1]]);
  const legs = couponLegGroups(entries);
  const under = legs.find((l) => l.key === "Toplam Gol 2,5|Alt")!;
  assert.deepEqual([under.label, under.results, under.hitRate, under.value, under.impact], ["Toplam Gol 2,5 · Alt", 2, 0.5, 1, -1]);
  assert.equal(legs.find((l) => l.key === "Çifte Şans|1X")!.open, 1);
});
