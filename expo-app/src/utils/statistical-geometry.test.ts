import assert from "node:assert/strict";
import test from "node:test";
import { formatHistoricalFraction, historicalFractionWidth, relativeComparisonWidths } from "./statistical-geometry";

test("relative bars distinguish a measured zero from a positive measurement without a visible minimum", () => {
  assert.deepEqual(relativeComparisonWidths(0, 10), { home: 0, away: 100 });
  assert.deepEqual(relativeComparisonWidths(10, 0), { home: 100, away: 0 });
  assert.deepEqual(relativeComparisonWidths(0, 0), { home: 0, away: 0 });
  const small = relativeComparisonWidths(1, 99);
  assert.ok(Math.abs(small.home - 1) < 1e-10);
  assert.ok(Math.abs(small.away - 99) < 1e-10);
});

test("fractions below one measurement unit retain their ratio and swapping sides preserves symmetry", () => {
  const forward = relativeComparisonWidths(0.2, 0.3);
  const reverse = relativeComparisonWidths(0.3, 0.2);
  assert.ok(Math.abs(forward.home - 40) < 1e-10);
  assert.ok(Math.abs(forward.away - 60) < 1e-10);
  assert.equal(forward.home, reverse.away);
  assert.equal(forward.away, reverse.home);
  assert.deepEqual(relativeComparisonWidths(1e308, 1e308), { home: 50, away: 50 });
});

test("a missing or invalid side never fabricates a full relative bar for the known side", () => {
  for (const missing of [null, undefined, NaN, Infinity, -1, "0"]) {
    assert.deepEqual(relativeComparisonWidths(missing, 40), { home: 0, away: 0 });
    assert.deepEqual(relativeComparisonWidths(40, missing), { home: 0, away: 0 });
  }
});

test("historical bars keep exact zero and small source shares rather than renormalizing a displayed subset", () => {
  assert.equal(historicalFractionWidth(0), "0%");
  assert.equal(historicalFractionWidth(0.01), "1%");
  assert.equal(historicalFractionWidth(0.025), "2.5%");
  assert.equal(historicalFractionWidth(1), "100%");
  // These two retained rows total only 3.5% of their original cohort.
  assert.deepEqual([0.01, 0.025].map(historicalFractionWidth), ["1%", "2.5%"]);
  assert.equal(formatHistoricalFraction(0.025), "%2,5");
  assert.equal(formatHistoricalFraction(0), "%0");
});

test("unknown or invalid historical fractions stay unavailable rather than clamped or printed as zero", () => {
  for (const value of [null, undefined, NaN, Infinity, -0.01, 1.01, "0.01"]) {
    assert.equal(historicalFractionWidth(value), null);
    assert.equal(formatHistoricalFraction(value), "—");
  }
});
