import { useEffect, useRef, useState } from "react";
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
import { useReducedMotionPreference } from "@/src/theme/use-reduced-motion";
import { createLaunchCompletion, launchBrandHoldMs, launchIntroDuration } from "./launch-policy";
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

export function AppLaunchScreen({
  ready,
  onComplete,
  onLayout
}: AppLaunchScreenProps) {
  const insets = useSafeAreaInsets();
  const { ready: motionKnown, reduceMotion } = useReducedMotionPreference();
  const [startedAt] = useState(Date.now);
  const [completion] = useState(createLaunchCompletion);
  const introStarted = useRef(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [brandHeld, setBrandHeld] = useState(false);
  const [showBall, setShowBall] = useState(false);
  const [ballY] = useState(() => new Animated.Value(-260));
  const [ballOpacity] = useState(() => new Animated.Value(0));
  const [ballScale] = useState(() => new Animated.Value(1));
  const [ballRotation] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const duration = launchIntroDuration({ layoutReady, preference: { ready: motionKnown, reduceMotion }, alreadyStarted: introStarted.current, elapsedMs: Date.now() - startedAt });
    if (duration === 0) return;
    introStarted.current = true;
    let active = true;
    ballY.setValue(-260);
    ballOpacity.setValue(1);
    ballScale.setValue(1);
    ballRotation.setValue(0);
    setShowBall(true);
    // One brief landing inside the brand window, even when initialization is
    // already done; slower preference/layout reads shorten its remaining
    // window rather than queueing a late introduction.
    const landing = Animated.sequence([
      Animated.parallel([
        Animated.timing(ballY, {
          toValue: 82,
          duration: Math.round(duration * 0.75),
          easing: Easing.bezier(0.2, 0.72, 0.25, 1),
          useNativeDriver: true
        }),
        Animated.timing(ballRotation, {
          toValue: 1,
          duration: Math.round(duration * 0.75),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]),
      Animated.parallel([
        Animated.timing(ballOpacity, {
          toValue: 0,
          duration: Math.round(duration * 0.25),
          useNativeDriver: true
        }),
        Animated.timing(ballScale, {
          toValue: 0.55,
          duration: Math.round(duration * 0.25),
          useNativeDriver: true
        })
      ])
    ]);
    landing.start(({ finished }) => {
      if (active && finished) setShowBall(false);
    });
    return () => {
      active = false;
      landing.stop();
      ballOpacity.setValue(0);
      setShowBall(false);
    };
  }, [ballOpacity, ballRotation, ballScale, ballY, layoutReady, motionKnown, reduceMotion, startedAt]);

  const holdMs = launchBrandHoldMs({ ready: motionKnown, reduceMotion });
  useEffect(() => {
    const remaining = Math.max(0, holdMs - (Date.now() - startedAt));
    const timer = setTimeout(() => setBrandHeld(true), remaining);
    return () => clearTimeout(timer);
  }, [holdMs, startedAt]);

  useEffect(() => {
    completion.complete(ready, layoutReady && brandHeld, onComplete);
  }, [brandHeld, completion, layoutReady, onComplete, ready]);
  const ballRotate = ballRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["-80deg", "420deg"]
  });

  return (
    <LinearGradient
      testID="launch-root"
      colors={
        themeMode === "light"
          ? [colors.background, colors.backgroundElevated, colors.surfaceStrong]
          : ["#020915", colors.background, "#061D31"]
      }
      locations={[0, 0.56, 1]}
      onLayout={event => {
        onLayout(event);
        setLayoutReady(true);
      }}
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
          {showBall && motionKnown && !reduceMotion ? <Animated.View
            testID="launch-ball"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
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
          </Animated.View> : null}
        </View>
        <Text style={styles.brand}>BTB MOBILE</Text>
        <Text style={styles.tagline}>BETTER THAN BET</Text>

        <View style={styles.statusArea}>
          <View testID="launch-status" accessibilityLabel={ready ? "BTB hazır" : "Uygulama hazırlanıyor"}
            accessibilityLiveRegion="polite"
            accessibilityRole={ready ? "text" : "progressbar"}
            accessibilityValue={ready ? undefined : { text: "Hazırlanıyor; kalan süre bilinmiyor" }}
            style={styles.statusRow}>
            <Text style={styles.status}>
              {ready ? "BTB hazır" : "Uygulama hazırlanıyor"}
            </Text>
            {!ready ? (
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={styles.dots}>
                <View style={styles.dot} />
                <View style={[styles.dot, styles.dotMid]} />
                <View style={[styles.dot, styles.dotLow]} />
              </View>
            ) : null}
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
  footer: {
    ...textFont("700"),
    position: "absolute",
    color: colors.textMuted,
    fontSize: 13
  }
});
