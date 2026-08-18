import { useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { allowsAmbientMotion, durations, semantic } from "@/src/theme/theme";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";

/**
 * The live indicator, breathing.
 *
 * This is the one place the product animates continuously, and it earns it: a
 * match in progress is the only thing on screen that is changing whether or not
 * the user is looking. Everywhere else motion reports a discrete event.
 *
 * Deliberately a slow opacity fade rather than a scale pulse. Scale moves the
 * dot's footprint and drags the eye at the edge of vision on a list the user is
 * trying to scan; opacity reads as alive without competing for attention.
 *
 * Runs on the native driver so a list of live cards animates off the JS thread,
 * and stops entirely under reduced motion — an ambient loop carries nothing the
 * user cannot get from the dot simply being there, which is what makes it the
 * first thing to drop.
 */
export function LiveDot({ size = 6 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  // Matches the animated-value idiom already used by Screen and the Bibi
  // overlay: a lazy useState rather than a ref read during render.
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!allowsAmbientMotion(reduceMotion)) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: durations.ambient,
          useNativeDriver: true
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: durations.ambient,
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, opacity: pulse }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    backgroundColor: semantic.live
  }
});
