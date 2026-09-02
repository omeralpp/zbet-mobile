import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse as parseYaml } from "yaml";
import {
  mockDashboard,
  mockMatchInsights,
  mockMatchSummaries,
  mockMatches,
  mockSuperKpis,
  mockSuperLogs,
  mockTotoPrograms
} from "./mock-data";
import { mockMobileApi } from "./mock-mobile-api";
import {
  dashboardSchema,
  matchDetailSchema,
  matchInsightListSchema,
  matchLeagueContextSchema,
  matchListSchema,
  matchSummarySchema,
  periodScoreContextSchema,
  superLogListSchema,
  superKpisSchema,
  totoProgramListSchema
} from "./schemas";

test("validates every native preview fixture against the runtime contract", () => {
  assert.doesNotThrow(() => dashboardSchema.parse(mockDashboard));
  assert.doesNotThrow(() => matchListSchema.parse(mockMatchSummaries));
  assert.doesNotThrow(() => matchInsightListSchema.parse(mockMatchInsights));
  assert.doesNotThrow(() => mockMatches.map((row) => matchDetailSchema.parse(row)));
  assert.doesNotThrow(() => superLogListSchema.parse(mockSuperLogs));
  assert.doesNotThrow(() => superKpisSchema.parse(mockSuperKpis));
  assert.doesNotThrow(() => totoProgramListSchema.parse(mockTotoPrograms));
});

test("serves list summaries without leaking match-detail fields", async () => {
  const matches = await mockMobileApi.getMatches();

  assert.equal(matches.length, mockMatches.length);
  assert.equal("scoreDistribution" in matches[0]!, false);
  assert.equal("homeBallPossession" in matches[0]!, false);
});

test("rejects unknown BFF fields and invalid Super ratings", () => {
  assert.throws(() =>
    matchDetailSchema.parse({ ...mockMatches[0], unexpectedSapField: "leak" })
  );
  assert.throws(() =>
    superLogListSchema.parse([{ ...mockSuperLogs[0], rating: 0 }])
  );
});

test("validates bounded half-time score contexts", async () => {
  const match = await mockMobileApi.getMatchPeriodScore(mockMatches[0]!.key);
  const log = await mockMobileApi.getSuperLogPeriodScore(mockSuperLogs[0]!.key);

  assert.deepEqual(periodScoreContextSchema.parse(match).halfTimeScore, {
    homeScore: 1,
    awayScore: 0
  });
  assert.deepEqual(periodScoreContextSchema.parse(log).halfTimeScore, {
    homeScore: 1,
    awayScore: 0
  });
  assert.throws(() =>
    periodScoreContextSchema.parse({
      key: "match",
      halfTimeScore: { homeScore: 1, awayScore: 0, leaked: true }
    })
  );
});

test("validates the bounded two-team league context", async () => {
  const context = await mockMobileApi.getMatchLeagueContext(mockMatches[0]!.key);
  assert.doesNotThrow(() => matchLeagueContextSchema.parse(context));
  assert.throws(() =>
    matchLeagueContextSchema.parse({ ...context, played: 20 })
  );
});

test("accepts the current BFF match summary contract including pressure metadata fields", () => {
  const payload = {
    key: "2026-08-15:999999:20:45:00",
    id: 999999,
    matchDate: "2026-08-15",
    matchTime: "20:45",
    league: "Test League",
    homeTeam: "Home FC",
    awayTeam: "Away FC",
    homeScore: 1,
    awayScore: 0,
    elapsed: 30,
    status: "LIVE",
    selectedOdd: "Ms1X",
    rating: 3,
    liveRate: 1.5,
    currentRate: 1.4,
    pressureDiff: 12.3,
    totalPressure: 45.6,
    pressureSource: "CURRENT_MATCH",
    pressureProvider: "ZBET_BILYONER_LIVE_CALC",
    pressureSnapshotAt: "2026-08-15T18:00:00.000Z",
    lastUpdatedAt: "2026-08-15T18:00:05.000Z"
  } as const;

  assert.doesNotThrow(() => matchSummarySchema.parse(payload));

  assert.doesNotThrow(() =>
    matchSummarySchema.parse({
      ...payload,
      pressureProvider: null,
      pressureSnapshotAt: null
    })
  );

  const { pressureProvider, pressureSnapshotAt, ...withoutPressureMetadata } = payload;
  void pressureProvider;
  void pressureSnapshotAt;
  assert.doesNotThrow(() => matchSummarySchema.parse(withoutPressureMetadata));

  assert.throws(() =>
    matchSummarySchema.parse({ ...payload, unexpectedNewBffField: "leak" })
  );
});

