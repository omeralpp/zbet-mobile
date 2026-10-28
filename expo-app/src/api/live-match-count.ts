import type { MatchSummary } from "./schemas";

type MatchCountSource = {
  data: readonly Pick<MatchSummary, "status">[] | undefined;
  isError: boolean;
  fetchStatus: "fetching" | "paused" | "idle";
};
type DashboardCountSource = {
  data: { liveMatchCount: number } | undefined;
  isError: boolean;
};

/** One snapshot policy for Summary, navigation and Jinx. Unknown is not zero. */
export function resolveLiveMatchCount(matches: MatchCountSource, dashboard: DashboardCountSource): number | null {
  if (matches.isError) return null;
  if (matches.data !== undefined) {
    return matches.data.filter(match => match.status === "LIVE" || match.status === "HALF_TIME").length;
  }
  // A complete match read is in flight; an older dashboard cannot override it.
  if (matches.fetchStatus !== "idle" || dashboard.isError) return null;
  return dashboard.data?.liveMatchCount ?? null;
}
