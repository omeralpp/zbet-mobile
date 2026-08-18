import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * The device's reduced-motion preference, as one shared source.
 *
 * Before this, only the Bibi overlay read `AccessibilityInfo`, which meant every
 * other animated surface silently ignored the setting. A preference that half
 * the product honours is worse than one it does not, because the user cannot
 * tell which half.
 *
 * The listener is kept because the setting can change while the app is open, and
 * a surface that only sampled it at mount would keep animating for the rest of
 * the session.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
