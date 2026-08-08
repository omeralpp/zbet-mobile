import assert from "node:assert/strict";
import test from "node:test";
import { deriveLiveRateTrend } from "./live-card-indicators";

test("compares current live odd with the selection-time odd", () => {
  assert.equal(deriveLiveRateTrend(1.42, 1.58), "UP");
  assert.equal(deriveLiveRateTrend(1.42, 1.31), "DOWN");
  assert.equal(deriveLiveRateTrend(1.42, 1.421), "STABLE");
});

test("does not imply a direction for closed or missing markets", () => {
  assert.equal(deriveLiveRateTrend(null, 1.58), "UNAVAILABLE");
  assert.equal(deriveLiveRateTrend(1.42, null), "UNAVAILABLE");
  assert.equal(deriveLiveRateTrend(1, 1.58), "UNAVAILABLE");
});
