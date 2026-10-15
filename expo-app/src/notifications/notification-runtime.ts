import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import type { useRouter } from "expo-router";
import {
  ensureBackgroundNotificationTask,
  syncWidgetsAfterNotification
} from "./background";
import { notificationDataToPath } from "./routing";
import {
  ensureNotificationChannels,
  restorePushRegistration,
  syncPushToken
} from "./register";
import { refreshPerformanceWidgetFromApi } from "@/src/widgets/performance-widget";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

/**
 * Native push runtime: channels, background task, token sync, widget refresh
 * and tap routing. The web build has its own no-op twin
 * (notification-runtime.web.ts) because v1 of the web client has no push.
 */
export function useNotificationRuntime(router: ReturnType<typeof useRouter>): void {
  useEffect(() => {
    Promise.all([
      ensureNotificationChannels(),
      ensureBackgroundNotificationTask(),
      restorePushRegistration(),
      refreshPerformanceWidgetFromApi()
    ]).catch((error: unknown) => {
      console.warn("Bildirim çalışma zamanı hazırlanamadı.", error);
    });

    const receivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data ?? {};
        if (data.btb_local_presentation === "1") {
          return;
        }

        syncWidgetsAfterNotification(data).catch((error: unknown) => {
          console.warn("Foreground widget güncellemesi tamamlanamadı.", error);
        });
      });
    const pushTokenSubscription = Notifications.addPushTokenListener((token) => {
      syncPushToken(String(token.data)).catch((error: unknown) => {
        console.warn("Bildirim tokenı sunucuya güncellenemedi.", error);
      });
    });

    const navigateFromResponse = (
      response: Notifications.NotificationResponse | null
    ) => {
      if (!response) {
        return;
      }
      const data = response.notification.request.content.data ?? {};
      router.push(notificationDataToPath(data) as never);
    };

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        navigateFromResponse
      );

    Notifications.getLastNotificationResponseAsync()
      .then(navigateFromResponse)
      .catch((error: unknown) => {
        console.warn("Son bildirim yönlendirmesi okunamadı.", error);
      });

    return () => {
      receivedSubscription.remove();
      pushTokenSubscription.remove();
      responseSubscription.remove();
    };
  }, [router]);
}
