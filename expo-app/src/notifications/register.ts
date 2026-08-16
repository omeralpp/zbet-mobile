import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { mobileApi } from "@/src/api";
import { runtimeConfig } from "@/src/config/runtime";
import { resolveLegacyNotificationTopic } from "./registration-policy";
import {
  legacyTopicTimeoutMs,
  permissionCheckTimeoutMs,
  pushTokenTimeoutMs,
  withTimeout
} from "./async-timeout";
import {
  createRegistrationController,
  type RegistrationSnapshot,
  type StageResult
} from "./registration-machine";

export const notificationChannels = {
  super: "btb_super_goal_v1",
  general: "btb_general_whistle_v1"
} as const;
const installationKey = "btb.mobile.installation-id";

async function getDevicePushTokenBounded(): Promise<string> {
  const deviceToken = await withTimeout(
    Notifications.getDevicePushTokenAsync(),
    pushTokenTimeoutMs,
    "Push token alınamadı (zaman aşımı)."
  );
  return String(deviceToken.data);
}

export async function getInstallationId(): Promise<string> {
  const stored = await SecureStore.getItemAsync(installationKey);
  if (stored && /^[A-Za-z0-9._:-]{16,128}$/.test(stored)) {
    return stored;
  }
  const installationId = Crypto.randomUUID();
  await SecureStore.setItemAsync(installationKey, installationId, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
  return installationId;
}

export async function syncPushToken(token: string): Promise<void> {
  const platform = Platform.OS === "ios" ? "ios" : "android";
  const legacyTopic = resolveLegacyNotificationTopic(
    runtimeConfig.authMode,
    platform
  );
  if (legacyTopic) {
    await withTimeout(
      Notifications.subscribeToTopicAsync(legacyTopic),
      legacyTopicTimeoutMs,
      "Eski bildirim konusuna abone olunamadı (zaman aşımı)."
    );
  }
  await mobileApi.registerDevice(
    token,
    platform,
    runtimeConfig.authMode === "oauth" ? await getInstallationId() : undefined
  );
}

export async function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Promise.all([
    Notifications.setNotificationChannelAsync(notificationChannels.super, {
      name: "BTB Super Kupon",
      description: "Super kupon gol ve stadyum bildirimleri",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "btb_super_goal.wav",
      vibrationPattern: [0, 180, 90, 180],
      lightColor: "#1597E5"
    }),
    Notifications.setNotificationChannelAsync(notificationChannels.general, {
      name: "BTB Genel",
      description: "Toto, oran ve diğer BTB bildirimleri",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "btb_referee_whistle.wav",
      vibrationPattern: [0, 140],
      lightColor: "#62E66D"
    })
  ]);
}

// Single authoritative owner of the manual/passive/token-rotation
// registration transaction — every caller below goes through this one
// controller so stale async results can never overwrite newer state.
const registrationController = createRegistrationController({
  ensureChannels: ensureNotificationChannels,
  checkPermission: async () =>
    (await Notifications.getPermissionsAsync()).status === "granted",
  requestPermission: async () =>
    (await Notifications.requestPermissionsAsync()).status === "granted",
  getPushToken: async () =>
    String((await Notifications.getDevicePushTokenAsync()).data),
  registerDevice: syncPushToken
});

export function useRegistrationState(): RegistrationSnapshot {
  return useSyncExternalStore(
    registrationController.subscribe,
    registrationController.getSnapshot
  );
}

export function isPushRegistrationActive(): boolean {
  return registrationController.isActive();
}

// Manual registration always takes precedence: starting a fresh
// transaction here immediately supersedes whatever was previously running
// (including a still-in-flight restorePushRegistration or a prior tap),
// regardless of what triggered it.
export function registerPushDevice(): Promise<StageResult> {
  return registrationController.start();
}

export async function restorePushRegistration(): Promise<void> {
  if (registrationController.isActive()) {
    return;
  }

  const permission = await withTimeout(
    Notifications.getPermissionsAsync(),
    permissionCheckTimeoutMs,
    "Bildirim izni kontrol edilemedi (zaman aşımı)."
  );
  if (permission.status !== "granted") {
    return;
  }

  const token = await getDevicePushTokenBounded();
  await syncPushToken(token);
}

export async function unregisterPushDevice(): Promise<void> {
  const installationId = await getInstallationId();
  await mobileApi.unregisterDevice(installationId);
}
