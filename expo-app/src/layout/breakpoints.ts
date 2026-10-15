/**
 * Layout widths for the desktop web build. A phone and a narrow browser
 * window stay "compact" and keep the mobile layout unchanged; the wider
 * classes unlock the sidebar shell and multi-column screens.
 */
export type Breakpoint = "compact" | "medium" | "wide" | "ultra";

export const breakpointMinWidths = {
  medium: 768,
  wide: 1200,
  ultra: 1600
} as const;

const order: readonly Breakpoint[] = ["compact", "medium", "wide", "ultra"];

export function resolveBreakpoint(width: number): Breakpoint {
  if (!Number.isFinite(width) || width < breakpointMinWidths.medium) {
    return "compact";
  }
  if (width < breakpointMinWidths.wide) {
    return "medium";
  }
  return width < breakpointMinWidths.ultra ? "wide" : "ultra";
}

export function isAtLeast(current: Breakpoint, minimum: Breakpoint): boolean {
  return order.indexOf(current) >= order.indexOf(minimum);
}

/**
 * Content width cap of a wide (opt-in) screen. Compact keeps the phone's
 * 720 px column; reading-style screens keep it at every width.
 */
export function wideContentMaxWidth(breakpoint: Breakpoint): number {
  switch (breakpoint) {
    case "ultra":
      return 1560;
    case "wide":
      return 1280;
    case "medium":
      return 960;
    default:
      return 720;
  }
}

/** How many list cards (matches, Super decisions, programs) sit in one row. */
export function cardColumns(breakpoint: Breakpoint): 1 | 2 | 3 {
  if (breakpoint === "ultra") {
    return 3;
  }
  return breakpoint === "compact" ? 1 : 2;
}

/** How many module columns a screen of this class lays out. */
export function moduleColumns(breakpoint: Breakpoint): 1 | 2 | 3 {
  if (breakpoint === "ultra") {
    return 3;
  }
  return breakpoint === "wide" ? 2 : 1;
}
