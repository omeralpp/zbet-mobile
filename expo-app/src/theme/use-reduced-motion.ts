import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import {
  observeReducedMotionPreference,
  pendingReducedMotionPreference,
  type ReducedMotionPreference
} from "./reduced-motion-preference";

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
export function useReducedMotionPreference(): ReducedMotionPreference {
  const [preference, setPreference] = useState(pendingReducedMotionPreference);

  useEffect(() => observeReducedMotionPreference({
    read: () => AccessibilityInfo.isReduceMotionEnabled(),
    subscribe: listener => AccessibilityInfo.addEventListener("reduceMotionChanged", listener)
  }, setPreference), []);

  return preference;
}

/** Existing callers stay conservative while the device preference is unknown. */
export function useReducedMotion(): boolean {
  return useReducedMotionPreference().reduceMotion;
}
