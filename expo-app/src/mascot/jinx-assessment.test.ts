import test from "node:test";
import assert from "node:assert/strict";
import { analysisNeedsRefresh, assessmentIsCurrent } from "./jinx-assessment";
import { mockMobileApi } from "../api/mock-mobile-api";
import { mockMatches } from "../api/mock-data";
import { withSyntheticIntelligence } from "../api/synthetic-intelligence";
import { analysisContextSchema, jinxAssessmentSchema } from "../api/schemas";
import type { AnalysisContext, JinxAssessment } from "../api/schemas";

test("the preview renders one validated screen context and a short policy-unavailable assessment", async () => {
  const packet = analysisContextSchema.parse(await mockMobileApi.getMatchAnalysisContext(mockMatches[0]!.key));
  const dto = jinxAssessmentSchema.parse(await mockMobileApi.getMatchJinxAssessment(packet.matchKey, packet.snapshotId));
  assert.equal(dto.verdict, "WAIT"); assert.equal(dto.reasonCode, "POLICY_UNAVAILABLE");
  assert.equal(dto.evidence.length, 0); assert.ok(dto.shortReason.length <= 240);
  assert.equal(Object.keys(packet.sources).length, 9);
  assert.equal(assessmentIsCurrent(dto, packet), true);
  for (const patch of [{ matchKey: "other" }, { selectionKey: "other" }, { evidenceRevision: "changed" }])
    assert.equal(assessmentIsCurrent({ ...dto, ...patch }, packet), false);
  assert.equal(assessmentIsCurrent(dto, packet, Date.parse(dto.expiresAt)), false);
  assert.equal(assessmentIsCurrent(undefined, packet), false);
  // A subsequent acquisition of unchanged facts need not invalidate a reading.
  assert.equal(assessmentIsCurrent(dto, { ...packet, snapshotId: "new-response" }), true);
});

test("malformed optional evidence does not discard the match; core identity remains required", async () => {
  const packet = await mockMobileApi.getMatchAnalysisContext(mockMatches[0]!.key);
  const malformed = { ...packet, sources: { ...packet.sources, teamForm: { malformed: true } } };
  assert.equal(analysisContextSchema.parse(malformed).sources.teamForm, null);
  assert.equal(analysisContextSchema.safeParse({ ...packet, acquiredAt: "not-a-time" }).success, false);
});

test("the client refuses a favorable label without policy evidence or with invented arithmetic", () => {
  const base = { contractVersion: "jinx-match-outlook.v3", matchKey: "match", snapshotId: "snapshot",
    selectionKey: "selection", evidenceRevision: "revision", evaluatedAt: "2026-10-17T12:00:00Z",
    expiresAt: "2026-10-17T12:02:00Z", verdict: "FAVORABLE", reasonCode: "VALUE_POSITIVE",
    shortReason: "Test", riskNote: null, evidence: [], sourceAvailability: {}, explanationOrigin: "DETERMINISTIC", value: null };
  assert.equal(jinxAssessmentSchema.safeParse(base).success, false);
  const value = { probability: .6, odds: 2, fairPrice: 1 / .6, expectedValue: .2, minimumExpectedValue: .02,
    policyId: "TEST", modelVersion: "TEST", validationRef: "TEST",
    quoteMeasuredAt: base.evaluatedAt, probabilityMeasuredAt: base.evaluatedAt };
  assert.equal(jinxAssessmentSchema.safeParse({ ...base, value }).success, true);
  assert.equal(jinxAssessmentSchema.safeParse({ ...base, value: { ...value, expectedValue: .8 } }).success, false);
  assert.equal(jinxAssessmentSchema.safeParse({ ...base, value, verdict: "WAIT" }).success, false);
});

test("current checks do not accept expired or differently selected results", () => {
  const context = { matchKey: "a", selectionKey: "s", evidenceRevision: "r" } as AnalysisContext;
  const dto = { matchKey: "a", selectionKey: "s", evidenceRevision: "r", expiresAt: "invalid" } as JinxAssessment;
  assert.equal(assessmentIsCurrent(dto, context), false);
});

test("mixed synthetic intelligence never sends preview facts to a live assessment", async () => {
  let liveCalls = 0;
  const api = withSyntheticIntelligence({ ...mockMobileApi, async getMatchJinxAssessment() {
    liveCalls++; throw new Error("must not call live assessment");
  } }, { teamForm: true, matchPath: false, jinxOutlook: false });
  const context = await api.getMatchAnalysisContext(mockMatches[0]!.key);
  assert.equal(context.sources.teamForm?.origin, "SYNTHETIC");
  assert.equal(context.sourceAvailability.teamForm, "SYNTHETIC");
  const dto = await api.getMatchJinxAssessment(context.matchKey, context.snapshotId);
  assert.equal(dto.verdict, "WAIT"); assert.equal(liveCalls, 0);
});

test("an explicit retry refreshes a snapshot evicted by a restart even before its advertised expiry", () => {
  const packet = { expiresAt: "2026-10-17T12:02:00Z" } as AnalysisContext;
  const now = Date.parse("2026-10-17T12:00:00Z");
  assert.equal(analysisNeedsRefresh(packet, null, now), false);
  assert.equal(analysisNeedsRefresh(packet, { code: "ANALYSIS_SNAPSHOT_EXPIRED" }, now), true);
  assert.equal(analysisNeedsRefresh(packet, null, now + 120000), true);
});
