import type { JinxMotionMode } from "./jinx-motion";

export type JinxPreferences = { mode: JinxMotionMode; hidden: boolean };
export const defaultJinxPreferences: JinxPreferences = { mode: "LIVE", hidden: false };
export const jinxPreferencesKey = "btb-mobile-next-jinx-preferences-v1";

export function parseJinxPreferences(stored: string | null): JinxPreferences {
  if (!stored) return { ...defaultJinxPreferences };
  try {
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== "object") return { ...defaultJinxPreferences };
    const mode = "mode" in value ? value.mode : null;
    return { mode: mode === "CALM" || mode === "OFF" || mode === "LIVE" ? mode : "LIVE", hidden: "hidden" in value && value.hidden === true };
  } catch { return { ...defaultJinxPreferences }; }
}
