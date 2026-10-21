/**
 * Presentation of rebuild (RB1) facts. Formatting only: every value here is
 * already decided by the backend, and nothing in this file may compute,
 * rank or reinterpret it (A7 question 33/36, "DTO number formatting cannot
 * decide admission, caps or ranking").
 */
import type { RebuildRecommendation } from "@/src/api/rebuild-schemas";

export type ResultState = RebuildRecommendation["result"]["state"];
export type Tone = "positive" | "negative" | "neutral" | "pending" | "warning";

/**
 * Five outcomes, five labels, five tones. VOID and UNRESOLVED are never folded
 * into a win or a loss, and PENDING is the open-ticket blue the old decision
 * log used for "açık".
 */
export const resultPresentation: Record<ResultState, { label: string; pill: string; tone: Tone }> = {
  WIN: { label: "Kazandı", pill: "KAZANDI", tone: "positive" },
  LOSS: { label: "Kaybetti", pill: "KAYBETTİ", tone: "negative" },
  VOID: { label: "İptal", pill: "İPTAL", tone: "neutral" },
  PENDING: { label: "Bekliyor", pill: "BEKLİYOR", tone: "pending" },
  UNRESOLVED: { label: "Çözülemedi", pill: "ÇÖZÜLEMEDİ", tone: "warning" }
};

const decimalFormat = (digits: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

function parseDecimal(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Hypothetical one-unit net, signed. A missing value is a dash, never zero. */
export function formatUnits(net: string | null | undefined): string {
  const value = parseDecimal(net);
  if (value === null) {
    return "—";
  }
  const text = decimalFormat(2).format(Math.abs(value));
  return value > 0 ? `+${text}` : value < 0 ? `-${text}` : text;
}

export function unitsTone(net: string | null | undefined): Tone {
  const value = parseDecimal(net);
  return value === null || value === 0 ? "neutral" : value > 0 ? "positive" : "negative";
}

/** A quoted price at two decimals, Turkish comma. */
export function formatQuote(quote: string | null | undefined): string {
  const value = parseDecimal(quote);
  return value === null ? "—" : decimalFormat(2).format(value);
}

/** Consistency score as delivered; the backend's decimal string, comma-printed. */
export function formatScore(score: string | null | undefined): string {
  const value = parseDecimal(score);
  if (value === null) {
    return "—";
  }
  return Number.isInteger(value) ? String(value) : decimalFormat(1).format(value);
}

/** A measured decimal (pressure vote), Turkish comma, up to two places. */
export function formatDecimal(value: string | null | undefined): string {
  const parsed = parseDecimal(value);
  return parsed === null
    ? "—"
    : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(parsed);
}

/** A ratio the report already computed (ROI, hit rate). Null stays a dash. */
export function formatRatio(ratio: number | null | undefined): string {
  if (ratio === null || ratio === undefined || !Number.isFinite(ratio)) {
    return "—";
  }
  // Turkish writes the sign before the percent sign: -%7,0, not %-7,0.
  return `${ratio < 0 ? "-" : ""}%${decimalFormat(1).format(Math.abs(ratio) * 100)}`;
}

/**
 * "36/40" read as sample support. The share is the plain quotient of the two
 * delivered counts, shown beside them, never instead of them.
 */
export function formatSupport(wins: number, total: number): { counts: string; share: string } {
  return {
    counts: `${wins}/${total}`,
    share: total > 0 ? `%${Math.round((wins / total) * 100)}` : "—"
  };
}

/** "2026-10-15" as "15 Eki". */
export function formatReportDay(day: string): string {
  const parsed = new Date(`${day}T12:00:00+03:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(parsed.getTime())) {
    return day;
  }
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" }).format(parsed);
}

/** "15 Eki – 21 Eki" for a reporting period. */
export function formatReportRange(from: string, through: string): string {
  const start = formatReportDay(from);
  const end = formatReportDay(through);
  return start === end ? start : `${start} – ${end}`;
}

export interface OutcomeCounts {
  wins: number;
  losses: number;
  voids: number;
  pending: number;
  unresolved: number;
}

export interface OutcomeSegment {
  key: keyof OutcomeCounts;
  count: number;
  label: string;
  tone: Tone;
}

/** The outcome bar's segments in a fixed reading order, empty ones dropped. */
export function outcomeSegments(counts: OutcomeCounts): OutcomeSegment[] {
  const order: [keyof OutcomeCounts, ResultState][] = [
    ["wins", "WIN"],
    ["losses", "LOSS"],
    ["voids", "VOID"],
    ["pending", "PENDING"],
    ["unresolved", "UNRESOLVED"]
  ];
  return order
    .map(([key, state]) => ({
      key,
      count: counts[key],
      label: resultPresentation[state].label.toLocaleLowerCase("tr-TR"),
      tone: resultPresentation[state].tone
    }))
    .filter((segment) => segment.count > 0);
}

/** Team names for a match key, read from the published records themselves. */
export function matchLabel(matchKey: string, records: readonly RebuildRecommendation[]): string {
  const record = records.find((item) => item.matchKey === matchKey);
  return record ? `${record.homeTeam} – ${record.awayTeam}` : matchKey.slice(0, 10);
}
