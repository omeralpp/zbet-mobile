/**
 * Motion vocabulary.
 *
 * Motion in BTB reports change; it does not decorate. A live product that
 * animates for its own sake costs the user the one thing the animation was
 * supposed to buy — the ability to notice that something actually moved.
 *
 * Durations are named for intent rather than length, so a screen asks for
 * `reveal` and inherits a retune instead of carrying a literal `180`.
 *
 * Reduced motion is resolved here rather than per component. Today only the
 * Bibi overlay reads `AccessibilityInfo`, which means every other animated
 * surface silently ignores the device setting. `motionDuration` collapses to
 * zero so a caller keeps its start and end state and loses only the travel
 * between them — an animation that is skipped must still land somewhere.
 */

export const durations = {
  /** State that must feel like it was already there. Press feedback. */
  instant: 90,
  /** Chips, toggles, small in-place swaps. */
  fast: 140,
  /** The default: a card appearing, a module settling. */
  reveal: 200,
  /** Screen transitions and anything crossing a large distance. */
  transition: 280,
  /** Ambient, repeating, never demanding: a live pulse, Bibi breathing. */
  ambient: 640
} as const;

export type DurationName = keyof typeof durations;

/**
 * Spring for gestures the finger is still holding or has just released.
 *
 * Matches the settle already used by the tab-swipe and edge-back gestures in
 * `Screen`, so newly animated surfaces inherit the feel the product shipped
 * with rather than introducing a second one.
 */
export const gestureSpring = {
  damping: 20,
  stiffness: 260,
  mass: 0.7
} as const;

/**
 * How a change is allowed to announce itself.
 *
 * The distinction that matters on a live surface: `arrive` is for something
 * that appeared, `alert` is for something that changed in a way the user is
 * waiting on — a goal, a new Super decision. Reserving `alert` keeps it
 * meaningful; if a routine refetch uses it, the real event is lost in it.
 */
export const emphasis = {
  arrive: { duration: durations.reveal, scaleFrom: 0.98, opacityFrom: 0 },
  alert: { duration: durations.transition, scaleFrom: 1.04, opacityFrom: 1 }
} as const;

export type EmphasisName = keyof typeof emphasis;

/**
 * Resolves a duration against the device's reduced-motion preference.
 *
 * Returns `0` rather than a shortened duration: a fast animation is still an
 * animation, and the setting asks for none.
 */
export function motionDuration(
  name: DurationName,
  reduceMotion: boolean
): number {
  return reduceMotion ? 0 : durations[name];
}

/**
 * Reports whether a repeating animation may run at all.
 *
 * Ambient motion is the first thing to drop: it never carries information the
 * user cannot get elsewhere, and it is the loop that makes a reduced-motion
 * user put the phone down.
 */
export function allowsAmbientMotion(reduceMotion: boolean): boolean {
  return !reduceMotion;
}
