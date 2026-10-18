/** Presentation arithmetic only: no inference, smoothing, minimum bar or cohort reweighting. */
export type PercentageWidth = `${number}%`;

function nonnegativeMeasurement(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** A relative comparison needs both measurements; an unknown opponent is not zero. */
export function relativeComparisonWidths(home: unknown, away: unknown): { home: number; away: number } {
  if (!nonnegativeMeasurement(home) || !nonnegativeMeasurement(away)) return { home: 0, away: 0 };
  const largest = Math.max(home, away);
  if (largest === 0) return { home: 0, away: 0 };
  // Scaling first also keeps two very large finite measurements from overflowing.
  const relativeHome = home / largest;
  const relativeAway = away / largest;
  const total = relativeHome + relativeAway;
  return { home: (relativeHome / total) * 100, away: (relativeAway / total) * 100 };
}

/** Preserve the source fraction, even when only a subset of historical rows is shown. */
export function historicalFractionWidth(value: unknown): PercentageWidth | null {
  return nonnegativeMeasurement(value) && value <= 1 ? `${value * 100}%` : null;
}

export function formatHistoricalFraction(value: unknown): string {
  return historicalFractionWidth(value) === null ? "—" : new Intl.NumberFormat("tr-TR", {
    style: "percent",
    maximumFractionDigits: 2
  }).format(value as number);
}
