import type { RebuildMatch } from "@/src/api/rebuild-schemas";
import { rebuildReason } from "./rebuild-current";

/** A failed/loading read never establishes zero published recommendations. */
export function decisionEvidenceStatus(data: {
  availability: RebuildMatch["availability"];
  reason: string;
  history: readonly unknown[];
} | undefined, isLoading: boolean, isError: boolean) {
  if (!data) {
    if (isLoading) return { kind: "LOADING" as const, count: null, title: "Karar kayıtları yükleniyor", detail: "Yayımlanmış öneriler ve karar anındaki kanıtlar hazırlanıyor." };
    return { kind: "ERROR" as const, count: null, title: "Karar kayıtları alınamadı", detail: "Öneri sayısı doğrulanamadı. Yeniden deneyebilirsin." };
  }
  if (!data.history.length && data.availability === "UNAVAILABLE") {
    return { kind: "UNAVAILABLE" as const, count: null, title: "Karar kanıtı kullanılamıyor", detail: rebuildReason(data.reason) };
  }
  if (!data.history.length) {
    return { kind: "EMPTY" as const, count: 0, title: data.availability === "NOT_STARTED" ? "Değerlendirme henüz başlamadı" : "Henüz yayımlanmış öneri yok", detail: rebuildReason(data.reason) };
  }
  return { kind: "READY" as const, count: data.history.length, title: "Yayımlanmış öneriler", detail: isError ? "Güncelleme alınamadı; son alınan kayıtlar gösteriliyor." : null };
}
