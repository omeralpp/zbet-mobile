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
import {
  colors,
  iconSizes,
  spacing,
  themeMode,
  textFont
} from "@/src/theme/theme";

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
      <View style={styles.content}>
        <View style={styles.logoStage}>
          {/* The centre circle and halfway line, centred on the mark: the
              pitch the product reads. */}
          <View pointerEvents="none" style={styles.halfway} />
          <View pointerEvents="none" style={styles.ring} />
          <View pointerEvents="none" style={styles.centreSpot} />
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
              color={colors.onAction}
              name="soccer"
              size={iconSizes.state}
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
            />
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.status}>
              {ready ? "BTB hazır" : "Güvenli oturum hazırlanıyor"}
            </Text>
            {ready ? (
              <Text style={styles.statusMark}>100%</Text>
            ) : (
              <View accessibilityElementsHidden style={styles.dots}>
                <View style={styles.dot} />
                <View style={[styles.dot, styles.dotMid]} />
                <View style={[styles.dot, styles.dotLow]} />
              </View>
            )}
          </View>
        </View>
      </View>
      <Text
        style={[
          styles.footer,
          { bottom: Math.max(insets.bottom, spacing.lg) + spacing.md }
        ]}
      >
        Canlı analiz · Super · Toto
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
  // Centred on the 176pt mark; the line runs past both screen edges.
  halfway: {
    position: "absolute",
    left: -2000,
    right: -2000,
    top: 88,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.45
  },
  ring: {
    position: "absolute",
    left: -62,
    top: -62,
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.45
  },
  centreSpot: {
    position: "absolute",
    left: 84,
    top: 84,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    opacity: 0.7
  },
  content: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center"
  },
  logo: {
    width: 176,
    height: 176
  },
  logoStage: {
    width: 176,
    height: 176
  },
  ball: {
    position: "absolute",
    left: 73,
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
    ...textFont("800"),
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: 6
  },
  tagline: {
    ...textFont("800"),
    marginTop: 6,
    color: colors.actionFill,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 3.6
  },
  statusArea: {
    width: 260,
    marginTop: 56
  },
  track: {
    height: 6,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: colors.surfaceStrong
  },
  progressClip: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.actionFill
  },
  dots: {
    flexDirection: "row",
    gap: 4
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.actionFill
  },
  dotMid: {
    opacity: 0.6
  },
  dotLow: {
    opacity: 0.3
  },
  statusRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  status: {
    ...textFont("500"),
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  statusMark: {
    ...textFont("800"),
    color: colors.actionFill,
    fontSize: 12,
    letterSpacing: 1
  },
  footer: {
    ...textFont("700"),
    position: "absolute",
    color: colors.textMuted,
    fontSize: 13
  }
});
