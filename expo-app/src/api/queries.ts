import { queryOptions } from "@tanstack/react-query";
import { mobileApi } from "./index";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  matches: ["matches"] as const,
  match: (key: string) => ["matches", key] as const,
  superLogs: ["superLogs"] as const,
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

export function matchQuery(key: string) {
  return queryOptions({
    queryKey: queryKeys.match(key),
    queryFn: ({ signal }) => mobileApi.getMatch(key, signal),
    staleTime: 15_000,
    enabled: Boolean(key)
  });
}

export const superLogsQuery = queryOptions({
  queryKey: queryKeys.superLogs,
  queryFn: ({ signal }) => mobileApi.getSuperLogs(signal),
  staleTime: 30_000
});

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
