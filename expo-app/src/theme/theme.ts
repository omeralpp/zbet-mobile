import * as SecureStore from "expo-secure-store";
import { reloadAppAsync } from "expo";
import {
  parseThemeMode,
  type ThemeMode
} from "./theme-preference";
import { resolveDepth, type DepthLevel, type DepthPalette } from "./elevation";
import { resolveSemanticColors } from "./semantic";
import { syncWidgetTheme } from "@/src/widgets/btb-widget";

export { parseThemeMode, type ThemeMode } from "./theme-preference";
export {
  fontWeights,
  minimumFontSize,
  typeScale,
  type TypeRole,
  type TypeRoleName
} from "./typography";
export {
  durations,
  emphasis,
  gestureSpring,
  motionDuration,
  allowsAmbientMotion
} from "./motion";
export { semanticCollisions, type SemanticColors } from "./semantic";
export { isSingleDepthTreatment, type DepthLevel } from "./elevation";

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
  // BTB's live signature. Chosen for hue distance rather than brightness: pure
  // cyan sits 15-18 degrees from Fiori blue and collapses into it at the size a
  // live dot actually renders, while this aqua-teal holds 28 degrees from blue
  // and 50 from BTB green - the widest worst-case separation available from
  // every meaning it can appear beside. 10.9:1 on the deep navy ground.
  teal: "#3AD9CB",
  tealSoft: "#0E424D",
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
  teal: "#046C7A",
  tealSoft: "#D7EFF2",
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

/**
 * Meaning-level colour names, resolved against the active palette.
 *
 * A screen asks for `semantic.live` rather than `colors.red`. The layer paid for
 * itself immediately: giving live state its own signature was a one-line change
 * here plus the palette entry, instead of a survey of every surface that had
 * spelled "this match is happening" as red.
 */
export const semantic = resolveSemanticColors(colors);

const depthPalette: DepthPalette = {
  border: colors.border,
  borderSoft: colors.borderSoft,
  shadow: colors.black
};

/**
 * Resolves one rung of the depth ladder for the active theme.
 *
 * `accent` applies to `glow` only, and a glow should be given the semantic
 * colour of whatever it is reporting — a live match, a fresh decision — so the
 * edge lighting stays a signal rather than a finish.
 */
export function depth(level: DepthLevel, accent?: string) {
  return resolveDepth(level, depthPalette, themeMode, accent);
}

export const interaction = {
  minTouchTarget: 44,
  preferredTouchTarget: 48,
  contentMaxWidth: 720
} as const;
