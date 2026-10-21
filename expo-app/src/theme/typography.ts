/**
 * BTB Mobile type scale.
 *
 * Before this scale the app carried seventeen hand-placed font sizes and three
 * weights, and hierarchy had quietly collapsed: `900` was applied 94 times,
 * `800` 38 times and `700` 13 times, so almost every string on screen rendered
 * at or near the heaviest weight the font offers. Emphasis then had nowhere to
 * go and had to be recovered through size and colour alone.
 *
 * Three rules keep that from coming back.
 *
 * **Two bundled families, one job each.** Manrope carries every word; Barlow
 * Condensed carries scores, odds and metrics, so a number reads as one shape
 * and a column of them lines up. Both ship inside the app (assets/fonts, OFL),
 * so Android and web render the same letters instead of whatever system face
 * the device happens to have.
 *
 * **Only weights that exist as files.** Each family ships Regular or Medium,
 * Bold and ExtraBold, and nothing else. A requested weight between two faces is
 * resolved to the nearest one, so an off-scale weight is never a real step —
 * it is an existing step spelled differently on each platform.
 *
 * **A floor of 11pt.** Sizes 8, 9 and 10 appeared 66 times. At Android font
 * scale 0.85 an 8pt label is under 7pt of rendered text, which is below what a
 * live match surface can ask a user to read at arm's length.
 *
 * Roles are named for what they carry in a football terminal, not for how big
 * they are, so a later retune changes one entry instead of every screen.
 */
import { fontFamilies } from "./font-families";

export { fontFamilies } from "./font-families";

export type FontWeight = "400" | "500" | "700" | "800";

export const fontWeights = {
  regular: "400",
  medium: "500",
  bold: "700",
  heavy: "800"
} as const satisfies Record<string, FontWeight>;

/** Smallest size any BTB surface may render. See the module note. */
export const minimumFontSize = 11;

/** Weights the bundled families resolve to a distinct face. */
export const renderableWeights: readonly FontWeight[] = [
  "400",
  "500",
  "700",
  "800"
];

export interface TypeRole {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing: number;
  textTransform?: "uppercase";
}

/**
 * Text style for a string that does not fit a role: the family is never left
 * to the platform default, whatever size the caller needs.
 */
export function textFont(
  fontWeight: FontWeight = fontWeights.regular
): Pick<TypeRole, "fontFamily" | "fontWeight"> {
  return { fontFamily: fontFamilies.text, fontWeight };
}

/** Numeric twin of `textFont`: Barlow Condensed with tabular figures. */
export function numericFont(fontWeight: FontWeight = fontWeights.bold) {
  return {
    fontFamily: fontFamilies.numeric,
    fontWeight,
    fontVariant: ["tabular-nums"] as ["tabular-nums"]
  };
}

/**
 * The scale.
 *
 * Numerics (`display`, `score`, `metric`, `metricCompact`) are Barlow
 * Condensed. The face is already narrow, so only the hero score tightens; the
 * sizes are a step larger than the old system-font numerals because a
 * condensed figure carries less ink at the same size. Prose stays at
 * `400`/`500`, which is what gives the heavy roles something to be heavy
 * against.
 */
export const typeScale = {
  /** Hero match score on Match Detail. The largest thing in the product. */
  display: {
    fontFamily: fontFamilies.numeric,
    fontSize: 52,
    lineHeight: 56,
    fontWeight: fontWeights.heavy,
    letterSpacing: -1
  },
  /** Score inside a list card, where two lines must stay on one card row. */
  score: {
    fontFamily: fontFamilies.numeric,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: fontWeights.heavy,
    letterSpacing: 0
  },
  /** `Screen` title. One per screen. */
  pageTitle: {
    fontFamily: fontFamilies.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.6
  },
  /** Module and section heading inside a screen. */
  moduleTitle: {
    fontFamily: fontFamilies.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.2
  },
  /** What BTB selected. The sentence the whole product exists to show. */
  decision: {
    fontFamily: fontFamilies.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.1
  },
  /** Team name on a detail surface. */
  identity: {
    fontFamily: fontFamilies.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: fontWeights.medium,
    letterSpacing: 0
  },
  /** Team name in a list row, where long Turkish club names must still fit. */
  identityCompact: {
    fontFamily: fontFamilies.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: fontWeights.medium,
    letterSpacing: 0
  },
  /** Primary metric value — odds, rating, profit. */
  metric: {
    fontFamily: fontFamilies.numeric,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: 0
  },
  /** Metric value in a dense three-column rhythm. */
  metricCompact: {
    fontFamily: fontFamilies.numeric,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: fontWeights.bold,
    letterSpacing: 0
  },
  /** Supporting copy and explanations. */
  body: {
    fontFamily: fontFamilies.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeights.regular,
    letterSpacing: 0
  },
  /** Supporting copy inside a card that cannot grow. */
  bodyCompact: {
    fontFamily: fontFamilies.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: fontWeights.regular,
    letterSpacing: 0
  },
  /** The word under a metric value. */
  label: {
    fontFamily: fontFamilies.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.3
  },
  /** Tracked uppercase kicker above a title. Carries BTB's voice. */
  eyebrow: {
    fontFamily: fontFamilies.text,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeights.heavy,
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  /** League, kickoff time, timestamp. */
  meta: {
    fontFamily: fontFamilies.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.2
  },
  /** Compact metadata: badge counts, pill text. Sits on the floor. */
  micro: {
    fontFamily: fontFamilies.text,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.4
  }
} as const satisfies Record<string, TypeRole>;

export type TypeRoleName = keyof typeof typeScale;

/**
 * Reports whether a line box leaves enough room for its glyphs.
 *
 * Turkish sets `ğ İ ş Ç` and the app renders scores next to them, so a line
 * height that is merely equal to the font size clips descenders and dotted
 * capitals on Android. `1.05` is the tightest ratio that survived the display
 * and score roles, which deliberately run tighter than prose.
 */
export function hasReadableLineBox(role: TypeRole): boolean {
  return role.lineHeight >= role.fontSize * 1.05;
}
