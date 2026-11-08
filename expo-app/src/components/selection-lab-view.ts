import type { MatchDetail } from "@/src/api/schemas";
import type { SelectionComparison } from "@/src/api/selection-comparison-schema";

export const selectionArmLabels = { C0: "Mevcut BTB", C1: "Maç başına sınır", C2: "Form + canlı", C3: "Form + fiyat" } as const;
export const selectionArmDescriptions = {
  C0: "Kabul edilmiş modelin aynı andaki kararı.",
  C1: "Ayrı deney: bir maçta ilk yayından sonra yeni seçim yapmaz.",
  C2: "Takım geçmişi, skor ve kalan süre birlikte değerlendirilir.",
  C3: "Form modelinin olasılığı, fiyat ve belirsizlik koşuluyla karşılaştırılır."
} as const;

const reasons: Record<string, string> = {
  NOT_PUBLISHED: "Bu maç için deney yayını henüz yok.",
  PRODUCER_NOT_CONFIGURED: "Karşılaştırma yayını henüz başlamadı.",
  PUBLICATION_INVALID: "Yayın doğrulanamadı; eski seçim gösterilmiyor.",
  PUBLICATION_EXPIRED: "Karşılaştırmanın süresi doldu; yeni yayın bekleniyor.",
  FOOTBALL_STATE_CHANGED: "Maç durumu değişti; yeni karşılaştırma bekleniyor.",
  CHAMPION_CHANGED: "BTB kararı değişti; eşleşen karşılaştırma bekleniyor.",
  QUOTE_CHANGED: "Piyasa oranı değişti veya kapandı; yeni karşılaştırma bekleniyor.",
  SOURCE_PROOF_UNAVAILABLE: "Karar anının kaynak kanıtı değişti veya doğrulanamadı.",
  FORM_UNAVAILABLE: "Karar anına ait doğrulanmış takım geçmişi eksik.",
  MODEL_NOT_VALIDATED: "Form modelinin zaman dışı doğrulaması tamamlanmadı.",
  PRICE_NOT_ADMITTED: "Fiyat ve belirsizlik koşulu sağlanmadı.",
  EXPOSURE_LIMIT: "Bu maçın deney sınırına ulaşıldı.",
  NO_SELECTION: "Bu yöntem bu anda seçim yapmadı.",
  TRIAL_STOPPED: "Deney durduruldu."
};
export const selectionReason = (reason: string) => reasons[reason] ?? "Bu yöntem için doğrulanmış seçim yok.";

/** Fail closed on errors, expiry, key changes and score/card/clock revisions. */
export function currentSelectionComparison(data: SelectionComparison | undefined, match: MatchDetail, now: number, failed = false) {
  if (!data || failed || data.availability !== "AVAILABLE" || data.matchKey !== match.key || !data.asOf || !data.expiresAt || !data.state ||
    !Number.isFinite(now) || Date.parse(data.asOf) > now || Date.parse(data.expiresAt) <= now) return null;
  const state = data.state;
  if (match.status !== "LIVE" || match.clock?.period !== state.period ||
    (["homeScore", "awayScore", "elapsed", "homeRedCards", "awayRedCards"] as const).some(key => match[key] !== state[key])) return null;
  const current = match.rebuild?.current;
  const champion = data.proposals[0]!;
  if (Boolean(current) !== (champion.status === "SELECTED") || (current && (current.decisionId !== champion.selection?.publicationId ||
    current.market !== champion.selection.market || Number(current.quote) !== champion.selection.quote))) return null;
  return data;
}
