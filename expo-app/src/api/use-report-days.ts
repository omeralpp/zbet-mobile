import { useQueries } from "@tanstack/react-query";
import type { RebuildCohortsReport } from "./rebuild-schemas";
import { rebuildReportWindowQuery } from "./queries";
import { composeDays, dailyDay, periodDays } from "@/src/utils/rebuild-days";
import type { LogPeriod } from "@/src/utils/rebuild-log";

export interface ReportDays {
  /** The loaded days added up over the whole view; null before the first day arrives. */
  report: RebuildCohortsReport | null;
  total: number;
  loaded: number;
  /** Days whose report could not be read or verified, newest first. */
  failed: string[];
  loading: boolean;
  retry: () => void;
}

/**
 * A 7/30-day Karar günlüğü read one Istanbul day at a time (NXT-OBS-244).
 * Today and yesterday come from the shared daily report; every other day is
 * its own verified window, cached per day (shared with day stepping) and read
 * newest first, a few at a time. The view fills in as the days arrive.
 */
export function useReportDays(period: LogPeriod, today: string, daily: RebuildCohortsReport | undefined, active: boolean): ReportDays {
  const days = active ? periodDays(period) : [];
  const shared = new Map(days.map((day) => [day, dailyDay(daily, day)] as const));
  const fetched = days.filter((day) => !shared.get(day));
  const results = useQueries({ queries: fetched.map((day) => rebuildReportWindowQuery(1, day, day === today)) });
  const chunks: { day: string; report: RebuildCohortsReport }[] = [];
  const failed: string[] = [];
  for (const day of days) {
    const own = shared.get(day);
    const result = own ? null : results[fetched.indexOf(day)];
    const report = own ?? result?.data;
    if (report?.availability === "AVAILABLE") chunks.push({ day, report });
    else if (result?.isError || report?.availability === "UNAVAILABLE") failed.push(day);
  }
  return {
    report: composeDays(chunks, period),
    total: days.length,
    loaded: chunks.length,
    failed,
    loading: chunks.length + failed.length < days.length,
    retry: () => {
      results.forEach((result, index) => {
        if (failed.includes(fetched[index]!)) void result.refetch();
      });
    }
  };
}
