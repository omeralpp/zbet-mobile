import * as SystemUI from "expo-system-ui";
import { Appearance } from "react-native";
import { syncWidgetTheme } from "@/src/widgets/btb-widget";
import type { ThemeMode } from "./theme-preference";

/**
 * Pushes the active theme to the platform chrome: the native appearance, the
 * root background behind every screen, and the Android widgets. The web build
 * has its own twin (system-theme.web.ts) for the document instead.
 */
export function applySystemTheme(mode: ThemeMode, background: string): void {
  Appearance.setColorScheme(mode);
  SystemUI.setBackgroundColorAsync(background).catch(() => undefined);
  syncWidgetTheme(mode).catch(() => undefined);
}
