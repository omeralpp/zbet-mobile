import { useQuery } from "@tanstack/react-query";
import { dashboardQuery, matchesQuery } from "./queries";

/**
 * Matches in play (live or at half-time) for the navigation badges. Reads the
 * match list only when a screen already holds it, so the badge never starts
 * the list's 10-second polling on its own; otherwise the dashboard's count.
 */
export function useLiveMatchCount(): number {
  const matches = useQuery({ ...matchesQuery, enabled: false });
  const dashboard = useQuery(dashboardQuery);
  if (matches.data) {
    return matches.data.filter((match) => match.status === "LIVE" || match.status === "HALF_TIME").length;
  }
  return dashboard.data?.liveMatchCount ?? 0;
}
