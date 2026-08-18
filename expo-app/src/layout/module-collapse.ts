import {
  moduleReorderActivationDelayMs,
  moduleReorderActivationSlop,
  type ModuleLayoutSurface
} from "./module-layout";

/**
 * Storage key for one surface's collapse preference.
 *
 * Deliberately a different key from the surface's order, because these are two
 * independent preferences about the same modules: a user who arranged a stack
 * and then shut two panels has expressed two things, and collapsing a module
 * must never be able to disturb where it sits.
 *
 * The stored payload is a list of stable module ids. Nothing user-visible is
 * persisted, so retitling a module in a later release cannot silently strand or
 * re-target a preference.
 */
export function moduleCollapseStorageKey(surface: ModuleLayoutSurface): string {
  return `btb-mobile-next-module-collapse-${surface}-v1`;
}

/**
 * Reconciles a persisted collapse preference against a surface's modules.
 *
 * The stored value is the *collapsed* set rather than the expanded one, and
 * that choice carries the whole migration: a module absent from storage is
 * open, so the first build that ships panels finds nothing stored and opens
 * everything, and every module shipped after it arrives open too. Storing the
 * expanded set would invert both — an existing install would upgrade into a
 * screen with every module shut, and a module introduced later would be hidden
 * by a preference written before it existed.
 *
 * This is the same invariant `reconcileModuleOrder` holds for order: a stored
 * preference may rearrange what the product shows, never conceal something the
 * user has not had the chance to see.
 *
 * Ids the surface no longer publishes are dropped, exactly as a retired module
 * is dropped from a stored order, so a removed module cannot come back as a
 * collapsed ghost if its id is ever reused.
 */
export function reconcileCollapsedModules(
  stored: unknown,
  canonicalIds: readonly string[]
): string[] {
  if (!Array.isArray(stored)) {
    // Unset, or corrupted beyond parsing. Either way the safe reading is that
    // the user has closed nothing.
    return [];
  }
  const known = new Set(canonicalIds);
  const seen = new Set<string>();
  const collapsed: string[] = [];
  for (const entry of stored) {
    if (typeof entry !== "string" || !known.has(entry) || seen.has(entry)) {
      continue;
    }
    seen.add(entry);
    collapsed.push(entry);
  }
  return collapsed;
}

/** Opens a collapsed module, or closes an open one. */
export function toggleCollapsedModule(
  collapsed: readonly string[],
  id: string
): string[] {
  return collapsed.includes(id)
    ? collapsed.filter((entry) => entry !== id)
    : [...collapsed, id];
}

/** A finished press on a panel header, in page coordinates. */
export interface PanelPressGesture {
  startedAt: number;
  endedAt: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Decides whether a finished press on a panel header is a real toggle.
 *
 * A panel header sits inside three gestures that are not its own: the vertical
 * scroll of the screen, the horizontal swipe between main tabs, and the
 * long-press that lifts the module for reordering. Without this guard the
 * header would fire on the release of any of them, and a user flicking past a
 * module would arrive somewhere else to find it shut.
 *
 * The duration bound is the reorder's own activation delay rather than a second
 * tuned number: past it the list has already lifted the module, so a toggle on
 * release would fire together with a drag that happened to end where it began.
 */
export function shouldTogglePanel(gesture: PanelPressGesture): boolean {
  if (gesture.endedAt - gesture.startedAt >= moduleReorderActivationDelayMs) {
    return false;
  }
  return (
    Math.abs(gesture.endX - gesture.startX) <= moduleReorderActivationSlop &&
    Math.abs(gesture.endY - gesture.startY) <= moduleReorderActivationSlop
  );
}
