import type { RebuildSummary, RebuildMatch } from "../api/rebuild-schemas";
import { currentRebuild, rebuildReason } from "./rebuild-current";
import { formatScore } from "./rebuild-display";

export function candidateFacts(candidate: RebuildMatch["candidates"][number]) {
  const score = candidate.consistencyScore === null ? "Puan hesaplanmadı" : `Puan ${formatScore(candidate.consistencyScore)}`;
  const votes = candidate.votesUsed > 0 ? `${candidate.votesSupport}/${candidate.votesUsed} teyit`
    : candidate.votes.length ? `${candidate.votes.filter(vote=>vote.supports).length}/${candidate.votes.length} ölçüm destekliyor · teyit yok` : "Teyit kaydı yok";
  const pool = candidate.poolTotal > 0 ? `${candidate.poolWins}/${candidate.poolTotal} havuz desteği` : "Havuz desteği hesaplanmadı";
  return `${score} · ${votes} · ${pool}`;
}

/** Presentation only: never admit a selection or relabel invalid data as proof. */
export function rebuildPresentation({ status, summary, now, error = false, redUnknown = false }: {
  status: string; summary: RebuildSummary | undefined; now: number; error?: boolean; redUnknown?: boolean | undefined;
}) {
  if (status === "FINISHED") return { label: "MAÇ TAMAMLANDI", text: "Maç tamamlandı · güncel seçim yok", tone: "neutral" as const };
  if (status === "NOT_PLAYED") return { label: "MAÇ OYNANMADI", text: "Maç oynanmadı · güncel seçim yok", tone: "neutral" as const };
  if (error) return { label: "VERİ ALINAMADI", text: "Güncel veri alınamadı · yeniden dene", tone: "warning" as const };
  if (currentRebuild(summary, now)) return { label: "GÜNCEL SEÇİM", text: "Güncel seçim doğrulandı", tone: "positive" as const };
  if (redUnknown || summary?.reason === "RED_CARD_UNKNOWN") return { label: "KART VERİSİ BEKLENİYOR", text: "Kart verisi bekleniyor · öneri üretilemiyor", tone: "warning" as const };
  if (summary?.availability === "NOT_STARTED" || status === "NOT_STARTED") return { label: "BAŞLAMADI", text: "Maç başlamadı · güncel seçim yok", tone: "neutral" as const };
  if (summary?.availability === "ACTIVE") return { label: "GÜNCEL VERİ BEKLENİYOR", text: "Oran / ölçüm güncel değil · güncel seçim yok", tone: "warning" as const };
  // These reasons describe a successfully verified context with no selection.
  const reason = summary?.reason;
  if (reason && ["NO_SELECTION", "SECOND_HALF_REQUIRED", "WAITING_CONFIRMATION", "CONFIRMATION_PENDING", "PRESSURE_FAILED", "LEADER_FAILED", "SCORE_FAILED"].includes(reason)) {
    return { label: "MAÇ İZLENİYOR", text: `Maç izleniyor · uygun seçim yok${reason === "SECOND_HALF_REQUIRED" ? " · ikinci yarı bekleniyor" : ""}`, tone: "neutral" as const };
  }
  return { label: "GÜNCEL VERİ BEKLENİYOR", text: `Güncel veri bekleniyor · ${rebuildReason(reason)}`, tone: "warning" as const };
}
