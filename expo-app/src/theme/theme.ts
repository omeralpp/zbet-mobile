import * as SecureStore from "expo-secure-store";
import { reloadAppAsync } from "expo";
import {
  parseThemeMode,
  type ThemeMode
} from "./theme-preference";
import { resolveDepth, type DepthLevel, type DepthPalette } from "./elevation";
import { resolveSurfaceGradient } from "./surface";
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

const darkColors = {
  // Deep ink. The old ground was a navy that read as "dark blue UI"; this one
  // reads as unlit space, which is what lets a single teal trace look like
  // energy rather than like another colour on a coloured background.
  background: "#030B16",
  backgroundElevated: "#06101D",
  surface: "#143552",
  surfaceStrong: "#16324D",
  border: "#1E4468",
  borderSoft: "#14304A",
  text: "#F2F7FC",
  textMuted: "#9AB0C4",
  textSubtle: "#6F8AA3",
  // Intelligence moved deeper and more saturated, away from the live teal
  // rather than toward it. Two technological accents only read as two if they
  // are far enough apart at the size a dot renders.
  blue: "#2E86F0",
  blueSoft: "#10375F",
  // Positive is jade rather than mint. A literal emerald sat 17 degrees from
  // the live aqua and the two collapsed into each other; this holds 33, which
  // is the widest worst-case separation this set can carry.
  green: "#4ADE80",
  greenSoft: "#10402A",
  // Warning is deliberately unchanged. It already reads as amber, and moving it
  // further warm would have closed the gap to the structural bronze for a
  // difference of three degrees.
  gold: "#F5C542",
  goldSoft: "#4A3C12",
  // Crimson rather than coral: deeper, less sugary, and still unmistakably the
  // colour of a lost decision and a red card.
  red: "#FA4E67",
  redSoft: "#4A1A26",
  // BTB's live signature, brightened slightly against the deeper ground.
  teal: "#3FE0D2",
  tealSoft: "#0E4650",
  // Structural metal, never a signal. Separated from the warning amber by
  // saturation and luminance rather than by hue.
  bronze: "#B08046",
  // Reserved emphasis. Deliberately unused: violet earns its rarity by not
  // appearing until something genuinely warrants it.
  violet: "#A78BFA",
  orange: "#FF9A55",
  white: "#FFFFFF",
  black: "#000000"
} as const;

export type ThemeColors = { [Key in keyof typeof darkColors]: string };

const lightColors: ThemeColors = {
  // Light is not the dark theme inverted. The ground is a warm off-white and
  // the surfaces above it are cool, so depth comes from temperature rather than
  // from another step of grey. Warm paper, cool instrument.
  background: "#F0EBE4",
  backgroundElevated: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceStrong: "#E9EFF5",
  border: "#CBD8E2",
  borderSoft: "#DFE7EE",
  text: "#0B1B2E",
  textMuted: "#4A5F73",
  textSubtle: "#5C7186",
  blue: "#1663C9",
  blueSoft: "#12539F",
  green: "#0F7A4A",
  greenSoft: "#D9F0E3",
  gold: "#8A6410",
  goldSoft: "#F6EBCB",
  red: "#C1304A",
  redSoft: "#F8DCE1",
  teal: "#04707F",
  tealSoft: "#D3EDF0",
  bronze: "#8A5F2B",
  violet: "#6D4AC4",
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

/** Intelligence Noir card material for the active theme, top stop first. */
export const surfaceGradient = resolveSurfaceGradient(themeMode);

export const interaction = {
  minTouchTarget: 44,
  preferredTouchTarget: 48,
  contentMaxWidth: 720
} as const;
