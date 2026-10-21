import { useCallback, useState } from "react";

/**
 * The desktop sidebar's open/rail choice.
 *
 * Until the user chooses, the window decides: open from 1200 px, a 76 px rail
 * from 768 px. Once the edge handle is used the choice is kept on this device
 * and wins at every width, so a user who prefers the rail is not handed the
 * open sidebar again on a wider window.
 */
export type SidebarPreference = "expanded" | "collapsed";

export const sidebarPreferenceKey = "btb-desktop-sidebar-v1";

export function parseSidebarPreference(value: string | null | undefined): SidebarPreference | null {
  return value === "expanded" || value === "collapsed" ? value : null;
}

export function resolveSidebarExpanded(preference: SidebarPreference | null, wide: boolean): boolean {
  return preference === null ? wide : preference === "expanded";
}

function readPreference(): SidebarPreference | null {
  try {
    return parseSidebarPreference(globalThis.localStorage?.getItem(sidebarPreferenceKey));
  } catch {
    return null;
  }
}

function writePreference(value: SidebarPreference): void {
  try {
    globalThis.localStorage?.setItem(sidebarPreferenceKey, value);
  } catch {
    // Storage can be blocked; the choice then lasts for this page only.
  }
}

export function useSidebarPreference(wide: boolean) {
  const [preference, setPreference] = useState<SidebarPreference | null>(readPreference);
  const expanded = resolveSidebarExpanded(preference, wide);
  const toggle = useCallback(() => {
    const next: SidebarPreference = expanded ? "collapsed" : "expanded";
    setPreference(next);
    writePreference(next);
  }, [expanded]);
  return { expanded, toggle };
}
