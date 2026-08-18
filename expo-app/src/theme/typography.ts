/**
 * BTB Mobile type scale.
 *
 * Before this scale the app carried seventeen hand-placed font sizes and three
 * weights, and hierarchy had quietly collapsed: `900` was applied 94 times,
 * `800` 38 times and `700` 13 times, so almost every string on screen rendered
 * at or near the heaviest weight the font offers. Emphasis then had nowhere to
 * go and had to be recovered through size and colour alone.
 *
 * Two rules keep that from coming back.
 *
 * **Only weights Android actually renders.** The default Android family ships
 * Regular(400), Medium(500), Bold(700) and Black(900). A requested `800` is
 * resolved to the nearest available face, so `800` and `900` were never two
 * steps — they were one step spelled two ways. This scale uses the four real
 * faces and nothing else.
 *
 * **A floor of 11pt.** Sizes 8, 9 and 10 appeared 66 times. At Android font
 * scale 0.85 an 8pt label is under 7pt of rendered text, which is below what a
 * live match surface can ask a user to read at arm's length.
 *
 * Roles are named for what they carry in a football terminal, not for how big
 * they are, so a later retune changes one entry instead of every screen.
 */

export type FontWeight = "400" | "500" | "700" | "900";

export const fontWeights = {
  regular: "400",
  medium: "500",
  bold: "700",
  black: "900"
} as const satisfies Record<string, FontWeight>;

/** Smallest size any BTB surface may render. See the module note. */
export const minimumFontSize = 11;

/** Weights the Android system family resolves to a distinct face. */
export const renderableWeights: readonly FontWeight[] = [
  "400",
  "500",
  "700",
  "900"
];

export interface TypeRole {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing: number;
  textTransform?: "uppercase";
}

/**
 * The scale.
 *
 * Numerics (`display`, `score`, `metric`, `metricCompact`) stay at `900` with
 * negative tracking: a score is read as a shape, and tightening it is what makes
 * it read as one value instead of two digits and a separator. Prose drops to
 * `400`/`500`, which is the change that gives the heavy roles something to be
 * heavy against.
 */
export const typeScale = {
  /** Hero match score on Match Detail. The largest thing in the product. */
  display: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: fontWeights.black,
    letterSpacing: -1.2
  },
  /** Score inside a list card, where two lines must stay on one card row. */
  score: {
    fontSize: 27,
    lineHeight: 30,
    fontWeight: fontWeights.black,
    letterSpacing: -0.8
  },
  /** `Screen` title. One per screen. */
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: fontWeights.black,
    letterSpacing: -0.6
  },
  /** Module and section heading inside a screen. */
  moduleTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.2
  },
  /** What BTB selected. The sentence the whole product exists to show. */
  decision: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.1
  },
  /** Team name on a detail surface. */
  identity: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: fontWeights.medium,
    letterSpacing: 0
  },
  /** Team name in a list row, where long Turkish club names must still fit. */
  identityCompact: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: fontWeights.medium,
    letterSpacing: 0
  },
  /** Primary metric value — odds, rating, profit. */
  metric: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: fontWeights.black,
    letterSpacing: -0.3
  },
  /** Metric value in a dense three-column rhythm. */
  metricCompact: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: fontWeights.black,
    letterSpacing: -0.2
  },
  /** Supporting copy and explanations. */
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    letterSpacing: 0
  },
  /** Supporting copy inside a card that cannot grow. */
  bodyCompact: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: fontWeights.regular,
    letterSpacing: 0
  },
  /** The word under a metric value. */
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.3
  },
  /** Tracked uppercase kicker above a title. Carries BTB's voice. */
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: fontWeights.black,
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  /** League, kickoff time, timestamp. */
  meta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.2
  },
  /** Compact metadata: badge counts, pill text. Sits on the floor. */
  micro: {
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
