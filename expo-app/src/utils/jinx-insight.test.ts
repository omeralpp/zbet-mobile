import assert from "node:assert/strict";
import test from "node:test";
import fixture from "../api/fixtures/btb-rebuild-v1.json";
import { rebuildMatchSchema } from "../api/rebuild-schemas";
import { jinxInsight } from "./jinx-insight";

const record = () => structuredClone(rebuildMatchSchema.parse(fixture).history[0]!);

test("explains why unanimous pressure can coexist with a two-star quality ceiling", () => {
  const r = record(); r.stars = 2; r.caps.xg = 2;
  assert.equal(jinxInsight(r), "Baskı aralıkları seçimi aynı yönde desteklemiş. xG kapsamı, kalite tavanını 2 yıldızla sınırlamış.");
});

test("direction conflict, dissent, absent and opposing pressure are never presented as unanimous support", () => {
  const r = record();
  r.directionConflict = true; assert.match(jinxInsight(r), /yön çelişkisi/);
  r.directionConflict = false; r.dissent = true; assert.match(jinxInsight(r), /bütünüyle desteklememiş/);
  r.dissent = false; r.votesSupport = 1; assert.match(jinxInsight(r), /bütünüyle desteklememiş/);
  r.votesSupport = 0; assert.match(jinxInsight(r), /aralıkları seçimi desteklememiş/);
  r.votesUsed = 0; assert.match(jinxInsight(r), /Baskı teyidi kaydedilmemiş/);
});

test("only binding ceilings are named; many ties stay concise and a lower score is not blamed on a higher ceiling", () => {
  const r = record(); r.stars = 2; r.caps = { sample: 2, direction: 5, timing: 4, xg: 2, time_goals: 5 };
  assert.match(jinxInsight(r), /Havuz kapsamı ve xG kapsamı/);
  r.caps.timing = 2; assert.match(jinxInsight(r), /Birden fazla kanıt alanı/);
  r.caps.xg = 1; assert.match(jinxInsight(r), /kalite tavanı, gösterilen yıldız sayısının altında/);
});

test("outcomes cannot rewrite the original reading or create a success claim", () => {
  const r = record(), before = jinxInsight(r);
  for (const state of ["WIN", "LOSS", "VOID", "PENDING", "UNRESOLVED"] as const) {
    r.result.state = state; r.result.revision++;
    assert.equal(jinxInsight(r), before);
  }
});

test("one or two short sentences, with no duplicated pool percentage, price, probability or boilerplate", () => {
  for (const caps of [{ sample: 2, direction: 5, timing: 4, xg: 2, time_goals: 5 },
    { sample: 2, direction: 2, timing: 2, xg: 2, time_goals: 2 },
    { sample: 5, direction: 5, timing: 5, xg: 5, time_goals: 5 }]) {
    const r = record(); r.stars = 2; r.caps = caps;
    const text = jinxInsight(r);
    assert.ok(text.length <= 210); assert.ok((text.match(/\./g) ?? []).length <= 2);
    assert.doesNotMatch(text, /%|36\/40|2\/2|olasılık|garanti|kazandı|kaybetti|şu an/);
  }
  const r = record(); r.caps = { sample: 5, direction: 5, timing: 5, xg: 5, time_goals: 5 }; r.poolWins = r.poolTotal;
  assert.equal(jinxInsight(r), "Baskı aralıkları seçimi aynı yönde desteklemiş.");
});
