import { MobileApiError } from "./mobile-api";

export function assertDecisionContextResponse(path: string, data: unknown, version: string | null, acknowledged: string | null) {
  if (!version) return;
  const fail = () => { throw new MobileApiError("Son ölçüm aralığı sözleşmesi henüz kullanılamıyor.",
    503, "DECISION_CONTEXT_UNAVAILABLE"); };
  if (acknowledged !== version) fail();
  let records: unknown[] | null = null;
  if (path === "/v1/dashboard") {
    if (!data || typeof data !== "object" || !("featuredMatches" in data) || !Array.isArray(data.featuredMatches)) fail();
    records = (data as { featuredMatches: unknown[] }).featuredMatches;
  }
  if (path === "/v1/btb/matches" || /^\/v1\/btb\/matches\/[^/]+$/.test(path) || /^\/v1\/super\/logs\/[^/]+$/.test(path))
    records = Array.isArray(data) ? data : [data];
  if (/^\/v1\/btb\/matches\/[^/]+\/match-journey$/.test(path)) {
    if (!data || typeof data !== "object" || !("points" in data) || !Array.isArray(data.points)) fail();
    records = (data as { points: unknown[] }).points;
  }
  if (records?.some(record => !record || typeof record !== "object" || !("decisionContext" in record) ||
      (record.decisionContext as { contractVersion?: string } | null)?.contractVersion !== version)) fail();
}
