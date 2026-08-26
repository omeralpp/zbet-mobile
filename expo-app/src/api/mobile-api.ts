import type {
  Dashboard,
  JinxQuipRequest,
  JinxQuipResponse,
  LiveContext,
  MatchDetail,
  MatchInsight,
  MatchLeagueContext,
  MatchSummary,
  PeriodScoreContext,
  SuperLog,
  SuperLogDetail,
  SuperKpis,
  TotoProgram
} from "./schemas";

export interface MobileApi {
  getDashboard(signal?: AbortSignal): Promise<Dashboard>;
  getMatches(signal?: AbortSignal): Promise<MatchSummary[]>;
  getMatchInsights(signal?: AbortSignal): Promise<MatchInsight[]>;
  getMatchInsight(key: string, signal?: AbortSignal): Promise<MatchInsight>;
  getMatchLeagueContext(
    key: string,
    signal?: AbortSignal
  ): Promise<MatchLeagueContext>;
  getMatch(key: string, signal?: AbortSignal): Promise<MatchDetail>;
  getMatchPeriodScore(
    key: string,
    signal?: AbortSignal
  ): Promise<PeriodScoreContext>;
  /**
   * Provider-neutral live match context. Mobile never calls a provider
   * directly; this is the only route that carries timeline and lineup data.
   */
  getMatchLiveContext(key: string, signal?: AbortSignal): Promise<LiveContext>;
  getMatchSuperLogs(key: string, signal?: AbortSignal): Promise<SuperLog[]>;
  getSuperLogs(signal?: AbortSignal): Promise<SuperLog[]>;
  getSuperKpis(signal?: AbortSignal): Promise<SuperKpis>;
  getSuperLog(key: string, signal?: AbortSignal): Promise<SuperLogDetail>;
  getSuperLogPeriodScore(
    key: string,
    signal?: AbortSignal
  ): Promise<PeriodScoreContext>;
  getTotoPrograms(signal?: AbortSignal): Promise<TotoProgram[]>;
  getTotoProgram(
    gcNo: number,
    version: number,
    signal?: AbortSignal
  ): Promise<TotoProgram>;
  getJinxQuip(
    mood: JinxQuipRequest,
    signal?: AbortSignal
  ): Promise<JinxQuipResponse>;
  registerDevice(
    token: string,
    platform: "android" | "ios",
    installationId?: string,
    signal?: AbortSignal
  ): Promise<void>;
  unregisterDevice(
    installationId: string,
    signal?: AbortSignal
  ): Promise<void>;
}

export class MobileApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "MobileApiError";
  }
}
