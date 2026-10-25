import assert from "node:assert/strict";
import test from "node:test";
import fixture from "./fixtures/btb-rebuild-v1.json";
import { rebuildMatchSchema } from "./rebuild-schemas";
import { jinxFactIds, jinxRb1ExplanationSchema, type JinxRb1Explanation } from "./jinx-rb1-schema";
import { currentRb1Explanation, rb1EvidenceKey } from "../utils/rebuild-jinx";

const reading = rebuildMatchSchema.parse(fixture);
const record = reading.history[0]!;
const example = (): JinxRb1Explanation => ({
  contractVersion: "jinx-rb1-explainer.v1", matchKey: reading.matchKey, asOf: reading.asOf,
  decisionId: record.decisionId, evidenceKey: rb1EvidenceKey(record), origin: "LIVE",
  availability: "OK", reasonCode: null, facts: jinxFactIds.map(id => ({ id, text: "Sunucuda yazılmış olgu." }))
});
test("shared Android/web contract rejects prose fields, missing/duplicate facts and legacy signals", () => {
  assert.equal(jinxRb1ExplanationSchema.safeParse(example()).success, true);
  for (const change of [
    { body: "provider prose" }, { confidence: 1 }, { contractVersion: "jinx-match-outlook.v4" },
    { facts: example().facts.slice(1) }, { facts: Array(5).fill(example().facts[0]) },
    { decisionId: null }, { evidenceKey: null }, { origin: "LIVE", reasonCode: "DISABLED" },
    { origin: "DETERMINISTIC", reasonCode: null }, { availability: "UNAVAILABLE" }
  ]) assert.equal(jinxRb1ExplanationSchema.safeParse({ ...example(), ...change }).success, false);
});
test("a late reply cannot cross a match, decision, score correction, changed evidence or source failure", () => {
  const dto = example();
  assert.equal(currentRb1Explanation(dto, record, reading.matchKey), dto);
  assert.equal(currentRb1Explanation(dto, undefined, reading.matchKey), null);
  assert.equal(currentRb1Explanation(dto, record, "another"), null);
  assert.equal(currentRb1Explanation(dto, record, reading.matchKey, true), null);
  for (const changed of [
    { ...record, decisionId: "B".repeat(32) }, { ...record, homeScore: record.homeScore + 1 },
    { ...record, poolWins: record.poolWins + 1 }, { ...record, votesSupport: record.votesSupport + 1 },
    { ...record, directionConflict: !record.directionConflict }, { ...record, quote: "9.25" }
  ]) assert.equal(currentRb1Explanation(dto, changed, reading.matchKey), null);
});
test("disabled or unavailable explanations stay explicitly deterministic", () => {
  assert.equal(jinxRb1ExplanationSchema.safeParse({ ...example(), origin: "DETERMINISTIC", reasonCode: "DISABLED" }).success, true);
  const dto = jinxRb1ExplanationSchema.parse({ ...example(), availability: "UNAVAILABLE", decisionId: null,
    evidenceKey: null, origin: "DETERMINISTIC", reasonCode: "NO_DECISION", facts: [] });
  assert.equal(currentRb1Explanation(dto, record, reading.matchKey), null);
});
