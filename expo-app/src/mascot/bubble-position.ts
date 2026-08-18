export interface BubbleTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BubblePositionOptions {
  /** Bibi's top-left in window coordinates; the result is relative to it. */
  anchorX: number;
  anchorY: number;
  anchorSize: number;
  /** The measured element a guide step points at, when there is one. */
  target: BubbleTarget | null;
  bubbleWidth: number;
  estimatedHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  insetTop: number;
  insetBottom: number;
  insetLeft: number;
  insetRight: number;
  edgeMargin: number;
}

/**
 * Places a Bibi bubble so it stays on screen and near what it is talking about.
 *
 * Two callers, one rule. A tutorial step has a measured target and centres the
 * bubble under it; a discovery hint has none and sits against Bibi herself. The
 * fallback is not a degraded case — it is the whole geometry for discovery, and
 * having both go through the same clamp is what stops a hint from opening off
 * the edge on a phone where the mascot was dragged into a corner.
 *
 * Below is preferred and above is the fallback, because a bubble that opens
 * downward from the thing it describes keeps that thing visible. It flips only
 * when the bubble would not fit in the space that is left.
 *
 * The result is relative to the anchor because the bubble renders inside Bibi's
 * transformed container, which already carries her position.
 */
export function resolveBubblePosition(
  options: BubblePositionOptions
): { left: number; top: number } {
  const {
    anchorX,
    anchorY,
    anchorSize,
    target,
    bubbleWidth,
    estimatedHeight,
    viewportWidth,
    viewportHeight,
    insetTop,
    insetBottom,
    insetLeft,
    insetRight,
    edgeMargin
  } = options;

  const minLeft = insetLeft + edgeMargin;
  const maxLeft = viewportWidth - insetRight - edgeMargin - bubbleWidth;
  const left = target
    ? Math.min(
        Math.max(minLeft, target.x + target.width / 2 - bubbleWidth / 2),
        maxLeft
      )
    : Math.min(Math.max(minLeft, anchorX), maxLeft);

  const below = target
    ? target.y + target.height + 12
    : anchorY + anchorSize + 8;
  const above = target
    ? target.y - estimatedHeight - 12
    : anchorY - estimatedHeight - 8;
  const top =
    below + estimatedHeight <= viewportHeight - insetBottom - edgeMargin
      ? below
      : Math.max(insetTop + edgeMargin, above);

  return { left: left - anchorX, top: top - anchorY };
}
