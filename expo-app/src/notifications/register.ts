import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { mobileApi } from "@/src/api";
import { runtimeConfig } from "@/src/config/runtime";

export const notificationChannels = {
  super: "btb_super_goal_v1",
  general: "btb_general_whistle_v1"
} as const;
const installationKey = "btb.mobile.installation-id";

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

export async function registerPushDevice(): Promise<string> {
  await ensureNotificationChannels();

  const current = await Notifications.getPermissionsAsync();
  const permission =
    current.status === "granted"
      ? current
      : await Notifications.requestPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error("Bildirim izni verilmedi.");
  }

  const deviceToken = await Notifications.getDevicePushTokenAsync();
  const token = String(deviceToken.data);
  await syncPushToken(token);
  return token;
}

export async function restorePushRegistration(): Promise<void> {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") {
    return;
  }

  const deviceToken = await Notifications.getDevicePushTokenAsync();
  const token = String(deviceToken.data);
  await syncPushToken(token);
}

export async function unregisterPushDevice(): Promise<void> {
  const installationId = await getInstallationId();
  await mobileApi.unregisterDevice(installationId);
}
