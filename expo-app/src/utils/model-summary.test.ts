import assert from "node:assert/strict";
import test from "node:test";
import {
  canPresentAsSum,
  contributorFields,
  forbiddenFields,
  headlineFields,
  isPresentable,
  readModelValue
} from "./model-summary";

test("the probability lift can never come back", () => {
  assert.equal(isPresentable("superProbability"), false);
  const all = [...headlineFields, ...contributorFields].map((f) => f.id);
  assert.ok(
    !all.includes("superProbability"),
    "super probability is the same quantity as the base probability, not a second output"
  );
});

test("every forbidden field carries the reason it is forbidden", () => {
  for (const field of forbiddenFields) {
    assert.ok(field.reason.length > 40, field.id);
  }
});

test("base probability survives as its own quantity", () => {
  const base = headlineFields.find((f) => f.id === "baseProbability");
  assert.ok(base, "the base probability is real and must still be shown");
  assert.equal(
    base?.role,
    "STANDALONE",
    "it does not feed the score, so it must not be drawn as a step toward it"
  );
});

test("model score is the output and edge is an input", () => {
  assert.equal(
    headlineFields.find((f) => f.id === "modelScore")?.role,
    "OUTPUT"
  );
  assert.equal(
    headlineFields.find((f) => f.id === "edgeScore")?.role,
    "WEIGHTED_INPUT"
  );
});

test("the deeper contributors are preserved and all weighted", () => {
  const ids = contributorFields.map((f) => f.id);
  assert.deepEqual(ids, [
    "pressureAdjustment",
    "stateAdjustment",
    "compatibilityScore",
    "alignmentScore"
  ]);
  for (const field of contributorFields) {
    assert.equal(
      field.role,
      "WEIGHTED_INPUT",
      `${field.id} reaches the score through a market-dependent weight`
    );
  }
});

test("nothing may be drawn as a sum", () => {
  assert.equal(
    canPresentAsSum(),
    false,
    "the real score is weighted, carries an intercept and includes terms the UI never shows"
  );
});

test("no probability is invented to replace the removed one", () => {
  const probabilityFields = [...headlineFields, ...contributorFields].filter(
    (f) => f.label.includes("olasılık")
  );
  assert.equal(
    probabilityFields.length,
    1,
    "exactly one probability is shown, and it is the existing base probability"
  );
  assert.equal(probabilityFields[0]?.id, "baseProbability");
});

test("user-facing labels stay Turkish", () => {
  for (const field of [...headlineFields, ...contributorFields]) {
    assert.ok(
      !/probability|score|adjustment|pressure|state/i.test(field.label) ||
        field.label === "edge",
      `${field.id} leaks an internal identifier: ${field.label}`
    );
  }
});

test("values are read straight through without transformation", () => {
  const log = { baseProbability: 0.6, modelScore: 2.41, edgeScore: 7.36 };
  assert.equal(readModelValue(log, "baseProbability"), 0.6);
  assert.equal(readModelValue(log, "modelScore"), 2.41);
  assert.equal(readModelValue(log, "edgeScore"), 7.36);
  assert.equal(readModelValue(log, "superProbability"), null);
});

test("a missing model score stays missing rather than defaulting", () => {
  const log = { baseProbability: null, modelScore: null, edgeScore: 0 };
  assert.equal(readModelValue(log, "modelScore"), null);
  assert.equal(readModelValue(log, "baseProbability"), null);
});