test("accepts valid, missing, and null participant IDs but rejects malformed ones", () => {
  const base = {
    key: "2026-08-15:999999:20:45:00",
    id: 999999,
    matchDate: "2026-08-15",
    matchTime: "20:45",
    league: "Test League",
    homeTeam: "Home FC",
    awayTeam: "Away FC",
    homeScore: 1,
    awayScore: 0,
    elapsed: 30,
    status: "LIVE",
    selectedOdd: "Ms1X",
    rating: 3,
    liveRate: 1.5,
    currentRate: 1.4,
    pressureDiff: null,
    totalPressure: null,
    pressureSource: null,
    lastUpdatedAt: "2026-08-15T18:00:05.000Z"
  } as const;

  assert.doesNotThrow(() =>
    matchSummarySchema.parse({
      ...base,
      homeParticipantId: "100021",
      awayParticipantId: "100022"
    })
  );
  assert.doesNotThrow(() =>
    matchSummarySchema.parse({
      ...base,
      homeParticipantId: null,
      awayParticipantId: null
    })
  );
  assert.doesNotThrow(() => matchSummarySchema.parse(base));

  assert.throws(() =>
    matchSummarySchema.parse({ ...base, homeParticipantId: "" })
  );
  assert.throws(() =>
    matchSummarySchema.parse({ ...base, homeParticipantId: 100021 })
  );
});

test("accepts the BetRadar event id on detail and keeps it off summaries", () => {
  const detail = mockMatches[0]!;
  assert.equal(matchDetailSchema.parse(detail).betRadarId, "70000001");

  const { betRadarId, ...withoutBetRadarId } = detail;
  void betRadarId;
  assert.doesNotThrow(() => matchDetailSchema.parse(withoutBetRadarId));
  assert.doesNotThrow(() =>
    matchDetailSchema.parse({ ...detail, betRadarId: null })
  );

  for (const invalid of ["", "0", "-1", "12.5", "abc", "1 2", 70000001]) {
    assert.throws(() =>
      matchDetailSchema.parse({ ...detail, betRadarId: invalid })
    );
  }

  assert.throws(() =>
    matchSummarySchema.parse({ ...mockMatchSummaries[0], betRadarId: "70000001" })
  );
});

test("accepts Super log rows with, without, and with null team names", () => {
  const log = mockSuperLogs[0]!;
  assert.equal(superLogListSchema.parse([log])[0]!.homeTeam, "Inter Turku");

  const { homeTeam, awayTeam, ...withoutTeams } = log;
  void homeTeam;
  void awayTeam;
  assert.doesNotThrow(() => superLogListSchema.parse([withoutTeams]));
  assert.doesNotThrow(() =>
    superLogListSchema.parse([{ ...log, homeTeam: null, awayTeam: null }])
  );
  assert.throws(() => superLogListSchema.parse([{ ...log, homeTeam: "" }]));
});

test("keeps the checked-in OpenAPI document parseable and route-complete", async () => {
  const source = await readFile(
    new URL("../../contracts/mobile-api.openapi.yaml", import.meta.url),
    "utf8"
  );
  const document = parseYaml(source) as {
    openapi?: string;
    paths?: Record<string, unknown>;
  };

  assert.equal(document.openapi, "3.1.0");
  assert.deepEqual(
    Object.keys(document.paths ?? {}).sort(),
    [
      "/v1/btb/matches",
      "/v1/btb/matches/{key}",
      "/v1/btb/matches/{key}/jinx-outlook",
      "/v1/btb/matches/{key}/league-context",
      "/v1/btb/matches/{key}/match-path",
      "/v1/btb/matches/{key}/period-score",
      "/v1/btb/matches/{key}/super-logs",
      "/v1/btb/matches/{key}/team-form",
      "/v1/btb/match-insights",
      "/v1/btb/match-insights/{key}",
      "/v1/dashboard",
      "/v1/devices",
      "/v1/devices/{installationId}",
      "/v1/super/logs",
      "/v1/super/kpis",
      "/v1/super/logs/{key}",
      "/v1/super/logs/{key}/period-score",
      "/v1/toto/programs",
      "/v1/toto/programs/{gcNo}/{version}"
    ].sort()
  );
});
