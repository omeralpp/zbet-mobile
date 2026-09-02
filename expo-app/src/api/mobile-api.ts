import type {
  Dashboard,
  JinxMatchOutlook,
  JinxQuipRequest,
  JinxQuipResponse,
  LiveContext,
  MatchPathContext,
  MatchDetail,
  MatchInsight,
  MatchLeagueContext,
  MatchSummary,
  PeriodScoreContext,
  SuperLog,
  SuperLogDetail,
  SuperKpis,
  TeamFormContext,
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
  /**
   * Provider-neutral derived team form (M15 / TASK-0040).
   *
   * Read-only and already summarised: the raw provider payload is terminated at
   * the BFF and never reaches this app.
   */
  getMatchTeamForm(key: string, signal?: AbortSignal): Promise<TeamFormContext>;
  /**
   * Similar-match cohort trajectory (M15 / TASK-0045).
   *
   * The v1 payload is synthetic and says so through `origin`. The real engine
   * is TASK-0044 under M9; this route exists so the client can be built and
   * verified against the shape that engine will eventually serve.
   */
  getMatchPath(key: string, signal?: AbortSignal): Promise<MatchPathContext>;
  /**
   * Informative Jinx reading of one match (M15 / TASK-0046).
   *
   * User-triggered rather than ambient, so it is never fetched until asked for.
   * Real centralized analysis is TASK-0011 under M11.
   */
  getMatchJinxOutlook(
    key: string,
    signal?: AbortSignal
  ): Promise<JinxMatchOutlook>;
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
