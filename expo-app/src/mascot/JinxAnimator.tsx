import { useEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppState, Animated, Easing, Image, Platform, StyleSheet, View } from "react-native";
import { textFont } from "@/src/theme/typography";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";
import { resolveJinxMotion, sceneCopy, type JinxCandidate, type JinxMotionMode, type JinxMotionState } from "./jinx-motion";

const frames = {
  orb: [require("../../assets/mascot/candidates/jinx-a-open.png"), require("../../assets/mascot/candidates/jinx-a-half.png"), require("../../assets/mascot/candidates/jinx-a-closed.png")],
  fox: [require("../../assets/mascot/candidates/jinx-b-open.png"), require("../../assets/mascot/candidates/jinx-b-half.png"), require("../../assets/mascot/candidates/jinx-b-closed.png")]
} as const;
const driver = Platform.OS !== "web";
const phasePoints = [0, 0.18, 0.4, 0.66, 0.84, 1];
type IdleMove = "hop" | "glance" | "tilt";
const idleMoves: readonly IdleMove[] = ["hop", "glance", "tilt"];

/**
 * Both characters use the exact same timing and layout for a fair comparison.
 * NXT-OBS-173: Jinx always breathes while motion is allowed and adds a short
 * irregular micro-move on top, so the character reads as alive between scenes.
 */
