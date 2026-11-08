/**
 * The RB1 decision log (Karar günlüğü): which published records a period
 * shows, how a view filters and orders them, and the summary of a star scope.
 *
 * Every figure comes from the report. A star scope's summary adds up the
 * backend's own per-star aggregates exactly (decimal strings, no floating
 * point); it never re-derives a result, a unit or a match count, because
 * records of one match can sit in different star rows.
 */
import type { RebuildCohortsReport, RebuildMatchFacts, RebuildRecommendation, RebuildReport, ReportWindowDays } from "@/src/api/rebuild-schemas";
import { rebuildCalendarDay } from "./rebuild-current";
import { formatReportDay, formatSupport } from "./rebuild-display";

export type RebuildPeriod = RebuildReport["periods"][number];

/** A period's published records, newest first (the report's own day bounds). */
export function periodRecords<T extends RebuildRecommendation>(report: { recommendations: readonly T[] }, period: RebuildPeriod): T[] {
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

export function filterLog<T extends RebuildRecommendation>(records: readonly T[], filter: LogFilter): T[] {
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
export function sortLog<T extends RebuildRecommendation>(records: readonly T[], sort: LogSort): T[] {
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
  /** Won and lost records: the report's resolved risk. */
  settled: number;
  /** Units per resolved unit and the won share of resolved records; null before any result. */
  roi: number | null;
  hitRate: number | null;
}

/**
 * The period, or its records at `minStars` and above, as the report counts
 * them. ROI and hit rate are the report's own figures for the whole period;
 * a star scope applies the report's definitions to its summed rows.
 */
export function logSummary(period: RebuildPeriod, minStars: number | null): LogSummary {
  const whole = minStars === null || minStars <= 1;
  const rows = whole ? [period] : period.byStar.filter((row) => row.stars >= minStars);
  const sum = (pick: (row: (typeof rows)[number]) => number) => rows.reduce((total, row) => total + pick(row), 0);
  const wins = sum((row) => row.wins), losses = sum((row) => row.losses), settled = wins + losses;
  const net = rows.length ? addDecimals(rows.map((row) => row.net)) : "0";
  return {
    recommendations: sum((row) => row.recommendations), wins, losses,
    pending: sum((row) => row.pending), unresolved: sum((row) => row.unresolved), voids: sum((row) => row.voids), net, settled,
    roi: whole ? period.roi : settled ? Number(net) / settled : null,
    hitRate: whole ? period.hitRate : settled ? wins / settled : null
  };
}

/** "2/2 · 36/40": the same frozen evidence under a "Baskı · Havuz" column head. */
export function evidenceCompact(record: Pick<RebuildRecommendation, "votesSupport" | "votesUsed" | "poolWins" | "poolTotal">): string {
  return `${record.votesSupport}/${record.votesUsed} · ${formatSupport(record.poolWins, record.poolTotal).counts}`;
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

/** The report a Karar günlüğü view shows, and whether it is older than the latest attempt. */
export interface DisplayedReport {
  report: RebuildCohortsReport | undefined;
  stale: boolean;
}

/**
 * A failed refresh or an UNAVAILABLE answer says nothing about decisions that
 * were already verified, so the last verified report stays on screen, marked
 * stale (NXT-OBS-246). Without one, the latest answer stands and the view says
 * it could not verify.
 */
export function displayedReport(latest: RebuildCohortsReport | undefined, lastVerified: RebuildCohortsReport | null, refreshFailed: boolean): DisplayedReport {
  if (latest?.availability === "AVAILABLE") return { report: latest, stale: refreshFailed };
  if (lastVerified?.availability === "AVAILABLE") return { report: lastVerified, stale: true };
  return { report: latest, stale: false };
}

/**
 * A v2 report as the v1 shape the Super screens render: every listed record
 * with the backend's all-cohort periods and learning (owner decision
 * 2026-10-22). Nothing is summed on the client.
 */
export function combinedReport(report: RebuildCohortsReport): RebuildReport {
  return {
    contractVersion: "btb-rebuild-report.v1", modelRegime: report.modelRegime, asOf: report.asOf, timeZone: report.timeZone,
    availability: report.availability, reason: report.reason, accounting: report.accounting, actualBetsAssumed: report.actualBetsAssumed,
    periods: report.periods,
    recommendations: report.recommendations.map(({ cohortId: _cohort, ...record }) => record),
    learning: report.learning
  };
}

/** A Karar günlüğü view: 1, 7 or 30 Istanbul days ending on `through`. */
export interface LogPeriod {
  days: ReportWindowDays;
  through: string;
}

/** The Istanbul calendar day of an instant, "2026-11-03". */
export function istanbulDay(now: number): string {
  return rebuildCalendarDay(new Date(now).toISOString());
}

/** A calendar day moved by whole days ("2026-11-01" − 1 → "2026-10-31"). */
export function shiftDay(day: string, delta: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + delta * 86_400_000).toISOString().slice(0, 10);
}

/** Single days step back up to a year, never past today (the backend's window bounds). */
export function canStepDay(period: LogPeriod, today: string, delta: -1 | 1): boolean {
  if (period.days !== 1) return false;
  const next = shiftDay(period.through, delta);
  return next <= today && next >= shiftDay(today, -365);
}

const weekdayFormat = new Intl.DateTimeFormat("tr-TR", { weekday: "short", timeZone: "Europe/Istanbul" });

/** "Bugün", "Dün", "31 Eki Cum", "Son 7 gün", "Son 30 gün". */
export function periodTitle(period: LogPeriod, today: string): string {
  if (period.days === 1) {
    if (period.through === today) return "Bugün";
    if (period.through === shiftDay(today, -1)) return "Dün";
    return `${formatReportDay(period.through)} ${weekdayFormat.format(new Date(`${period.through}T12:00:00+03:00`))}`;
  }
  return period.through === today ? `Son ${period.days} gün` : `${period.days} gün · ${formatReportDay(period.through)} sonu`;
}

/** The one cohort every listed record shares, or null when they mix. */
export function sharedCohort(records: readonly { decisionId: string }[], labels: ReadonlyMap<string, string>): string | null {
  const names = new Set(records.map((record) => labels.get(record.decisionId) ?? ""));
  const [only] = names;
  return names.size === 1 && only ? only : null;
}

/**
 * SAP stores league names in 20 characters, so a 20-character name may be
 * cut ("İngiltere Premier Li"); it is shown as cut rather than completed.
 */
export function leagueText(league: string): string {
  return [...league].length >= 20 ? `${league}…` : league;
}

/** "İspanya La Liga · 23:00 başlama" from the frozen facts; null when neither is known. */
export function fixtureLine(match: RebuildMatchFacts | undefined): string | null {
  const parts = [match?.league ? leagueText(match.league) : null, match?.kickoff ? `${match.kickoff} başlama` : null].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** "MS 2–1": the regulation-time score a proven result was settled on. */
export function finalScoreText(match: RebuildMatchFacts | undefined): string | null {
  return match?.finalScore ? `MS ${match.finalScore.home}–${match.finalScore.away}` : null;
}

/** True when the backend could not prove either side's name for this record. */
export function namesUnverified(match: RebuildMatchFacts | undefined): boolean {
  return match?.names === "UNAVAILABLE";
}

/** What the period control remembers: relative choices follow the calendar, a stepped day stays put. */
export type LogPeriodChoice = { kind: "today" } | { kind: "yesterday" } | { kind: "last"; days: 7 | 30 } | { kind: "day"; date: string };

export function resolvePeriod(choice: LogPeriodChoice, today: string): LogPeriod {
  switch (choice.kind) {
    case "today":
      return { days: 1, through: today };
    case "yesterday":
      return { days: 1, through: shiftDay(today, -1) };
    case "last":
      return { days: choice.days, through: today };
    case "day":
      return { days: 1, through: choice.date };
  }
}

/** A stepped day turns back into "Bugün" or "Dün" when it reaches them. */
export function choiceForDay(day: string, today: string): LogPeriodChoice {
  return day === today ? { kind: "today" } : day === shiftDay(today, -1) ? { kind: "yesterday" } : { kind: "day", date: day };
}

/** Today and yesterday come from the shared daily report; every other view reads its own window. */
export function needsWindow(period: LogPeriod, today: string): boolean {
  return !(period.days === 1 && (period.through === today || period.through === shiftDay(today, -1)));
}
