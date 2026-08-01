import {
  dashboardSchema,
  matchDetailSchema,
  matchInsightListSchema,
  matchInsightSchema,
  matchListSchema,
  superLogDetailSchema,
  superLogListSchema,
  superKpisSchema,
  totoProgramListSchema,
  totoProgramSchema
} from "./schemas";
import {
  mockDashboard,
  mockMatchInsights,
  mockMatchSummaries,
  mockMatches,
  mockSuperKpis,
  mockSuperLogs,
  mockTotoPrograms
} from "./mock-data";
import { MobileApiError, type MobileApi } from "./mobile-api";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function mockDelay(signal?: AbortSignal): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, 120);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new DOMException("Request aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

export const mockMobileApi: MobileApi = {
  async getDashboard(signal) {
    await mockDelay(signal);
    return dashboardSchema.parse(clone(mockDashboard));
  },

  async getMatches(signal) {
    await mockDelay(signal);
    return matchListSchema.parse(clone(mockMatchSummaries));
  },

  async getMatchInsights(signal) {
    await mockDelay(signal);
    return matchInsightListSchema.parse(clone(mockMatchInsights));
  },

  async getMatchInsight(key, signal) {
    await mockDelay(signal);
    const insight = mockMatchInsights.find((candidate) => candidate.key === key);
    if (!insight) {
      throw new MobileApiError(
        "Maç göstergesi bulunamadı.",
        404,
        "MATCH_INSIGHT_NOT_FOUND"
      );
    }
    return matchInsightSchema.parse(clone(insight));
  },

  async getMatch(key, signal) {
    await mockDelay(signal);
    const match = mockMatches.find((candidate) => candidate.key === key);
    if (!match) {
      throw new MobileApiError("Maç bulunamadı.", 404, "MATCH_NOT_FOUND");
    }
    return matchDetailSchema.parse(clone(match));
  },

  async getSuperLogs(signal) {
    await mockDelay(signal);
    return superLogListSchema.parse(clone(mockSuperLogs));
  },

  async getSuperKpis(signal) {
    await mockDelay(signal);
    return superKpisSchema.parse(clone(mockSuperKpis));
  },

  async getSuperLog(key, signal) {
    await mockDelay(signal);
    const log = mockSuperLogs.find((candidate) => candidate.key === key);
    if (!log) {
      throw new MobileApiError(
        "Super kararı bulunamadı.",
        404,
        "SUPER_LOG_NOT_FOUND"
      );
    }
    return superLogDetailSchema.parse(
      clone({
        ...log,
        matchDate: "2026-07-29",
        matchTime: "20:45",
        matchId: 472910,
        homeTeam: log.matchName.split(" - ")[0] || "Ev",
        awayTeam: log.matchName.split(" - ")[1] || "Deplasman",
        league: "Demo lig",
        marketGroup: "MATCH_RESULT",
        decisionHomeScore: 1,
        decisionAwayScore: 0,
        baseProbability: 0.72,
        superProbability: 0.79,
        modelScore: 3.75,
        edgeScore: 1.2,
        compatibilityScore: 0.8,
        alignmentScore: 0.65,
        totalPressure: 68.2,
        pressureDiff: 16.4,
        homePressure: 42.3,
        awayPressure: 25.9,
        deviation: 0.15,
        initialPool: 61,
        halfTimePool: 18,
        postScorePool: 14,
        selectedOddPool: 9,
        homeStandingPosition: 2,
        awayStandingPosition: 7,
        homeStandingPoints: 41,
        awayStandingPoints: 28,
        standingPpgDiff: 0.42,
        homeVenuePpg: 2.1,
        awayVenuePpg: 1.3,
        venuePpgDiff: 0.8,
        aiComment: "Ev sahibi baskısı seçimi destekliyor."
      })
    );
  },

  async getTotoPrograms(signal) {
    await mockDelay(signal);
    return totoProgramListSchema.parse(clone(mockTotoPrograms));
  },

  async getTotoProgram(gcNo, version, signal) {
    await mockDelay(signal);
    const program = mockTotoPrograms.find(
      (candidate) =>
        candidate.gcNo === gcNo && candidate.version === version
    );
    if (!program) {
      throw new MobileApiError(
        "Toto programı bulunamadı.",
        404,
        "TOTO_PROGRAM_NOT_FOUND"
      );
    }
    return totoProgramSchema.parse(clone(program));
  },

  async registerDevice(_token, _platform, signal) {
    await mockDelay(signal);
  }
};
