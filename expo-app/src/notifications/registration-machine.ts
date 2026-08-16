import {
  TimeoutError,
  channelsTimeoutMs,
  deviceRegistrationTimeoutMs,
  permissionCheckTimeoutMs,
  permissionRequestTimeoutMs,
  pushTokenTimeoutMs,
  registrationWatchdogTimeoutMs,
  withTimeout
} from "./async-timeout";

export type RegistrationStage =
  | "idle"
  | "channels"
  | "permission_check"
  | "permission_request"
  | "push_token"
  | "device_registration"
  | "complete"
  | "failed";

export type RegistrationErrorCode =
  | "PUSH_CHANNEL_SETUP_TIMEOUT"
  | "PUSH_CHANNEL_SETUP_FAILED"
  | "PUSH_PERMISSION_CHECK_TIMEOUT"
  | "PUSH_PERMISSION_CHECK_FAILED"
  | "PUSH_PERMISSION_REQUEST_FAILED"
  | "PUSH_PERMISSION_TIMEOUT"
  | "PUSH_PERMISSION_DENIED"
  | "PUSH_TOKEN_TIMEOUT"
  | "PUSH_TOKEN_FAILED"
  | "DEVICE_REGISTER_TIMEOUT"
  | "DEVICE_REGISTER_FAILED"
  | "REGISTRATION_WATCHDOG_TIMEOUT"
  | "REGISTRATION_UNKNOWN_ERROR";

export interface RegistrationSnapshot {
  stage: RegistrationStage;
  code?: RegistrationErrorCode;
  message?: string;
}

export interface RegistrationDependencies {
  ensureChannels: () => Promise<void>;
  checkPermission: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  getPushToken: () => Promise<string>;
  registerDevice: (token: string) => Promise<void>;
}

export interface RegistrationTimeouts {
  channelsTimeoutMs: number;
  permissionCheckTimeoutMs: number;
  permissionRequestTimeoutMs: number;
  pushTokenTimeoutMs: number;
  deviceRegistrationTimeoutMs: number;
  registrationWatchdogTimeoutMs: number;
}

export const defaultRegistrationTimeouts: RegistrationTimeouts = {
  channelsTimeoutMs,
  permissionCheckTimeoutMs,
  permissionRequestTimeoutMs,
  pushTokenTimeoutMs,
  deviceRegistrationTimeoutMs,
  registrationWatchdogTimeoutMs
};

export type StageResult =
  | { ok: true }
  | { ok: false; code: RegistrationErrorCode; message: string };

type StageOutcome<T> =
  | { ok: true; value: T }
  | { ok: false; code: RegistrationErrorCode; message: string };

async function runStage<T>(
  onStage: (stage: RegistrationStage) => void,
  stage: RegistrationStage,
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutCode: RegistrationErrorCode,
  failureCode: RegistrationErrorCode,
  timeoutMessage: string
): Promise<StageOutcome<T>> {
  onStage(stage);
  try {
    const value = await withTimeout(operation(), timeoutMs, timeoutMessage);
    return { ok: true, value };
  } catch (error) {
    if (error instanceof TimeoutError) {
      return { ok: false, code: timeoutCode, message: timeoutMessage };
    }
    return {
      ok: false,
      code: failureCode,
      message: error instanceof Error ? error.message : "Bilinmeyen hata."
    };
  }
}

