import { useQuery } from "@tanstack/react-query";
import { dashboardQuery, matchesQuery } from "./queries";
import { resolveLiveMatchCount } from "./live-match-count";

/**
 * Matches in play (live or at half-time) for the navigation badges. Reads the
 * match list only when a screen already holds it; the desktop sidebar opts
 * into its established polling. A failed/pending count stays unknown.
 */
export function useLiveMatchCount(loadMatches = false): number | null {
  const matches = useQuery({ ...matchesQuery, enabled: loadMatches });
  const dashboard = useQuery(dashboardQuery);
  return resolveLiveMatchCount(matches, dashboard);
}
