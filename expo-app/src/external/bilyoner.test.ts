import assert from "node:assert/strict";
import test from "node:test";
import { buildBilyonerMatchUrl } from "./bilyoner";

test("Bilyoner maç kartı için güvenilir event URL'si üretir", () => {
  assert.equal(
    buildBilyonerMatchUrl(472910),
    "https://www.bilyoner.com/mac-karti/futbol/472910/oranlar"
  );
  assert.throws(() => buildBilyonerMatchUrl(0), /etkinlik kimliği/);
});
