import { useQuery } from "@tanstack/react-query";
import { mobileApi } from "@/src/api";
import { superKpisQuery } from "@/src/api/queries";
import { useSuperStarFilter } from "@/src/preferences/SuperStarFilterProvider";
import { deriveJinxDailyMood, jinxMoodSignature, selectJinxMoodQuip } from "./jinx-mood";
import { acceptRemoteQuip, jinxQuipRequest } from "./jinx-quip-remote";

/**
 * NXT-OBS-174: Jinx's comment on the day's Super result, shared by the ambient
 * bubble and the Overview line so both always say the same thing. The BFF
 * wording is used only when it passes the client guard for the current
 * numbers; otherwise the deterministic repertoire speaks.
 */
export function useJinxDailyQuip() {
  const { filter } = useSuperStarFilter();
  const kpis = useQuery(superKpisQuery);
  const mood = deriveJinxDailyMood({ ready: kpis.isSuccess, metricDate: kpis.data?.metricDate,
    filter, bucket: kpis.data?.buckets[filter] });
  const signature = jinxMoodSignature(mood);
  const request = jinxQuipRequest(mood);
  const remote = useQuery({
    queryKey: ["jinxDailyQuip", signature, mood.won, mood.lost, mood.profit],
    enabled: Boolean(signature && request),
    staleTime: Infinity, gcTime: 6 * 60 * 60 * 1000, retry: false,
    queryFn: async ({ signal }) => {
      const response = await mobileApi.getJinxQuip(request!, signal);
      return response.enabled ? acceptRemoteQuip(response.body, mood) : null;
    }
  });
  const quip = selectJinxMoodQuip(mood);
  return { mood, signature, quip: quip ? { ...quip, body: remote.data ?? quip.body } : null };
}
