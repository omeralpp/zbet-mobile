/** Proposal-only display helpers. They never estimate missing measurements. */
export type FractionWidth = `${number}%`;

export function finiteFraction(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1
    ? value
    : null;
}

/** A zero stays zero; small shares get no invented minimum visible length. */
export function exactFractionWidth(value: unknown): FractionWidth | null {
  const fraction = finiteFraction(value);
  return fraction === null ? null : `${fraction * 100}%`;
}

export function formatFractionPercent(value: unknown): string {
  const fraction = finiteFraction(value);
  return fraction === null ? "—" : new Intl.NumberFormat("tr-TR", {
    style: "percent",
    maximumFractionDigits: 2
  }).format(fraction);
}

/** Accept date-only metadata without normalizing impossible dates or guessing today. */
export function formatMetricDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Tarih bilinmiyor";
  const [year, month, day] = value.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined || year < 1000) return "Tarih bilinmiyor";
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "Tarih bilinmiyor";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function formatSampleDenominator(value: unknown): string {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? `${new Intl.NumberFormat("tr-TR").format(value)} maç`
    : "Payda bilinmiyor";
}
