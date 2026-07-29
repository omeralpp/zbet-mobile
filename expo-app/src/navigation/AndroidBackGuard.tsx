import { useEffect, useRef } from "react";
import {
  useGlobalSearchParams,
  usePathname,
  useRouter
} from "expo-router";
import { Alert, BackHandler, Platform } from "react-native";
import {
  resolveAndroidBackAction,
  resolveAndroidFallbackPath
} from "./back-navigation";

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function AndroidBackGuard() {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{
    from?: string | string[];
  }>();
  const router = useRouter();
  const exitDialogOpen = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const action = resolveAndroidBackAction(
          pathname,
          router.canGoBack()
        );

        if (action === "delegate") {
          return false;
        }

        if (action === "back") {
          router.back();
          return true;
        }

        if (action === "home") {
          router.replace(
            resolveAndroidFallbackPath(
              pathname,
              firstParam(params.from)
            )
          );
          return true;
        }

        if (!exitDialogOpen.current) {
          exitDialogOpen.current = true;
          Alert.alert(
            "BTB Mobile’dan çıkılsın mı?",
            "Uygulamayı kapatmak istediğinize emin misiniz?",
            [
              {
                text: "Vazgeç",
                style: "cancel",
                onPress: () => {
                  exitDialogOpen.current = false;
                }
              },
              {
                text: "Çıkış",
                style: "destructive",
                onPress: () => {
                  exitDialogOpen.current = false;
                  BackHandler.exitApp();
                }
              }
            ],
            {
              cancelable: true,
              onDismiss: () => {
                exitDialogOpen.current = false;
              }
            }
          );
        }

        return true;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [params.from, pathname, router]);

  return null;
}
