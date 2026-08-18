/**
 * How the Super model summary is allowed to describe itself.
 *
 * Two errors were shipped and are corrected here, both of them about claiming
 * more than the backend actually says.
 *
 * **The probability lift was not a lift.** The UI drew `baseProbability` →
 * `superProbability` as movement, implying BTB had raised the probability. In
 * the current implementation `superProbability` is mapped from
 * `super_current_rate`, computed as `(rate_won_super / rate_total) * 100` — the
 * same kind of quantity as the base probability, measured against the current
 * score distribution rather than a different model output. Drawing an arrow
 * between them invents a claim, and the two are frequently identical, which is
 * how it surfaced in physical use as `%60 → %60`.
 *
 * **The contributors are not summands.** The real score is a weighted linear
 * combination with an intercept:
 *
 * ```
 * final_score = intercept
 *             + edge          * w_edge
 *             + pressure      * w_pressure
 *             + state         * w_state
 *             + compatibility * w_compat
 *             + alignment     * w_align
 *             + redPenalty    * w_red
 * ```
 *
 * Base probability is not a term in it. The weights differ by market. There is
 * an intercept the UI never shows, a red-market penalty term it never shows,
 * and a second code path that derives the score from EV entirely differently.
 * So the contributors may be listed as influences and never as a sum: any
 * layout implying `a + b + c = model score` would be arithmetic the backend
 * does not perform.
 */

/** A field the summary is allowed to present, with its role. */
export type ModelFieldRole =
  /** Shown as its own quantity, not as a step toward anything else. */
  | "STANDALONE"
  /** Feeds the score through a weight; listed as an influence only. */
  | "WEIGHTED_INPUT"
  /** The model's own output. */
  | "OUTPUT";

export interface ModelField {
  id: string;
  label: string;
  role: ModelFieldRole;
}

/**
 * Fields the headline summary presents.
 *
 * `temel olasılık` stands alone deliberately: it is real and worth showing, but
 * it does not flow into the score, so it must not be drawn as the first step of
 * a pipeline.
 */
export const headlineFields: readonly ModelField[] = [
  { id: "baseProbability", label: "temel olasılık", role: "STANDALONE" },
  { id: "modelScore", label: "model skoru", role: "OUTPUT" },
  { id: "edgeScore", label: "edge", role: "WEIGHTED_INPUT" }
];

/**
 * Fields behind the disclosure.
 *
 * Presented under `MODEL GİRDİLERİ` — inputs, not terms. Each of these reaches
 * the score multiplied by a market-dependent weight.
 */
export const contributorFields: readonly ModelField[] = [
  { id: "pressureAdjustment", label: "baskı etkisi", role: "WEIGHTED_INPUT" },
  { id: "stateAdjustment", label: "durum etkisi", role: "WEIGHTED_INPUT" },
  { id: "compatibilityScore", label: "uyumluluk", role: "WEIGHTED_INPUT" },
  { id: "alignmentScore", label: "hizalama", role: "WEIGHTED_INPUT" }
];

/**
 * Fields the summary must never present, with the reason.
 *
 * Kept as data rather than as a comment so the prohibition is testable and
 * survives someone re-adding a field without reading this file.
 */
export const forbiddenFields: readonly { id: string; reason: string }[] = [
  {
    id: "superProbability",
    reason:
      "Mapped from super_current_rate, the same kind of quantity as the base " +
      "probability rather than a second model output. Presenting the pair as a " +
      "lift claims a change the model did not make."
  }
];

/** Whether a field may appear anywhere in the user-facing model summary. */
export function isPresentable(fieldId: string): boolean {
  return !forbiddenFields.some((field) => field.id === fieldId);
}

/**
 * Whether a set of fields may be drawn as an arithmetic sum.
 *
 * Always false. The relationship exists but is weighted, carries an intercept
 * and includes terms the UI does not show, so no subset of displayed fields
 * adds up to the score.
 */
export function canPresentAsSum(): boolean {
  return false;
}

export interface ModelValues {
  baseProbability: number | null;
  modelScore: number | null;
  edgeScore: number;
}

/**
 * Reads a headline value off a decision.
 *
 * Typed structurally rather than against a schema variant so the rule this file
 * encodes cannot drift when the list and detail schemas diverge.
 */
export function readModelValue(
  log: ModelValues,
  fieldId: string
): number | null {
  if (fieldId === "baseProbability") {
    return log.baseProbability;
  }
  if (fieldId === "modelScore") {
    return log.modelScore;
  }
  if (fieldId === "edgeScore") {
    return log.edgeScore;
  }
  return null;
}
