/**
 * Semantic colour layer.
 *
 * The palette names hues (`green`, `red`, `gold`). Screens name meaning.
 *
 * Without this layer the two most loaded hues each carried several unrelated
 * jobs: `green` was the active tab, the eyebrow and a won decision; `red` was
 * the live pill, a lost decision, a red card and a connection error. A user
 * reading a live list saw the same red for "this match is happening now" and
 * "this decision lost", so the strongest colour on screen carried no direction.
 *
 * Live state now has its own signature and is no longer spelled in loss red.
 * That separation was a single mapping change precisely because every surface
 * had first been migrated to ask by meaning — which is the whole argument for
 * this layer existing.
 *
 * Overlaps that remain are recorded in `semanticCollisions` rather than left to
 * be rediscovered. That list is the design debt this layer exists to pay off.
 */

/** The palette shape this layer needs. Kept structural so it stays testable. */
export interface SemanticPalette {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  borderSoft: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  blue: string;
  blueSoft: string;
  green: string;
  greenSoft: string;
  gold: string;
  goldSoft: string;
  red: string;
  redSoft: string;
  teal: string;
  tealSoft: string;
  violet: string;
  orange: string;
}

export interface SemanticColors {
  /** BTB's analytical accent: the product is thinking or has an opinion. */
  intelligence: string;
  intelligenceSoft: string;
  /** A won decision, a profitable outcome, a positive delta. */
  positive: string;
  positiveSoft: string;
  /** A lost decision, an unprofitable outcome, a negative delta. */
  negative: string;
  negativeSoft: string;
  /**
   * This match is happening right now. Deliberately not a judgement about it,
   * and deliberately not the red that a lost decision uses.
   */
  live: string;
  liveSoft: string;
  /** Something needs attention but nothing has failed. */
  warning: string;
  warningSoft: string;
  /** Retrieved, but older than the freshness threshold. */
  stale: string;
  staleSoft: string;
  /** Not retrievable right now. Distinct from empty and from failed. */
  unavailable: string;
  unavailableSoft: string;
  /**
   * An event that departed from what its cohort would have predicted.
   *
   * Deliberately not the warning amber. Warning means something needs
   * attention; surprise means the match did something unusual, which is
   * information rather than a problem. It spends the palette's reserved violet
   * because the two roles that were near it - the structural bronze a cohort
   * bar uses and the warning amber - are separated from each other by
   * saturation alone, and in the light palette that separation collapses:
   * gold resolves to #8A6410 and bronze to #8A5F2B. A surprise signal drawn
   * next to a cohort bar has to survive that, so it gets its own hue.
   */
  surprise: string;
  /** No signal either way. The absence of an opinion, not a weak one. */
  neutral: string;
}

export function resolveSemanticColors(
  palette: SemanticPalette
): SemanticColors {
  return {
    intelligence: palette.blue,
    intelligenceSoft: palette.blueSoft,
    positive: palette.green,
    positiveSoft: palette.greenSoft,
    negative: palette.red,
    negativeSoft: palette.redSoft,
    live: palette.teal,
    liveSoft: palette.tealSoft,
    warning: palette.gold,
    warningSoft: palette.goldSoft,
    stale: palette.gold,
    staleSoft: palette.goldSoft,
    unavailable: palette.textSubtle,
    unavailableSoft: palette.surfaceStrong,
    surprise: palette.violet,
    neutral: palette.textSubtle
  };
}

export interface SemanticCollision {
  /** The two meanings that currently render identically. */
  roles: readonly [keyof SemanticColors, keyof SemanticColors];
  /** Why they collide and what a user cannot tell apart because of it. */
  note: string;
  /** `true` when resolving it is a visible identity decision for the owner. */
  ownerDecision: boolean;
}

/**
 * Meanings that are still spelled with the same hue.
 *
 * Recorded, not hidden. A collision here is a known cost with a known owner —
 * not a bug to be found again by the next person reading a live match screen.
 */
export const semanticCollisions: readonly SemanticCollision[] = [
  {
    roles: ["stale", "warning"],
    note:
      "Freshness already uses gold and reads correctly as caution. Separating " +
      "them is only worth doing if a surface ever needs both at once.",
    ownerDecision: false
  },
  {
    roles: ["unavailable", "neutral"],
    note:
      "Both resolve to the subtle text tone. Acceptable: an unavailable value " +
      "and an absent one should recede equally, and neither is actionable.",
    ownerDecision: false
  }
];
