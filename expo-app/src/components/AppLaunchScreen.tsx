import { useEffect, useRef, useState } from "react";
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
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { btbBrandMark } from "@/src/theme/brand-mark";
import { experiencePalettes } from "@/src/theme/experience-palette";
import { useReducedMotionPreference } from "@/src/theme/use-reduced-motion";
import { spacing, textFont } from "@/src/theme/theme";
import { LaunchBall } from "./LaunchBall";
import {
  createLaunchCompletion,
  crestBall,
  launchBrandHoldMs,
  launchChoreography,
  launchExitDuration,
  launchIntroDuration,
  launchPreparingDelayMs,
  launchRevealFallbackMs,
  resolveLaunchReveal,
  type LaunchReveal
} from "./launch-policy";

type AppLaunchScreenProps = {
  ready: boolean;
  /** The app is mounted underneath; fade out and report when gone. */
  exiting: boolean;
  onComplete(): void;
  onExited(): void;
  onLayout(event: LayoutChangeEvent): void;
};

/**
 * The launch is always the brand's night pitch, whichever theme the app uses:
 * it continues the native splash (#04101E) and the web page background
 * without a flash, and hands off to either theme with one fade.
 */
const brand = experiencePalettes.dark;
const stage = 176;
const ringSize = 264;
const ballSize = 30;
const rippleSize = 184;
const haloSize = 320;
const ballCenter = { x: stage * crestBall.centerX, y: stage * crestBall.centerY };
const ballStart = -(ballCenter.y + 280);

const ease = Easing.bezier(0.2, 0.7, 0.25, 1);
const gravity = Easing.in(Easing.quad);

function timing(value: Animated.Value, toValue: number, duration: number, easing = ease) {
  return Animated.timing(value, { toValue, duration: Math.max(0, duration), easing, useNativeDriver: true });
}

function CrestHalo() {
  return (
    <Svg height={haloSize} width={haloSize}>
      <Defs>
        <RadialGradient cx="50%" cy="50%" id="btbLaunchHalo" r="50%">
          <Stop offset="0" stopColor={brand.accent} stopOpacity={0.3} />
          <Stop offset="0.45" stopColor={brand.blue} stopOpacity={0.12} />
          <Stop offset="1" stopColor={brand.blue} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={haloSize / 2} cy={haloSize / 2} fill="url(#btbLaunchHalo)" r={haloSize / 2} />
    </Svg>
  );
}

