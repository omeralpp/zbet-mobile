import type { useRouter } from "expo-router";

/**
 * Web twin of the native push runtime. v1 of the web client has no push: the
 * site stays current by polling, and the phone keeps its FCM notifications.
 */
export function useNotificationRuntime(_router: ReturnType<typeof useRouter>): void {
  // Intentionally empty.
}
