import assert from "node:assert/strict";
import test from "node:test";
import {
  createRegistrationController,
  defaultRegistrationTimeouts,
  type RegistrationDependencies,
  type RegistrationSnapshot,
  type RegistrationTimeouts
} from "./registration-machine";
import {
  channelsTimeoutMs,
  deviceRegistrationTimeoutMs,
  permissionCheckTimeoutMs,
  permissionRequestTimeoutMs,
  pushTokenTimeoutMs,
  registrationWatchdogTimeoutMs
} from "./async-timeout";

function neverSettles<T>(): Promise<T> {
  return new Promise<T>(() => {});
}

function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function createDeps(
  overrides: Partial<RegistrationDependencies> = {}
): RegistrationDependencies {
  return {
    ensureChannels: async () => {},
    checkPermission: async () => true,
    requestPermission: async () => true,
    getPushToken: async () => "token-value",
    registerDevice: async () => {},
    ...overrides
  };
}

function fastTimeouts(
  overrides: Partial<RegistrationTimeouts> = {}
): RegistrationTimeouts {
  return {
    channelsTimeoutMs: 25,
    permissionCheckTimeoutMs: 25,
    permissionRequestTimeoutMs: 25,
    pushTokenTimeoutMs: 25,
    deviceRegistrationTimeoutMs: 25,
    registrationWatchdogTimeoutMs: 400,
    ...overrides
  };
}

function stagesOf(snapshots: RegistrationSnapshot[]): string[] {
  return snapshots.map((snapshot) => snapshot.stage);
}

test("runs the happy path through every stage and reaches complete", async () => {
  const controller = createRegistrationController(createDeps(), fastTimeouts());
  const seen: RegistrationSnapshot[] = [];
  controller.subscribe((snapshot) => seen.push(snapshot));

  const result = await controller.start();

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(stagesOf(seen), [
    "channels",
    "permission_check",
    "push_token",
    "device_registration",
    "complete"
  ]);
  assert.equal(controller.getSnapshot().stage, "complete");
});

test("requests permission when it is not already granted", async () => {
  const deps = createDeps({
    checkPermission: async () => false,
    requestPermission: async () => true
  });
  const controller = createRegistrationController(deps, fastTimeouts());
  const seen: RegistrationSnapshot[] = [];
  controller.subscribe((snapshot) => seen.push(snapshot));

  const result = await controller.start();

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(stagesOf(seen), [
    "channels",
    "permission_check",
    "permission_request",
    "push_token",
    "device_registration",
    "complete"
  ]);
});

test("fails with PUSH_PERMISSION_DENIED when permission is refused", async () => {
  const deps = createDeps({
    checkPermission: async () => false,
    requestPermission: async () => false
  });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.deepEqual(result, {
    ok: false,
    code: "PUSH_PERMISSION_DENIED",
    message: "Bildirim izni verilmedi."
  });
  assert.equal(controller.getSnapshot().stage, "failed");
});

test("bounds a hanging channel setup with PUSH_CHANNEL_SETUP_TIMEOUT", async () => {
  const deps = createDeps({ ensureChannels: () => neverSettles() });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.code, "PUSH_CHANNEL_SETUP_TIMEOUT");
});

test("reports PUSH_CHANNEL_SETUP_FAILED on a native channel rejection", async () => {
  const deps = createDeps({
    ensureChannels: async () => {
      throw new Error("kanal hatası");
    }
  });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.code, "PUSH_CHANNEL_SETUP_FAILED");
  assert.equal(!result.ok && result.message, "kanal hatası");
});

test("bounds a hanging permission check with PUSH_PERMISSION_CHECK_TIMEOUT", async () => {
  const deps = createDeps({ checkPermission: () => neverSettles() });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "PUSH_PERMISSION_CHECK_TIMEOUT");
});

test("reports PUSH_PERMISSION_CHECK_FAILED on a native rejection", async () => {
  const deps = createDeps({
    checkPermission: async () => {
      throw new Error("izin kontrolü çöktü");
    }
  });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "PUSH_PERMISSION_CHECK_FAILED");
});

test("reports PUSH_PERMISSION_REQUEST_FAILED on a native rejection", async () => {
  const deps = createDeps({
    checkPermission: async () => false,
    requestPermission: async () => {
      throw new Error("izin istemi çöktü");
    }
  });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "PUSH_PERMISSION_REQUEST_FAILED");
});

test("recovers a hung permission request when a recheck shows permission was granted", async () => {
  let checkCalls = 0;
  const deps = createDeps({
    checkPermission: async () => {
      checkCalls += 1;
      return checkCalls > 1;
    },
    requestPermission: () => neverSettles()
  });
  const controller = createRegistrationController(
    deps,
    fastTimeouts({ permissionRequestTimeoutMs: 10 })
  );

  const result = await controller.start();

  assert.deepEqual(result, { ok: true });
  assert.equal(checkCalls, 2);
});

test("fails with PUSH_PERMISSION_TIMEOUT when the recheck shows no permission", async () => {
  const deps = createDeps({
    checkPermission: async () => false,
    requestPermission: () => neverSettles()
  });
  const controller = createRegistrationController(
    deps,
    fastTimeouts({ permissionRequestTimeoutMs: 10 })
  );

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "PUSH_PERMISSION_TIMEOUT");
});

test("fails with PUSH_PERMISSION_TIMEOUT when both the request and the recheck hang", async () => {
  let checkCalls = 0;
  const deps = createDeps({
    checkPermission: () => {
      checkCalls += 1;
      return checkCalls === 1 ? Promise.resolve(false) : neverSettles();
    },
    requestPermission: () => neverSettles()
  });
  const controller = createRegistrationController(
    deps,
    fastTimeouts({ permissionRequestTimeoutMs: 10, permissionCheckTimeoutMs: 10 })
  );

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "PUSH_PERMISSION_TIMEOUT");
});

