import assert from "node:assert/strict";
import test from "node:test";
import { decisionEvidenceStatus } from "./decision-evidence-view";

test("loading and failed reads do not report zero publications", () => {
  assert.equal(decisionEvidenceStatus(undefined, true, false).count, null);
  assert.equal(decisionEvidenceStatus(undefined, false, true).kind, "ERROR");
  assert.equal(decisionEvidenceStatus(undefined, false, true).count, null);
});

test("backend unavailable empty history is not proof of no recommendations", () => {
  const status = decisionEvidenceStatus({ availability: "UNAVAILABLE", reason: "SOURCE_UNAVAILABLE", history: [] }, false, false);
  assert.equal(status.kind, "UNAVAILABLE");
  assert.equal(status.count, null);
});

test("a verified empty response can establish zero; retained records survive refresh failure", () => {
  assert.equal(decisionEvidenceStatus({ availability: "WAITING_DATA", reason: "SECOND_HALF_REQUIRED", history: [] }, false, false).count, 0);
  const retained = decisionEvidenceStatus({ availability: "WAITING_DATA", reason: "NO_SELECTION", history: [{}, {}] }, false, true);
  assert.equal(retained.kind, "READY");
  assert.equal(retained.count, 2);
  assert.match(retained.detail ?? "", /son alınan kayıtlar/);
});
