import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { dashboardQuery, matchesQuery, matchInsightsQuery, rebuildCohortsReportQuery } from "./queries";

/**
 * Starts the Özet reads while the launch brand is still on screen, so the
 * first screen opens filled instead of showing a second loading state.
 *
 * Read-only queries the Overview mounts anyway, with their own cache times.
 * `prefetchQuery` never throws; a failure is reported by the screen's own
 * query. Runs only once a session exists, so it never reads before sign-in.
 */
export function usePrefetchOverview(enabled: boolean): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    void queryClient.prefetchQuery(dashboardQuery);
    void queryClient.prefetchQuery(matchesQuery);
    void queryClient.prefetchQuery(rebuildCohortsReportQuery);
    void queryClient.prefetchQuery(matchInsightsQuery);
  }, [enabled, queryClient]);
}
