/**
 * A 7- or 30-day Karar günlüğü composed from single Istanbul days (owner
 * request 2026-11-03, NXT-OBS-244). One 30-day window verifies every proof in
 * a single BFF request: on 3 Nov one such read failed with
 * CAPTURE_BATCH_BYTE_LIMIT and a successful one took 6.5 s. Each day is now its
 * own verified report; this file only adds them up.
 *
 * Counts and units are the days' own backend aggregates, added exactly
 * (decimal strings). ROI and hit rate use the backend's definitions on those
 * sums. A match is counted once even when its decisions fall on two days, so
 * match counts come from the distinct match keys of the listed records. The
 * match-clustered ROI interval cannot be added up and stays null here.
 */
import type { RebuildCohortsReport, RebuildLogRecord } from "@/src/api/rebuild-schemas";
import { rebuildCalendarDay } from "./rebuild-current";
import { addDecimals, shiftDay, type LogPeriod, type RebuildPeriod } from "./rebuild-log";

type Aggregate = Omit<RebuildPeriod, "days" | "key" | "from" | "through" | "byStar" | "byMarket" | "byMatch">;
type AggregateRow = Pick<RebuildPeriod, "recommendations" | "settled" | "wins" | "losses" | "voids" | "pending" | "unresolved" | "net" | "risk" | "totalRisk">;

/** The days of a view, newest first ("2026-11-03", "2026-11-02", …). */
export function periodDays(period: LogPeriod): string[] {
  return Array.from({ length: period.days }, (_, index) => shiftDay(period.through, -index));
}

/** One day of the shared daily report as its own day report, or null when that report does not hold the day. */
export function dailyDay(daily: RebuildCohortsReport | undefined, day: string): RebuildCohortsReport | null {
  if (!daily || daily.availability !== "AVAILABLE") return null;
  const period = daily.periods.find((item) => item.days === 1 && item.through === day);
  if (!period) return null;
  return {
    ...daily,
    periods: [period],
    cohorts: daily.cohorts.map((cohort) => ({ ...cohort, periods: cohort.periods.filter((item) => item.days === 1 && item.through === day) })),
    recommendations: daily.recommendations.filter((record) => rebuildCalendarDay(record.publishedAt) === day)
  };
}

function sum(rows: readonly AggregateRow[], records: readonly RebuildLogRecord[]): Aggregate {
  const total = (pick: (row: AggregateRow) => number) => rows.reduce((value, row) => value + pick(row), 0);
  const wins = total((row) => row.wins), settled = total((row) => row.settled);
  const net = rows.length ? addDecimals(rows.map((row) => row.net)) : "0";
  return {
    recommendations: total((row) => row.recommendations), matches: new Set(records.map((record) => record.matchKey)).size, settled, wins,
    losses: total((row) => row.losses), voids: total((row) => row.voids), pending: total((row) => row.pending), unresolved: total((row) => row.unresolved),
    net, risk: total((row) => row.risk), totalRisk: total((row) => row.totalRisk),
    roi: settled ? Number(net) / settled : null, hitRate: settled ? wins / settled : null, evidenceNote: "PILOT_MATCH_CLUSTERED", uncertainty: null
  };
}

/**
 * The loaded days as one report over the whole view. Days still loading or
 * failed are simply absent; the caller states how many days it holds.
 */
export function composeDays(chunks: readonly { day: string; report: RebuildCohortsReport }[], period: LogPeriod): RebuildCohortsReport | null {
  const first = chunks[0]?.report;
  if (!first) return null;
  // One report per day, even when a day was handed over twice.
  const unique = chunks.filter((chunk, index) => chunks.findIndex((other) => other.day === chunk.day) === index);
  const days = unique.map(({ day, report }) => ({ day, report, period: report.periods.find((item) => item.days === 1 && item.through === day) }))
    .filter((chunk): chunk is typeof chunk & { period: RebuildPeriod } => chunk.period !== undefined);
  const seen = new Set<string>();
  const records = days.flatMap(({ day, report }) => report.recommendations.filter((record) => rebuildCalendarDay(record.publishedAt) === day))
    .filter((record) => !seen.has(record.decisionId) && Boolean(seen.add(record.decisionId)))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.decisionId.localeCompare(a.decisionId));
  const periods = days.map((chunk) => chunk.period);
  const markets = [...new Set(periods.flatMap((item) => item.byMarket.map((row) => row.market)))].sort();
  const cohorts = new Map<string, RebuildCohortsReport["cohorts"][number]>();
  for (const { report } of days) {
    for (const cohort of report.cohorts) {
      const known = cohorts.get(cohort.id);
      const firstDecisionAt = [known?.firstDecisionAt, cohort.firstDecisionAt].filter((value): value is string => Boolean(value)).sort()[0] ?? null;
      cohorts.set(cohort.id, { ...(known ?? cohort), firstDecisionAt, periods: [], learning: null });
    }
  }
  return {
    ...first,
    asOf: days.map(({ report }) => report.asOf).sort().at(-1) ?? first.asOf,
    availability: "AVAILABLE",
    reason: "",
    periods: [{
      days: period.days, from: shiftDay(period.through, -(period.days - 1)), through: period.through, ...sum(periods, records),
      byStar: [1, 2, 3, 4, 5].map((stars) => ({ stars, ...sum(periods.flatMap((item) => item.byStar.filter((row) => row.stars === stars)), records.filter((record) => record.stars === stars)) })),
      byMarket: markets.map((market) => ({ market, ...sum(periods.flatMap((item) => item.byMarket.filter((row) => row.market === market)), records.filter((record) => record.market === market)) }))
    }],
    learning: null,
    cohorts: [...cohorts.values()],
    recommendations: records as RebuildCohortsReport["recommendations"]
  };
}
