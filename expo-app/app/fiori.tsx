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
import {
  isAllowedSapWebUrl,
  parseSapWebAllowedHosts
} from "@/src/legacy/sap-web-boundary";
import { useMascotActions } from "@/src/mascot/MascotActions";
import {
  colors,
  iconSizes,
  interaction,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function positiveInteger(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeTarget(value: string): FioriTarget {
  return value === "match" || value === "super" || value === "toto"
    ? value
    : "launchpad";
}

export default function FioriScreen() {
  const params = useLocalSearchParams<{
    target?: string | string[];
    matchKey?: string | string[];
    gcNo?: string | string[];
    version?: string | string[];
    matchDate?: string | string[];
    matchId?: string | string[];
    elapsed?: string | string[];
    selectedOdd?: string | string[];
    rating?: string | string[];
    reason?: string | string[];
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
        version: positiveInteger(firstParam(params.version)),
        superKey: {
          matchDate: firstParam(params.matchDate),
          matchId: positiveInteger(firstParam(params.matchId)),
          elapsed: Number(firstParam(params.elapsed)) || 0,
          selectedOdd: firstParam(params.selectedOdd),
          rating: positiveInteger(firstParam(params.rating)),
          reason: firstParam(params.reason)
        }
      }),
    [
      params.elapsed,
      params.gcNo,
      params.matchDate,
      params.matchId,
      params.matchKey,
      params.rating,
      params.reason,
      params.selectedOdd,
      params.version,
      target
    ]
  );
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [blockedUrl, setBlockedUrl] = useState("");
  const allowedHosts = useMemo(
    () => parseSapWebAllowedHosts(runtimeConfig.sapWebAllowedHosts),
    []
  );

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
    Linking.openURL(blockedUrl || currentUrl).catch(() => undefined);
  }, [blockedUrl, currentUrl]);

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
        <View pointerEvents="none" style={styles.optionalBadge}>
          <Text style={styles.optionalBadgeText}>
            {error ? "BTB WEB • KULLANILAMIYOR" : "BTB WEB"}
          </Text>
        </View>
        <WebView
          allowsBackForwardNavigationGestures
          domStorageEnabled
          injectedJavaScript={fioriShellFocusScript}
          injectedJavaScriptBeforeContentLoaded={fioriShellFocusScript}
          javaScriptEnabled
          mixedContentMode="never"
          onError={() => {
            setError("BTB Web bağlantısı şu anda kurulamadı.");
          }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 400) {
              setError("BTB Web bağlantısı şu anda kurulamadı.");
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
            if (isAllowedSapWebUrl(request.url, allowedHosts)) {
              return true;
            }
            if (request.url.startsWith("https://")) {
              setBlockedUrl(request.url);
              setError(
                "Bu bağlantı güvenli BTB Web alanının dışında kaldığı için açılmadı."
              );
              return false;
            }
            if (/^(?:mailto|tel):/i.test(request.url)) {
              Linking.openURL(request.url).catch(() => undefined);
              return false;
            }
            setError(
              "Bu bağlantı BTB Web tarafından desteklenmiyor."
            );
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
              color={semantic.negative}
              name="cloud-alert-outline"
              size={iconSizes.hero}
            />
            <Text style={styles.errorTitle}>BTB Web açılamadı</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Text style={styles.optionalMessage}>
              Bu web görünümü isteğe bağlıdır; BTB Mobile, Super, Toto,
              bildirimler ve widget&apos;lar çalışmaya devam eder.
            </Text>
            <Pressable
              accessibilityHint="BTB Web sayfasını yeniden yükler"
              accessibilityRole="button"
              onPress={() => {
                setError(null);
                webView.current?.reload();
              }}
              style={styles.retry}
            >
              <Text style={styles.retryText}>Yeniden dene</Text>
            </Pressable>
            <Pressable
              accessibilityHint="BTB Web sayfasını sistem tarayıcısında açar"
              accessibilityRole="button"
              onPress={openExternal}
              style={styles.external}
            >
              <Text style={styles.retryText}>Sistem tarayıcısında aç</Text>
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
    backgroundColor: semantic.intelligence
  },
  optionalBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 4,
    elevation: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong
  },
  optionalBadgeText: {
    color: colors.textMuted,
    ...typeScale.micro
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
    ...typeScale.moduleTitle,
    marginTop: spacing.lg
  },
  errorMessage: {
    color: colors.textMuted,
    ...typeScale.body,
    textAlign: "center",
    marginTop: spacing.sm
  },
  optionalMessage: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    textAlign: "center",
    marginTop: spacing.md
  },
  retry: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    minHeight: interaction.minTouchTarget,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.round,
    backgroundColor: semantic.intelligence
  },
  retryText: {
    color: colors.white,
    ...typeScale.label
  },
  external: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    minHeight: interaction.minTouchTarget,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong
  }
});
