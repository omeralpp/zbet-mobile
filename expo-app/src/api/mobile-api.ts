import type {
  Dashboard,
  MatchDetail,
  MatchInsight,
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
  getMatch(key: string, signal?: AbortSignal): Promise<MatchDetail>;
  getMatchPeriodScore(
    key: string,
    signal?: AbortSignal
  ): Promise<PeriodScoreContext>;
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
