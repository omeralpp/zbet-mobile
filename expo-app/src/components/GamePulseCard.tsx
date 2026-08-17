import { memo, useCallback, useMemo, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import WebView from "react-native-webview";
import {
  buildGamePulseUrl,
  isAllowedGamePulseUrl
} from "@/src/external/bilyoner";
import { ModuleHeading } from "@/src/components/ModuleHeading";
import {
  defaultPulseHeight,
  parsePulseHeightMessage,
  pulseHeightProbe,
  resolvePulseHeight
} from "@/src/components/game-pulse-sizing";
import { colors, radii, spacing } from "@/src/theme/theme";

/**
 * Heading plus card shell shared by every state of this module.
 *
 * The provider panel inside it is a self-sizing third-party widget behind an
 * obfuscating script loader, so it reports its own content height and the
 * viewport follows it. Until a measurement arrives the previous fixed height is
 * used, so a frame that never reports renders exactly as it did before. The
 * sizing rules live in `game-pulse-sizing`.
 */
function PulseFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ModuleHeading eyebrow="MAÇIN NABZI" title="Canlı tempo" />
      <View style={styles.card}>{children}</View>
    </>
  );
}

function GamePulseCardComponent({
  betRadarId
}: {
  betRadarId?: string | null | undefined;
}) {
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(defaultPulseHeight);
  const webView = useRef<WebView>(null);
  const url = useMemo(() => buildGamePulseUrl(betRadarId), [betRadarId]);
  // The source identity depends only on the event id and the retry counter, so
  // routine live-data refetches never remount or reload the player.
  const source = useMemo(
    () => (url ? { uri: url } : undefined),
    [url]
  );

  // Height messages come from a third-party frame, so an unparseable payload
  // leaves the current height untouched rather than resizing the card.
  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    const reported = parsePulseHeightMessage(event.nativeEvent.data);
    if (reported === null) {
      return;
    }
    const next = resolvePulseHeight(reported);
    setViewportHeight((current) => (current === next ? current : next));
  }, []);

  if (!source) {
    return (
      <PulseFrame>
        <View style={styles.state}>
          <MaterialCommunityIcons
            color={colors.textSubtle}
            name="pulse"
            size={30}
          />
          <Text style={styles.stateTitle}>Canlı tempo yayını yok</Text>
          <Text style={styles.stateBody}>
            Bu maç için sağlayıcı etkinlik kimliği gelmedi. Diğer analiz
            modülleri çalışmaya devam eder.
          </Text>
        </View>
      </PulseFrame>
    );
  }

  return (
    <PulseFrame>
      <View style={[styles.viewport, { height: viewportHeight }]}>
        <WebView
          allowsInlineMediaPlayback
          domStorageEnabled
          javaScriptEnabled
          key={attempt}
          mediaPlaybackRequiresUserAction
          mixedContentMode="never"
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 400) {
              setLoading(false);
              setFailed(true);
            }
          }}
          onLoadEnd={() => setLoading(false)}
          // The provider widget loads sub-resources, so this fires more than
          // once per view. Retry state is owned by `attempt`, which remounts
          // the WebView, so this only has to clear a previous failure.
          onLoadStart={() => setFailed(false)}
          onMessage={handleMessage}
          injectedJavaScript={pulseHeightProbe}
          // Anything outside the trusted Bilyoner origin is refused rather than
          // opened, so the module can never become a general browser.
          onShouldStartLoadWithRequest={(request) =>
            isAllowedGamePulseUrl(request.url)
          }
          originWhitelist={["https://content.bilyoner.com"]}
          ref={webView}
          scrollEnabled={false}
          setSupportMultipleWindows={false}
          // No BTB session, pilot key or SAP credential is shared with the
          // provider frame.
          sharedCookiesEnabled={false}
          source={source}
          style={styles.webView}
          thirdPartyCookiesEnabled={false}
        />
        {loading && !failed ? (
          <View pointerEvents="none" style={styles.overlay}>
            <ActivityIndicator color={colors.green} />
            <Text style={styles.stateBody}>Canlı tempo yükleniyor…</Text>
          </View>
        ) : null}
        {failed ? (
          <View style={styles.overlay}>
            <MaterialCommunityIcons
              color={colors.red}
              name="cloud-alert-outline"
              size={30}
            />
            <Text style={styles.stateTitle}>Canlı tempo yüklenemedi</Text>
            <Text style={styles.stateBody}>
              Sağlayıcı görünümü şu anda açılamıyor. Maç detayının geri kalanı
              etkilenmez.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setFailed(false);
                setLoading(true);
                setAttempt((value) => value + 1);
              }}
              style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>Yeniden dene</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      <Text style={styles.source}>Kaynak: Bilyoner canlı anlatım</Text>
    </PulseFrame>
  );
}

export const GamePulseCard = memo(GamePulseCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden"
  },
  // Height is supplied at render time from the frame's own measurement. The
  // light surface is the provider's, which keeps a short pre-match panel from
  // leaving a dark hole inside the card.
  viewport: {
    backgroundColor: colors.white,
    width: "100%"
  },
  webView: {
    backgroundColor: colors.white,
    flex: 1
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.xl
  },
  state: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    // The empty state is a short message; it never needed the tall provider box.
    paddingVertical: spacing.lg
  },
  stateTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  stateBody: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center"
  },
  retry: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: radii.round,
    justifyContent: "center",
    marginTop: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.xl
  },
  pressed: {
    opacity: 0.75
  },
  retryText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "900"
  },
  source: {
    color: colors.textSubtle,
    fontSize: 9,
    marginTop: spacing.sm,
    textAlign: "right"
  }
});
