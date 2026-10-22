/**
 * The RB1 decision log (Karar günlüğü): which published records a period
 * shows, how a view filters and orders them, and the summary of a star scope.
 *
 * Every figure comes from the report. A star scope's summary adds up the
 * backend's own per-star aggregates exactly (decimal strings, no floating
 * point); it never re-derives a result, a unit or a match count, because
 * records of one match can sit in different star rows.
 */
import type { RebuildCohortsReport, RebuildRecommendation, RebuildReport } from "@/src/api/rebuild-schemas";
import { rebuildCalendarDay } from "./rebuild-current";
import { formatSupport } from "./rebuild-display";

export type RebuildPeriod = RebuildReport["periods"][number];

/** A period's published records, newest first (the report's own day bounds). */
export function periodRecords(report: Pick<RebuildReport, "recommendations">, period: RebuildPeriod): RebuildRecommendation[] {
  return report.recommendations
    .filter((record) => {
      const day = rebuildCalendarDay(record.publishedAt);
      return day >= period.from && day <= period.through;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export interface LogFilter {
  /** Lowest star count shown; null shows every record. */
  minStars: number | null;
  /** Only records whose result is still pending. */
  pendingOnly: boolean;
}

export function filterLog(records: readonly RebuildRecommendation[], filter: LogFilter): RebuildRecommendation[] {
  return records.filter(
    (record) =>
      (filter.minStars === null || record.stars >= filter.minStars) &&
      (!filter.pendingOnly || record.result.state === "PENDING")
  );
}

export type LogColumn = "publishedAt" | "minute" | "stars" | "quote" | "net";
export interface LogSort {
  column: LogColumn;
  direction: "asc" | "desc";
}

export const defaultLogSort: LogSort = { column: "publishedAt", direction: "desc" };

/** Same column flips direction; a new column starts high to low. */
export function nextLogSort(current: LogSort, column: LogColumn): LogSort {
  return current.column === column
    ? { column, direction: current.direction === "desc" ? "asc" : "desc" }
    : { column, direction: "desc" };
}

function sortValue(record: RebuildRecommendation, column: LogColumn): number | null {
  switch (column) {
    case "publishedAt":
      return Date.parse(record.publishedAt);
    case "minute":
      return record.minute;
    case "stars":
      return record.stars;
    case "quote":
      return record.quote === null ? null : Number(record.quote);
    case "net":
      return record.result.net === null ? null : Number(record.result.net);
  }
}

/** Orders a view; records without a value (no net yet) always go last. */
export function sortLog(records: readonly RebuildRecommendation[], sort: LogSort): RebuildRecommendation[] {
  const sign = sort.direction === "asc" ? 1 : -1;
  return records
    .map((record, index) => ({ record, index }))
    .sort((left, right) => {
      const a = sortValue(left.record, sort.column);
      const b = sortValue(right.record, sort.column);
      if (a === null || b === null) {
        return a === b ? left.index - right.index : a === null ? 1 : -1;
      }
      return (a - b) * sign || Date.parse(right.record.publishedAt) - Date.parse(left.record.publishedAt) || left.index - right.index;
    })
    .map(({ record }) => record);
}

/** Exact sum of backend decimal strings; the result keeps the widest scale. */
export function addDecimals(values: readonly string[]): string {
  const scale = values.reduce((widest, value) => Math.max(widest, value.split(".")[1]?.length ?? 0), 0);
  const total = values.reduce((sum, value) => {
    const negative = value.startsWith("-");
    const [whole = "0", fraction = ""] = value.replace("-", "").split(".");
    const units = BigInt(whole + fraction.padEnd(scale, "0"));
    return sum + (negative ? -units : units);
  }, 0n);
  const negative = total < 0n;
  const digits = (negative ? -total : total).toString().padStart(scale + 1, "0");
  const whole = digits.slice(0, digits.length - scale);
  const fraction = scale ? `.${digits.slice(digits.length - scale)}` : "";
  return `${negative ? "-" : ""}${whole}${fraction}`;
}

export interface LogSummary {
  recommendations: number;
  wins: number;
  losses: number;
  pending: number;
  unresolved: number;
  voids: number;
  net: string;
}

/** The period, or its records at `minStars` and above, as the report counts them. */
export function logSummary(period: RebuildPeriod, minStars: number | null): LogSummary {
  const rows = minStars === null || minStars <= 1 ? [period] : period.byStar.filter((row) => row.stars >= minStars);
  return {
    recommendations: rows.reduce((sum, row) => sum + row.recommendations, 0),
    wins: rows.reduce((sum, row) => sum + row.wins, 0),
    losses: rows.reduce((sum, row) => sum + row.losses, 0),
    pending: rows.reduce((sum, row) => sum + row.pending, 0),
    unresolved: rows.reduce((sum, row) => sum + row.unresolved, 0),
    voids: rows.reduce((sum, row) => sum + row.voids, 0),
    net: rows.length ? addDecimals(rows.map((row) => row.net)) : "0"
  };
}

/** "2/2 baskı teyidi · 36/40 havuz": the frozen evidence in one line. */
export function evidenceLine(record: Pick<RebuildRecommendation, "votesSupport" | "votesUsed" | "poolWins" | "poolTotal">): string {
  return `${record.votesSupport}/${record.votesUsed} baskı teyidi · ${formatSupport(record.poolWins, record.poolTotal).counts} havuz`;
}

const dayFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
const timeFormat = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Istanbul" });

/** Publication instant as "21 Eki" and "20:52", Istanbul time. */
export function publishedParts(iso: string): { day: string; time: string } {
  const date = new Date(iso);
  return Number.isFinite(date.getTime()) ? { day: dayFormat.format(date), time: timeFormat.format(date) } : { day: "—", time: "—" };
}

/** "Inter Turku" as "IT", "Fatih Karagümrük Spor Kulübü" as "FK". */
export function teamInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const letters = words.length > 1 ? `${words[0]![0]}${words[1]![0]}` : (words[0] ?? "").slice(0, 2);
  return letters.toLocaleUpperCase("tr-TR") || "—";
}

/**
 * One policy cohort of a v2 report as a v1-shaped report: that cohort's own
 * periods and learning and only its records. Cohorts are never merged.
 */
export function cohortReport(report: RebuildCohortsReport, cohortId: string | null): RebuildReport | null {
  const cohort = report.cohorts.find((item) => item.id === cohortId);
  if (!cohort) return null;
  return {
    contractVersion: "btb-rebuild-report.v1", modelRegime: report.modelRegime, asOf: report.asOf, timeZone: report.timeZone,
    availability: report.availability, reason: report.reason, accounting: report.accounting, actualBetsAssumed: report.actualBetsAssumed,
    periods: cohort.periods,
    recommendations: report.recommendations.filter((record) => record.cohortId === cohort.id).map(({ cohortId: _cohort, ...record }) => record),
    learning: cohort.learning
  };
}

/**
 * The cohort whose summary opens first: the current one when it already has a
 * decision in the period, otherwise the cohort of the newest decision there.
 */
export function defaultCohortId(report: RebuildCohortsReport, days: 7 | 30): string | null {
  const current = report.cohorts.find((cohort) => cohort.current) ?? null;
  const inPeriod = (id: string) => (report.cohorts.find((cohort) => cohort.id === id)?.periods.find((period) => period.days === days)?.recommendations ?? 0) > 0;
  if (current && inPeriod(current.id)) return current.id;
  const newest = [...report.recommendations].filter((record) => inPeriod(record.cohortId)).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
  return newest?.cohortId ?? current?.id ?? report.cohorts[0]?.id ?? null;
}
