import type {
  Dashboard,
  MatchDetail,
  MatchSummary,
  SuperLog,
  TotoProgram
} from "./schemas";

export interface MobileApi {
  getDashboard(signal?: AbortSignal): Promise<Dashboard>;
  getMatches(signal?: AbortSignal): Promise<MatchSummary[]>;
  getMatch(key: string, signal?: AbortSignal): Promise<MatchDetail>;
  getSuperLogs(signal?: AbortSignal): Promise<SuperLog[]>;
  getTotoPrograms(signal?: AbortSignal): Promise<TotoProgram[]>;
  getTotoProgram(
    gcNo: number,
    version: number,
    signal?: AbortSignal
  ): Promise<TotoProgram>;
  registerDevice(
    token: string,
    platform: "android" | "ios",
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