test("bounds a hanging push token fetch with PUSH_TOKEN_TIMEOUT", async () => {
  const deps = createDeps({ getPushToken: () => neverSettles() });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "PUSH_TOKEN_TIMEOUT");
});

test("reports PUSH_TOKEN_FAILED on a native rejection", async () => {
  const deps = createDeps({
    getPushToken: async () => {
      throw new Error("token alınamadı");
    }
  });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "PUSH_TOKEN_FAILED");
});

test("bounds a hanging device registration with DEVICE_REGISTER_TIMEOUT", async () => {
  const deps = createDeps({ registerDevice: () => neverSettles() });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "DEVICE_REGISTER_TIMEOUT");
});

test("reports DEVICE_REGISTER_FAILED on a native rejection", async () => {
  const deps = createDeps({
    registerDevice: async () => {
      throw new Error("kayıt reddedildi");
    }
  });
  const controller = createRegistrationController(deps, fastTimeouts());

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "DEVICE_REGISTER_FAILED");
});

test("the outer watchdog fires even when every stage is within its own bound", async () => {
  const deps = createDeps({
    ensureChannels: () => delay(60, undefined),
    checkPermission: () => delay(60, true),
    getPushToken: () => delay(60, "token-value"),
    registerDevice: () => delay(60, undefined)
  });
  const controller = createRegistrationController(
    deps,
    fastTimeouts({
      channelsTimeoutMs: 1_000,
      permissionCheckTimeoutMs: 1_000,
      pushTokenTimeoutMs: 1_000,
      deviceRegistrationTimeoutMs: 1_000,
      registrationWatchdogTimeoutMs: 20
    })
  );

  const result = await controller.start();

  assert.equal(!result.ok && result.code, "REGISTRATION_WATCHDOG_TIMEOUT");
  assert.equal(controller.getSnapshot().stage, "failed");
});

test("a throwing subscriber cannot crash registration or block other subscribers", async () => {
  const controller = createRegistrationController(createDeps(), fastTimeouts());
  const originalWarn = console.warn;
  console.warn = () => {};
  const otherSeen: RegistrationSnapshot[] = [];
  try {
    controller.subscribe((snapshot) => {
      if (snapshot.stage === "permission_check") {
        throw new Error("listener boom");
      }
    });
    controller.subscribe((snapshot) => otherSeen.push(snapshot));

    const result = await controller.start();

    assert.deepEqual(result, { ok: true });
    assert.equal(controller.getSnapshot().stage, "complete");
    assert.deepEqual(stagesOf(otherSeen), [
      "channels",
      "permission_check",
      "push_token",
      "device_registration",
      "complete"
    ]);
  } finally {
    console.warn = originalWarn;
  }
});

test("isActive() is true as soon as start() is called and false once settled", async () => {
  const controller = createRegistrationController(createDeps(), fastTimeouts());

  assert.equal(controller.isActive(), false);
  const pending = controller.start();
  assert.equal(controller.isActive(), true);

  await pending;

  assert.equal(controller.isActive(), false);
});

test("a newer transaction preempts an older one and stale results cannot overwrite it", async () => {
  let channelCalls = 0;
  const deps = createDeps({
    ensureChannels: () => {
      channelCalls += 1;
      return channelCalls === 1 ? delay(15, undefined) : Promise.resolve();
    }
  });
  const controller = createRegistrationController(deps, fastTimeouts());
  const seen: RegistrationSnapshot[] = [];
  controller.subscribe((snapshot) => seen.push(snapshot));

  const older = controller.start();
  const newer = controller.start();

  const newerResult = await newer;
  assert.deepEqual(newerResult, { ok: true });
  const snapshotAfterNewer = controller.getSnapshot();
  const notificationCountAfterNewer = seen.length;

  const olderResult = await older;

  assert.deepEqual(olderResult, { ok: true });
  assert.equal(
    seen.length,
    notificationCountAfterNewer,
    "the older transaction's late stage transitions must not reach subscribers"
  );
  assert.deepEqual(controller.getSnapshot(), snapshotAfterNewer);
});

test("unsubscribing stops further notifications", async () => {
  const controller = createRegistrationController(createDeps(), fastTimeouts());
  const seen: RegistrationSnapshot[] = [];
  const unsubscribe = controller.subscribe((snapshot) => seen.push(snapshot));

  unsubscribe();
  await controller.start();

  assert.equal(seen.length, 0);
});

test("a fresh transaction's snapshot never carries a stale error code or message", async () => {
  const failingDeps = createDeps({
    checkPermission: async () => false,
    requestPermission: async () => false
  });
  const failingController = createRegistrationController(failingDeps, fastTimeouts());
  await failingController.start();
  assert.equal(failingController.getSnapshot().stage, "failed");

  const succeedingController = createRegistrationController(createDeps(), fastTimeouts());
  await succeedingController.start();

  const snapshot = succeedingController.getSnapshot();
  assert.equal(snapshot.stage, "complete");
  assert.equal(snapshot.code, undefined);
  assert.equal(snapshot.message, undefined);
});

test("defaultRegistrationTimeouts binds the centralized async-timeout constants", () => {
  assert.deepEqual(defaultRegistrationTimeouts, {
    channelsTimeoutMs,
    permissionCheckTimeoutMs,
    permissionRequestTimeoutMs,
    pushTokenTimeoutMs,
    deviceRegistrationTimeoutMs,
    registrationWatchdogTimeoutMs
  });
});
