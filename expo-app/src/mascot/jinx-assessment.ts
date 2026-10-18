import type { AnalysisContext, JinxAssessment, JinxLean, JinxSignal } from "../api/schemas";
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

/**
 * Preview-only pilot signal for mock and design-lab builds, shaped exactly like
 * the BFF's JINX_LEAN_PILOT_V1 so the card renders the same way. Live builds
 * always receive the server's signal.
 */
export function previewJinxSignal(context: AnalysisContext): JinxSignal | null {
  const match = context.sources.matchDetail;
  const confidence = match.decisionConfidence;
  if (!context.selectionKey || confidence === null || confidence <= 0) return null;
  const odds = match.currentRate !== null && match.currentRate > 1 ? match.currentRate : null;
  const impliedProbability = odds === null ? null : 1 / odds;
  const edge = impliedProbability === null ? null : confidence - impliedProbability;
  const lean: JinxLean | null = edge === null ? null : edge >= 0.05 ? "FAVORABLE" : edge <= -0.05 ? "UNFAVORABLE" : "NEUTRAL";
  return { policyId: "JINX_LEAN_PILOT_V1", basis: "POOL_SHARE_UNCALIBRATED", confidence, odds,
    impliedProbability, edge, lean, pressure: null };
}

export const assessmentLabels = { FAVORABLE: "Oynamak için olumlu", UNFAVORABLE: "Oynamak için olumsuz", WAIT: "Bahis önerisi yok" };
export const leanLabels: Record<JinxLean, string> = { FAVORABLE: "Lehte", NEUTRAL: "Dengede", UNFAVORABLE: "Aleyhte" };
export const analysisSourceLabels: Record<string, string> = {
  matchDetail: "Maç ve seçim", insight: "Saha göstergeleri", periodScore: "Devre skoru",
  leagueContext: "Lig durumu", superLogs: "Karar geçmişi", liveContext: "Canlı olaylar",
  teamForm: "Takım formu", matchPath: "Benzer maçlar", matchJourney: "Maçın yolu"
};

/** The pilot signal of a V4 reading; V3 readings carry none. */
export function assessmentSignal(dto: JinxAssessment | undefined): JinxSignal | null {
  return dto && "signal" in dto ? dto.signal : null;
}

const percent = (ratio: number) => `%${Math.round(ratio * 100)}`;

/** Short labelled facts shown under the confidence, in reading order. */
export function signalFacts(signal: JinxSignal, teams: { homeTeam: string; awayTeam: string }) {
  const facts = [{ key: "pool", label: "Havuz", value: percent(signal.confidence) }];
  if (signal.odds !== null && signal.impliedProbability !== null)
    facts.push({ key: "market", label: "Piyasa", value: `${percent(signal.impliedProbability)} · ${signal.odds.toFixed(2).replace(".", ",")}` });
  const pressure = signal.pressure;
  if (pressure?.leader === "HOME" || pressure?.leader === "AWAY") {
    const share = pressure.leader === "HOME" ? pressure.homeShare! : 1 - pressure.homeShare!;
    facts.push({ key: "pressure", label: "Baskı", value: `${pressure.leader === "HOME" ? teams.homeTeam : teams.awayTeam} ${percent(share)}` });
  } else if (pressure?.leader === "BALANCED") facts.push({ key: "pressure", label: "Baskı", value: "Dengede" });
  return facts;
}

export function assessmentIsCurrent(dto: JinxAssessment | undefined, context: AnalysisContext | undefined, now = Date.now()) {
  return Boolean(dto && context && dto.matchKey === context.matchKey && dto.selectionKey === context.selectionKey
    && dto.evidenceRevision === context.evidenceRevision && Date.parse(dto.expiresAt) > now);
}

export function analysisNeedsRefresh(context: AnalysisContext | undefined, error: unknown, now = Date.now()) {
  return !context || !(Date.parse(context.expiresAt) > now) || (typeof error === "object" && error !== null
    && "code" in error && error.code === "ANALYSIS_SNAPSHOT_EXPIRED");
}
