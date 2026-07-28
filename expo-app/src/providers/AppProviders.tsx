import { useEffect, useState, type PropsWithChildren } from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager
} from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { ensureBackgroundNotificationTask } from "@/src/notifications/background";
import { notificationDataToPath } from "@/src/notifications/routing";
import {
  ensureNotificationChannels,
  restorePushRegistration
} from "@/src/notifications/register";
import { updateWidgetsFromData } from "@/src/widgets/btb-widget";
import { AuthProvider } from "@/src/auth/AuthProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            gcTime: 15 * 60 * 1000,
            refetchOnReconnect: true
          }
        }
      })
  );
  const router = useRouter();

  useEffect(() => {
    onlineManager.setEventListener((setOnline) =>
      NetInfo.addEventListener((state) => {
        setOnline(Boolean(state.isConnected));
      })
    );

    const appStateSubscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        if (Platform.OS !== "web") {
          focusManager.setFocused(status === "active");
        }
      }
    );

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    Promise.all([
      ensureNotificationChannels(),
      ensureBackgroundNotificationTask(),
      restorePushRegistration()
    ]).catch((error: unknown) => {
      console.warn("Bildirim çalışma zamanı hazırlanamadı.", error);
    });

    const receivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data ?? {};
        if (data.btb_local_presentation === "1") {
          return;
        }

        updateWidgetsFromData(data).catch((error: unknown) => {
          console.warn("Foreground widget güncellemesi tamamlanamadı.", error);
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
      responseSubscription.remove();
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
