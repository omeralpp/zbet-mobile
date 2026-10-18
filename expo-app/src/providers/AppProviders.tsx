import { useEffect, useState, type PropsWithChildren } from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { useNotificationRuntime } from "@/src/notifications/notification-runtime";
import { refreshPerformanceWidgetFromApi } from "@/src/widgets/performance-widget";
import { AuthProvider } from "@/src/auth/AuthProvider";
import { LiveStarFilterProvider } from "@/src/preferences/LiveStarFilterProvider";
import { SuperStarFilterProvider } from "@/src/preferences/SuperStarFilterProvider";
import { JinxPreferencesProvider } from "@/src/mascot/JinxPreferencesProvider";

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
          if (status === "active") {
            refreshPerformanceWidgetFromApi().catch((error: unknown) => {
              console.warn(
                "Performans widgetı uygulama dönüşünde yenilenemedi.",
                error
              );
            });
          }
        }
      }
    );

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  useNotificationRuntime(router);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LiveStarFilterProvider>
          <SuperStarFilterProvider><JinxPreferencesProvider>{children}</JinxPreferencesProvider></SuperStarFilterProvider>
        </LiveStarFilterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
