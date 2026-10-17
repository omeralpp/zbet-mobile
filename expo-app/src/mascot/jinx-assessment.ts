import type { AnalysisContext, JinxAssessment } from "../api/schemas";
import { formatSelection } from "../utils/format";

/** Preview-only wording; mixed synthetic sources never reach the live analyst. */
export function previewSelectionReading(context: AnalysisContext) {
  const match = context.sources.matchDetail;
  const totals = /^Ms(\d)5([au])$/.exec(match.selectedOdd ?? "");
  const prefix = `${match.elapsed}′ · ${match.homeScore}–${match.awayScore}: ${formatSelection(match.selectedOdd)}`;
  if (totals && match.homeScore !== null && match.awayScore !== null) {
    const needed = Number(totals[1]) + 1 - match.homeScore - match.awayScore;
    return totals[2] === "a" ? `${prefix}; ${needed > 0 ? `${needed} gol daha seçimi bozar` : "bu skorla artık karşılanamaz"}.`
      : `${prefix}; ${needed > 0 ? `${needed} gol daha gerekiyor` : "skor koşulu zaten sağlandı"}.`;
  }
  return `${prefix}; skor koşulu ve maçın akışı birlikte izleniyor.`;
}

export const assessmentLabels = { FAVORABLE: "Oynamak için olumlu", UNFAVORABLE: "Oynamak için olumsuz", WAIT: "Bahis önerisi yok" };
export const analysisSourceLabels: Record<string, string> = {
  matchDetail: "Maç ve seçim", insight: "Saha göstergeleri", periodScore: "Devre skoru",
  leagueContext: "Lig durumu", superLogs: "Karar geçmişi", liveContext: "Canlı olaylar",
  teamForm: "Takım formu", matchPath: "Benzer maçlar", matchJourney: "Maçın yolu"
};
export function assessmentIsCurrent(dto: JinxAssessment | undefined, context: AnalysisContext | undefined, now = Date.now()) {
  return Boolean(dto && context && dto.matchKey === context.matchKey && dto.selectionKey === context.selectionKey
    && dto.evidenceRevision === context.evidenceRevision && Date.parse(dto.expiresAt) > now);
}

export function analysisNeedsRefresh(context: AnalysisContext | undefined, error: unknown, now = Date.now()) {
  return !context || !(Date.parse(context.expiresAt) > now) || (typeof error === "object" && error !== null
    && "code" in error && error.code === "ANALYSIS_SNAPSHOT_EXPIRED");
}
