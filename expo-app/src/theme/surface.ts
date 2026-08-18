/**
 * Intelligence Noir — BTB's content-surface language.
 *
 * The shell stays deliberately quiet. Depth, material and energy live inside
 * content surfaces instead, because a card is where a user is actually reading
 * and it is the only place the extra richness buys anything.
 *
 * Three ideas, and a limit on each:
 *
 * **Layered ink.** A card is a vertical gradient rather than a flat fill, lit
 * from the top edge and sinking at the bottom. That reads as material with a
 * light source instead of a rectangle of paint, and it separates card from page
 * far better than a one-step colour difference can.
 *
 * **A luminous edge trace.** A hairline along the top edge that fades out before
 * it reaches the far corner. The fade is the whole point: a trace that ran the
 * full width would be a border, and a lit border on every card is the neon
 * failure this language exists to avoid. `traceWidthRatio` enforces it.
 *
 * **Restrained energy.** The trace carries a semantic colour only when the
 * surface has something to report — a live match. Everything else gets a barely
 * present cool highlight. The ordinary surface has to stay calm, or the live
 * card has nothing to be brighter *than*.
 *
 * Bronze is structural, never semantic. It marks a premium surface — the brand
 * hero — and never stands in for positive, warning, live or rating. It is safe
 * beside the rating gold because it is separated by saturation rather than hue:
 * roughly half as saturated, so it reads as metal rather than as a signal.
 */

export type ThemeName = "dark" | "light";

/**
 * Card material, top stop first.
 *
 * The dark pair straddles the old flat surface, lifting the top and letting the
 * bottom settle. A first attempt sank the bottom much further, which looked
 * better in isolation and was wrong on a screen: at 1.04 against the page the
 * lower edge of a card stopped being readable as an edge, so cards dissolved
 * downward into the background. Depth that costs the boundary of the surface is
 * not depth, it is fog. These stops keep every edge at least as separated as the
 * flat fill was, and lift the top well past it.
 */
export const surfaceGradients = {
  dark: ["#0E2740", "#0A1E31"],
  light: ["#FFFFFF", "#F6FAFC"]
} as const satisfies Record<ThemeName, readonly [string, string]>;

/** Page ground each material sits on, used to check edge readability. */
export const pageBackgrounds = {
  dark: "#04101E",
  light: "#F3F7FA"
} as const satisfies Record<ThemeName, string>;

/**
 * How far the edge trace may travel across the top of a surface.
 *
 * Strictly below 1. This is the rule that keeps a trace from becoming a border,
 * which is the line between "lit edge" and "neon outline".
 */
export const traceWidthRatio = 0.55;

/** Opacity per trace kind. An inert surface is barely lit at all. */
export const traceOpacity = {
  inert: 0.3,
  accent: 0.95
} as const;

export function resolveSurfaceGradient(
  mode: ThemeName
): readonly [string, string] {
  return surfaceGradients[mode];
}

export interface EdgeTrace {
  /** Gradient stops: the colour, then the same colour fully transparent. */
  colors: readonly [string, string];
  opacity: number;
  /** Fraction of the surface width the trace spans. */
  widthRatio: number;
}

/**
 * Builds the trace for a surface.
 *
 * `accent` is the semantic colour of whatever the surface is reporting. Without
 * one the surface is inert and gets the neutral highlight — never an invented
 * colour, and never the full accent opacity.
 */
export function resolveEdgeTrace(
  accent: string | undefined,
  neutral: string
): EdgeTrace {
  const colour = accent ?? neutral;
  return {
    colors: [colour, `${colour}00`],
    opacity: accent ? traceOpacity.accent : traceOpacity.inert,
    widthRatio: traceWidthRatio
  };
}

function channelLuminance(channel: number): number {
  const ratio = channel / 255;
  return ratio <= 0.03928
    ? ratio / 12.92
    : Math.pow((ratio + 0.055) / 1.055, 2.4);
}

/** Relative luminance of a `#rrggbb` colour. */
export function relativeLuminance(colour: string): number {
  const value = colour.replace("#", "");
  const [red, green, blue] = [0, 2, 4].map((offset) =>
    channelLuminance(parseInt(value.slice(offset, offset + 2), 16))
  ) as [number, number, number];
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Contrast ratio between two `#rrggbb` colours. */
export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [
    relativeLuminance(first),
    relativeLuminance(second)
  ].sort((a, b) => b - a) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Reports whether a card's edges still read against the page.
 *
 * Both stops are checked, because the failure mode is one-sided: a gradient can
 * lift its top edge convincingly while quietly sinking its bottom edge into the
 * background. `minimum` is the separation the flat fill had, so the material is
 * only allowed to add depth, never to trade the surface's boundary for it.
 */
export function keepsCardEdgeReadable(
  gradient: readonly [string, string],
  pageBackground: string,
  minimum: number
): boolean {
  return gradient.every(
    (stop) => contrastRatio(stop, pageBackground) >= minimum
  );
}

/**
 * Reports whether a set of surfaces respects the restraint the language needs.
 *
 * If most cards on a screen are lit, none of them is. The threshold is
 * deliberately strict: energy is meant to be the exception that marks the few
 * surfaces worth looking at first.
 */
export function keepsEnergyScarce(
  accentedSurfaces: number,
  totalSurfaces: number
): boolean {
  if (totalSurfaces <= 0) {
    return true;
  }
  return accentedSurfaces / totalSurfaces <= 0.5;
}
