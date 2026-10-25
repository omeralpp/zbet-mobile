import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import fixture from "../src/api/fixtures/btb-rebuild-v1.json";
import { rebuildMatchSchema } from "../src/api/rebuild-schemas";
import { jinxRb1ExplanationSchema } from "../src/api/jinx-rb1-schema";
import { currentRb1Explanation } from "../src/utils/rebuild-jinx";

const require = createRequire(import.meta.url);
const { createJinxOutlookService } = require("../../../zbet-cap/srv/mobile-bff/jinx-outlook.js");

async function main() {
  const reading = rebuildMatchSchema.parse(fixture), record = reading.history[0];
  assert.ok(record);
  const now = () => Date.parse(reading.asOf), request = { decisionId: record.decisionId };
  const live = jinxRb1ExplanationSchema.parse(await createJinxOutlookService({ now,
    generate: async (_prompt: string, context: { evidenceIds: string[] }) => ({ order: context.evidenceIds.toReversed() })
  }).analyze(reading, request));
  assert.equal(live.origin, "LIVE");
  assert.equal(currentRb1Explanation(live, record, reading.matchKey), live);
  assert.equal(currentRb1Explanation(live, { ...record, poolWins: record.poolWins + 1 }, reading.matchKey), null);
  assert.equal(currentRb1Explanation(live, record, reading.matchKey, true), null);
  const disabled = jinxRb1ExplanationSchema.parse(await createJinxOutlookService({ now }).analyze(reading, request));
  const refused = jinxRb1ExplanationSchema.parse(await createJinxOutlookService({ now,
    generate: async () => ({ body: "Untrusted model prose" })
  }).analyze(reading, request));
  assert.equal(disabled.origin, "DETERMINISTIC");
  assert.deepEqual(refused.facts, disabled.facts);
  assert.deepEqual(live.facts.toReversed(), disabled.facts);
  assert.equal(jinxRb1ExplanationSchema.safeParse({ ...live, body: "extra prose" }).success, false);
  const unavailable = jinxRb1ExplanationSchema.parse(await createJinxOutlookService({ now })
    .analyze({ ...reading, availability: "UNAVAILABLE" }, request));
  assert.equal(unavailable.availability, "UNAVAILABLE");
  if (process.argv[2]) jinxRb1ExplanationSchema.parse(JSON.parse(readFileSync(process.argv[2], "utf8")));
  process.stdout.write("PASS: RB1 BFF/client contract, exact sentence permutation, fallback and decision/source binding.\n");
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
