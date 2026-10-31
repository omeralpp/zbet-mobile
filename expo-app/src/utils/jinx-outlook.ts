import type { RebuildMatch, RebuildSummary } from "../api/rebuild-schemas";
import { currentRebuild, rebuildReason } from "./rebuild-current";

type Candidate = RebuildMatch["candidates"][number];
export type JinxOutlook = {
  kind: "ACT" | "WATCH" | "NONE" | "ERROR";
  label: string; tone: "positive" | "pending" | "neutral" | "warning";
  text: string; detail?: string;
};
// Successfully evaluated cycles that simply found no eligible market.
const evaluated = new Set(["NO_SELECTION", "SECOND_HALF_REQUIRED", "WAITING_CONFIRMATION", "CONFIRMATION_PENDING", "PRESSURE_FAILED", "LEADER_FAILED", "SCORE_FAILED"]);
const watchText: Record<string, string> = {
  NO_SELECTION: "Şu an hiçbir pazar öneri koşullarını karşılamıyor.",
  SECOND_HALF_REQUIRED: "Öneri için ikinci yarı bekleniyor."
};

/** What this match can still offer: a current selection, a decision worth
 * waiting for, or nothing more. Labels speak only about that outlook, so they
 * never echo the hero's match-state label. Presentation only; never admits a selection. */
export function jinxOutlook({ status, data, now, error = false, loading = false }: {
  status: string; now: number; error?: boolean; loading?: boolean;
  data: RebuildSummary & { candidates?: readonly Pick<Candidate, "reason">[] } | undefined;
}): JinxOutlook {
  const none = (text: string, detail?: string): JinxOutlook => ({ kind: "NONE", label: "KARAR BEKLENMİYOR", tone: "neutral", text, ...(detail ? { detail } : {}) });
  const watch = (text: string, tone: JinxOutlook["tone"] = "pending", label = "KARAR GELEBİLİR"): JinxOutlook => ({ kind: "WATCH", label, tone, text });
  if (error) return { kind: "ERROR", label: "YENİLENEMEDİ", tone: "warning", text: "Güncel karar verisi alınamadı." };
  if (status === "FINISHED") return none("Maç bitti; bu maç için yeni öneri üretilmez.");
  if (status === "NOT_PLAYED") return none("Maç oynanmadı; bu maç için öneri üretilmez.");
  if (!data) return watch(loading ? "Karar verisi okunuyor." : "Karar verisi henüz alınmadı.", "neutral", "OKUNUYOR");
  if (currentRebuild(data, now)) return { kind: "ACT", label: "GÜNCEL SEÇİM", tone: "positive", text: "Güncel seçim doğrulandı." };
  // The provider sends no red-card counter for either side; it may never arrive.
  if (data.reason === "RED_CARD_UNKNOWN" || data.candidates?.some(candidate => candidate.reason === "RED_CARD_UNKNOWN"))
    return none("Sağlayıcı bu maç için kırmızı kart sayısını göndermiyor. Bu veri gelmezse BTB bu maçta öneri üretmez.",
      "Skor ve baskı izlenmeye devam ediyor.");
  if (data.reason === "MODEL_NOT_ENABLED") return none("Yeni BTB sürümü devrede değil; bu maçta öneri üretilmiyor.");
  if (data.availability === "NOT_STARTED" || status === "NOT_STARTED") return watch("Değerlendirme maç başlayınca başlar.", "neutral");
  // Stale or unverified data pauses evaluation without ruling a decision out.
  if (data.availability === "ACTIVE") return watch("Seçimin geçerliliği doldu; yeni oran ve ölçüm bekleniyor.", "warning");
  if (evaluated.has(data.reason)) return watch(watchText[data.reason] ?? rebuildReason(data.reason));
  return watch(rebuildReason(data.reason), "warning");
}

/** Why no market qualifies, as counts per recorded reason (largest first).
 * Names no market, so a rejected candidate never reads as a tip. */
export function jinxBlockers(data: { reason: string; candidates: readonly Pick<Candidate, "admitted" | "reason">[] } | undefined, limit = 3) {
  const counts = new Map<string, number>();
  for (const candidate of data?.candidates ?? []) if (!candidate.admitted) counts.set(candidate.reason, (counts.get(candidate.reason) ?? 0) + 1);
  // One reason covering every market repeats the main sentence.
  const rows = [...counts].filter(([reason, count]) => !(reason === data?.reason && count === data.candidates.length))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([reason, count]) => ({ reason, count, label: rebuildReason(reason).replace(/\.$/, "") }));
  // A single leftover reason is named; only two or more share "Diğer nedenler".
  if (rows.length <= limit + 1) return rows;
  const rest = rows.slice(limit).reduce((sum, row) => sum + row.count, 0);
  return [...rows.slice(0, limit), { reason: "OTHER", count: rest, label: "Diğer nedenler" }];
}

const measured = (candidate: Candidate) => candidate.consistencyScore !== null || candidate.votesUsed > 0
  || candidate.votes.length > 0 || candidate.poolTotal > 0;

/** Dayanaklar: chosen and eligible markets one by one; rejected markets grouped
 * by reason, with facts only for markets the evaluation actually measured. */
export function candidateGroups(candidates: readonly Candidate[]) {
  const groups = new Map<string, { measured: Candidate[]; unmeasured: Candidate[] }>();
  for (const candidate of candidates) {
    if (candidate.selected || candidate.admitted) continue;
    const group = groups.get(candidate.reason) ?? { measured: [], unmeasured: [] };
    (measured(candidate) ? group.measured : group.unmeasured).push(candidate);
    groups.set(candidate.reason, group);
  }
  return {
    listed: candidates.filter(candidate => candidate.selected || candidate.admitted),
    rejected: [...groups].map(([reason, group]) => ({ reason, ...group, count: group.measured.length + group.unmeasured.length }))
      .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason))
  };
}
