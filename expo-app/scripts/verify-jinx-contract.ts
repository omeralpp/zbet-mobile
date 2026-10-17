import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { jinxMatchOutlookSchema, jinxAssessmentSchema } from "../src/api/schemas";
import { acceptHeadline, acceptBody, acceptUncertaintyNote, confidenceBand, resolveOutlookState } from "../src/mascot/jinx-match-outlook";

const require = createRequire(import.meta.url);
const { createJinxOutlookService, assessSources } = require("../../../zbet-cap/srv/mobile-bff/jinx-outlook.js");
const { createAnalysisContextStore, selectionKey, matchStateKey } = require("../../../zbet-cap/srv/mobile-bff/analysis-context.js");
const { createJinxAssessmentService } = require("../../../zbet-cap/srv/mobile-bff/jinx-assessment.js");
const { matchKey, capturedAt, sources, wording } = require("../../../zbet-cap/test/fixtures/jinx-outlook.js");

function verify(value: unknown) {
  const dto = jinxMatchOutlookSchema.parse(value);
  assert.equal(resolveOutlookState(dto, { asked: false }), "IDLE");
  if (dto.availability !== "UNAVAILABLE") {
    assert.equal(acceptHeadline(dto.headline), dto.headline);
    assert.equal(acceptBody(dto.body), dto.body);
    assert.equal(acceptUncertaintyNote(dto.uncertaintyNote), dto.uncertaintyNote);
    assert.notEqual(confidenceBand(dto.confidence), "HIGH");
  }
  return dto;
}

async function main() {
  const service = () => createJinxOutlookService({ generate: async () => wording, now: () => Date.parse(capturedAt) });
  let checked = 0;
  for (const variant of ["normal", "tiny", "empty", "missing", "unavailable", "stale"]) {
    const data = sources();
    if (variant === "tiny") data.superLogs.decisions[0].postScorePool = 1;
    if (variant === "empty") data.matchPath.points = [];
    if (variant === "missing") data.matchPath.points = null;
    if (variant === "unavailable") {
      data.teamForm = null; data.matchPath = null;
    }
    if (variant === "stale") {
      data.teamForm.capturedAt = null; data.matchPath.capturedAt = null;
      data.superLogs.capturedAt = "2026-09-11T00:00:00.000Z";
      data.teamForm.home.matchesSampled = 0; data.teamForm.away.matchesSampled = 0;
      data.matchPath.initialCohortSize = 0; data.matchPath.points = null;
    }
    const assessment = assessSources(matchKey, data, Date.parse(capturedAt));
    assert.ok(assessment.uncertaintyNote.length <= 1200, `${variant}: caveat exceeds reader limit`);
    const dto = verify(await service().analyze(matchKey, data));
    assert.equal(dto.availability, "DEGRADED", variant);
    checked++;
  }
  const fallbackService = createJinxOutlookService({ factualFallback: true,
    generate: async () => { throw new Error("test provider failure"); }, now: () => Date.parse(capturedAt) });
  const fallback = verify(await fallbackService.analyze(matchKey, sources()));
  assert.equal(fallback.origin, "DETERMINISTIC");
  assert.equal(fallback.availability, "DEGRADED");
  checked++;
  if (process.argv[2]) {
    const live = verify(JSON.parse(readFileSync(process.argv[2], "utf8")));
    assert.notEqual(live.availability, "UNAVAILABLE", "real provider must return a visible, validated reading");
    checked++;
  }
  const now = () => Date.parse(capturedAt);
  const contextStore = createAnalysisContextStore({ now });
  const waiting = contextStore.capture(matchKey, "contract-test", sources());
  const waitDto = jinxAssessmentSchema.parse(await createJinxAssessmentService({ now }).analyze(waiting));
  assert.equal(waitDto.verdict, "WAIT");
  assert.equal(waitDto.snapshotId, waiting.snapshotId);
  assert.equal(waitDto.value, null);
  checked++;
  // Synthetic policy for wire compatibility only; never a registered runtime policy.
  const policy = { id: "CONTRACT_TEST", modelVersion: "CONTRACT_TEST", validationRef: "CONTRACT_TEST",
    minimumExpectedValue: .02, maxQuoteAgeSeconds: 30, maxProbabilityAgeSeconds: 60 };
  const current = sources(); current.matchDetail.currentRate = 2;
  const value = { policyId: policy.id, modelVersion: policy.modelVersion, validationRef: policy.validationRef,
    sampleStatus: "SUFFICIENT", probability: .6, odds: 2, marketStatus: "OPEN",
    selectionKey: selectionKey(current.matchDetail), stateKey: matchStateKey(current.matchDetail),
    quoteStateKey: matchStateKey(current.matchDetail), quoteMeasuredAt: capturedAt, probabilityMeasuredAt: capturedAt };
  const packet = contextStore.capture(matchKey, "contract-test", current, value);
  const valueDto = jinxAssessmentSchema.parse(await createJinxAssessmentService({ now, valuePolicy: policy }).analyze(packet));
  assert.equal(valueDto.verdict, "FAVORABLE"); assert.equal(valueDto.selectionKey, packet.selectionKey);
  checked++;
  process.stdout.write(`PASS: ${checked} Jinx payloads across legacy and V3 schemas; default WAIT, approved-test value and snapshot identity verified; idle remains idle.\n`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
