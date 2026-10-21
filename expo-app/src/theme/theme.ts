import * as SecureStore from "expo-secure-store";
import { reloadAppAsync } from "expo";
import {
  parseThemeMode,
  type ThemeMode
} from "./theme-preference";
import { resolveDepth, type DepthLevel, type DepthPalette } from "./elevation";
import { resolveSurfaceGradient } from "./surface";
import { resolveSemanticColors } from "./semantic";
import { accessibleColors } from "./accessible-colors";
import { experiencePalettes } from "./experience-palette";
import { syncWidgetTheme } from "@/src/widgets/btb-widget";

export { parseThemeMode, type ThemeMode } from "./theme-preference";
export {
  fontFamilies,
  fontWeights,
  minimumFontSize,
  numericFont,
  textFont,
  typeScale,
  type TypeRole,
  type TypeRoleName
} from "./typography";
export {
  durations,
  emphasis,
  gestureSpring,
  motionDuration,
  allowsAmbientMotion,
  type EmphasisName
} from "./motion";
export { semanticCollisions, type SemanticColors } from "./semantic";
export { isSingleDepthTreatment, type DepthLevel } from "./elevation";
export {
  keepsEnergyScarce,
  resolveEdgeTrace,
  traceWidthRatio
} from "./surface";

export const themeStorageKey = "btb-mobile-next-theme-v1";

const darkBase = experiencePalettes.dark;
const lightBase = experiencePalettes.light;
const darkColors = {
  background: darkBase.background,
  backgroundElevated: darkBase.surface,
  surface: darkBase.surface,
  surfaceStrong: darkBase.soft,
  border: darkBase.border,
  borderSoft: darkBase.border,
  text: darkBase.text,
  textMuted: darkBase.muted,
  ...accessibleColors.dark,
  blue: darkBase.blue,
  blueSoft: "#123A5C",
  green: "#4ADE80",
  greenSoft: darkBase.accentSoft,
  gold: darkBase.warning,
  goldSoft: darkBase.warningSoft,
  red: "#FF5C70",
  redSoft: "#47202A",
  teal: "#2EE6D6",
  tealSoft: "#0C4249",
  bronze: "#E0AE62",
  violet: "#B394FF",
  orange: "#FF9F4A",
  white: "#FFFFFF",
  black: "#000000"
} as const;

export type ThemeColors = { [Key in keyof typeof darkColors]: string };

const lightColors: ThemeColors = {
  background: lightBase.background,
  backgroundElevated: lightBase.surface,
  surface: lightBase.surface,
  surfaceStrong: lightBase.soft,
  border: lightBase.border,
  borderSoft: lightBase.border,
  text: lightBase.text,
  textMuted: lightBase.muted,
  ...accessibleColors.light,
  blue: lightBase.blue,
  blueSoft: "#DCE8F7",
  green: "#0E7C47",
  greenSoft: lightBase.accentSoft,
  gold: lightBase.warning,
  goldSoft: lightBase.warningSoft,
  red: "#BE2843",
  // #F9D9DF left red text at 4.48:1, just under the reading floor.
  redSoft: "#FADEE3",
  teal: "#036E74",
  tealSoft: "#D6EEEC",
  bronze: "#7A5B30",
  violet: "#5F3DA6",
  orange: "#924A14",
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

/**
 * Visual icon sizes, separate from the larger interactive target around them.
 * Keeping these on one small scale prevents dense rows from feeling heavy and
 * stops supporting status marks from becoming too small to identify quickly.
 */
export const iconSizes = {
  micro: 14,
  small: 16,
  inline: 18,
  control: 20,
  navigation: 24,
  state: 30,
  hero: 40
} as const;

export const shadows = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: themeMode === "light" ? 0.04 : 0.1,
    shadowRadius: 8,
    elevation: 1
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

/** Intelligence Noir card material for the active theme, top stop first. */
export const surfaceGradient = resolveSurfaceGradient(themeMode);

export const interaction = {
  minTouchTarget: 44,
  preferredTouchTarget: 48,
  contentMaxWidth: 720
} as const;
