import assert from "node:assert/strict";
import test from "node:test";
import { legacyTopicTimeoutMs } from "./async-timeout";
import { legacyNotificationTopic } from "./registration-policy";
import { runPushSync, type PushSyncDependencies } from "./push-sync";

function neverSettles<T>(): Promise<T> {
  return new Promise<T>(() => {});
}

function createDependencies(
  overrides: Partial<PushSyncDependencies> = {}
): PushSyncDependencies & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    authMode: "pilot",
    platform: "android",
    registerDevice: async () => {
      calls.push("registerDevice");
    },
    subscribeToLegacyTopic: async (topic) => {
      calls.push(`subscribeToLegacyTopic:${topic}`);
      return null;
    },
    ...overrides
  };
}

test("registers the device before touching the legacy broadcast topic", async () => {
  const deps = createDependencies();

  await runPushSync(deps);

  assert.deepEqual(deps.calls, [
    "registerDevice",
    `subscribeToLegacyTopic:${legacyNotificationTopic}`
  ]);
});

// The physical-phone regression: FCM's subscribeToTopic task can stay pending
// far past its bound while the BFF is perfectly reachable. That must not stop
// POST /v1/devices from being sent, and must not fail the stage afterwards.
test("a legacy topic subscription that never settles still registers the device", async () => {
  let registered = false;
  let reportedFailure: unknown;
  const deps = createDependencies({
    registerDevice: async () => {
      registered = true;
    },
    subscribeToLegacyTopic: () => neverSettles(),
    onLegacyTopicFailure: (error) => {
      reportedFailure = error;
    },
    legacyTopicTimeoutMs: 20
  });

  await runPushSync(deps);

  assert.equal(registered, true);
  assert.match(String((reportedFailure as Error).message), /zaman aşımı/);
});

test("the legacy topic subscription is bounded by the shared push timeout", () => {
  assert.equal(legacyTopicTimeoutMs, 8_000);
});

test("a rejecting legacy topic subscription never fails the registration", async () => {
  let reportedFailure: unknown;
  const deps = createDependencies({
    subscribeToLegacyTopic: async () => {
      throw new Error("E_TOPIC_SUBSCRIBE_FAILED");
    },
    onLegacyTopicFailure: (error) => {
      reportedFailure = error;
    }
  });

  await runPushSync(deps);

  assert.match(String((reportedFailure as Error).message), /E_TOPIC_SUBSCRIBE_FAILED/);
});

test("a legacy topic subscription that throws synchronously is contained", async () => {
  const deps = createDependencies({
    subscribeToLegacyTopic: () => {
      throw new Error("ExpoNotifications is unavailable");
    }
  });

  await runPushSync(deps);
});

test("a failed device registration still fails the stage", async () => {
  const deps = createDependencies({
    registerDevice: async () => {
      throw new Error("Mobil servis hatası (503).");
    }
  });

  await assert.rejects(() => runPushSync(deps), /Mobil servis hatası \(503\)\./);
  assert.deepEqual(deps.calls, []);
});

test("skips the legacy topic entirely outside the Android pilot", async () => {
  const oauth = createDependencies({ authMode: "oauth" });
  await runPushSync(oauth);
  assert.deepEqual(oauth.calls, ["registerDevice"]);

  const ios = createDependencies({ platform: "ios" });
  await runPushSync(ios);
  assert.deepEqual(ios.calls, ["registerDevice"]);
});
