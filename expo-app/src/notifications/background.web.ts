import type { WidgetInputData } from "@/src/widgets/widget-payload";

/**
 * Web twin of the native background notification task. A browser has no
 * headless FCM task and no home-screen widget, so nothing is registered.
 */
export const backgroundNotificationTask = "BTB_BACKGROUND_NOTIFICATION_V1";

export async function syncWidgetsAfterNotification(
  _data: WidgetInputData
): Promise<boolean> {
  return false;
}

export async function ensureBackgroundNotificationTask(): Promise<void> {
  // No background task on web.
}
