import { legacyTopicTimeoutMs, withTimeout } from "./async-timeout";
import {
  resolveLegacyNotificationTopic,
  type NotificationAuthMode,
  type NotificationPlatform
} from "./registration-policy";

export interface PushSyncDependencies {
  authMode: NotificationAuthMode;
  platform: NotificationPlatform;
  registerDevice: () => Promise<void>;
  subscribeToLegacyTopic: (topic: string) => Promise<unknown>;
  onLegacyTopicFailure?: (error: unknown) => void;
  legacyTopicTimeoutMs?: number;
}

// The encrypted device registry behind POST /v1/devices is the authoritative
// delivery target, so it runs first and is the only step allowed to fail this
// stage. The legacy broadcast topic is a pilot-only extra: FCM's
// subscribeToTopic task stays pending until it syncs with the FCM backend,
// which on a physical device can outlast the bound below even though the
// network to the BFF is perfectly healthy. Subscribing before registering made
// that pending sync abort the registration itself, and its TimeoutError then
// surfaced as a device-registration timeout for a request that was never sent.
export async function runPushSync(deps: PushSyncDependencies): Promise<void> {
  await deps.registerDevice();

  const legacyTopic = resolveLegacyNotificationTopic(
    deps.authMode,
    deps.platform
  );
  if (!legacyTopic) {
    return;
  }

  try {
    await withTimeout(
      Promise.resolve(deps.subscribeToLegacyTopic(legacyTopic)),
      deps.legacyTopicTimeoutMs ?? legacyTopicTimeoutMs,
      "Eski bildirim konusuna abone olunamadı (zaman aşımı)."
    );
  } catch (error) {
    deps.onLegacyTopicFailure?.(error);
  }
}
