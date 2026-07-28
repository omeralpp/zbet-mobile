import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { mobileApi } from "@/src/api";

export const notificationChannels = {
  super: "btb_super_goal_v1",
  general: "btb_general_whistle_v1"
} as const;
export const notificationTopic = "BTB";

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
  const platform = Platform.OS === "ios" ? "ios" : "android";
  if (Platform.OS === "android") {
    await Notifications.subscribeToTopicAsync(notificationTopic);
  }
  await mobileApi.registerDevice(token, platform);
  return token;
}

export async function restorePushRegistration(): Promise<void> {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") {
    return;
  }

  const deviceToken = await Notifications.getDevicePushTokenAsync();
  const token = String(deviceToken.data);
  const platform = Platform.OS === "ios" ? "ios" : "android";
  if (Platform.OS === "android") {
    await Notifications.subscribeToTopicAsync(notificationTopic);
  }
  await mobileApi.registerDevice(token, platform);
}
