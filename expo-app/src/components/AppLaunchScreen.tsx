import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { btbBrandMark } from "@/src/theme/brand-mark";
import { colors, radii, spacing, themeMode } from "@/src/theme/theme";

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
  const insets = useSafeAreaInsets();
  const [progress] = useState(() => new Animated.Value(0.08));
  const [ballY] = useState(() => new Animated.Value(-260));
  const [ballOpacity] = useState(() => new Animated.Value(1));
  const [ballScale] = useState(() => new Animated.Value(1));
  const [ballRotation] = useState(() => new Animated.Value(0));
  const [minimumDisplayElapsed, setMinimumDisplayElapsed] =
    useState(false);

  useEffect(() => {
    const landing = Animated.sequence([
      Animated.parallel([
        Animated.timing(ballY, {
          toValue: 86,
          duration: 720,
          easing: Easing.bezier(0.2, 0.72, 0.25, 1),
          useNativeDriver: true
        }),
        Animated.timing(ballRotation, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]),
      Animated.spring(ballY, {
        toValue: 82,
        damping: 11,
        stiffness: 240,
        mass: 0.55,
        useNativeDriver: true
      }),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(ballOpacity, {
          toValue: 0,
          duration: 170,
          useNativeDriver: true
        }),
        Animated.timing(ballScale, {
          toValue: 0.55,
          duration: 170,
          useNativeDriver: true
        })
      ])
    ]);
    landing.start();
    return () => landing.stop();
  }, [ballOpacity, ballRotation, ballScale, ballY]);

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
  const ballRotate = ballRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["-80deg", "420deg"]
  });

  return (
    <LinearGradient
      colors={
        themeMode === "light"
          ? [colors.background, colors.backgroundElevated, colors.surfaceStrong]
          : ["#020915", colors.background, "#061D31"]
      }
      locations={[0, 0.56, 1]}
      onLayout={onLayout}
      style={styles.container}
    >
      <View style={styles.glow} />
      <View style={styles.content}>
        <View style={styles.logoStage}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={btbBrandMark}
            style={styles.logo}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ball,
              {
                opacity: ballOpacity,
                transform: [
                  { translateY: ballY },
                  { rotate: ballRotate },
                  { scale: ballScale }
                ]
              }
            ]}
          >
            <MaterialCommunityIcons
              color={colors.white}
              name="soccer"
              size={30}
            />
          </Animated.View>
        </View>
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
      <Text
        style={[
          styles.footer,
          { bottom: Math.max(insets.bottom, spacing.lg) + spacing.md }
        ]}
      >
        Canlı analiz • Super • Toto
      </Text>
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
    height: 132
  },
  logoStage: {
    width: 132,
    height: 132
  },
  ball: {
    position: "absolute",
    left: 51,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.backgroundElevated,
    shadowColor: colors.blue,
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8
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
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2
  }
});
