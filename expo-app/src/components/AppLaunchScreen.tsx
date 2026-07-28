import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent
} from "react-native";
import { colors, radii, spacing } from "@/src/theme/theme";

type AppLaunchScreenProps = {
  ready: boolean;
  onComplete(): void;
  onLayout(event: LayoutChangeEvent): void;
};

const minimumDisplayDurationMs = 1250;

export function AppLaunchScreen({
  ready,
  onComplete,
  onLayout
}: AppLaunchScreenProps) {
  const [progress] = useState(() => new Animated.Value(0.08));
  const [minimumDisplayElapsed, setMinimumDisplayElapsed] =
    useState(false);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 0.84,
      duration: minimumDisplayDurationMs,
      useNativeDriver: false
    });

    animation.start(({ finished }) => {
      if (finished) {
        setMinimumDisplayElapsed(true);
      }
    });

    return () => {
      animation.stop();
    };
  }, [progress]);

  useEffect(() => {
    if (!minimumDisplayElapsed || !ready) {
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 320,
      useNativeDriver: false
    });

    animation.start(({ finished }) => {
      if (finished) {
        onComplete();
      }
    });

    return () => {
      animation.stop();
    };
  }, [minimumDisplayElapsed, onComplete, progress, ready]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <LinearGradient
      colors={["#020915", colors.background, "#061D31"]}
      locations={[0, 0.56, 1]}
      onLayout={onLayout}
      style={styles.container}
    >
      <View style={styles.glow} />
      <View style={styles.content}>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={require("../../assets/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.brand}>BTB MOBILE</Text>
        <Text style={styles.tagline}>BETTER THAN BET</Text>

        <View style={styles.statusArea}>
          <View
            accessibilityLabel="Uygulama yükleme durumu"
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              text: ready ? "Tamamlandı" : "Yükleniyor"
            }}
            style={styles.track}
          >
            <Animated.View
              style={[styles.progressClip, { width: progressWidth }]}
            >
              <LinearGradient
                colors={[colors.blue, colors.green]}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={styles.progressFill}
              />
            </Animated.View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.status}>
              {ready ? "BTB hazır" : "Güvenli oturum hazırlanıyor"}
            </Text>
            <Text style={styles.statusMark}>{ready ? "100%" : "•••"}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.footer}>Canlı analiz • Super • Toto</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl
  },
  glow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.blueSoft,
    opacity: 0.18
  },
  content: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center"
  },
  logo: {
    width: 132,
    height: 132,
    borderRadius: 30
  },
  brand: {
    marginTop: spacing.xl,
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 3.2
  },
  tagline: {
    marginTop: spacing.sm,
    color: colors.green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3.6
  },
  statusArea: {
    width: "100%",
    marginTop: 54
  },
  track: {
    height: 7,
    overflow: "hidden",
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border
  },
  progressClip: {
    height: "100%",
    overflow: "hidden",
    borderRadius: radii.round
  },
  progressFill: {
    width: "100%",
    height: "100%"
  },
  statusRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  status: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  statusMark: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1
  },
  footer: {
    position: "absolute",
    bottom: 42,
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2
  }
});
