import type {
  JinxMatchOutlook,
  JinxOutlookSignal
} from "@/src/api/schemas";
import { foldDiacritics } from "./jinx-language";

/**
 * Guard and presentation rules for the informative Ask Jinx match surface
 * (M15 / TASK-0046).
 *
 * Jinx is a presentation persona and this surface is informative only. The real
 * centralized match analyst is TASK-0011 under M11; nothing here reads a model,
 * a Super decision, a rating or a threshold, and nothing here influences one.
 *
 * The contract already constrains the shape, but wording is the part that can
 * quietly turn a description into a recommendation, so the same refusal runs
 * again on the client — exactly as the daily quip does. A rejected line leaves
 * the surface with no text rather than a softened version of the same claim:
 * rewriting it here would be this module inventing a reading of its own.
 */

const maxHeadlineLength = 140;
const maxBodyLength = 400;

/**
 * Wording this surface refuses.
 *
 * Three families, all of which turn an observation into something it is not:
 *
 *   - advice and staking: what the reader should do about the match;
 *   - certainty about the future: what the match is going to do;
 *   - BTB decision vocabulary: borrowing the authority of a model, a Super
 *     selection or a rating that this surface is explicitly not connected to.
 *
 * Matched against a diacritic-folded copy, so a line written without Turkish
 * characters cannot walk past the list.
 */
const bannedPhrasePattern =
  /\b(tavsiye|oneri|onerir|bahis|iddaa|kupon|banko|oyna|oynayin|oynanir|yatir|yatirim|garanti|kesinlikle|mutlaka|kesin|eminim|tahmin|ongoru|ongoruyorum|model|super|rating|reyting)/;

/**
 * Accepts one candidate line, or refuses it outright.
 *
 * Length and line-count are checked first because an over-long or multi-line
 * body is a shape problem rather than a wording one, and it should not be
 * scanned for phrasing it was never meant to carry.
 */
export function acceptOutlookText(
  candidate: string | null | undefined,
  limit: number
): string | null {
  if (typeof candidate !== "string") {
    return null;
  }
  const text = candidate.trim();
  if (!text || text.length > limit) {
    return null;
  }
  return bannedPhrasePattern.test(foldDiacritics(text)) ? null : text;
}

export function acceptHeadline(candidate: string | null | undefined) {
  return acceptOutlookText(candidate, maxHeadlineLength);
}

export function acceptBody(candidate: string | null | undefined) {
  return acceptOutlookText(candidate, maxBodyLength);
}

/**
 * The uncertainty note, which fails closed rather than failing empty.
 *
 * Every other guarded string disappears when it is refused. This one must not:
 * dropping a caveat makes the reading look more certain than it is, which is
 * the exact failure the guard exists to prevent. A refused note falls back to
 * the standing disclaimer, so the surface is never left without one.
 */
export function acceptUncertaintyNote(
  candidate: string | null | undefined
): string {
  return acceptOutlookText(candidate, maxBodyLength) ?? informativeOnlyNotice;
}

/**
 * `IDLE` is the state before the user has asked.
 *
 * It exists so the surface can be mounted without ever having produced a
 * reading: this is a thing the user requests, not something the app volunteers
 * about every match it shows them.
 */
export type OutlookState =
  | "IDLE"
  | "LOADING"
  | "UNAVAILABLE"
  | "DEGRADED"
  | "READY";

export function resolveOutlookState(
  outlook: JinxMatchOutlook | undefined,
  options: {
    asked: boolean;
    isLoading?: boolean | undefined;
    isError?: boolean | undefined;
  }
): OutlookState {
  if (!options.asked) {
    return "IDLE";
  }
  if (options.isLoading) {
    return "LOADING";
  }
  if (options.isError || !outlook || outlook.availability === "UNAVAILABLE") {
    return "UNAVAILABLE";
  }
  // A headline that the guard refused leaves nothing honest to show, so the
  // surface reports that rather than rendering an empty bubble.
  if (acceptHeadline(outlook.headline) === null) {
    return "UNAVAILABLE";
  }
  return outlook.availability === "DEGRADED" ? "DEGRADED" : "READY";
}

export type ConfidenceBand = "LOW" | "MEDIUM" | "HIGH";

/**
 * Confidence as a band rather than a number.
 *
 * A percentage on an informative reading invites arithmetic the reading cannot
 * support. The band says how much weight to put on it and stops there.
 */
export function confidenceBand(
  confidence: number | null | undefined
): ConfidenceBand | null {
  if (typeof confidence !== "number" || !Number.isFinite(confidence)) {
    return null;
  }
  if (confidence < 0.35) {
    return "LOW";
  }
  return confidence < 0.65 ? "MEDIUM" : "HIGH";
}

export const confidenceLabels: Record<ConfidenceBand, string> = {
  LOW: "Düşük güven",
  MEDIUM: "Orta güven",
  HIGH: "Yüksek güven"
};

export const directionLabels: Record<JinxOutlookSignal["direction"], string> = {
  SUPPORTING: "Destekliyor",
  OPPOSING: "Karşı",
  NEUTRAL: "Nötr"
};

/**
 * Signals worth drawing.
 *
 * Order is the contract's own. Re-sorting by direction or strength would be
 * this module ranking the reasons, which is analysis rather than presentation.
 */
export function outlookSignals(
  outlook: JinxMatchOutlook | undefined
): JinxOutlookSignal[] {
  return outlook?.signals ?? [];
}

/**
 * The freshness line, when there is one worth showing.
 *
 * Only staleness is surfaced. A reading that is current needs no note, and
 * printing an age on every reading would make the fresh case look qualified.
 */
export function outlookFreshnessNotice(
  outlook: JinxMatchOutlook | undefined
): string | null {
  const freshness = outlook?.freshness;
  if (!freshness?.stale) {
    return null;
  }
  const ageSeconds = freshness.ageSeconds;
  if (ageSeconds === null || ageSeconds === undefined) {
    return "Bu okuma güncel olmayabilir";
  }
  const age =
    ageSeconds < 60
      ? `${Math.round(ageSeconds)} sn`
      : `${Math.round(ageSeconds / 60)} dk`;
  return `${age} önceki okuma`;
}

/**
 * The standing disclaimer.
 *
 * Always rendered next to a reading, never conditional on the content: the
 * point is that this surface is informative by construction, not that a
 * particular sentence happened to need a caveat.
 */
export const informativeOnlyNotice =
  "Bilgilendirme amaçlıdır. Sonuç iddiası ya da yönlendirme değildir.";