export function AppLaunchScreen({ ready, exiting, onComplete, onExited, onLayout }: AppLaunchScreenProps) {
  const insets = useSafeAreaInsets();
  const preference = useReducedMotionPreference();
  const { ready: motionKnown, reduceMotion } = preference;
  const [startedAt] = useState(Date.now);
  const [completion] = useState(createLaunchCompletion);
  const [layoutReady, setLayoutReady] = useState(false);
  const [brandHeld, setBrandHeld] = useState(false);
  const [reveal, setReveal] = useState<LaunchReveal>("PENDING");
  const [showPreparing, setShowPreparing] = useState(false);

  const [values] = useState(() => ({
    crest: new Animated.Value(0),
    bump: new Animated.Value(1),
    pitch: new Animated.Value(0),
    wordmark: new Animated.Value(0),
    tagline: new Animated.Value(0),
    footer: new Animated.Value(0),
    halo: new Animated.Value(0),
    ballY: new Animated.Value(ballStart),
    ballTurn: new Animated.Value(0),
    ballSquashX: new Animated.Value(1),
    ballSquashY: new Animated.Value(1),
    ballOpacity: new Animated.Value(0),
    ripple: new Animated.Value(0),
    exit: new Animated.Value(1),
    dots: new Animated.Value(0)
  }));

  // Decide once how the brand appears; re-evaluated until it is decided. A
  // decision available now lands on the next tick, otherwise the fallback
  // reveals the static brand.
  useEffect(() => {
    if (reveal !== "PENDING") return;
    const elapsed = Date.now() - startedAt;
    const decided = resolveLaunchReveal({ current: "PENDING", layoutReady, preference, elapsedMs: elapsed }) !== "PENDING";
    const timer = setTimeout(() => {
      const elapsedMs = Math.max(decided ? 0 : launchRevealFallbackMs, Date.now() - startedAt);
      setReveal(current => resolveLaunchReveal({ current, layoutReady, preference, elapsedMs }));
    }, decided ? 0 : Math.max(0, launchRevealFallbackMs - elapsed));
    return () => clearTimeout(timer);
  }, [layoutReady, preference, reveal, startedAt]);

  useEffect(() => {
    if (reveal === "PENDING") return;
    const v = values;
    // The finished composition: static brand, interrupted landing or no time left.
    const settle = () => {
      v.crest.setValue(1);
      v.pitch.setValue(1);
      v.wordmark.setValue(1);
      v.tagline.setValue(1);
      v.footer.setValue(1);
      v.halo.setValue(0.6);
      v.bump.setValue(1);
      v.ballOpacity.setValue(0);
      v.ripple.setValue(0);
    };
    const plan = reveal === "INTRO"
      ? launchChoreography(launchIntroDuration({ layoutReady: true, preference: { ready: true, reduceMotion: false }, alreadyStarted: false, elapsedMs: Date.now() - startedAt }))
      : null;
    if (!plan) {
      settle();
      return;
    }
    v.ballY.setValue(ballStart);
    v.ballTurn.setValue(0);
    v.ballOpacity.setValue(1);
    const landing = Animated.parallel([
      timing(v.crest, 1, plan.entrance),
      timing(v.pitch, 1, plan.entrance + plan.dropAt),
      Animated.sequence([Animated.delay(plan.wordmarkAt), timing(v.wordmark, 1, plan.wordmarkMs)]),
      Animated.sequence([Animated.delay(plan.taglineAt), timing(v.tagline, 1, plan.wordmarkMs)]),
      Animated.sequence([Animated.delay(plan.footerAt), timing(v.footer, 1, plan.wordmarkMs)]),
      // The fall: accelerating, one and a half turns, ending upright so the
      // panels line up with the ball in the crest.
      Animated.sequence([
        Animated.delay(plan.dropAt),
        Animated.parallel([
          timing(v.ballY, 0, plan.dropMs, gravity),
          timing(v.ballTurn, 1, plan.dropMs, Easing.out(Easing.quad))
        ]),
        // Impact: a short squash that springs back while the ball stays seated.
        Animated.parallel([
          timing(v.ballSquashX, 1.14, plan.squashMs, Easing.out(Easing.quad)),
          timing(v.ballSquashY, 0.84, plan.squashMs, Easing.out(Easing.quad))
        ]),
        Animated.parallel([
          timing(v.ballSquashX, 1, plan.settleMs, Easing.out(Easing.back(2))),
          timing(v.ballSquashY, 1, plan.settleMs, Easing.out(Easing.back(2)))
        ])
      ]),
      Animated.sequence([
        Animated.delay(plan.impactAt),
        Animated.parallel([
          timing(v.ripple, 1, plan.rippleMs, Easing.out(Easing.cubic)),
          Animated.sequence([
            timing(v.bump, 1.045, plan.squashMs, Easing.out(Easing.quad)),
            timing(v.bump, 1, plan.settleMs)
          ]),
          Animated.sequence([
            timing(v.halo, 1, plan.haloRiseMs, Easing.out(Easing.quad)),
            timing(v.halo, 0.6, plan.haloSettleMs)
          ])
        ])
      ]),
      Animated.sequence([Animated.delay(plan.mergeAt), timing(v.ballOpacity, 0, plan.mergeMs)])
    ]);
    landing.start();
    return () => {
      landing.stop();
      settle();
    };
  }, [reveal, startedAt, values]);

  const holdMs = launchBrandHoldMs(preference);
  useEffect(() => {
    const remaining = Math.max(0, holdMs - (Date.now() - startedAt));
    const timer = setTimeout(() => setBrandHeld(true), remaining);
    return () => clearTimeout(timer);
  }, [holdMs, startedAt]);

  useEffect(() => {
    completion.complete(ready, layoutReady && brandHeld, onComplete);
  }, [brandHeld, completion, layoutReady, onComplete, ready]);

  // A slow start earns a truthful line; a fast one never flashes it.
  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setShowPreparing(true), Math.max(0, launchPreparingDelayMs - (Date.now() - startedAt)));
    return () => clearTimeout(timer);
  }, [ready, startedAt]);
  const preparing = showPreparing && !ready;

  const motion = motionKnown && !reduceMotion;
  useEffect(() => {
    if (!preparing || !motion) {
      values.dots.setValue(0);
      return;
    }
    const loop = Animated.loop(timing(values.dots, 1, 1200, Easing.linear));
    loop.start();
    return () => loop.stop();
  }, [motion, preparing, values.dots]);

  // The preference at the moment of exit decides the fade; a later change must
  // not restart or cut it, so the effect below reads these through refs.
  const exitDuration = launchExitDuration(preference);
  const exitDurationRef = useRef(exitDuration);
  const onExitedRef = useRef(onExited);
  useEffect(() => {
    exitDurationRef.current = exitDuration;
    onExitedRef.current = onExited;
  }, [exitDuration, onExited]);

  // The app is already mounted underneath: one frame for it to paint, then fade.
  useEffect(() => {
    if (!exiting) return;
    const duration = exitDurationRef.current;
    if (!duration) {
      onExitedRef.current();
      return;
    }
    let fade: Animated.CompositeAnimation | null = null;
    const frame = requestAnimationFrame(() => {
      fade = timing(values.exit, 0, duration, Easing.out(Easing.cubic));
      fade.start(({ finished }) => {
        if (finished) onExitedRef.current();
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      fade?.stop();
    };
  }, [exiting, values.exit]);

  const v = values;
  // The hand-off clears the brand in the first half of the fade and the night
  // pitch over the whole of it, so the app never shows through a double image.
  const contentFade = v.exit.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const lift = (value: Animated.Value, distance: number) => ({
    opacity: value,
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }]
  });
  const dot = (offset: number) => ({
    opacity: v.dots.interpolate({
      inputRange: [0, offset, offset + 0.2, offset + 0.4, 1],
      outputRange: [0.3, 0.3, 1, 0.3, 0.3]
    })
  });

  return (
    <Animated.View
      accessibilityElementsHidden={exiting}
      importantForAccessibility={exiting ? "no-hide-descendants" : "auto"}
      pointerEvents={exiting ? "none" : "auto"}
      style={[styles.overlay, { opacity: v.exit }]}
      testID="launch-root"
    >
      <LinearGradient
        colors={["#030B16", "#04101E", "#061D31"]}
        locations={[0, 0.55, 1]}
        onLayout={event => {
          onLayout(event);
          setLayoutReady(true);
        }}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: contentFade, transform: [{ scale: v.exit.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1] }) }] }
          ]}
        >
          <View style={styles.logoStage}>
            {/* The pitch the product reads: halfway line and centre circle,
                centred on the crest, kept clear of the wordmark. */}
            <Animated.View pointerEvents="none" style={[styles.halfway, { opacity: v.pitch, transform: [{ scaleX: v.pitch }] }]} />
            <Animated.View
              pointerEvents="none"
              style={[styles.ring, {
                opacity: v.pitch,
                transform: [{ scale: v.pitch.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }]
              }]}
            />
            <Animated.View pointerEvents="none" style={[styles.halo, { opacity: v.halo }]}>
              <CrestHalo />
            </Animated.View>
            <Animated.View style={{
              opacity: v.crest,
              transform: [
                { scale: v.crest.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                { scale: v.bump }
              ]
            }}>
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel="BTB"
                resizeMode="contain"
                source={btbBrandMark}
                style={styles.logo}
              />
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[styles.ripple, {
                opacity: v.ripple.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.9, 0] }),
                transform: [{ scale: v.ripple.interpolate({ inputRange: [0, 1], outputRange: [ballSize / rippleSize, 1] }) }]
              }]}
            />
            {reveal === "INTRO" ? (
              <Animated.View
                accessibilityElementsHidden
                aria-hidden
                importantForAccessibility="no-hide-descendants"
                pointerEvents="none"
                style={[styles.ball, {
                  opacity: v.ballOpacity,
                  transform: [
                    { translateY: v.ballY },
                    { rotate: v.ballTurn.interpolate({ inputRange: [0, 1], outputRange: ["-180deg", "360deg"] }) },
                    { scaleX: v.ballSquashX },
                    { scaleY: v.ballSquashY }
                  ]
                }]}
                testID="launch-ball"
              >
                <LaunchBall size={ballSize} />
              </Animated.View>
            ) : null}
          </View>
          <Animated.Text accessibilityRole="header" style={[styles.brand, lift(v.wordmark, 10)]}>BTB MOBILE</Animated.Text>
          <Animated.Text style={[styles.tagline, lift(v.tagline, 6)]}>BETTER THAN BET</Animated.Text>

          <View style={styles.statusArea}>
            {preparing ? (
              <View
                accessibilityLabel="Uygulama hazırlanıyor"
                accessibilityLiveRegion="polite"
                accessibilityRole="progressbar"
                accessibilityValue={{ text: "Hazırlanıyor; kalan süre bilinmiyor" }}
                style={styles.statusRow}
                testID="launch-status"
              >
                <Text style={styles.status}>Uygulama hazırlanıyor</Text>
                <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" style={styles.dots}>
                  <Animated.View style={[styles.dot, dot(0)]} />
                  <Animated.View style={[styles.dot, dot(0.2)]} />
                  <Animated.View style={[styles.dot, dot(0.4)]} />
                </View>
              </View>
            ) : null}
          </View>
        </Animated.View>
        <Animated.Text
          style={[
            styles.footer,
            { bottom: Math.max(insets.bottom, spacing.lg) + spacing.md, opacity: Animated.multiply(v.footer, contentFade) }
          ]}
        >
          Canlı analiz · Super · Toto
        </Animated.Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2000,
    elevation: 40,
    backgroundColor: "#04101E"
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl
  },
  content: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center"
  },
  logoStage: {
    width: stage,
    height: stage
  },
  // The line runs past both screen edges, through the crest's centre.
  halfway: {
    position: "absolute",
    left: -2000,
    right: -2000,
    top: stage / 2,
    height: 1,
    backgroundColor: brand.border,
    opacity: 0.5
  },
  ring: {
    position: "absolute",
    left: (stage - ringSize) / 2,
    top: (stage - ringSize) / 2,
    width: ringSize,
    height: ringSize,
    borderRadius: ringSize / 2,
    borderWidth: 1,
    borderColor: brand.border
  },
  halo: {
    position: "absolute",
    left: (stage - haloSize) / 2,
    top: (stage - haloSize) / 2,
    width: haloSize,
    height: haloSize
  },
  logo: {
    width: stage,
    height: stage
  },
  ripple: {
    position: "absolute",
    left: ballCenter.x - rippleSize / 2,
    top: ballCenter.y - rippleSize / 2,
    width: rippleSize,
    height: rippleSize,
    borderRadius: rippleSize / 2,
    borderWidth: 1.5,
    borderColor: brand.accent
  },
  ball: {
    position: "absolute",
    left: ballCenter.x - ballSize / 2,
    top: ballCenter.y - ballSize / 2,
    width: ballSize,
    height: ballSize,
    borderRadius: ballSize / 2,
    backgroundColor: brand.text,
    shadowColor: brand.blue,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8
  },
  // Clear of the centre circle, so the circle never cuts through the letters.
  brand: {
    ...textFont("800"),
    marginTop: (ringSize - stage) / 2 + 22,
    color: brand.text,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: 6
  },
  tagline: {
    ...textFont("800"),
    marginTop: 6,
    color: brand.accent,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 3.6
  },
  statusArea: {
    minHeight: 24,
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  status: {
    ...textFont("500"),
    color: brand.muted,
    fontSize: 13,
    lineHeight: 18
  },
  dots: {
    flexDirection: "row",
    gap: 4
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: brand.accent
  },
  footer: {
    ...textFont("700"),
    position: "absolute",
    color: brand.muted,
    fontSize: 13
  }
});
