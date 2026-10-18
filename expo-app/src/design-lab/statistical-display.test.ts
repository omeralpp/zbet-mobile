import assert from "node:assert/strict";
import test from "node:test";
import {
  exactFractionWidth,
  finiteFraction,
  formatFractionPercent,
  formatMetricDate,
  formatSampleDenominator
} from "./statistical-display";

test("historical shares keep zero and small fractions at their real lengths", () => {
  assert.equal(exactFractionWidth(0), "0%");
  assert.equal(exactFractionWidth(0.01), "1%");
  assert.equal(exactFractionWidth(0.025), "2.5%");
  assert.equal(exactFractionWidth(0.004), "0.4%");
  assert.equal(exactFractionWidth(1), "100%");
});

test("missing, non-finite and out-of-range shares never become a zero or a clamped bar", () => {
  for (const value of [undefined, null, "0.025", NaN, Infinity, -Infinity, -0.01, 1.01]) {
    assert.equal(finiteFraction(value), null);
    assert.equal(exactFractionWidth(value), null);
    assert.equal(formatFractionPercent(value), "—");
  }
});

test("Turkish percent labels retain the small-share distinction", () => {
  assert.equal(formatFractionPercent(0), "%0");
  assert.equal(formatFractionPercent(0.01), "%1");
  assert.equal(formatFractionPercent(0.025), "%2,5");
  assert.equal(formatFractionPercent(0.965), "%96,5");
});

test("metric dates name the supplied calendar date without a relative today label", () => {
  assert.equal(formatMetricDate("2026-10-18"), "18 Eki 2026");
  assert.equal(formatMetricDate("2024-02-29"), "29 Şub 2024");
  assert.equal(formatMetricDate("2026-01-01"), "01 Oca 2026");
});

test("unknown and impossible dates stay explicitly unknown", () => {
  for (const value of [undefined, null, "", "2026-02-29", "2026-02-31", "2026-13-01", "2026-00-01", "2026-01-00", "2026-1-1", "2026-10-18T23:00:00Z", 20261018]) {
    assert.equal(formatMetricDate(value), "Tarih bilinmiyor");
  }
});

test("zero known observations are distinct from a missing or invalid denominator", () => {
  assert.equal(formatSampleDenominator(0), "0 maç");
  assert.equal(formatSampleDenominator(400), "400 maç");
  assert.equal(formatSampleDenominator(1200), "1.200 maç");
  for (const value of [undefined, null, NaN, Infinity, -1, 2.5, "400"]) {
    assert.equal(formatSampleDenominator(value), "Payda bilinmiyor");
  }
});
