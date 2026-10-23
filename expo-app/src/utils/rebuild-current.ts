import type { RebuildSummary } from "../api/rebuild-schemas";
export function currentRebuild(summary: RebuildSummary | undefined, now: number) {
  return summary?.availability === "ACTIVE" && summary.current && Date.parse(summary.current.validUntil) >= now ? summary.current : null;
}
export function rebuildCalendarDay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}
export function rebuildReason(reason: string | undefined) {
  const labels: Record<string, string> = {
    DUMMY_NOT_PUBLISHED: "Henüz yayımlanmış öneri yok.", NOT_STARTED: "Bu maç için henüz değerlendirme başlamadı.",
    MODEL_NOT_ENABLED: "Yeni BTB sürümü henüz devreye alınmadı.", ACTIVE: "Güncel seçim doğrulandı.",
    NO_SELECTION: "Bu değerlendirmede uygun seçim yok.", WAITING_CONFIRMATION: "Baskı teyidi için yeterli aralık bekleniyor.",
    RED_CARD_UNKNOWN: "Kart verisi bekleniyor; bu bilgi doğrulanana kadar öneri üretilemiyor.",
    QUOTE_STALE: "Son oran ölçümünün geçerlilik süresi doldu; yeni oran bekleniyor.",
    ENDPOINT_STALE: "Son maç veya baskı ölçümü güncel değil; yeni ölçüm bekleniyor.",
    CONFIRMATION_PENDING: "İki destekleyici baskı aralığı bekleniyor.", PRESSURE_FAILED: "Son baskı ölçümleri seçimi desteklemiyor.",
    LEADER_FAILED: "Lider skorlardan biri bu seçimi desteklemiyor.", SCORE_FAILED: "Tutarlılık puanı öneri eşiğinin altında.",
    SECOND_HALF_REQUIRED: "İkinci yarı bekleniyor.", MARKET_ALREADY_DECIDED: "Bu bahis mevcut skorla zaten sonuçlanmış.",
    PRICE_CEILING: "Oran izin verilen tavanın üzerinde.", ADMITTED: "Uygun aday.",
    TRANSACTION_RECONCILIATION_REQUIRED: "Kayıt kontrolü tamamlanana kadar öneriler duraklatıldı."
  };
  if (!reason) return "Veri alınıyor.";
  if (labels[reason]) return labels[reason];
  if (/QUOTE|MARKET_CLOSED/.test(reason)) return "Bu pazarın güncel ve açık oranı doğrulanamadı.";
  if (/POOL|ARCHIVE/.test(reason)) return "Skor havuzunun kanıtı doğrulanamadı.";
  if (/PRESSURE|INTERVAL|VOTE/.test(reason)) return "Güncel baskı ölçümleri doğrulanamadı.";
  if (/OBSERVATION|CLOCK|INPUT|SOURCE/.test(reason)) return "Güncel maç verisi doğrulanamadı.";
  return "Veri veya karar kanıtı doğrulanamadı.";
}
