import {
  analysisContextSchema,
  jinxAssessmentSchema,
  liveContextSchema,
  dashboardSchema,
  matchDetailSchema,
  matchInsightListSchema,
  matchInsightSchema,
  matchLeagueContextSchema,
  matchListSchema,
  jinxMatchOutlookSchema,
  matchPathContextSchema,
  periodScoreContextSchema,
  superLogDetailSchema,
  superLogListSchema,
  superKpisSchema,
  teamFormContextSchema,
  totoProgramListSchema,
  totoProgramSchema
} from "./schemas";
import {
  mockDashboard,
  mockRetainedJourney,
  mockMatchInsights,
  mockMatchSummaries,
  mockMatches,
  mockSuperKpis,
  mockSuperLogs,
  mockTotoPrograms,
  mockLiveContext,
  mockLiveContextState,
  mockIntelligenceState,
  mockJinxOutlook,
  mockMatchPath,
  mockTeamForm
} from "./mock-data";
import { MobileApiError, type MobileApi } from "./mobile-api";
import { rebuildCohortsReportSchema, rebuildMatchSchema, rebuildReportSchema } from "./rebuild-schemas";
import { rebuildPressureHistorySchema, rebuildStatisticsSchema, rebuildPoolPathSchema } from "./rebuild-statistics-schemas";
import { decisionContextSchema, type AnalysisContext, type MatchJourney } from "./schemas";
import { previewJinxSignal, previewSelectionReading } from "../mascot/jinx-assessment";

const analysisSnapshots = new Map<string, AnalysisContext>();

