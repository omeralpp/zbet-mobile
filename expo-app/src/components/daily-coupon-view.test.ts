import assert from "node:assert/strict";
import test from "node:test";
import { dailyCouponWindowSchema } from "@/src/api/daily-coupons-schema";
import { mockDailyCouponWindow } from "@/src/api/mock-daily-coupons";
import { countByResult, couponEntries, couponsForMatch, currentCouponMatchKeys, filterCoupons, fixtureIdOfMatchKey, liveLegStates, losingLegs, summarizeCoupons } from "./daily-coupon-view";

const today = "2026-11-17";
const window = dailyCouponWindowSchema.parse(mockDailyCouponWindow(today, 7, today));
const entries = couponEntries(window.entries);

test("window coupons list newest day first and tiers in Banko, Dengeli, Riskli order", () => {
  assert.equal(entries.length, 12);
  assert.deepEqual(entries.slice(0, 3).map((entry) => [entry.day, entry.tier.tier]),
    [[today, "BANKO"], [today, "DENGELI"], [today, "RISKLI"]]);
});

test("result and tier filters agree with their counts", () => {
  const counts = countByResult(entries);
  assert.deepEqual(counts, { ALL: 12, WON: 3, LOST: 6, PENDING: 3 });
  for (const result of ["ALL", "WON", "LOST", "PENDING"] as const) {
    assert.equal(filterCoupons(entries, "ALL", result).length, counts[result]);
  }
  assert.ok(filterCoupons(entries, "RISKLI", "ALL").every((entry) => entry.tier.tier === "RISKLI"));
});

test("a summary stakes one unit per coupon at its total odds", () => {
  const settled = filterCoupons(entries, "BANKO", "WON");
  const summary = summarizeCoupons(settled);
  assert.equal(summary.wins, 3);
  assert.equal(summary.hitRate, 1);
  assert.equal(summary.net, Math.round(3 * (settled[0]!.tier.totalOdds - 1) * 100) / 100);
  assert.equal(summarizeCoupons(filterCoupons(entries, "ALL", "PENDING")).hitRate, null);
});

test("a lost coupon names the leg that lost it", () => {
  const lost = filterCoupons(entries, "DENGELI", "LOST")[0]!;
  assert.deepEqual(losingLegs(lost.tier).map((leg) => `${leg.home} ${leg.finalScore?.home}-${leg.finalScore?.away}`), ["Lech Poznan 2-1"]);
});

test("a match finds its coupon legs by key or by fixture id", () => {
  assert.equal(fixtureIdOfMatchKey("2026-07-28:472910:20:45:00"), "472910");
  assert.equal(fixtureIdOfMatchKey("broken"), null);
  const found = couponsForMatch(window.entries[0], "2026-07-28:472910:20:45:00");
  assert.deepEqual(found.map((item) => [item.tier.tier, item.leg.selection]), [["BANKO", "Ev sahibi / beraberlik"]]);
  assert.deepEqual(couponsForMatch(window.entries[0], "2026-07-28:1:20:45:00"), []);
});

test("score polling includes unresolved exact keys from today and yesterday only", () => {
  const first = entries[0]!;
  const yesterday = { ...first, day: "2026-11-16" };
  const old = { ...entries[1]!, day: "2026-11-15" };
  const settled = { ...entries[2]!, tier: { ...entries[2]!.tier,
    legs: entries[2]!.tier.legs.map(leg => ({ ...leg, result: "WON" as const })) } };
  assert.deepEqual(currentCouponMatchKeys([first, yesterday, old, settled], today),
    first.tier.legs.map(leg => leg.matchKey!).sort());
});

test("live and finished observations do not replace the coupon's settlement", () => {
  const [first, second] = entries[0]!.tier.legs;
  const states = liveLegStates([
    { matchKey: first!.matchKey!, status: "LIVE", score: { home: 0, away: 0 }, elapsed: 47 },
    { matchKey: second!.matchKey!, status: "FINISHED", score: { home: 2, away: 0 }, elapsed: null }
  ]);
  assert.deepEqual([...states.values()], [
    { score: "0–0", label: "Canlı · 47′" }, { score: "2–0", label: "Bitti · sonuç işleniyor" }
  ]);
  assert.equal(summarizeCoupons([entries[0]!]).pending, 1);
});
