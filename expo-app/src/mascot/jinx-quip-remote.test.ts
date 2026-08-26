import assert from "node:assert/strict";
import test from "node:test";
import type { JinxDailyMood } from "./jinx-mood";
import { acceptRemoteQuip, jinxQuipRequest } from "./jinx-quip-remote";

const mood: JinxDailyMood = {
  kind: "POSITIVE",
  metricDate: "2026-08-26",
  filter: "STAR_2_PLUS",
  won: 3,
  lost: 1,
  profit: 0.75
};

test("builds a request only for a known mood", () => {
  assert.deepEqual(jinxQuipRequest(mood), {
    kind: "POSITIVE",
    filter: "STAR_2_PLUS",
    metricDate: "2026-08-26",
    won: 3,
    lost: 1,
    profit: 0.75
  });
  assert.equal(
    jinxQuipRequest({ ...mood, kind: "UNKNOWN", metricDate: null }),
    null
  );
});

test("accepts wording built from verified numbers only", () => {
  assert.equal(
    acceptRemoteQuip("Kravati taktim: +0,75. 3 galibiyet is yapti.", mood),
    "Kravati taktim: +0,75. 3 galibiyet is yapti."
  );
  assert.equal(acceptRemoteQuip("Bugun 12 isabet yakaladim.", mood), null);
});

test("accepts the absolute profit and the star threshold", () => {
  const negative: JinxDailyMood = { ...mood, kind: "NEGATIVE", profit: -25.94 };
  assert.equal(acceptRemoteQuip("Cebimde yanki var: 25,94.", negative), "Cebimde yanki var: 25,94.");
  assert.equal(acceptRemoteQuip("2 yildiz esiginde boyle.", negative), "2 yildiz esiginde boyle.");
});

test("refuses a figure spelled out in words, with or without diacritics", () => {
  assert.equal(
    acceptRemoteQuip("Bugün sıfır virgül yetmiş beş kâr yaptım.", mood),
    null
  );
  assert.equal(acceptRemoteQuip("Sifir virgulemis yetmis bes kar.", mood), null);
  assert.equal(
    acceptRemoteQuip("Bugün bir tutan kararla idare ettim.", mood),
    "Bugün bir tutan kararla idare ettim."
  );
});

test("refuses empty, over-long, multiline, and non-string candidates", () => {
  assert.equal(acceptRemoteQuip("   ", mood), null);
  assert.equal(acceptRemoteQuip("x".repeat(121), mood), null);
  assert.equal(acceptRemoteQuip("iki\nsatir", mood), null);
  assert.equal(acceptRemoteQuip(null, mood), null);
  assert.equal(acceptRemoteQuip(undefined, mood), null);
});

test("trims surrounding whitespace before use", () => {
  assert.equal(acceptRemoteQuip("  Cuzdanla ateskes.  ", mood), "Cuzdanla ateskes.");
});