/** Preview-only interval pressure, so mock builds can show the Baskı grafiği. */
function withPreviewPressure(journey: MatchJourney): MatchJourney {
  return { ...journey, points: journey.points.map((point) => {
    if (point.plotMinute === null || point.capturedAt === null) return point;
    const home = Math.round((0.18 + 0.14 * (1 + Math.sin(point.plotMinute / 7))) * 1000) / 1000;
    const away = Math.round((0.12 + 0.12 * (1 + Math.cos(point.plotMinute / 9))) * 1000) / 1000;
    return { ...point, decisionContext: decisionContextSchema.parse({ contractVersion: "decision-context.v2",
      recentPressure: { availability: "AVAILABLE", reason: null, units: "EST_SAMPLED_ACTIVITY_PER_MIN",
        policyId: "OBSERVED_PILOT_V1", estimated: true, observedEpoch: "PREVIEW", home, away, total: home + away,
        difference: home - away, intervalSeconds: 180, observedAt: point.capturedAt, sourceTimingKnown: false,
        xgCovered: false, stateRevision: null },
      decisionCoherence: { availability: "UNAVAILABLE", reason: "PREVIEW", stateRevision: null, quoteRevision: null } }) };
  }) };
}

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
  async getRebuildMatch(key, signal) {
    await mockDelay(signal);
    return rebuildMatchSchema.parse({ contractVersion: "btb-rebuild.v1", modelRegime: "BTB_RB1_20261018", matchKey: key, asOf: new Date().toISOString(),
      availability: "UNAVAILABLE", reason: "DUMMY_NOT_PUBLISHED", current: null, history: [], candidates: [],
      jinx: { source: "BACKEND", decisionId: null, reason: "DUMMY_NOT_PUBLISHED", summary: "Örnek veri gerçek öneri değildir." } });
  },
  async getRebuildReport(signal) {
    await mockDelay(signal);
    return rebuildReportSchema.parse({ contractVersion: "btb-rebuild-report.v1", modelRegime: "BTB_RB1_20261018", asOf: new Date().toISOString(), timeZone: "Europe/Istanbul",
      availability: "UNAVAILABLE", reason: "DUMMY_NOT_PUBLISHED", accounting: "ONE_HYPOTHETICAL_UNIT_AT_FIRST_QUOTE", actualBetsAssumed: false, periods: [], recommendations: [], learning: null });
  },
  async getRebuildCohortsReport(signal) {
    await mockDelay(signal);
    return rebuildCohortsReportSchema.parse({ contractVersion: "btb-rebuild-report.v2", modelRegime: "BTB_RB1_20261018", asOf: new Date().toISOString(), timeZone: "Europe/Istanbul",
      availability: "UNAVAILABLE", reason: "DUMMY_NOT_PUBLISHED", accounting: "ONE_HYPOTHETICAL_UNIT_AT_FIRST_QUOTE", actualBetsAssumed: false, cohorts: [], recommendations: [] });
  },
  // Sample data publishes no RB1 facts, so both RB1 match reads are honestly
  // unavailable here, like the decision and report above.
  async getRebuildStatistics(key, signal) {
    await mockDelay(signal);
    const statistics = Object.fromEntries(["TotalShots", "ShotsOnTarget", "Corners", "Xg", "BallPossession", "YellowCards",
      "RedCards", "BoxTouches", "BlockedShots", "GoalkeeperSaves"].flatMap((name) => [[`home${name}`, null], [`away${name}`, null]]));
    return rebuildStatisticsSchema.parse({ contractVersion: "btb-match-statistics.v1", modelRegime: "BTB_RB1_20261018", matchKey: key,
      asOf: new Date().toISOString(), availability: "UNAVAILABLE", reason: "DUMMY_NOT_PUBLISHED", observedAt: null,
      source: "VERIFIED_RB1_OBSERVATION", captureId: null, pressurePolicy: null, phase: null, elapsed: null, homeScore: null,
      awayScore: null, xgScopeVerified: false, statistics, coverage: [], pressure: null });
  },
  async getRebuildPressureHistory(key, signal) {
    await mockDelay(signal);
    return rebuildPressureHistorySchema.parse({ contractVersion: "btb-pressure-history.v1", modelRegime: "BTB_RB1_20261018", matchKey: key,
      asOf: new Date().toISOString(), availability: "UNAVAILABLE", reason: "DUMMY_NOT_PUBLISHED", source: "VERIFIED_RB1_HISTORY",
      historical: true, coverage: "PERSISTED_VERIFIED_INTERVALS_ONLY", fullMatchCoverageProven: false, samples: [], observations: [],
      poolPath: { availability: "UNAVAILABLE", reason: "RB1_POOL_PATH_NOT_EXPOSED" } });
  },
  async getRebuildPoolPath(key, signal) {
    await mockDelay(signal);
    return rebuildPoolPathSchema.parse({contractVersion:"btb-pool-path.v1",modelRegime:"BTB_RB1_20261018",matchKey:key,
      asOf:new Date().toISOString(),availability:"UNAVAILABLE",reason:"DUMMY_NOT_PUBLISHED",source:"VERIFIED_RB1_OBSERVATION_POOLS",
      label:"Havuzda kalan pay",unit:"SURVIVING_REFERENCE_SHARE",winningProbability:false,historical:true,fullMatchCoverageProven:false,points:[]});
  },
  async getMatchAnalysisContext(key, signal) {
    const [matchDetail, insight, periodScore, leagueContext, superLogs, liveContext,
      teamForm, matchPath, matchJourney] = await Promise.all([
      mockMobileApi.getMatch(key, signal), mockMobileApi.getMatchInsight(key, signal),
      mockMobileApi.getMatchPeriodScore(key, signal), mockMobileApi.getMatchLeagueContext(key, signal),
      mockMobileApi.getMatchSuperLogs(key, signal), mockMobileApi.getMatchLiveContext(key, signal),
      mockMobileApi.getMatchTeamForm(key, signal), mockMobileApi.getMatchPath(key, signal),
      mockMobileApi.getMatchJourney(key, signal)
    ]);
    const acquiredAt = new Date().toISOString();
    const sources = { matchDetail: { ...matchDetail, currentMatchRecord: true }, insight,
      periodScore, leagueContext, superLogs, liveContext, teamForm, matchPath, matchJourney };
    const packet = analysisContextSchema.parse({ contractVersion: "btb-analysis-context.v1", matchKey: key,
      snapshotId: `synthetic-${key}-${Date.now()}`, evidenceRevision: JSON.stringify(sources),
      selectionKey: matchDetail.selectedOdd && matchDetail.rating > 0 ? JSON.stringify([key,
        matchDetail.selectedOdd, matchDetail.rating, matchDetail.decisionMinute, matchDetail.decisionReason]) : "",
      acquiredAt, expiresAt: new Date(Date.now() + 120000).toISOString(), sources,
      sourceAvailability: Object.fromEntries(Object.keys(sources).map((name) => [name, "SYNTHETIC"])),
      valueEvidence: null });
    if (analysisSnapshots.size >= 128) analysisSnapshots.delete(analysisSnapshots.keys().next().value!);
    analysisSnapshots.set(packet.snapshotId, packet);
    return packet;
  },
  async getMatchJinxAssessment(key, snapshotId, signal) {
    await mockDelay(signal);
    const packet = analysisSnapshots.get(snapshotId);
    if (!packet || packet.matchKey !== key || Date.parse(packet.expiresAt) <= Date.now())
      throw new MobileApiError("Maç verisini yenileyip tekrar sor.", 409, "ANALYSIS_SNAPSHOT_EXPIRED");
    return jinxAssessmentSchema.parse({ contractVersion: "jinx-match-outlook.v4", matchKey: key,
      snapshotId, evidenceRevision: packet.evidenceRevision, selectionKey: packet.selectionKey,
      evaluatedAt: new Date().toISOString(), expiresAt: packet.expiresAt, verdict: "WAIT",
      reasonCode: "POLICY_UNAVAILABLE", shortReason: previewSelectionReading(packet),
      riskNote: "Örnek veri.", evidence: [], value: null, signal: previewJinxSignal(packet),
      sourceAvailability: packet.sourceAvailability, explanationOrigin: "DETERMINISTIC" });
  },
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

  async getMatchLeagueContext(key, signal) {
    await mockDelay(signal);
    const match = mockMatches.find((candidate) => candidate.key === key);
    const insight = mockMatchInsights.find((candidate) => candidate.key === key);
    if (!match || !insight) {
      throw new MobileApiError(
        "Maç lig bağlamı bulunamadı.",
        404,
        "MATCH_LEAGUE_CONTEXT_NOT_FOUND"
      );
    }
    return matchLeagueContextSchema.parse({
      key,
      league: match.league,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      source: "LATEST_SUPER_DECISION",
      capturedAt: "2026-07-29T09:12:00.000Z",
      homeStandingPosition: insight.homeStandingPosition,
      awayStandingPosition: insight.awayStandingPosition,
      homeStandingPoints: insight.homeStandingPosition ? 41 : null,
      awayStandingPoints: insight.awayStandingPosition ? 28 : null
    });
  },

  async getMatch(key, signal) {
    await mockDelay(signal);
    const match = mockMatches.find((candidate) => candidate.key === key);
    if (!match) {
      throw new MobileApiError("Maç bulunamadı.", 404, "MATCH_NOT_FOUND");
    }
    return matchDetailSchema.parse(clone(match));
  },

  // Preview mode exercises every live-context state so all four can be seen
  // without touching pilot or production configuration. The state is chosen by
  // match id purely so one preview session covers the whole matrix.
  async getMatchLiveContext(key, signal) {
    await mockDelay(signal);
    const state = mockLiveContextState(key);
    return liveContextSchema.parse(mockLiveContext(key, state));
  },
  async getMatchPeriodScore(key, signal) {
    await mockDelay(signal);
    const match = mockMatches.find((candidate) => candidate.key === key);
    if (!match) {
      throw new MobileApiError("Maç devre skoru bulunamadı.", 404, "MATCH_PERIOD_SCORE_NOT_FOUND");
    }
    return periodScoreContextSchema.parse({
      key,
      halfTimeScore:
        match.elapsed >= 45 ? { homeScore: 1, awayScore: 0 } : null
    });
  },

  // The M15 intelligence fixtures are synthetic and declare it in the payload.
  // As with live context, the state is chosen by match id so one preview
  // session covers populated, low-sample, partial, empty and unavailable.
  async getMatchTeamForm(key, signal) {
    await mockDelay(signal);
    return teamFormContextSchema.parse(
      mockTeamForm(key, mockIntelligenceState(key))
    );
  },

  async getMatchJourney(key) {
    return withPreviewPressure(mockRetainedJourney(key));
  },
  async getMatchPath(key, signal) {
    await mockDelay(signal);
    return matchPathContextSchema.parse(
      mockMatchPath(key, mockIntelligenceState(key))
    );
  },

  async getMatchJinxOutlook(key, signal) {
    await mockDelay(signal);
    return jinxMatchOutlookSchema.parse(
      mockJinxOutlook(key, mockIntelligenceState(key))
    );
  },

  async getMatchSuperLogs(key, signal) {
    await mockDelay(signal);
    return superLogListSchema.parse(
      clone(mockSuperLogs.filter((candidate) => candidate.matchKey === key))
    );
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

  async getSuperLogPeriodScore(key, signal) {
    await mockDelay(signal);
    const log = mockSuperLogs.find((candidate) => candidate.key === key);
    if (!log) {
      throw new MobileApiError("Super karar devre skoru bulunamadı.", 404, "SUPER_LOG_PERIOD_SCORE_NOT_FOUND");
    }
    return periodScoreContextSchema.parse({
      key,
      halfTimeScore:
        log.elapsed >= 45 ? { homeScore: 1, awayScore: 0 } : null
    });
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

  async getJinxQuip(_mood, signal) {
    await mockDelay(signal);
    // The mock never invents wording; callers keep their deterministic line.
    return { enabled: false, source: "DISABLED", body: null };
  },

  async registerDevice(_token, _platform, _installationId, signal) {
    await mockDelay(signal);
  },

  async unregisterDevice(_installationId, signal) {
    await mockDelay(signal);
  }
};
