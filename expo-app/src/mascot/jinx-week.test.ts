import assert from "node:assert/strict";
import test from "node:test";
import { jinxWeekQuip } from "./jinx-week";

const period = {
  days: 7 as const,
  from: "2026-10-15",
  through: "2026-10-21",
  recommendations: 5,
  matches: 4,
  settled: 3,
  wins: 1,
  losses: 1,
  voids: 1,
  pending: 1,
  unresolved: 1,
  net: "-0.14",
  risk: 2,
  totalRisk: 5,
  roi: -0.07,
  hitRate: 0.5,
  evidenceNote: "PILOT_MATCH_CLUSTERED" as const,
  uncertainty: null,
  byMatch: [],
  byStar: [],
  byMarket: []
};

test("speaks the report's seven days in neutral words", () => {
  const quip = jinxWeekQuip(period);
  assert.equal(quip?.title, "Son 7 gün: 5 öneri");
  assert.equal(quip?.body, "1 kazandı · 1 kaybetti · 1 bekliyor · 1 çözülemedi · 1 iptal · -0,14 birim (varsayımsal).");
  assert.doesNotMatch(`${quip?.title} ${quip?.body}`, /zengin|cüzdan|cep|kravat/i);
});

test("says nothing until the report is available, and waits plainly on an empty week", () => {
  assert.equal(jinxWeekQuip(undefined), null);
  assert.equal(jinxWeekQuip({ ...period, recommendations: 0 })?.title, "Son 7 günde öneri yok");
});

test("a changed figure is a new signature, so the bubble speaks again", () => {
  assert.notEqual(jinxWeekQuip(period)?.signature, jinxWeekQuip({ ...period, net: "0.86", wins: 2 })?.signature);
});
