import type { RebuildMatch, RebuildRecommendation, RebuildSummary } from "../api/rebuild-schemas";
import { currentRebuild } from "./rebuild-current";

// These evaluator outcomes occur after its open/current quote checks. A
// candidate can lose eligibility while its market still has a valid price.
const pricedReasons = new Set([
  "ADMITTED", "PRICE_CEILING", "PERIOD_CONTEXT_INVALID", "INTERVAL_EVIDENCE_INVALID",
  "LEADER_FAILED", "CONFIRMATION_PENDING", "PREDECESSOR_INVALID", "PRESSURE_FAILED", "SCORE_FAILED"
]);
// These native evaluator exits follow BOTH the quote and market_open checks.
// Earlier exits can contain a valid quote without proving an undecided market.
const undecidedReasons = new Set([
  "ADMITTED", "LEADER_FAILED", "CONFIRMATION_PENDING", "PREDECESSOR_INVALID", "PRESSURE_FAILED", "SCORE_FAILED"
]);

/** Live also uses `decision` for STAR_* filters; those are not record IDs. */
export function requestedDecision(value: unknown) {
  return typeof value === "string" && /^[A-F0-9]{32}$/.test(value) ? value : null;
}

export function latestPublished(records: readonly RebuildRecommendation[], matchKey: string) {
  const fixture = matchKey.split(":").slice(0, 2).join(":");
  return records.reduce<RebuildRecommendation | null>((latest, item) =>
    item.matchKey.split(":").slice(0, 2).join(":") === fixture && (!latest || item.publishedAt > latest.publishedAt ||
      (item.publishedAt === latest.publishedAt && item.decisionId > latest.decisionId)) ? item : latest, null);
}

export function displayedDecision(records: readonly RebuildRecommendation[], matchKey: string, requested: string | null) {
  const fixture = matchKey.split(":").slice(0,2).join(":");
  return requested ? records.find(record => record.decisionId === requested && record.matchKey.split(":").slice(0,2).join(":") === fixture) ?? null : latestPublished(records, matchKey);
}

type HeroData = RebuildSummary & { history: readonly RebuildRecommendation[];
  candidates: readonly Pick<RebuildMatch["candidates"][number], "market" | "admitted" | "reason" | "quote" | "quoteAt">[] };

/** Recommendation eligibility and the published selection's playability are separate. */
export function rebuildHero({ data, matchKey, status, now, error = false, decisionId = null }: {
  data: HeroData | undefined; matchKey: string; status: string; now: number; error?: boolean; decisionId?: string | null;
}) {
  if (!data || data.matchKey !== matchKey) return null;
  // Older frozen records may have an unknown kickoff (00:00:00); SAP's
  // fixture identity is date + id, not the subsequently supplied kickoff.
  const record = displayedDecision(data.history, matchKey, decisionId);
  if (!record) return null;

  const live = status === "LIVE" || status === "HALF_TIME";
  const current = !error && live ? currentRebuild(data, now) : null;
  const active = current?.decisionId === record.decisionId && current.market === record.market;
  const matches = data.candidates.filter(item => item.market === record.market);
  const candidate = matches.length === 1 ? matches[0] : undefined;
  const pending = record.result.state === "PENDING";
  const resolved = !pending && record.result.state !== "UNRESOLVED";
  const closed = candidate && /^(QUOTE_CLOSED|MARKET_CLOSED)$/.test(candidate.reason);
  const decided = candidate?.reason === "MARKET_ALREADY_DECIDED";
  const quoteTime = Date.parse(candidate?.quoteAt ?? "");
  const price = Number(candidate?.quote);
  const freshQuote = !error && live && !resolved && !closed && !decided && data.availability !== "UNAVAILABLE" && data.availability !== "NOT_STARTED" &&
    candidate && (candidate.admitted || pricedReasons.has(candidate.reason)) &&
    Number.isFinite(price) && price > 1 && Number.isFinite(quoteTime) &&
    quoteTime <= Date.parse(data.asOf) && now >= quoteTime && now - quoteTime <= 15_000;
  const currentQuote = freshQuote ? candidate.quote : null;
  const quoteLabel = status === "FINISHED" ? "Maç tamamlandı" : status === "NOT_PLAYED" ? "Maç oynanmadı"
    : resolved || decided ? "Bahis sonuçlandı" : currentQuote ? "güncel oran" : closed ? "Oran kapalı" : "Güncel oran bekleniyor";
  const playable = !!currentQuote && pending && !!candidate && (candidate.admitted || undecidedReasons.has(candidate.reason));
  const state = status === "FINISHED" ? { label: "MAÇ TAMAMLANDI", text: "Maç tamamlandı; kararın sonucu kayıtta korunuyor.", tone: "neutral" as const }
    : status === "NOT_PLAYED" ? { label: "MAÇ OYNANMADI", text: "Maç oynanmadı; karar kaydı korunuyor.", tone: "neutral" as const }
    : resolved ? { label: "BAHİS SONUÇLANDI", text: "Bu seçim sonuçlandı; sonuç karar kaydında gösteriliyor.", tone: "neutral" as const }
    : error ? { label: "PİYASA DOĞRULANIYOR", text: "Güncel piyasa verisi alınamadı; seçim kaydı korunuyor.", tone: "warning" as const }
    : !live ? { label: "MAÇ DURUMU DOĞRULANIYOR", text: "Canlı maç durumu doğrulanmadan seçim aktif gösterilmez.", tone: "warning" as const }
    : closed ? { label: "ORAN KAPALI", text: "Son kontrolde piyasa kapalı; yeniden açılması bekleniyor.", tone: "warning" as const }
    : decided ? { label: "BAHİS SONUÇLANDI", text: "Skor durumuna göre bu piyasanın sonucu belli oldu.", tone: "neutral" as const }
    : playable ? { label: "SEÇİM AKTİF", text: "Oran açık · seçim henüz sonuçlanmadı.", tone: "positive" as const }
    : record.result.state === "UNRESOLVED" ? { label: "SONUÇ DOĞRULANIYOR", text: "Bu kararın sonucu doğrulanıyor; seçim kaydı korunuyor.", tone: "warning" as const }
    : active ? { label: "GÜNCEL SEÇİM", text: "Güncel seçim doğrulandı.", tone: "positive" as const }
    : { label: "PİYASA DOĞRULANIYOR", text: "Piyasanın açık ve seçimin hâlâ sonuçlanmamış olduğu doğrulanıyor; seçim kaydı korunuyor.", tone: "warning" as const };
  return { record, active, playable, currentQuote, quoteLabel, stateLabel: state.label, stateText: state.text, stateTone: state.tone };
}
