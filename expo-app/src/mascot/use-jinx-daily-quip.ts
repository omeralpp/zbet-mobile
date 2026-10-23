import { useQuery } from "@tanstack/react-query";
import { rebuildCohortsReportQuery } from "@/src/api/queries";
import { jinxWeekQuip } from "./jinx-week";

/**
 * Jinx's daily comment, shared by the ambient bubble, "Günlük yorum" and the
 * Overview card so all three always say the same thing. Since 2026-10-21 it
 * reads the RB1 report's seven days in neutral words (owner decision); the old
 * A3 daily Super figures and their mood are retired.
 */
export function useJinxDailyQuip() {
  const report = useQuery(rebuildCohortsReportQuery);
  const period = !report.isError && report.data?.availability === "AVAILABLE"
    ? report.data.periods.find((item) => item.days === 7)
    : undefined;
  const quip = jinxWeekQuip(period);
  return { signature: quip?.signature ?? null, quip };
}
