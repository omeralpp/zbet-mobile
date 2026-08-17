import { queryOptions } from "@tanstack/react-query";
import { mobileApi } from "./index";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  matches: ["matches"] as const,
  matchInsights: ["matchInsights"] as const,
  matchInsight: (key: string) => ["matchInsights", key] as const,
  matchLeagueContext: (key: string) =>
    ["matches", key, "leagueContext"] as const,
  match: (key: string) => ["matches", key] as const,
  matchPeriodScore: (key: string) => ["matches", key, "periodScore"] as const,
  matchSuperLogs: (key: string) => ["matches", key, "superLogs"] as const,
  matchLiveContext: (key: string) => ["matches", key, "liveContext"] as const,
  superLogs: ["superLogs"] as const,
  superKpis: ["superKpis"] as const,
  superLog: (key: string) => ["superLogs", key] as const,
  superLogPeriodScore: (key: string) =>
    ["superLogs", key, "periodScore"] as const,
  totoPrograms: ["totoPrograms"] as const,
  totoProgram: (gcNo: number, version: number) =>
    ["totoPrograms", gcNo, version] as const
};

export const dashboardQuery = queryOptions({
  queryKey: queryKeys.dashboard,
  queryFn: ({ signal }) => mobileApi.getDashboard(signal),
  staleTime: 30_000
});

export const matchesQuery = queryOptions({
  queryKey: queryKeys.matches,
  queryFn: ({ signal }) => mobileApi.getMatches(signal),
  staleTime: 20_000,
  refetchInterval: 60_000
});

export const matchInsightsQuery = queryOptions({
  queryKey: queryKeys.matchInsights,
  queryFn: ({ signal }) => mobileApi.getMatchInsights(signal),
  staleTime: 20_000,
  refetchInterval: 60_000
});

export function matchInsightQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.matchInsight(key),
    queryFn: ({ signal }) => mobileApi.getMatchInsight(key, signal),
    staleTime: 15_000,
    enabled: Boolean(key),
    retry: 1
  });
}

export function matchLeagueContextQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.matchLeagueContext(key),
    queryFn: ({ signal }) => mobileApi.getMatchLeagueContext(key, signal),
    staleTime: 60_000,
    enabled: Boolean(key),
    retry: 1
  });
}

export function matchQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.match(key),
    queryFn: ({ signal }) => mobileApi.getMatch(key, signal),
    staleTime: 15_000,
    enabled: Boolean(key)
  });
}

export function matchPeriodScoreQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.matchPeriodScore(key),
    queryFn: ({ signal }) => mobileApi.getMatchPeriodScore(key, signal),
    staleTime: 15_000,
    enabled: Boolean(key),
    retry: 1
  });
}

export function matchSuperLogsQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.matchSuperLogs(key),
    queryFn: ({ signal }) => mobileApi.getMatchSuperLogs(key, signal),
    staleTime: 15_000,
    enabled: Boolean(key),
    retry: 1
  });
}

/**
 * Live context is supplementary to Match Detail, so it never blocks the screen.
 * A 503 (provider runtime not configured) is a settled answer rather than a
 * transient fault, so it is not retried.
 */
export function matchLiveContextQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.matchLiveContext(key),
    queryFn: ({ signal }) => mobileApi.getMatchLiveContext(key, signal),
    staleTime: 30_000,
    enabled: Boolean(key),
    retry: false
  });
}

export const superLogsQuery = queryOptions({
  queryKey: queryKeys.superLogs,
  queryFn: ({ signal }) => mobileApi.getSuperLogs(signal),
  staleTime: 30_000
});

export const superKpisQuery = queryOptions({
  queryKey: queryKeys.superKpis,
  queryFn: ({ signal }) => mobileApi.getSuperKpis(signal),
  staleTime: 30_000
});

export function superLogQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.superLog(key),
    queryFn: ({ signal }) => mobileApi.getSuperLog(key, signal),
    staleTime: 30_000,
    enabled: Boolean(key)
  });
}

export function superLogPeriodScoreQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.superLogPeriodScore(key),
    queryFn: ({ signal }) => mobileApi.getSuperLogPeriodScore(key, signal),
    staleTime: 30_000,
    enabled: Boolean(key),
    retry: 1
  });
}

export const totoProgramsQuery = queryOptions({
  queryKey: queryKeys.totoPrograms,
  queryFn: ({ signal }) => mobileApi.getTotoPrograms(signal),
  staleTime: 60_000
});

export function totoProgramQuery(gcNo: number, version: number) {
  return queryOptions({
    queryKey: queryKeys.totoProgram(gcNo, version),
    queryFn: ({ signal }) =>
      mobileApi.getTotoProgram(gcNo, version, signal),
    staleTime: 60_000,
    enabled: gcNo > 0 && version > 0
  });
}
