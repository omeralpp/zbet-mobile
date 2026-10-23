import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MatchSummary } from "./schemas";
import type { RebuildRecommendation } from "./rebuild-schemas";
import { rebuildCohortsReportQuery } from "./queries";

const empty: readonly RebuildRecommendation[] = [];
const retainedKey = ["lastVerifiedPublishedSelections"] as const;
/** Cards, filters and counters share one publication cache and refresh policy. */
export function usePublishedSelections(matches: readonly MatchSummary[] | undefined) {
  const enabled=!!matches?.some(match=>match.rebuild);
  const query=useQuery({...rebuildCohortsReportQuery,enabled});
  const cache=useQueryClient();
  // One shared, memory-only snapshot survives an unavailable report response.
  // It is historical display evidence; unavailable still disables playability.
  const retained=useQuery({queryKey:retainedKey,queryFn:async()=>empty,enabled:false,staleTime:Infinity});
  const verified=query.data?.availability === "AVAILABLE";
  const received=query.data?.recommendations ?? empty;
  useEffect(()=>{if (verified) cache.setQueryData(retainedKey,received);},[cache,verified,received]);
  const attempted=useRef(new Set<string>());
  const ids=(matches??[]).flatMap(match=>match.rebuild?.current ? [match.rebuild.current.decisionId] : []).join(",");
  const records=verified ? received : retained.data ?? empty;
  const refresh=query.refetch;
  useEffect(()=>{
    if (!query.isSuccess || query.isError || !ids) return;
    const known=new Set(records.map(record=>record.decisionId));
    const missing=ids.split(",").filter(id=>!known.has(id) && !attempted.current.has(id));
    if (missing.length) {
      missing.forEach(id=>attempted.current.add(id));
      void refresh({cancelRefetch:false});
    }
  },[ids,records,query.isSuccess,query.isError,refresh]);
  return {query,records,pending:enabled && query.isPending,
    unavailable:enabled && (query.isPending || query.isError || query.data?.availability === "UNAVAILABLE")};
}
