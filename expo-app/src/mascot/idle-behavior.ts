export const bibiIdleBehaviors = [
  "blink",
  "doubleBlink",
  "lookAround",
  "bob",
  "wink"
] as const;

export type BibiIdleBehavior = (typeof bibiIdleBehaviors)[number];

export type MascotMotionState =
  | "AMBIENT"
  | "SLEEPING"
  | "REACTING"
  | "MENU"
  | "DRAGGING"
  | "GUIDING"
  | "SUSPENDED";

/** Total on-screen time of one idle behaviour, in milliseconds. */
export const bibiIdleDurations: Record<BibiIdleBehavior, number> = {
  blink: 200,
  doubleBlink: 430,
  lookAround: 900,
  bob: 620,
  wink: 340
};

export const bibiIdleRest = {
  minDelayMs: 3600,
  maxDelayMs: 8200
} as const;

/** Long enough to feel intentional, short enough to be seen in a real session. */
export const jinxSleepDelayMs = 30_000;

/**
 * One explicit owner for Jinx motion. State priority prevents an idle blink,
 * drag settle and guide reaction from competing for the same transform.
 */
export function resolveMascotMotionState({
  active,
  ambient,
  reduceMotion,
  dragging,
  menuOpen,
  guideActive,
  sleeping,
  reactionActive
}: {
  active: boolean;
  ambient: boolean;
  reduceMotion: boolean;
  dragging: boolean;
  menuOpen: boolean;
  guideActive: boolean;
  sleeping: boolean;
  reactionActive: boolean;
}): MascotMotionState {
  if (!active || !ambient) {
    return "SUSPENDED";
  }
  if (dragging) {
    return "DRAGGING";
  }
  if (guideActive) {
    return "GUIDING";
  }
  if (menuOpen) {
    return "MENU";
  }
  if (reactionActive) {
    return "REACTING";
  }
  if (sleeping) {
    return "SLEEPING";
  }
  if (reduceMotion) {
    return "SUSPENDED";
  }
  return "AMBIENT";
}

/**
 * Picks the irregular gap between Jinx micro-expressions. A very small ambient
 * breathing rhythm continues underneath, so this is a pause in expression,
 * not a return to a pasted-on still image.
 */
export function nextIdleDelayMs(random: number): number {
  const bounded = Number.isFinite(random)
    ? Math.min(Math.max(random, 0), 0.999999)
    : 0;
  const span = bibiIdleRest.maxDelayMs - bibiIdleRest.minDelayMs;
  return bibiIdleRest.minDelayMs + Math.floor(bounded * span);
}

/**
 * Picks the next idle behaviour, never repeating the previous one so the
 * vocabulary reads as alive instead of as a loop.
 */
export function pickIdleBehavior(
  random: number,
  previous?: BibiIdleBehavior | null
): BibiIdleBehavior {
  const candidates = bibiIdleBehaviors.filter(
    (behavior) => behavior !== previous
  );
  const pool = candidates.length ? candidates : [...bibiIdleBehaviors];
  const bounded = Number.isFinite(random)
    ? Math.min(Math.max(random, 0), 0.999999)
    : 0;
  const index = Math.floor(bounded * pool.length);
  return pool[Math.min(index, pool.length - 1)] as BibiIdleBehavior;
}
