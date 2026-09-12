import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { jinxMatchOutlookSchema } from "../src/api/schemas";
import { acceptHeadline, acceptBody, acceptUncertaintyNote, confidenceBand, resolveOutlookState } from "../src/mascot/jinx-match-outlook";

const require = createRequire(import.meta.url);
const { createJinxOutlookService, assessSources } = require("../../../zbet-cap/srv/mobile-bff/jinx-outlook.js");
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
  if (process.argv[2]) {
    const live = verify(JSON.parse(readFileSync(process.argv[2], "utf8")));
    assert.notEqual(live.availability, "UNAVAILABLE", "real provider must return a visible, validated reading");
    checked++;
  }
  process.stdout.write(`PASS: ${checked} Jinx payloads consumed by the existing Mobile schema and current presentation guards; idle remains idle.\n`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
