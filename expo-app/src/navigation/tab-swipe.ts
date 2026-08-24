export const edgeSwipe = {
  /** Width of the leading-edge activation zone. */
  startWidth: 32,
  /** Horizontal travel before the edge gesture may activate. */
  activationDx: 8,
  /** How much more horizontal than vertical the gesture must be. */
  directionRatio: 1.2,
  /** Travel that commits the stack back action on release. */
  commitDx: 76,
  /** Fling velocity that commits the stack back action. */
  commitVx: 0.65
} as const;

export function shouldActivateEdgeSwipe(
  startX: number,
  dx: number,
  dy: number
): boolean {
  "worklet";
  return (
    startX <= edgeSwipe.startWidth &&
    dx > edgeSwipe.activationDx &&
    dx > Math.abs(dy) * edgeSwipe.directionRatio
  );
}

export function shouldCommitEdgeSwipe(dx: number, vx: number): boolean {
  "worklet";
  return dx > edgeSwipe.commitDx || vx > edgeSwipe.commitVx;
}
