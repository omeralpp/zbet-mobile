/**
 * BTB's signal meter.
 *
 * The rating already exists as a 1-5 star string. Stars are fine in a dense list
 * row, but on the flagship surface they read as a review score — the vocabulary
 * of an app store, not of an instrument. The meter is the same value drawn as
 * signal strength: discrete segments, lit from the left, unlit segments still
 * present so the reader sees the ceiling as well as the level.
 *
 * This changes presentation only. It does not compute, weight, threshold or
 * reinterpret anything: `rating` arrives decided and leaves undisplaced.
 */

export type SignalSegment = "LIT" | "DIM";

/** Segments in the meter. Matches the rating ceiling the product already uses. */
export const signalSegmentCount = 5;

/**
 * Draws a rating as segments.
 *
 * A rating of zero is not "no signal" — it is BTB watching without a selection,
 * which the star component already words as `İzleniyor`. The meter renders that
 * as an entirely dim track rather than as an empty or absent one, so the surface
 * still shows a ceiling and never implies the market is missing.
 */
export function resolveSignalSegments(
  rating: number | null | undefined
): SignalSegment[] {
  const bounded =
    typeof rating === "number" && Number.isFinite(rating)
      ? Math.max(0, Math.min(signalSegmentCount, Math.floor(rating)))
      : 0;
  return Array.from({ length: signalSegmentCount }, (_, index) =>
    index < bounded ? "LIT" : "DIM"
  );
}

/** Whether the meter carries an actual selection rather than a watching state. */
export function hasSignal(rating: number | null | undefined): boolean {
  return resolveSignalSegments(rating).some((segment) => segment === "LIT");
}

/**
 * Screen-reader wording for the meter.
 *
 * Read as a level out of a ceiling rather than as a count of shapes, because
 * "four of five" is the information and "four stars" is the decoration.
 */
export function signalAccessibilityLabel(
  rating: number | null | undefined
): string {
  const lit = resolveSignalSegments(rating).filter(
    (segment) => segment === "LIT"
  ).length;
  if (lit === 0) {
    return "BTB izliyor, seçim yok";
  }
  return `BTB sinyali ${lit} / ${signalSegmentCount}`;
}
