import assert from "node:assert/strict";
import test from "node:test";
import { dailyCouponWindowSchema, dailyCouponsSchema } from "./daily-coupons-schema";

const common = { contractVersion: "daily-coupons.v2", bettingDate: "2026-11-14", history: [] };
const empty = { status: "NO_QUALIFYING_COUPON", reason: "Bu risk aralığında seçim bulunmadı.", totalOdds: null, legs: [], settlement: null };
const demo = {
  ...common,
  status: "AVAILABLE",
  publication: { cutoffAt: "2026-11-14T13:25:49+03:00", publishedAt: "2026-11-14T13:30:14.069371+03:00", expiresAt: "2026-11-14T22:45:00+03:00", sourceChannel: "İddaa basılı bülteni", mode: "DEMO" },
  tiers: [
    { tier: "BANKO", status: "AVAILABLE", reason: null, totalOdds: 1.6, settlement: "PENDING", expiresAt: "2026-11-14T19:45:00.000Z", legs: [
      { fixtureId: "01", home: "Ev", away: "Konuk", kickoffAt: "2026-11-14T19:45:00Z", market: "Toplam Gol 2,5", selection: "Üst", odds: 1.6,
        quotedAt: "2026-11-14T10:25:49+00:00", quoteTimeBasis: "CAPTURE_UPPER_BOUND", rationale: "Piyasa oranlarına göre seçildi.",
        matchKey: "2026-11-14:4101:22:45:00", result: "PENDING", finalScore: null }
    ] },
    { ...empty, tier: "DENGELI" },
    { ...empty, tier: "RISKLI" }
  ]
};

test("accepts three unique coupon slots with explicit demo and quote provenance", () => {
  const result = dailyCouponsSchema.parse(demo);
  assert.equal(result.publication?.mode, "DEMO");
  assert.equal(result.tiers[0]?.legs[0]?.quoteTimeBasis, "CAPTURE_UPPER_BOUND");
  assert.equal(dailyCouponsSchema.safeParse({ ...demo, tiers: [demo.tiers[0], demo.tiers[1], demo.tiers[1]] }).success, false);
});

test("distinguishes unverified and waiting dates from a published tier without a coupon", () => {
  for (const status of ["UNAVAILABLE", "AWAITING_PUBLICATION"]) {
    assert.equal(dailyCouponsSchema.parse({ ...common, status, publication: null, tiers: [] }).status, status);
    assert.equal(dailyCouponsSchema.safeParse({ ...common, status, publication: null, tiers: demo.tiers }).success, false);
  }
  assert.equal(dailyCouponsSchema.safeParse({ ...demo, history: [{ bettingDate: common.bettingDate, status: "AVAILABLE" }] }).success, false);
});

test("accepts a recorded settlement correction and rejects a partial revision", () => {
  const [, balanced, risky] = demo.tiers;
  const corrected = { ...demo.tiers[0], settlement: "PENDING", settlementUpdatedAt: "2026-11-15T10:00:00+03:00" };
  assert.equal(dailyCouponsSchema.safeParse({ ...demo, tiers: [{ ...corrected, settlementRevision: 2 }, balanced, risky] }).success, true);
  assert.equal(dailyCouponsSchema.safeParse({ ...demo, tiers: [corrected, balanced, risky] }).success, false);
});

test("v2 legs carry a match key, a result and a score only once settled", () => {
  const leg = demo.tiers[0]!.legs[0]!;
  const withLeg = (change: object) => ({ ...demo, tiers: [{ ...demo.tiers[0], legs: [{ ...leg, ...change }] }, demo.tiers[1], demo.tiers[2]] });
  assert.equal(dailyCouponsSchema.safeParse(withLeg({ result: "LOST", finalScore: { home: 1, away: 3 } })).success, true);
  assert.equal(dailyCouponsSchema.safeParse(withLeg({ result: "PENDING", finalScore: { home: 0, away: 0 } })).success, false);
  assert.equal(dailyCouponsSchema.safeParse(withLeg({ result: null, finalScore: { home: 0, away: 0 } })).success, false);
  assert.equal(dailyCouponsSchema.safeParse(withLeg({ matchKey: "4101" })).success, false);
  assert.equal(dailyCouponsSchema.safeParse(withLeg({ matchKey: null, result: null })).success, true);
});

test("the coupon window holds unique published days inside its range", () => {
  const { history: _history, ...entry } = demo;
  const window = { contractVersion: "daily-coupons-window.v2", window: { days: 7, from: "2026-11-08", through: "2026-11-14" },
    todayStatus: "AVAILABLE", unavailableDays: [], entries: [entry] };
  assert.equal(dailyCouponWindowSchema.safeParse(window).success, true);
  assert.equal(dailyCouponWindowSchema.safeParse({ ...window, entries: [entry, entry] }).success, false);
  assert.equal(dailyCouponWindowSchema.safeParse({ ...window, window: { ...window.window, from: "2026-11-15", through: "2026-11-21" } }).success, false);
});
