import { StyleSheet, View, type ViewStyle } from "react-native";
import { allowsAmbientMotion, durations, semantic } from "@/src/theme/theme";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";

/**
 * Web twin of the live indicator.
 *
 * React Native Web has no native driver, so the Animated loop of the native dot
 * ran on the JS thread and restyled the dot every frame: about 100 style
 * recalculations a second on an idle match page (measured 1 November 2026,
 * NXT-OBS-241). The same slow opacity fade as a CSS animation stays off the JS
 * thread, and reduced motion still stops it.
 */
const breathe = {
  animationKeyframes: [{ "0%": { opacity: 1 }, "50%": { opacity: 0.35 }, "100%": { opacity: 1 } }],
  animationDuration: `${durations.ambient * 2}ms`,
  animationIterationCount: "infinite",
  animationTimingFunction: "ease-in-out"
} as unknown as ViewStyle;

export function LiveDot({ size = 6 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2 },
        allowsAmbientMotion(reduceMotion) ? breathe : null
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    backgroundColor: semantic.live
  }
});
