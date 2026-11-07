import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Animated, Easing, StyleSheet, Text } from "react-native";
import { colors, iconSizes, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { useReducedMotion } from "@/src/theme/use-reduced-motion";

/** How long the confirmation stays before it slips away. */
export const refreshToastMs = 1600;

/**
 * A short "Yenilendi" after a pull-to-refresh succeeds, so the gesture ends in
 * an answer rather than a spinner that simply stops. It reports the action
 * only; it never claims how fresh the upstream data is (NXT-OBS-032).
 * Floats over the content so nothing below it moves; `token` restarts it.
 */
export function RefreshToast({ token }: { token: number | null }) {
  const reduceMotion = useReducedMotion();
  const [presence] = useState(() => new Animated.Value(0));
  const [shownFor, setShownFor] = useState<number | null>(null);

  useEffect(() => {
    if (token === null) return;
    const show = Animated.sequence([
      Animated.timing(presence, { toValue: 1, duration: reduceMotion ? 0 : 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(refreshToastMs),
      Animated.timing(presence, { toValue: 0, duration: reduceMotion ? 0 : 220, easing: Easing.in(Easing.quad), useNativeDriver: true })
    ]);
    const start = setTimeout(() => {
      setShownFor(token);
      show.start(({ finished }) => {
        if (finished) setShownFor(null);
      });
    }, 0);
    return () => {
      clearTimeout(start);
      show.stop();
      presence.setValue(0);
    };
  }, [presence, reduceMotion, token]);

  if (shownFor === null || shownFor !== token) return null;
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      pointerEvents="none"
      style={[styles.toast, {
        opacity: presence,
        transform: [{ translateY: presence.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }]
      }]}
    >
      <MaterialCommunityIcons accessible={false} color={semantic.positive} name="check-circle-outline" size={iconSizes.small} />
      <Text style={styles.text}>Yenilendi</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: spacing.xs,
    alignSelf: "center",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadows.card
  },
  text: { ...typeScale.bodyCompact, color: colors.text, fontWeight: "700" }
});
