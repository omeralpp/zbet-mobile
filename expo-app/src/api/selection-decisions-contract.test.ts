import assert from "node:assert/strict";
import test from "node:test";
import { selectionDecisionsSchema, unpublishedSelectionDecisions } from "./selection-decisions-schema";
import { mockMobileApi } from "./mock-mobile-api";

// SYNTHETIC TEST ONLY: the selection-decisions.v1 shape the BFF returns.
function payload() {
  return {
    contractVersion: "selection-decisions.v1", rule: "C1", ruleLabel: "C1 · kendi durumu", asOf: "2026-11-15T08:00:00.000Z",
    window: { days: 7, from: "2026-11-09", through: "2026-11-15" }, availability: "AVAILABLE", reason: null,
    accounting: "ONE_HYPOTHETICAL_UNIT_AT_FIRST_QUOTE", hypotheticalOnly: true,
    coverage: { fixtures: 12, tracking: 1, decided: 2, notEnrolled: 8, stopped: 1 },
    summary: { decisions: 2, live: 1, settled: 1, wins: 1, losses: 0, pending: 1, unresolved: 0,
      hitRate: "1.0000", averageQuote: "1.24", net: "0.30", roi: "0.3000" },
    records: [
      { decisionId: "A".repeat(32), fixtureKey: "2026-11-14:3000001", homeTeam: "Synthetic Home", awayTeam: "Synthetic Away",
        league: "Synthetic League", market: "Ms05u", quote: "1.30", stars: 4, minute: 61, period: "2H", homeScore: 0, awayScore: 0,
        live: false, decidedAt: "2026-11-14T21:19:30.123Z", evaluatedAt: "2026-11-14T19:50:17.500Z",
        result: { state: "WIN", net: "0.30", finalHome: 0, finalAway: 0 } },
      { decisionId: "B".repeat(32), fixtureKey: "2026-11-14:3000002", homeTeam: "Synthetic Home", awayTeam: "Synthetic Away",
        league: "", market: "Ms1", quote: "1.18", stars: 3, minute: 58, period: "2H", homeScore: 1, awayScore: 0,
        live: true, decidedAt: "2026-11-14T21:23:30.000Z", evaluatedAt: "2026-11-14T21:23:17.500Z",
        result: { state: "PENDING", net: null, finalHome: null, finalAway: null } }
    ]
  };
}

test("the client accepts the BFF rule decisions with exact decimal text", () => {
  const value = selectionDecisionsSchema.parse(payload());
  assert.equal(value.records[0]?.quote, "1.30");
  assert.equal(value.summary?.net, "0.30");
  assert.equal(value.records[1]?.live, true);
});

test("inconsistent results, summaries and availability are refused", () => {
  const settledWithoutNet = payload();
  settledWithoutNet.records[0]!.result.net = null as unknown as string;
  assert.equal(selectionDecisionsSchema.safeParse(settledWithoutNet).success, false);
  const wrongCount = payload();
  wrongCount.summary.decisions = 3;
  assert.equal(selectionDecisionsSchema.safeParse(wrongCount).success, false);
  const floatQuote = payload() as unknown as { records: { quote: unknown }[] };
  floatQuote.records[0]!.quote = 1.3;
  assert.equal(selectionDecisionsSchema.safeParse(floatQuote).success, false);
  const unavailableWithRecords = { ...payload(), availability: "UNAVAILABLE", reason: "SELECTION_SOURCE_INVALID", summary: null, coverage: null };
  assert.equal(selectionDecisionsSchema.safeParse(unavailableWithRecords).success, false);
});

test("an unpublished rule stays empty and the mock sample stays valid", async () => {
  const later = selectionDecisionsSchema.parse(unpublishedSelectionDecisions("C2", "2026-11-15", 7));
  assert.equal(later.window.from, "2026-11-09");
  assert.equal(later.records.length, 0);
  const mock = selectionDecisionsSchema.parse(await mockMobileApi.getSelectionDecisions("C1", "2026-11-15", 1));
  assert.equal(mock.availability, "AVAILABLE");
  assert.match(mock.ruleLabel, /örnek/);
  assert.equal(selectionDecisionsSchema.parse(await mockMobileApi.getSelectionDecisions("C3", "2026-11-15", 1)).reason, "RULE_NOT_PUBLISHED");
});
