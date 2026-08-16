export const bibiIdleBehaviors = [
  "blink",
  "doubleBlink",
  "lookAround",
  "bob",
  "wink"
] as const;

export type BibiIdleBehavior = (typeof bibiIdleBehaviors)[number];

/** Total on-screen time of one idle behaviour, in milliseconds. */
export const bibiIdleDurations: Record<BibiIdleBehavior, number> = {
  blink: 200,
  doubleBlink: 430,
  lookAround: 900,
  bob: 620,
  wink: 340
};

export const bibiIdleRest = {
  minDelayMs: 5200,
  maxDelayMs: 12400
} as const;

/**
 * Picks how long Bibi stays completely still before the next micro-animation.
 * Bibi is at rest most of the time, so the quiet window is long and jittered
 * rather than a fixed metronome.
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
