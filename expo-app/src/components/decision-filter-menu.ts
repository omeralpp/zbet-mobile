type Rect = { x: number; y: number; width: number; height: number };
type Insets = { top: number; right: number; bottom: number; left: number };

/** Keep the complete scroll viewport inside the safe window, even in landscape. */
export function decisionFilterMenuLayout({ anchor, window, insets, contentHeight }: {
  anchor: Rect;
  window: { width: number; height: number };
  insets: Insets;
  contentHeight: number;
}) {
  const margin = 16, gap = 4;
  const leftEdge = Math.min(window.width, Math.max(0, insets.left) + margin);
  const rightEdge = Math.max(leftEdge, window.width - Math.max(0, insets.right) - margin);
  const topEdge = Math.min(window.height, Math.max(0, insets.top) + margin);
  const bottomEdge = Math.max(topEdge, window.height - Math.max(0, insets.bottom) - margin);
  const width = Math.min(280, rightEdge - leftEdge);
  const desiredHeight = Math.max(0, contentHeight);
  const belowTop = Math.max(topEdge, Math.min(bottomEdge, anchor.y + anchor.height + gap));
  const aboveBottom = Math.max(topEdge, Math.min(bottomEdge, anchor.y - gap));
  const below = bottomEdge - belowTop, above = aboveBottom - topEdge;
  const opensBelow = below >= desiredHeight || (above < desiredHeight && below >= above);
  const available = opensBelow ? below : above;
  // If the anchor divides an unusually short window, use the whole safe area
  // instead of leaving a sliver that cannot expose a complete 44-point option.
  const useSafeWindow = available < Math.min(desiredHeight, 54);
  const height = Math.min(desiredHeight, useSafeWindow ? bottomEdge - topEdge : available);
  return {
    left: Math.max(leftEdge, Math.min(anchor.x + anchor.width - width, rightEdge - width)),
    top: useSafeWindow ? topEdge : opensBelow ? belowTop : aboveBottom - height,
    width,
    height
  };
}
