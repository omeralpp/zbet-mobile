import assert from "node:assert/strict";
import test from "node:test";
import { pushTokenTimeoutMs, withTimeout } from "./async-timeout";

function neverSettles<T>(): Promise<T> {
  return new Promise<T>(() => {});
}

test("withTimeout resolves normally when the wrapped promise settles first", async () => {
  const result = await withTimeout(Promise.resolve("token-value"), 50, "timed out");
  assert.equal(result, "token-value");
});

test("withTimeout rejects with the wrapped promise's own rejection", async () => {
  await assert.rejects(
    () => withTimeout(Promise.reject(new Error("native failure")), 50, "timed out"),
    /native failure/
  );
});

test("withTimeout bounds a promise that never resolves", async () => {
  await assert.rejects(
    () => withTimeout(neverSettles(), 20, "Push token alınamadı (zaman aşımı)."),
    /zaman aşımı/
  );
});

test("a timeout rejection short-circuits before any dependent request runs", async () => {
  let dependentCalled = false;
  const dependentStep = async () => {
    dependentCalled = true;
  };

  // Mirrors registerPushDevice()'s shape: await the bounded token call,
  // then await syncPushToken(token). If the first await rejects, the
  // second statement must never execute.
  const simulateRegisterPushDevice = async () => {
    const token = await withTimeout(neverSettles<string>(), 20, "zaman aşımı");
    await dependentStep();
    return token;
  };

  await assert.rejects(() => simulateRegisterPushDevice());
  assert.equal(dependentCalled, false);
});

test("exposes the documented push-token timeout duration", () => {
  assert.equal(pushTokenTimeoutMs, 15_000);
});
