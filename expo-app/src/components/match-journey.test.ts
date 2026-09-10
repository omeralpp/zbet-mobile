import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { matchJourneySchema } from "../api/schemas";
import { retainedJourneyRuns, journeyPointLabel } from "./match-journey";
import { mockRetainedJourney } from "../api/mock-data";

test("BFF acceptance fixture renders both halves and restores the same path after reopening",()=>{
  const first=mockRetainedJourney('2026-09-08:44:20:00:00');
  const reopened=matchJourneySchema.parse(JSON.parse(JSON.stringify(first)));
  assert.deepEqual(retainedJourneyRuns(first.points),retainedJourneyRuns(reopened.points));
  assert.equal(first.points.find(p=>p.minute===32)?.level,.92);
  assert.equal(first.points.find(p=>p.minute===73)?.eliminatedRatio,.76);
  assert.equal(first.pools[1]?.count,50);
  assert.equal(retainedJourneyRuns(first.points).length,2);
  assert.match(journeyPointLabel(first.points.find(p=>p.minute===46)!),/İkinci yarı/);
});
test("invalid and unobserved states cannot be joined by the renderer",()=>{
  const fixture=mockRetainedJourney('test');
  const a=fixture.points[0]!,b=fixture.points[1]!,c=fixture.points[2]!;
  const runs=retainedJourneyRuns([a,{...b,level:null},c]);
  assert.equal(runs.length,2);
  assert.equal(runs[0]?.length,1);assert.equal(runs[1]?.length,1);
});
test("contract refuses an invented probability scale and out-of-range event ratios",()=>{
  const fixture=mockRetainedJourney('test');
  assert.throws(()=>matchJourneySchema.parse({...fixture,scale:'WIN_PROBABILITY'}));
  assert.throws(()=>matchJourneySchema.parse({...fixture,points:[{...fixture.points[0],eliminatedRatio:1.01}]}));
});
test("match detail combines Match Path with the retained journey and keeps score/Super separate",async()=>{
  const source=await readFile(new URL('../../app/match/[key].tsx',import.meta.url),'utf8');
  const analysisModule=source.slice(source.indexOf('moduleNodes.matchPath ='));
  const timelineModule=source.slice(source.indexOf('timeline: ('),source.indexOf('scoreDistribution: ('));
  assert.ok(source.includes('matchPathQuery(key)'));
  assert.ok(analysisModule.includes('<MatchJourneyChart'));
  assert.ok(analysisModule.includes('path={matchPath.data}'));
  assert.ok(timelineModule.includes('<MatchTimelineCard'));
  assert.ok(timelineModule.includes('includeRedCards={!matchPathEnabled}'));
  assert.ok(!source.includes('useJourneyObservations'));
  assert.ok(timelineModule.includes('decisions={relatedDecisions}'));
  assert.ok(source.includes('journey.refetch()'));
  assert.ok(source.includes('matchPath.refetch()'));
});
