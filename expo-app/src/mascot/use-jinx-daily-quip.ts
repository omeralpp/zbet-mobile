import { useQuery } from "@tanstack/react-query";
import { pickJinxLine } from "@/src/api/jinx-notes-schema";
import { jinxDailyLinesQuery, rebuildCohortsReportQuery } from "@/src/api/queries";
import { jinxWeekQuip } from "./jinx-week";

/**
 * Jinx's daily comment, shared by the ambient bubble, "Günlük yorum" and the
 * Overview card so all three always say the same thing. Since 2026-10-21 it
 * reads the RB1 report's today scope in neutral words; the old
 * A3 daily Super figures and their mood are retired. Since 2026-11-26 the body
 * is a line from the BFF's neutral daily pool when that pool matches today's
 * facts; otherwise the report's own wording stays.
 */
export function useJinxDailyQuip() {
  const report = useQuery(rebuildCohortsReportQuery);
  const lines = useQuery(jinxDailyLinesQuery);
  const period = !report.isError && report.data?.availability === "AVAILABLE"
    ? report.data.periods.find((item) => item.key === "today")
    : undefined;
  const base = jinxWeekQuip(period);
  const line = base && !lines.isError ? pickJinxLine(lines.data, lines.dataUpdatedAt) : null;
  const quip = base && line ? { ...base, body: line } : base;
  return { signature: quip?.signature ?? null, quip };
}
