import type { AnalysisContext, JinxAssessment } from "../api/schemas";

export const assessmentLabels = { FAVORABLE: "Oynamak için olumlu", UNFAVORABLE: "Oynamak için olumsuz", WAIT: "Bekle" };
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
