/**
 * Depth vocabulary.
 *
 * The app had exactly one depth treatment — a single card shadow — so every
 * surface sat at the same distance from the background and "premium" had no
 * substrate to work with. The temptation when adding depth is to reach for
 * border *and* shadow *and* gradient *and* glow on the same card, which is how
 * a futuristic interface turns into a noisy one.
 *
 * So depth is a ladder with one rung per surface, never a stack:
 *
 * - `flat`     structure only. Grouping that must not compete for attention.
 * - `raised`   the default card. Border plus a soft shadow.
 * - `floating` menus, modals, the Bibi overlay. Detached from the page.
 * - `glow`     reserved. Edge lighting that means something is live or decided.
 *
 * `glow` is the only rung that carries meaning rather than hierarchy, which is
 * why it is the only one that takes a colour and the only one a surface has to
 * earn. Restraint here is what keeps the cyberpunk influence legible: if every
 * container glows, the glow stops saying anything.
 */

export type DepthLevel = "flat" | "raised" | "floating" | "glow";

export interface ShadowGeometry {
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * Shadow geometry per level, before a colour is applied.
 *
 * Opacity is expressed per theme because a dark surface needs a heavier shadow
 * to read at all, while the same value on a light surface looks like grime.
 */
export const shadowGeometry = {
  raised: {
    dark: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 18,
      elevation: 4
    },
    light: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 18,
      elevation: 4
    }
  },
  floating: {
    dark: {
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.38,
      shadowRadius: 28,
      elevation: 12
    },
    light: {
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.18,
      shadowRadius: 28,
      elevation: 12
    }
  },
  /** Tight and close: edge lighting, not a drop shadow cast by the card. */
  glow: {
    dark: {
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.55,
      shadowRadius: 12,
      elevation: 6
    },
    light: {
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6
    }
  }
} as const satisfies Record<string, Record<"dark" | "light", ShadowGeometry>>;

export interface DepthStyle {
  borderWidth: number;
  borderColor: string;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

export interface DepthPalette {
  border: string;
  borderSoft: string;
  shadow: string;
}

/**
 * Resolves one rung of the ladder.
 *
 * `accent` is required by `glow` and ignored by every other level: a glow with
 * no meaning attached is decoration, and the signature is what makes it signal.
 */
export function resolveDepth(
  level: DepthLevel,
  palette: DepthPalette,
  mode: "dark" | "light",
  accent?: string
): DepthStyle {
  if (level === "flat") {
    return { borderWidth: 1, borderColor: palette.borderSoft };
  }
  if (level === "glow") {
    const geometry = shadowGeometry.glow[mode];
    const edge = accent ?? palette.border;
    return { borderWidth: 1, borderColor: edge, shadowColor: edge, ...geometry };
  }
  const geometry = shadowGeometry[level][mode];
  return {
    borderWidth: 1,
    borderColor: level === "floating" ? palette.border : palette.borderSoft,
    shadowColor: palette.shadow,
    ...geometry
  };
}

/**
 * Guards the one rule this ladder exists to enforce.
 *
 * A surface picks a rung. Combining a drop shadow with edge lighting produces
 * the muddy double-halo that reads as an accident rather than as depth, and it
 * is the specific failure mode that turns "futuristic" into "noisy".
 */
export function isSingleDepthTreatment(levels: readonly DepthLevel[]): boolean {
  return levels.length <= 1;
}
