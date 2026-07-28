import { useCallback, useMemo, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter
} from "expo-router";
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, {
  type WebViewNavigation
} from "react-native-webview";
import { runtimeConfig } from "@/src/config/runtime";
import {
  resolveFioriTargetUrl,
  type FioriTarget
} from "@/src/legacy/fiori-target";
import { fioriShellFocusScript } from "@/src/legacy/fiori-shell";
import { useMascotActions } from "@/src/mascot/MascotActions";
import { colors, spacing } from "@/src/theme/theme";

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function positiveInteger(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeTarget(value: string): FioriTarget {
  return value === "match" || value === "toto" ? value : "launchpad";
}

export default function FioriScreen() {
  const params = useLocalSearchParams<{
    target?: string | string[];
    matchKey?: string | string[];
    gcNo?: string | string[];
    version?: string | string[];
  }>();
  const router = useRouter();
  const { setPageActions } = useMascotActions();
  const webView = useRef<WebView>(null);
  const webCanGoBack = useRef(false);
  const target = normalizeTarget(firstParam(params.target));
  const initialUrl = useMemo(
    () =>
      resolveFioriTargetUrl(runtimeConfig.legacyLaunchpadUrl, {
        target,
        matchKey: firstParam(params.matchKey),
        gcNo: positiveInteger(firstParam(params.gcNo)),
        version: positiveInteger(firstParam(params.version))
      }),
    [params.gcNo, params.matchKey, params.version, target]
  );
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const goBack = useCallback(() => {
    if (webCanGoBack.current) {
      webView.current?.goBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }, [router]);
  const refresh = useCallback(() => {
    webView.current?.reload();
  }, []);
  const openExternal = useCallback(() => {
    Linking.openURL(currentUrl).catch(() => undefined);
  }, [currentUrl]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return;
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          goBack();
          return true;
        }
      );
      return () => subscription.remove();
    }, [goBack])
  );

  useFocusEffect(
    useCallback(() => {
      setPageActions({
        back: goBack,
        refresh,
        openExternal
      });
      return () => {
        setPageActions(null);
      };
    }, [goBack, openExternal, refresh, setPageActions])
  );

  const updateNavigation = (state: WebViewNavigation) => {
    webCanGoBack.current = state.canGoBack;
    setCurrentUrl(state.url);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.webContainer}>
        {progress < 1 ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progress,
                {
                  width: `${
                    Math.max(0, Math.min(progress, 1)) * 100
                  }%`
                }
              ]}
            />
          </View>
        ) : null}
        <WebView
          allowsBackForwardNavigationGestures
          domStorageEnabled
          injectedJavaScript={fioriShellFocusScript}
          injectedJavaScriptBeforeContentLoaded={fioriShellFocusScript}
          javaScriptEnabled
          mixedContentMode="never"
          onError={(event) => {
            setError(event.nativeEvent.description || "Fiori yüklenemedi.");
          }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 400) {
              setError(`Fiori HTTP ${event.nativeEvent.statusCode} hatası.`);
            }
          }}
          onLoadProgress={(event) => {
            setProgress(event.nativeEvent.progress);
          }}
          onLoadStart={() => {
            setError(null);
            setProgress(0.04);
          }}
          onLoadEnd={() => {
            setProgress(1);
            webView.current?.injectJavaScript(fioriShellFocusScript);
          }}
          onNavigationStateChange={updateNavigation}
          onShouldStartLoadWithRequest={(request) => {
            if (
              request.url === "about:blank" ||
              request.url.startsWith("https://")
            ) {
              return true;
            }
            Linking.openURL(request.url).catch(() => undefined);
            return false;
          }}
          originWhitelist={["https://*"]}
          ref={webView}
          setSupportMultipleWindows={false}
          sharedCookiesEnabled
          source={{ uri: initialUrl }}
          thirdPartyCookiesEnabled
        />

        {error ? (
          <View style={styles.errorOverlay}>
            <MaterialCommunityIcons
              color={colors.red}
              name="cloud-alert-outline"
              size={42}
            />
            <Text style={styles.errorTitle}>Fiori sayfası açılamadı</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Pressable
              onPress={() => {
                setError(null);
                webView.current?.reload();
              }}
              style={styles.retry}
            >
              <Text style={styles.retryText}>Yeniden dene</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  progressTrack: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 3,
    backgroundColor: colors.surfaceStrong,
    zIndex: 3,
    elevation: 3
  },
  progress: {
    height: "100%",
    backgroundColor: colors.green
  },
  webContainer: {
    flex: 1,
    backgroundColor: colors.backgroundElevated
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xxl
  },
  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: spacing.lg
  },
  errorMessage: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing.sm
  },
  retry: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.blue
  },
  retryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  }
});