export function JinxAnimator({ candidate, state, mode, size = 160, dark = true, compact = false, asleep = false, forceReducedMotion = false, onComplete }: {
  candidate: JinxCandidate;
  state: JinxMotionState;
  mode: JinxMotionMode;
  size?: number;
  dark?: boolean;
  compact?: boolean;
  asleep?: boolean;
  forceReducedMotion?: boolean;
  onComplete?: (sequence: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [foreground, setForeground] = useState(() => AppState.currentState === "active");
  useEffect(() => {
    const listener = AppState.addEventListener("change", next => setForeground(next === "active"));
    return () => listener.remove();
  }, []);
  const policy = resolveJinxMotion(mode, reduceMotion || forceReducedMotion || asleep, state.active && foreground);
  const [phase] = useState(() => new Animated.Value(0));
  const [breath] = useState(() => new Animated.Value(0));
  const [idleX] = useState(() => new Animated.Value(0));
  const [idleY] = useState(() => new Animated.Value(0));
  const [idleTilt] = useState(() => new Animated.Value(0));
  const blinkToken = `${state.scene}:${state.sequence}:${policy.enabled}:${mode}`;
  const [blink, setBlink] = useState<{ frame: 0 | 1 | 2; token: string }>({ frame: 0, token: "" });
  const complete = useRef(onComplete);
  useEffect(() => { complete.current = onComplete; }, [onComplete]);

  useEffect(() => {
    phase.stopAnimation();
    phase.setValue(0);
    if (!policy.enabled) {
      complete.current?.(state.sequence);
      return;
    }
    if (state.scene === "idle" && state.sequence === 0) return;
    const animation = Animated.timing(phase, {
      toValue: 1, duration: sceneCopy[state.scene].duration,
      easing: Easing.inOut(Easing.cubic), useNativeDriver: driver
    });
    animation.start(({ finished }) => { if (finished) complete.current?.(state.sequence); });
    return () => animation.stop();
  }, [phase, policy.enabled, state.scene, state.sequence]);

  // One breath drives position, scale and the spark, so loops never drift apart.
  useEffect(() => {
    breath.stopAnimation();
    breath.setValue(0);
    if (!policy.enabled) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: policy.ambient ? 1700 : 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: driver }),
      Animated.timing(breath, { toValue: 0, duration: policy.ambient ? 2000 : 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: driver })
    ]));
    loop.start();
    return () => { loop.stop(); breath.setValue(0); };
  }, [breath, policy.ambient, policy.enabled]);

  // Irregular micro-moves between scenes; never the same one twice in a row.
  useEffect(() => {
    idleX.setValue(0); idleY.setValue(0); idleTilt.setValue(0);
    if (!policy.ambient || state.scene !== "idle") return;
    let disposed = false;
    let previous: IdleMove | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const spring = (value: Animated.Value, toValue: number) => Animated.sequence([
      Animated.spring(value, { toValue, damping: 9, stiffness: 230, useNativeDriver: driver }),
      Animated.spring(value, { toValue: 0, damping: 12, stiffness: 190, useNativeDriver: driver })
    ]);
    const play = () => {
      const options = idleMoves.filter(move => move !== previous);
      const move = options[Math.floor(Math.random() * options.length)] ?? "hop";
      previous = move;
      const amp = size / 68;
      (move === "hop" ? spring(idleY, -7 * amp)
        : move === "glance" ? Animated.sequence([
          Animated.timing(idleX, { toValue: -4 * amp, duration: 260, useNativeDriver: driver }),
          Animated.timing(idleX, { toValue: 4 * amp, duration: 380, useNativeDriver: driver }),
          Animated.timing(idleX, { toValue: 0, duration: 260, useNativeDriver: driver })])
        : spring(idleTilt, Math.random() < 0.5 ? -1 : 1)).start();
      schedule();
    };
    const schedule = () => { timer = setTimeout(() => { if (!disposed) play(); }, 3200 + Math.random() * 3800); };
    schedule();
    return () => { disposed = true; clearTimeout(timer); idleX.stopAnimation(); idleY.stopAnimation(); idleTilt.stopAnimation(); };
  }, [idleTilt, idleX, idleY, policy.ambient, size, state.scene]);

  useEffect(() => {
    if (!policy.enabled || state.scene === "drag") return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;
    const schedule = () => {
      timers = [setTimeout(() => {
        if (cancelled) return;
        setBlink({ frame: 1, token: blinkToken });
        timers.push(setTimeout(() => { if (!cancelled) setBlink({ frame: 2, token: blinkToken }); }, 70));
        timers.push(setTimeout(() => { if (!cancelled) setBlink({ frame: 1, token: blinkToken }); }, 145));
        timers.push(setTimeout(() => { if (!cancelled) { setBlink({ frame: 0, token: blinkToken }); schedule(); } }, 220));
      }, policy.ambient ? 2600 + Math.random() * 3400 : 6000 + Math.random() * 3000)];
    };
    schedule();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [blinkToken, policy.ambient, policy.enabled, state.scene]);

  const scene = state.scene;
  const moving = policy.enabled && state.sequence > 0;
  const amp = policy.amplitude * size / 160;
  const curve = (values: number[]) => phase.interpolate({ inputRange: phasePoints, outputRange: values.map(n => n * amp) });
  const vertical = scene === "goal" ? [0, -14, -34, 0, -12, 0]
    : scene === "cheer" ? [0, -16, -38, 0, -18, 0]
    : scene === "doubt" ? [0, 3, -5, 3, 0, 0]
    : scene === "greeting" ? [0, -15, 0, -7, 0, 0]
    : scene === "touch" ? [0, 6, -16, 0, -3, 0]
    : scene === "drag" ? [0, -5, 6, -3, 1, 0]
    : scene === "thinking" || scene === "halfTime" ? [0, -3, 1, -3, 0, 0]
    : [0, -6, 0, -3, 0, 0];
  const tilt = scene === "drag" ? [0, 16, -12, 7, -3, 0]
    : scene === "goal" || scene === "cheer" ? [0, -10, 12, -6, 3, 0]
    : scene === "doubt" ? [0, -11, 11, -9, 6, 0]
    : scene === "guide" ? [0, -7, -7, 0, -3, 0]
    : [0, -5, 4, -2, 1, 0];
  const breathAmp = policy.enabled ? policy.amplitude * size / 68 : 0;
  const breathY = breath.interpolate({ inputRange: [0, 1], outputRange: [0.8 * breathAmp, -2.6 * breathAmp] });
  const breathScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + 0.03 * Math.min(1, breathAmp)] });
  const sparkOpacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const sparkScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.25] });
  const sceneY = moving ? curve(vertical) : 0;
  const translateY = Animated.add(Animated.add(sceneY, breathY), idleY);
  const sceneTilt = moving ? phase.interpolate({ inputRange: phasePoints, outputRange: tilt.map(n => n * policy.amplitude) }) : 0;
  const rotation = Animated.add(sceneTilt, Animated.multiply(idleTilt, 6)).interpolate({ inputRange: [-60, 60], outputRange: ["-60deg", "60deg"] });
  const squash = phase.interpolate({ inputRange: phasePoints, outputRange: [1, 1 - .08 * policy.amplitude, 1 + .06 * policy.amplitude, 1 - .02 * policy.amplitude, 1, 1] });
  const ballVisible = ["idle", "touch", "goal", "cheer", "drag", "greeting"].includes(scene);
  const boardVisible = ["thinking", "halfTime", "guide"].includes(scene);
  const expression = asleep ? 2 : policy.enabled ? scene === "waiting" || scene === "doubt" ? 1 : blink.token === blinkToken ? blink.frame : 0 : 0;

  return <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width: size * (compact ? 1 : 1.6), height: size * (compact ? 1 : 1.45), alignItems: "center", justifyContent: "center" }}>
    {!compact ? <View style={[styles.pitch, { width: size * 1.4, height: size * .6, borderColor: dark ? "#2A5A4C" : "#A7C9BE", backgroundColor: dark ? "#0F3329" : "#E6F2EB", bottom: size * .08 }]}>
      <View style={[styles.pitchLine, { borderColor: dark ? "#3B6E5E" : "#A7C9BE" }]} />
    </View> : null}
    {!compact ? <Animated.View style={[styles.shadow, { width: size * .66, height: size * .08, bottom: size * .14, opacity: dark ? .38 : .12, transform: [{ scaleX: moving ? phase.interpolate({ inputRange: phasePoints, outputRange: [1, .85, .65, 1, .88, 1] }) : 1 }] }]} /> : null}
    <Animated.View style={{ width: size, height: size, transform: [{ translateX: idleX }, { translateY }, { rotate: rotation }, { scaleY: moving ? squash : 1 }, { scale: breathScale }] }}>
      <Image source={frames[candidate][expression]} resizeMode="contain" style={styles.image} fadeDuration={0} />
    </Animated.View>
    {policy.enabled && !asleep ? <Animated.Text style={[styles.spark, { fontSize: Math.max(11, size * .2), right: compact ? -2 : size * .2, top: compact ? -4 : size * .12, opacity: sparkOpacity, transform: [{ scale: sparkScale }] }]}>✦</Animated.Text> : null}
    {ballVisible && (!compact || scene !== "idle") ? <Animated.View style={{ position: "absolute", bottom: size * .12, left: size * (compact ? .72 : 1.05), transform: [{ translateX: moving ? curve([0, -14, 8, -18, -3, 0]) : 0 }, { translateY: moving ? curve([0, -8, -38, -5, -16, 0]) : 0 }, { rotate: moving ? phase.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "210deg"] }) : "0deg" }] }}>
      <MaterialCommunityIcons name="soccer" size={size * .22} color={dark ? "#F1EFE5" : "#27372F"} />
    </Animated.View> : null}
    {boardVisible ? <Animated.View style={[styles.board, { right: size * .04, bottom: size * .27, transform: [{ translateY: moving ? curve([8, 0, -3, 0, -2, 8]) : 0 }] }]}>
      <MaterialCommunityIcons name={scene === "guide" ? "arrow-left" : "soccer-field"} size={size * .27} color="#C8EDDA" />
    </Animated.View> : null}
    {scene === "cheer" ? <View style={[styles.badge, { right: size * .02, top: size * .02 }]}><MaterialCommunityIcons name="star-four-points" size={size * .22} color="#FFC845" /></View> : null}
    {scene === "doubt" ? <View style={[styles.badge, { right: size * .02, top: size * .04 }]}><MaterialCommunityIcons name="help-circle-outline" size={size * .22} color="#FF9F4A" /></View> : null}
    {scene === "waiting" ? <View style={[styles.waiting, { right: size * .12, top: size * .16 }]}><MaterialCommunityIcons name="timer-sand" size={size * .18} color="#EBC478" /></View> : null}
    {scene === "answer" ? <View style={[styles.waiting, { right: size * .08, top: size * .13 }]}><MaterialCommunityIcons name="text-box-outline" size={size * .2} color="#93C9FF" /></View> : null}
  </View>;
}

const styles = StyleSheet.create({
  image: { width: "100%", height: "100%" },
  pitch: { position: "absolute", borderWidth: 1, borderRadius: 100, transform: [{ scaleY: .48 }], alignItems: "center", justifyContent: "center" },
  pitchLine: { height: "90%", width: "32%", borderRadius: 100, borderWidth: 1 },
  shadow: { backgroundColor: "#000000", position: "absolute", borderRadius: 100 },
  spark: { ...textFont("800"), position: "absolute", color: "#56C8FF" },
  board: { position: "absolute", padding: 7, borderRadius: 8, backgroundColor: "#173E32", borderWidth: 1, borderColor: "#567D66", transform: [{ rotate: "-8deg" }] },
  badge: { position: "absolute" },
  waiting: { position: "absolute", padding: 6, borderRadius: 30, backgroundColor: "#122B3B" }
});
