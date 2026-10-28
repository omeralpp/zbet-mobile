import assert from "node:assert/strict";
import test from "node:test";
import { resolveLiveMatchCount } from "./live-match-count";

test("current match snapshots replace the dashboard count across starts, half-time and finishes", () => {
  const dashboard = { data: { liveMatchCount: 9 }, isError: false };
  const snapshot = { data: [{ status: "LIVE" }, { status: "HALF_TIME" }, { status: "NOT_STARTED" }, { status: "FINISHED" }] as const, isError: false, fetchStatus: "idle" as const };
  assert.equal(resolveLiveMatchCount(snapshot, dashboard), 2);
  assert.equal(resolveLiveMatchCount({ ...snapshot, data: [{ status: "FINISHED" }, { status: "HALF_TIME" }] }, dashboard), 1);
  assert.equal(resolveLiveMatchCount({ ...snapshot, data: [{ status: "FINISHED" }, { status: "HALF_TIME" }, { status: "LIVE" }] }, dashboard), 2);
  assert.equal(resolveLiveMatchCount({ ...snapshot, data: [] }, dashboard), 0);
});

test("loading, failed and paused match reads do not become zero or an older dashboard count", () => {
  const dashboard = { data: { liveMatchCount: 9 }, isError: false };
  assert.equal(resolveLiveMatchCount({ data: undefined, isError: false, fetchStatus: "fetching" }, dashboard), null);
  assert.equal(resolveLiveMatchCount({ data: undefined, isError: false, fetchStatus: "paused" }, dashboard), null);
  assert.equal(resolveLiveMatchCount({ data: [{ status: "LIVE" }], isError: true, fetchStatus: "idle" }, dashboard), null);
});

test("dashboard fallback is used only before a match read, and preserves an unknown result", () => {
  const matches = { data: undefined, isError: false, fetchStatus: "idle" as const };
  assert.equal(resolveLiveMatchCount(matches, { data: { liveMatchCount: 3 }, isError: false }), 3);
  assert.equal(resolveLiveMatchCount(matches, { data: { liveMatchCount: 0 }, isError: false }), 0);
  assert.equal(resolveLiveMatchCount(matches, { data: undefined, isError: false }), null);
  assert.equal(resolveLiveMatchCount(matches, { data: { liveMatchCount: 3 }, isError: true }), null);
});
