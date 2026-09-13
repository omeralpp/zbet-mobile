import assert from "node:assert/strict";
import test from "node:test";
import { jinxIsLive, jinxSelectionKey } from "./jinx-eligibility";

test("Jinx only accepts ongoing statuses, including half-time", () => {
  for (const status of ["LIVE", "HALF_TIME"]) assert.equal(jinxIsLive(status), true);
  for (const status of ["FINISHED", "NOT_STARTED", "NOT_PLAYED", "UNKNOWN", undefined]) assert.equal(jinxIsLive(status), false);
});

test("asking for one selection never authorizes another or reuses its cache", () => {
  const match = { key: "match-a", selectedOdd: "MsX2", rating: 3, decisionMinute: 61, decisionReason: "SCORE_CHANGED" };
  const key = jinxSelectionKey(match);
  for (const change of [{ key: "match-b" }, { selectedOdd: "Ms1" }, { rating: 4 }, { decisionMinute: 62 }, { decisionReason: "RATE_CHANGED" }]) {
    assert.notEqual(jinxSelectionKey({ ...match, ...change }), key);
  }
  assert.equal(jinxSelectionKey(undefined), "");
  assert.equal(jinxSelectionKey({ ...match, selectedOdd: "" }), "");
  assert.equal(jinxSelectionKey({ ...match, rating: 0 }), "");
});
