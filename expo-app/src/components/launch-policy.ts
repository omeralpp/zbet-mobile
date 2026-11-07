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

/**
 * Before the motion preference answers, the launch shows only the brand
 * background, which continues the native splash seamlessly. An answer slower
 * than this reveals the static brand rather than leave an empty screen.
 */
export const launchRevealFallbackMs = 120;
/** Below this the landing cannot read as a fall; the brand appears statically. */
export const launchMinimumIntroMs = 420;
/** A slow start (OAuth, fonts) earns a visible preparing line; a fast one never flashes it. */
export const launchPreparingDelayMs = 600;
/** The hand-off: the launch fades over the already mounted app. */
export const launchExitMs = 240;

/** What the first frames may show: nothing yet, the static brand, or the intro. */
export type LaunchReveal = "PENDING" | "STATIC" | "INTRO";

/**
 * Resolves how the brand appears. The intro needs a known normal-motion
 * preference, a laid-out screen and enough of the brand window left for a
 * believable fall; everything else is the static brand. A reveal that has been
 * decided never changes, so the brand cannot appear twice.
 */
export function resolveLaunchReveal({ current, layoutReady, preference, elapsedMs }: {
  current: LaunchReveal;
  layoutReady: boolean;
  preference: ReducedMotionPreference;
  elapsedMs: number;
}): LaunchReveal {
  if (current !== "PENDING") return current;
  if (preference.ready && preference.reduceMotion) return "STATIC";
  if (preference.ready && layoutReady) {
    const duration = launchIntroDuration({ layoutReady, preference, alreadyStarted: false, elapsedMs });
    return duration >= launchMinimumIntroMs ? "INTRO" : "STATIC";
  }
  return elapsedMs >= launchRevealFallbackMs ? "STATIC" : "PENDING";
}

/** Millisecond marks of one landing, all inside the intro duration. */
export interface LaunchChoreography {
  duration: number;
  /** Crest and pitch lines arrive. */
  entrance: number;
  wordmarkAt: number;
  wordmarkMs: number;
  taglineAt: number;
  footerAt: number;
  dropAt: number;
  dropMs: number;
  /** The ball meets the crest's own ball. */
  impactAt: number;
  squashMs: number;
  /** The squash springs back while the ball stays seated on the crest. */
  settleMs: number;
  rippleMs: number;
  haloRiseMs: number;
  haloSettleMs: number;
  mergeAt: number;
  mergeMs: number;
}

/**
 * One landing, proportioned to the intro duration so a slightly late start
 * keeps the same shape: arrive, fall, meet the crest's ball with a short
 * squash, a ripple through the centre circle, and the ball settles into the
 * crest. No bounce: a hop would show two balls stacked for a moment.
 */
export function launchChoreography(duration: number): LaunchChoreography | null {
  if (!Number.isFinite(duration) || duration < launchMinimumIntroMs) return null;
  const at = (fraction: number) => Math.round(duration * fraction);
  const impactAt = at(0.6);
  return {
    duration,
    entrance: at(0.3),
    wordmarkAt: at(0.15),
    wordmarkMs: at(0.4),
    taglineAt: at(0.25),
    footerAt: at(0.35),
    dropAt: at(0.1),
    dropMs: impactAt - at(0.1),
    impactAt,
    squashMs: at(0.08),
    settleMs: at(0.16),
    rippleMs: duration - impactAt,
    haloRiseMs: at(0.12),
    haloSettleMs: duration - impactAt - at(0.12),
    mergeAt: at(0.88),
    mergeMs: duration - at(0.88)
  };
}

/** The hand-off fade; reduced or unknown motion swaps instantly. */
export function launchExitDuration(preference: ReducedMotionPreference): number {
  return preference.ready && !preference.reduceMotion ? launchExitMs : 0;
}

/**
 * Where the football sits inside the BTB crest artwork, as fractions of the
 * square mark (measured from assets/brand/btb-mark.png). The launch ball lands
 * exactly there, so the fall ends in the brand instead of on top of it.
 */
export const crestBall = { centerX: 0.5, centerY: 0.713, diameter: 0.174 } as const;

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
