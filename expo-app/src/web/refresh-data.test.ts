import assert from "node:assert/strict";
import test from "node:test";
import { canRefreshScreenQuery } from "./refresh-data";

test("refresh includes visible match context but excludes analyst and private local state", () => {
  assert.equal(canRefreshScreenQuery(["analysisContext", "match"]), true);
  assert.equal(canRefreshScreenQuery(["matches", "match", "matchJourney"]), true);
  assert.equal(canRefreshScreenQuery(["rebuildReport"]), true);
  assert.equal(canRefreshScreenQuery(["rebuildCohortsReport"]), true);
  assert.equal(canRefreshScreenQuery(["rebuildPoolPath", "match"]), true);
  assert.equal(canRefreshScreenQuery(["rebuildMatch", "match"]), true);
  assert.equal(canRefreshScreenQuery(["superLogs"]), false);
  assert.equal(canRefreshScreenQuery(["matches", "match", "jinxOutlook", "selection"]), false);
  assert.equal(canRefreshScreenQuery(["jinxAssessment", "match"]), false);
  assert.equal(canRefreshScreenQuery(["preferences"]), false);
});
