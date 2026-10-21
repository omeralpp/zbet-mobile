import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDecimal,
  formatQuote,
  formatRatio,
  formatReportRange,
  formatScore,
  formatSupport,
  formatUnits,
  outcomeSegments,
  resultPresentation,
  unitsTone
} from "./rebuild-display";

test("units are signed with a Turkish comma and a missing net is a dash", () => {
  assert.equal(formatUnits("1.25"), "+1,25");
  assert.equal(formatUnits("-1"), "-1,00");
  assert.equal(formatUnits("0"), "0,00");
  assert.equal(formatUnits(null), "—");
  assert.equal(formatUnits(""), "—");
});

test("tone follows the sign and treats a missing net as neutral, not zero profit", () => {
  assert.equal(unitsTone("0.5"), "positive");
  assert.equal(unitsTone("-1"), "negative");
  assert.equal(unitsTone("0"), "neutral");
  assert.equal(unitsTone(null), "neutral");
});

test("quotes and scores print as delivered, at display precision only", () => {
  assert.equal(formatQuote("2.123456789012345678901234567890123"), "2,12");
  assert.equal(formatQuote(null), "—");
  assert.equal(formatScore("81"), "81");
  assert.equal(formatScore("80.5"), "80,5");
  assert.equal(formatScore(null), "—");
});

test("measured decimals print with a Turkish comma", () => {
  assert.equal(formatDecimal("4.2"), "4,2");
  assert.equal(formatDecimal("5"), "5");
  assert.equal(formatDecimal(null), "—");
});

test("a null ratio stays a dash instead of becoming 0%", () => {
  assert.equal(formatRatio(0.125), "%12,5");
  assert.equal(formatRatio(-0.07), "-%7,0");
  assert.equal(formatRatio(null), "—");
  assert.equal(formatRatio(Number.NaN), "—");
});

test("pool support keeps both counts beside its share", () => {
  assert.deepEqual(formatSupport(36, 40), { counts: "36/40", share: "%90" });
  assert.deepEqual(formatSupport(0, 0), { counts: "0/0", share: "—" });
});

test("the five outcomes keep five distinct labels", () => {
  const labels = new Set(Object.values(resultPresentation).map((item) => item.label));
  assert.equal(labels.size, 5);
  assert.equal(resultPresentation.VOID.label, "İptal");
});

test("the outcome bar drops empty outcomes and keeps reading order", () => {
  assert.deepEqual(
    outcomeSegments({ wins: 2, losses: 0, voids: 1, pending: 3, unresolved: 0 }).map((item) => item.key),
    ["wins", "voids", "pending"]
  );
});

test("a reporting range reads as Istanbul calendar days", () => {
  assert.equal(formatReportRange("2026-10-15", "2026-10-21"), "15 Eki – 21 Eki");
  assert.equal(formatReportRange("2026-10-21", "2026-10-21"), "21 Eki");
});