// Never throws: every failure path (native rejection, timeout, or an
// unexpected error from a stage/listener) resolves to a tagged StageResult
// so the caller always gets a definite outcome instead of an unhandled
// rejection that could leave the UI stuck.
async function runStages(
  deps: RegistrationDependencies,
  timeouts: RegistrationTimeouts,
  onStage: (stage: RegistrationStage) => void
): Promise<StageResult> {
  try {
    const channels = await runStage(
      onStage,
      "channels",
      deps.ensureChannels,
      timeouts.channelsTimeoutMs,
      "PUSH_CHANNEL_SETUP_TIMEOUT",
      "PUSH_CHANNEL_SETUP_FAILED",
      "Bildirim kanalları hazırlanamadı (zaman aşımı)."
    );
    if (!channels.ok) {
      return channels;
    }

    const initialCheck = await runStage(
      onStage,
      "permission_check",
      deps.checkPermission,
      timeouts.permissionCheckTimeoutMs,
      "PUSH_PERMISSION_CHECK_TIMEOUT",
      "PUSH_PERMISSION_CHECK_FAILED",
      "Bildirim izni kontrol edilemedi (zaman aşımı)."
    );
    if (!initialCheck.ok) {
      return initialCheck;
    }

    let granted = initialCheck.value;
    if (!granted) {
      const request = await runStage(
        onStage,
        "permission_request",
        deps.requestPermission,
        timeouts.permissionRequestTimeoutMs,
        "PUSH_PERMISSION_TIMEOUT",
        "PUSH_PERMISSION_REQUEST_FAILED",
        "Bildirim izni istemi zaman aşımına uğradı."
      );
      if (request.ok) {
        granted = request.value;
      } else if (request.code === "PUSH_PERMISSION_TIMEOUT") {
        // The OS permission dialog can resolve natively even though the
        // request promise itself never settles. Recheck once before
        // treating this as a real timeout failure, instead of failing a
        // registration the user actually approved.
        const recheck = await runStage(
          onStage,
          "permission_check",
          deps.checkPermission,
          timeouts.permissionCheckTimeoutMs,
          "PUSH_PERMISSION_TIMEOUT",
          "PUSH_PERMISSION_TIMEOUT",
          request.message
        );
        if (!recheck.ok) {
          return recheck;
        }
        granted = recheck.value;
        if (!granted) {
          return { ok: false, code: "PUSH_PERMISSION_TIMEOUT", message: request.message };
        }
      } else {
        return request;
      }
    }

    if (!granted) {
      return {
        ok: false,
        code: "PUSH_PERMISSION_DENIED",
        message: "Bildirim izni verilmedi."
      };
    }

    const pushToken = await runStage(
      onStage,
      "push_token",
      deps.getPushToken,
      timeouts.pushTokenTimeoutMs,
      "PUSH_TOKEN_TIMEOUT",
      "PUSH_TOKEN_FAILED",
      "Push token alınamadı (zaman aşımı)."
    );
    if (!pushToken.ok) {
      return pushToken;
    }

    const registration = await runStage(
      onStage,
      "device_registration",
      () => deps.registerDevice(pushToken.value),
      timeouts.deviceRegistrationTimeoutMs,
      "DEVICE_REGISTER_TIMEOUT",
      "DEVICE_REGISTER_FAILED",
      "Cihaz kaydı tamamlanamadı (zaman aşımı)."
    );
    if (!registration.ok) {
      return registration;
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      code: "REGISTRATION_UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "Bilinmeyen hata."
    };
  }
}

export interface RegistrationController {
  getSnapshot: () => RegistrationSnapshot;
  subscribe: (listener: (snapshot: RegistrationSnapshot) => void) => () => void;
  start: () => Promise<StageResult>;
  isActive: () => boolean;
}

const activeStages: ReadonlySet<RegistrationStage> = new Set([
  "channels",
  "permission_check",
  "permission_request",
  "push_token",
  "device_registration"
]);

// Single authoritative owner of push-registration state. Every caller
// (manual tap, startup restore, token-rotation listener) must go through
// one controller instance so only one transaction can drive the UI-facing
// snapshot at a time.
export function createRegistrationController(
  deps: RegistrationDependencies,
  timeouts: RegistrationTimeouts = defaultRegistrationTimeouts
): RegistrationController {
  let snapshot: RegistrationSnapshot = { stage: "idle" };
  const listeners = new Set<(snapshot: RegistrationSnapshot) => void>();
  let currentTransaction = 0;

  // Every published snapshot is tagged with the transaction that produced
  // it. A transaction superseded by a newer start() call (or by the
  // watchdog already having settled it) can never write over later state,
  // even if its background work resolves after the fact.
  function publish(next: RegistrationSnapshot, transaction: number) {
    if (transaction !== currentTransaction) {
      return;
    }
    snapshot = next;
    // A misbehaving subscriber must never stop other subscribers from
    // being notified, or stop the transaction itself from settling —
    // otherwise a UI bug elsewhere could leave the registration snapshot
    // (and any subtitle driven by it) stuck at a non-terminal stage.
    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.warn("Registration listener threw", error);
      }
    });
  }

  function getSnapshot(): RegistrationSnapshot {
    return snapshot;
  }

  function subscribe(listener: (snapshot: RegistrationSnapshot) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function isActive(): boolean {
    return activeStages.has(snapshot.stage);
  }

  async function start(): Promise<StageResult> {
    // Bumping the transaction counter immediately preempts any prior
    // in-flight transaction: its future onStage/publish calls are stale
    // and will be dropped by the token check above. This is what makes a
    // fresh manual tap take precedence over whatever was running before.
    const transaction = ++currentTransaction;

    const onStage = (stage: RegistrationStage) => {
      publish({ stage }, transaction);
    };

    let result: StageResult;
    try {
      result = await withTimeout(
        runStages(deps, timeouts, onStage),
        timeouts.registrationWatchdogTimeoutMs,
        "Bildirim kaydı zaman aşımına uğradı."
      );
    } catch (error) {
      result = {
        ok: false,
        code: "REGISTRATION_WATCHDOG_TIMEOUT",
        message: error instanceof Error ? error.message : "Bilinmeyen hata."
      };
    }

    publish(
      result.ok
        ? { stage: "complete" }
        : { stage: "failed", code: result.code, message: result.message },
      transaction
    );

    return result;
  }

  return { getSnapshot, subscribe, start, isActive };
}
