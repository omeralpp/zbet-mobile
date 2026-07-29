import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { extractRemoteNotificationData } from "./background-data";
import { notificationChannels } from "./register";
import { updateWidgetsFromData } from "@/src/widgets/btb-widget";
import { hasPerformanceWidgetData } from "@/src/widgets/performance-widget-data";
import { refreshPerformanceWidgetFromApi } from "@/src/widgets/performance-widget";
import type { WidgetInputData } from "@/src/widgets/widget-payload";

export const backgroundNotificationTask =
  "BTB_BACKGROUND_NOTIFICATION_V1";
const localPresentationMarker = "btb_local_presentation";

function presentableData(data: WidgetInputData): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) =>
      ["string", "number", "boolean"].includes(typeof value)
    )
  );
}

async function presentAndroidNotification(
  data: WidgetInputData
): Promise<boolean> {
  if (
    Platform.OS !== "android" ||
    data[localPresentationMarker] === "1"
  ) {
    return false;
  }

  const title = String(data.notification_title ?? data.title ?? "").trim();
  const body = String(
    data.notification_body ?? data.body ?? data.widget_body ?? ""
  ).trim();
  if (!title && !body) {
    return false;
  }

  const rating = Number.parseInt(String(data.rating ?? ""), 10);
  const isSuper = rating >= 1 && rating <= 5;
  const channelId = String(
    data.notification_android_channel_id ??
      (isSuper ? notificationChannels.super : notificationChannels.general)
  );
  const sound = String(
    data.notification_android_sound ??
      (isSuper ? "btb_super_goal.wav" : "btb_referee_whistle.wav")
  );

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title || "BTB Mobile",
      body,
      data: {
        ...presentableData(data),
        [localPresentationMarker]: "1"
      },
      sound
    },
    trigger: { channelId }
  });
  return true;
}

export async function syncWidgetsAfterNotification(
  data: WidgetInputData
): Promise<boolean> {
  const notificationUpdated = await updateWidgetsFromData(data);
  if (hasPerformanceWidgetData(data)) {
    return notificationUpdated;
  }

  try {
    const performanceUpdated = await refreshPerformanceWidgetFromApi();
    return notificationUpdated || performanceUpdated;
  } catch (error: unknown) {
    console.warn(
      "Performans widgetı canlı özetle yenilenemedi.",
      error
    );
    return notificationUpdated;
  }
}

if (!TaskManager.isTaskDefined(backgroundNotificationTask)) {
  TaskManager.defineTask<Notifications.NotificationTaskPayload>(
    backgroundNotificationTask,
    async ({ data, error }) => {
      if (error) {
        return Notifications.BackgroundNotificationTaskResult.Failed;
      }

      const remoteData = extractRemoteNotificationData(data);
      if (!remoteData) {
        return Notifications.BackgroundNotificationTaskResult.NoData;
      }

      try {
        const [widgetUpdated, notificationPresented] = await Promise.all([
          syncWidgetsAfterNotification(remoteData),
          presentAndroidNotification(remoteData)
        ]);
        return widgetUpdated || notificationPresented
          ? Notifications.BackgroundNotificationTaskResult.NewData
          : Notifications.BackgroundNotificationTaskResult.NoData;
      } catch (taskError: unknown) {
        console.warn("Arka plan BTB bildirimi işlenemedi.", taskError);
        return Notifications.BackgroundNotificationTaskResult.Failed;
      }
    }
  );
}

export async function ensureBackgroundNotificationTask(): Promise<void> {
  const registered = await TaskManager.isTaskRegisteredAsync(
    backgroundNotificationTask
  );
  if (!registered) {
    await Notifications.registerTaskAsync(backgroundNotificationTask);
  }
}
