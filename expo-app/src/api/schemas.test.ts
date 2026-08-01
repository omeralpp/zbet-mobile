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
  matchListSchema,
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
      "/v1/btb/match-insights",
      "/v1/btb/match-insights/{key}",
      "/v1/dashboard",
      "/v1/devices",
      "/v1/super/logs",
      "/v1/super/kpis",
      "/v1/super/logs/{key}",
      "/v1/toto/programs",
      "/v1/toto/programs/{gcNo}/{version}"
    ].sort()
  );
});
