import assert from "node:assert/strict";
import test from "node:test";
import fixture from "../api/fixtures/btb-match-statistics-v1.json";
import { rebuildStatisticsSchema } from "../api/rebuild-statistics-schemas";
import { possessionContext } from "./rebuild-possession";

function setup() {
  const statistics = rebuildStatisticsSchema.parse(structuredClone(fixture));
  statistics.statistics.homeBallPossession = 64; statistics.statistics.awayBallPossession = 36;
  const match = {key:statistics.matchKey,status:"LIVE",elapsed:statistics.elapsed!,homeScore:statistics.homeScore!,awayScore:statistics.awayScore!};
  return {statistics,match,now:Date.parse(statistics.observedAt!)};
}
test("possession is labelled current supporting context with its own minute",()=>{
  const {statistics,match,now}=setup();
  assert.equal(possessionContext(statistics,match,now)?.label,`Topla oynama %64 · %36 · ${match.elapsed}′`);
  statistics.statistics.homeBallPossession=0;statistics.statistics.awayBallPossession=100;
  assert.equal(possessionContext(statistics,match,now)?.home,0);
});
test("stale, future, missing and invalid possession is hidden rather than treated as zero",()=>{
  const {statistics,match,now}=setup();
  assert.equal(possessionContext(statistics,match,now+120_000)?.home,64);
  for(const instant of [now-1,now+120_001]) assert.equal(possessionContext(statistics,match,instant),null);
  statistics.statistics.homeBallPossession=null;assert.equal(possessionContext(statistics,match,now),null);
  statistics.statistics.homeBallPossession=70;assert.equal(possessionContext(statistics,match,now),null);
});
test("different fixtures, scores, clocks and terminal games cannot supply current selection context",()=>{
  const {statistics,match,now}=setup();
  for(const patch of [{key:"other"},{homeScore:match.homeScore+1},{elapsed:match.elapsed+3},{status:"FINISHED"}])
    assert.equal(possessionContext(statistics,{...match,...patch},now),null);
  assert.equal(possessionContext(undefined,match,now),null);
});
