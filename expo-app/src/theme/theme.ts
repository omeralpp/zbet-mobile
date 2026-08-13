import * as SecureStore from "expo-secure-store";
import { reloadAppAsync } from "expo";
import {
  parseThemeMode,
  type ThemeMode
} from "./theme-preference";
import { syncWidgetTheme } from "@/src/widgets/btb-widget";

export { parseThemeMode, type ThemeMode } from "./theme-preference";

export const themeStorageKey = "btb-mobile-next-theme-v1";

const darkColors = {
  background: "#04101E",
  backgroundElevated: "#071726",
  surface: "#0A1D31",
  surfaceStrong: "#102A43",
  border: "#173B59",
  borderSoft: "#102E48",
  text: "#F4F8FC",
  textMuted: "#94A9BC",
  textSubtle: "#6E879D",
  blue: "#1597E5",
  blueSoft: "#0F5F91",
  green: "#62E66D",
  greenSoft: "#174A32",
  gold: "#F5C542",
  goldSoft: "#4A3C12",
  red: "#FF6573",
  redSoft: "#4D2028",
  orange: "#FF9A55",
  white: "#FFFFFF",
  black: "#000000"
} as const;

export type ThemeColors = { [Key in keyof typeof darkColors]: string };

const lightColors: ThemeColors = {
  background: "#F3F7FA",
  backgroundElevated: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceStrong: "#E7F0F6",
  border: "#B9CFDD",
  borderSoft: "#D5E2EA",
  text: "#102538",
  textMuted: "#4D6577",
  textSubtle: "#6C8190",
  blue: "#087FC1",
  blueSoft: "#0F6FA6",
  green: "#198A43",
  greenSoft: "#DDF4E5",
  gold: "#9B7200",
  goldSoft: "#F8EDC8",
  red: "#C93F51",
  redSoft: "#F8DDE1",
  orange: "#C86521",
  white: "#FFFFFF",
  black: "#000000"
} as const;

function readStoredThemeMode(): ThemeMode {
  const previewMode = process.env.EXPO_PUBLIC_THEME_MODE;
  if (previewMode === "light" || previewMode === "dark") {
    return previewMode;
  }
  if (typeof localStorage !== "undefined") {
    return parseThemeMode(localStorage.getItem(themeStorageKey));
  }
  try {
    return parseThemeMode(SecureStore.getItem(themeStorageKey));
  } catch {
    return "dark";
  }
}

export const themeMode = readStoredThemeMode();
export const colors: ThemeColors =
  themeMode === "light" ? lightColors : darkColors;

export async function applyThemeMode(mode: ThemeMode): Promise<void> {
  if (mode === themeMode) {
    await syncWidgetTheme(mode);
    return;
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(themeStorageKey, mode);
  } else {
    SecureStore.setItem(themeStorageKey, mode);
  }
  await syncWidgetTheme(mode);
  await reloadAppAsync("BTB Mobile tema tercihi değişti");
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  round: 999
} as const;

export const shadows = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: themeMode === "light" ? 0.1 : 0.2,
    shadowRadius: 18,
    elevation: 4
  }
} as const;

export const interaction = {
  minTouchTarget: 44,
  preferredTouchTarget: 48,
  contentMaxWidth: 720
} as const;
