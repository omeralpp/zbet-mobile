import type { ReducedMotionPreference } from "../theme/reduced-motion-preference";

export const launchIntroWindowMs = 800;
export const launchIntroDurationMs = 640;
/** Reduced motion keeps the brand readable for a moment without movement. */
export const launchStaticHoldMs = 500;
/** An unanswered preference read never holds the brand longer than this. */
export const launchBrandCapMs = 900;

/** The intro plays once inside the brand window; readiness does not cut it. */
export function launchIntroDuration({ layoutReady, preference, alreadyStarted, elapsedMs }: {
  layoutReady: boolean;
  preference: ReducedMotionPreference;
  alreadyStarted: boolean;
  elapsedMs: number;
}): number {
  if (!layoutReady || !preference.ready || preference.reduceMotion || alreadyStarted) return 0;
  return Math.max(0, Math.min(launchIntroDurationMs, launchIntroWindowMs - Math.max(0, elapsedMs)));
}

/**
 * Owner decision 2026-10-29: a fast cold start still shows a brief, bounded
 * brand moment, measured from mount. Slower initialization adds nothing.
 */
export function launchBrandHoldMs(preference: ReducedMotionPreference): number {
  if (!preference.ready) return launchBrandCapMs;
  return preference.reduceMotion ? launchStaticHoldMs : launchIntroWindowMs;
}

/** Completion belongs to readiness and the presented brand, never an animation callback. */
export function createLaunchCompletion() {
  let completed = false;
  return {
    complete(ready: boolean, presented: boolean, onComplete: () => void): boolean {
      if (completed || !ready || !presented) return false;
      completed = true;
      onComplete();
      return true;
    }
  };
}
