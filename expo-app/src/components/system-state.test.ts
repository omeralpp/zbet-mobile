import assert from "node:assert/strict";
import test from "node:test";
import {
  isAlarming,
  resolveSystemState,
  retainsContent,
  type SystemStateKind
} from "./system-state";

const kinds: SystemStateKind[] = [
  "LOADING",
  "EMPTY",
  "NO_LIVE_MATCH",
  "NO_DECISION",
  "STALE",
  "REFRESH_FAILED",
  "UNAVAILABLE",
  "OFFLINE"
];

test("only a state the user can act on is allowed to look alarming", () => {
  const alarming = kinds.filter((kind) =>
    isAlarming(resolveSystemState(kind).tone)
  );
  assert.deepEqual(
    alarming,
    ["OFFLINE"],
    "dressing quiet states as errors teaches people to ignore error styling"
  );
});

test("nothing-here states are normal answers, not failures", () => {
  for (const kind of ["EMPTY", "NO_LIVE_MATCH", "NO_DECISION"] as const) {
    assert.equal(resolveSystemState(kind).tone, "NEUTRAL", kind);
  }
});

test("retry is offered only where retrying can change the answer", () => {
  for (const kind of ["EMPTY", "NO_LIVE_MATCH", "NO_DECISION"] as const) {
    assert.equal(
      resolveSystemState(kind).retryable,
      false,
      `${kind} would re-fetch the same emptiness`
    );
  }
  assert.equal(resolveSystemState("OFFLINE").retryable, true);
  assert.equal(resolveSystemState("REFRESH_FAILED").retryable, true);
});

test("loading never offers a retry, because it has not finished failing", () => {
  const loading = resolveSystemState("LOADING");
  assert.equal(loading.tone, "WAITING");
  assert.equal(loading.retryable, false);
});

test("a quiet source and a failed refresh read the same to the user", () => {
  const unavailable = resolveSystemState("UNAVAILABLE");
  const failed = resolveSystemState("REFRESH_FAILED");
  assert.equal(unavailable.tone, failed.tone);
  assert.equal(unavailable.icon, failed.icon);
  assert.equal(
    unavailable.body,
    failed.body,
    "the difference between them matters to telemetry, not to a reader"
  );
});

test("no state names a provider, a status code or an error code", () => {
  const forbidden = /http|\d{3}|bilyoner|sap|api|token|error|hata kodu/i;
  for (const kind of kinds) {
    const spec = resolveSystemState(kind);
    assert.ok(!forbidden.test(spec.title), `${kind} title leaks internals`);
    assert.ok(!forbidden.test(spec.body), `${kind} body leaks internals`);
  }
});

test("stale is the only state that keeps real data underneath it", () => {
  const retaining = kinds.filter(retainsContent);
  assert.deepEqual(retaining, ["STALE"]);
  assert.equal(resolveSystemState("STALE").tone, "CAUTION");
});

test("every state says something a reader can act on or accept", () => {
  for (const kind of kinds) {
    const spec = resolveSystemState(kind);
    assert.ok(spec.title.length > 0, kind);
    assert.ok(spec.body.length > 0, kind);
    assert.ok(spec.icon.length > 0, kind);
  }
});
