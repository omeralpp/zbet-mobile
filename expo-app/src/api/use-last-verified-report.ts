import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { RebuildCohortsReport } from "./rebuild-schemas";

const retainedKey = (scope: string) => ["lastVerifiedReport", scope] as const;

/**
 * The newest verified report of one log scope, kept in memory only. It is
 * historical display evidence for the Karar günlüğü; it never decides whether
 * a selection is playable.
 */
export function useLastVerifiedReport(scope: string, latest: RebuildCohortsReport | undefined): RebuildCohortsReport | null {
  const cache = useQueryClient();
  const retained = useQuery<RebuildCohortsReport | null>({ queryKey: retainedKey(scope), queryFn: async () => null, enabled: false, staleTime: Infinity });
  useEffect(() => {
    if (latest?.availability === "AVAILABLE") cache.setQueryData(retainedKey(scope), latest);
  }, [cache, scope, latest]);
  return retained.data ?? null;
}
