import {
  dashboardSchema,
  matchDetailSchema,
  matchListSchema,
  superLogListSchema,
  totoProgramListSchema,
  totoProgramSchema
} from "./schemas";
import {
  mockDashboard,
  mockMatchSummaries,
  mockMatches,
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
