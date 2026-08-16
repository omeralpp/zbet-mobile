export const tabSwipe = {
  /** Horizontal travel before the gesture may take over from a scroll view. */
  activationDx: 14,
  /** How much more horizontal than vertical the gesture must be. */
  directionRatio: 1.6,
  /** Travel that commits the tab change on release. */
  commitDx: 64,
  /** Fling velocity that commits the tab change even on a short drag. */
  commitVx: 0.55,
  /** Share of the screen the content may follow the finger. */
  peekRatio: 0.28,
  /** Share of the screen an edge tab may rubber-band without a target. */
  resistanceRatio: 0.05
} as const;

export function shouldActivateTabSwipe(dx: number, dy: number): boolean {
  return (
    Math.abs(dx) > tabSwipe.activationDx &&
    Math.abs(dx) > Math.abs(dy) * tabSwipe.directionRatio
  );
}

/**
 * Maps raw finger travel to screen travel.
 *
 * Motion follows the finger immediately but decays toward a bounded peek so the
 * gesture never exposes a blank frame, and an edge tab with no target resists
 * instead of pretending a screen is arriving.
 */
export function tabSwipeTranslation(
  dx: number,
  width: number,
  hasTarget: boolean
): number {
  if (!Number.isFinite(dx) || !Number.isFinite(width) || width <= 0) {
    return 0;
  }
  const limit =
    width * (hasTarget ? tabSwipe.peekRatio : tabSwipe.resistanceRatio);
  const direction = dx < 0 ? -1 : 1;
  const travelled = Math.abs(dx);
  // Asymptotic decay: 1:1 at the start of the drag, easing into the limit.
  const eased = limit * (1 - Math.exp(-travelled / limit));
  return direction * eased;
}

export function shouldCommitTabSwipe(
  dx: number,
  vx: number,
  hasTarget: boolean
): boolean {
  if (!hasTarget) {
    return false;
  }
  const forward = dx < 0;
  const consistent = forward ? vx <= 0 : vx >= 0;
  return (
    consistent &&
    (Math.abs(dx) >= tabSwipe.commitDx ||
      Math.abs(vx) >= tabSwipe.commitVx)
  );
}
