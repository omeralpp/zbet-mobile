import assert from "node:assert/strict";
import test from "node:test";
import { decisionContextSchema } from "../api/schemas";
import { decisionModelLabel, recordedSelection } from "./decision-model";
import { pressureReading } from "../components/journey-story";
import { mockRetainedJourney } from "../api/mock-data";

function context(state = "TOWARD", recommendation = "CURRENT") {
  return decisionContextSchema.parse({ contractVersion: "decision-context.v3",
    recentPressure: { availability: "AVAILABLE", reason: null, policyId: "OBSERVED_PILOT_V1", estimated: true,
      units: "EST_SAMPLED_ACTIVITY_PER_MIN", observedEpoch: "LOCAL-EPOCH", home: 4, away: 1, total: 5,
      difference: 3, intervalSeconds: 60, observedAt: "2026-10-14T08:00:00Z", sourceTimingKnown: false,
      xgCovered: false, stateRevision: null },
    decisionCoherence: { availability: "UNAVAILABLE", reason: "OBSERVED_PROVIDER_ASSOCIATION_UNPROVEN", stateRevision: null, quoteRevision: null },
    model: { kind: "PRESSURE_PATH_PILOT", regimeId: "BTB_PPV1_20261014", cutoverId: "2026-10-14", arm: 3,
      scorerSha: "A".repeat(64), baseParameterSha: "B".repeat(64), decisionRecordSha: "C".repeat(64),
      pressureUnits: "EST_SAMPLED_ACTIVITY_PER_MIN", recommendation },
    expectedScorePressure: { state, reason: state === "MIXED" ? "TIED_PATH_CONFLICT" : null,
      alignment: state === "MIXED" ? null : state === "TOWARD" ? 0.6 : -1,
      leaders: [{ score: "2-1", homeRemaining: 1, awayRemaining: 0 },
        ...(state === "MIXED" ? [{ score: "1-2", homeRemaining: 0, awayRemaining: 1 }] : [])] }
  });
}

test("stored selection cannot masquerade as a current recommendation just because a quote exists", () => {
  assert.equal(recordedSelection("Ms1", 1.8, context(),Date.parse("2026-10-14T08:01:00Z")),false);
  assert.equal(recordedSelection("Ms1", 1.8, context(),Date.parse("2026-10-14T08:04:01Z")),true);
  assert.equal(recordedSelection("Ms1", 1.8, context("TOWARD", "RECORDED")),true);
  assert.equal(recordedSelection("Ms1", null, context()),true);
  assert.equal(recordedSelection("", null, context("TOWARD", "NONE")),false);
  assert.match(decisionModelLabel(context()),/2026-10-14/);
});
test("conflicting leaders are explained as uncertainty rather than absent pressure", () => {
  const point = mockRetainedJourney("path").points[0]!;
  assert.match(pressureReading({ ...point, decisionContext: context("MIXED") }),/farklı yollar/);
  assert.match(pressureReading({ ...point, decisionContext: context() }),/2-1 skoruna doğru/);
  assert.match(pressureReading({ ...point, decisionContext: context("PRESERVATION") }),/skorun korunmasına karşı/);
});
test("partial model stamps and unavailable current recommendations fail schema validation", () => {
  const value = context();
  if (value.contractVersion !== "decision-context.v3") throw new Error("Expected V3");
  for (const change of [{ arm: 0 },{ cutoverId: "2026-10-13" },{ decisionRecordSha: null },{ kind: "LEGACY" }])
    assert.equal(decisionContextSchema.safeParse({ ...value, model: { ...value.model,...change } }).success,false);
  assert.equal(decisionContextSchema.safeParse({ ...value, expectedScorePressure: {
    ...value.expectedScorePressure, state: "MIXED", alignment: 0.5 } }).success,false);
});
