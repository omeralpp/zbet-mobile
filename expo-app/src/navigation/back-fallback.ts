import type { Breakpoint } from "@/src/layout/breakpoints";

/**
 * Whether a stack header has to draw its own back control.
 *
 * A detail screen opened without history (a notification link, a bookmark or
 * a reload) gets no back arrow from the navigator, and at phone width nothing
 * else on screen leads out of it. From the medium width up the web shell's
 * sidebar is always present, so the header stays as it is there (NXT-OBS-256).
 */
export function needsBackFallback(canGoBack: boolean, platform: string, breakpoint: Breakpoint): boolean {
  if (canGoBack) return false;
  return platform !== "web" || breakpoint === "compact";
}

/**
 * Where that control leads: the same place each screen's edge swipe already
 * falls back to, so the two ways out of a screen never disagree.
 */
export function backFallbackTarget(routeName: string): "/" | "/super" | "/toto" {
  if (routeName.startsWith("super/")) return "/super";
  if (routeName.startsWith("toto/")) return "/toto";
  return "/";
}
