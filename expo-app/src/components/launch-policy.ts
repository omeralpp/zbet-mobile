import type { ReducedMotionPreference } from "../theme/reduced-motion-preference";

export const launchIntroWindowMs = 800;
export const launchIntroDurationMs = 640;

/** The intro uses initialization time only; it can never delay application access. */
export function launchIntroDuration({ ready, layoutReady, preference, alreadyStarted, elapsedMs }: {
  ready: boolean;
  layoutReady: boolean;
  preference: ReducedMotionPreference;
  alreadyStarted: boolean;
  elapsedMs: number;
}): number {
  if (ready || !layoutReady || !preference.ready || preference.reduceMotion || alreadyStarted) return 0;
  return Math.max(0, Math.min(launchIntroDurationMs, launchIntroWindowMs - Math.max(0, elapsedMs)));
}

/** Completion belongs to actual readiness and layout, never an animation callback. */
export function createLaunchCompletion() {
  let completed = false;
  return {
    complete(ready: boolean, layoutReady: boolean, onComplete: () => void): boolean {
      if (completed || !ready || !layoutReady) return false;
      completed = true;
      onComplete();
      return true;
    }
  };
}
