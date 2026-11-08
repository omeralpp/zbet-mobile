import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { emptySelectionComparison, selectionComparisonSchema, type SelectionComparison } from "@/src/api/selection-comparison-schema";
import { mockMatches } from "@/src/api/mock-data";
import type { MatchDetail } from "@/src/api/schemas";
import { currentSelectionComparison, selectionReason } from "./selection-lab-view";

const fixture = () => selectionComparisonSchema.parse(JSON.parse(readFileSync(new URL("../../contracts/selection-comparison.test-fixture.json", import.meta.url), "utf8")));
function match(data: SelectionComparison): MatchDetail {
  const state = data.state!;
  return { ...mockMatches[0]!, ...state, key: data.matchKey, status: "LIVE",
    clock: { contractVersion: "match-clock.v1", period: state.period, label: String(state.elapsed) },
    rebuild: { contractVersion: "btb-rebuild.v1", modelRegime: "BTB_RB1_20261018", matchKey: data.matchKey,
      asOf: data.asOf!, availability: "ACTIVE", reason: "TEST_ONLY", current: { decisionId: data.proposals[0]!.selection!.publicationId,
        market: data.proposals[0]!.selection!.market, quote: String(data.proposals[0]!.selection!.quote), stars: 2, consistencyScore: "70", validUntil: data.expiresAt! } } };
}

test("the BFF contract example is accepted and unpublished states never invent selections", () => {
  assert.equal(fixture().proposals[2]!.selection?.market, "Ms1X");
  const empty = selectionComparisonSchema.parse(emptySelectionComparison("2026-11-08:999999:20:00:00"));
  assert.ok(empty.proposals.every(arm => arm.selection === null && arm.probability === null));
  const missing = emptySelectionComparison(empty.matchKey); missing.proposals[0]!.probability = 0.8;
  assert.equal(selectionComparisonSchema.safeParse(missing).success, false);
});

test("strict client refuses unvalidated probabilities, wrong payoffs, duplicates and unsupported markets", () => {
  const changes = [
    (v: SelectionComparison) => { v.proposals[2]!.probabilityValidation = null; },
    (v: SelectionComparison) => { v.proposals[2]!.expectedNet = 0.2; },
    (v: SelectionComparison) => { v.proposals[2]!.trialId = null; },
    (v: SelectionComparison) => { v.proposals[2]!.form!.homeN = 0; },
    (v: SelectionComparison) => { v.proposals[1] = v.proposals[0]!; },
    (v: SelectionComparison) => { v.expiresAt = "2026-11-08T18:02:01.000Z"; }
  ];
  for (const change of changes) { const value = fixture(); change(value); assert.equal(selectionComparisonSchema.safeParse(value).success, false); }
});

test("both surfaces withhold previous data after failure, expiry, key, score, card, period or champion change", () => {
  const data = fixture(), current = match(data), now = Date.parse(data.asOf!);
  assert.equal(currentSelectionComparison(data, current, now), data);
  assert.equal(currentSelectionComparison(data, current, now, true), null);
  assert.equal(currentSelectionComparison(data, current, now-1), null);
  assert.equal(currentSelectionComparison(data, current, now+120000), null);
  for (const changed of [{ ...current, key: "other" }, { ...current, homeScore: 1 }, { ...current, awayScore: 1 },
    { ...current, homeRedCards: 1 }, { ...current, awayRedCards: 1 }, { ...current, elapsed: 61 },
    { ...current, clock: { ...current.clock!, period: "ET" as const } }, { ...current, rebuild: { ...current.rebuild!, current: null, availability: "WAITING_DATA" as const } }])
    assert.equal(currentSelectionComparison(data, changed, now), null);
  assert.equal(currentSelectionComparison(undefined, current, now), null);
  assert.ok(selectionReason("FORM_UNAVAILABLE").includes("takım geçmişi"));
});
