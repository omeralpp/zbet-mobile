import type { RegistrationSnapshot, StageResult } from "./registration-machine";

/**
 * Web twin of native push registration. v1 of the web client registers no
 * device: the BFF's device routes are refused to the web identity, and the
 * settings screen hides the notification controls on web.
 */
export const notificationChannels = {
  super: "btb_super_goal_v1",
  general: "btb_general_whistle_v1"
} as const;

const unsupported = "Web sürümünde bildirim yok; bildirimler telefondaki uygulamadan gelir.";
const idle: RegistrationSnapshot = { stage: "idle" };

export async function getInstallationId(): Promise<string> {
  throw new Error(unsupported);
}

export async function syncPushToken(_token: string): Promise<void> {
  // No device registration on web.
}

export async function ensureNotificationChannels(): Promise<void> {
  // No notification channels on web.
}

export function useRegistrationState(): RegistrationSnapshot {
  return idle;
}

export function isPushRegistrationActive(): boolean {
  return false;
}

export async function registerPushDevice(): Promise<StageResult> {
  return { ok: false, code: "REGISTRATION_UNKNOWN_ERROR", message: unsupported };
}

export async function restorePushRegistration(): Promise<void> {
  // Nothing to restore on web.
}

export async function unregisterPushDevice(): Promise<void> {
  // Nothing to unregister on web.
}
