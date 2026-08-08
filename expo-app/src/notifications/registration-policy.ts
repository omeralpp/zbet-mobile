export type NotificationAuthMode = "preview" | "pilot" | "oauth";
export type NotificationPlatform = "android" | "ios";

export const legacyNotificationTopic = "BTB";

export function resolveLegacyNotificationTopic(
  authMode: NotificationAuthMode,
  platform: NotificationPlatform
): string {
  return authMode === "pilot" && platform === "android"
    ? legacyNotificationTopic
    : "";
}
