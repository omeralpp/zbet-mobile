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
test("journey card keeps the published type floor and the renderable weight set",async()=>{
  const source=await readFile(new URL('./MatchJourneyChart.tsx',import.meta.url),'utf8');
  const {minimumFontSize,renderableWeights}=await import('../theme/typography');
  const sizes=[...source.matchAll(/fontSize:\s*(\d+)/g)].map(m=>Number(m[1]));
  const belowFloor=sizes.filter(size=>size<minimumFontSize);
  assert.deepEqual(belowFloor,[],`journey card renders ${belowFloor.join(', ')}pt below the ${minimumFontSize}pt floor`);
  const weights=[...source.matchAll(/fontWeight:\s*["'](\d+)["']/g)].map(m=>m[1]!);
  const unrenderable=weights.filter(weight=>!renderableWeights.includes(weight as never));
  assert.deepEqual(unrenderable,[],`Android resolves ${unrenderable.join(', ')} to another face`);
});
test("journey chart annotates the reference change where the contract put it",async()=>{
  const source=await readFile(new URL('./MatchJourneyChart.tsx',import.meta.url),'utf8');
  // The rule used to be pinned to x(45) while the reference change is a point
  // in the contract, so on any match whose pool changed elsewhere the chart
  // annotated a minute where nothing happened.
  assert.ok(!source.includes('x1={x(45)}'));
  assert.ok(source.includes('referenceMinute'));
  assert.ok(source.includes('p.referenceChange && p.plotMinute!==null'));
});
test("surprise and normality are never rendered as an unnamed adjacent pair",async()=>{
  const source=await readFile(new URL('./MatchJourneyChart.tsx',import.meta.url),'utf8');
  // Two different measurements formatted identically invite the reader to take
  // one as the complement of the other. Each must carry its contract name.
  assert.ok(source.includes('surpriseLabel'));
  assert.ok(source.includes('normalityLabel'));
  assert.ok(!source.includes('% normal`'));
  // Emphasis follows sufficiency, so an under-threshold reading can never be
  // the loudest mark. Marker size must not encode surprise.
  assert.ok(!source.includes('(event.eventSurprise ?? 0)*2'));
  assert.ok(source.includes('belowReliableCohort'));
});
test("the drawn line is one unbroken series",async()=>{
  const source=await readFile(new URL('./MatchJourneyChart.tsx',import.meta.url),'utf8');
  // The owner rejected a broken chart three times. One polyline, no run split,
  // no dashed bridge standing in for a join.
  assert.ok(!source.includes('caps:'));
  assert.ok(!source.includes('retainedJourneyRuns'));
  assert.ok(source.includes('linePoints.join'));
  assert.ok(source.includes('joinMarks'));
  // A point the contract left without a level is skipped, never interpolated
  // into, so the line still states nothing that was not reported.
  assert.ok(source.includes("p.level!==null && p.plotMinute!==null"));
  // The helper stays covered on its own terms even though the chart no longer
  // splits on it.
  const fixture=mockRetainedJourney('test');
  const a=fixture.points[0]!,b=fixture.points[1]!,c=fixture.points[2]!;
  assert.equal(retainedJourneyRuns([a,{...b,level:null},c]).length,2);
});
test("events the contract left without a minute still reach the chart",async()=>{
  const source=await readFile(new URL('./MatchJourneyChart.tsx',import.meta.url),'utf8');
  // minuteLabel is empty whenever the point has no minute, so HALF_TIME and
  // FULL_TIME pool events arrived with minute null and were filtered out of the
  // chart entirely - the purple rings the card exists to show never appeared.
  // Position is derived from the contract's kind, never from the label text.
  assert.ok(source.includes("event.pathKind==='HALF_TIME'"));
  assert.ok(source.includes("event.pathKind==='FULL_TIME'"));
  assert.ok(source.includes('plottableEvents'));
  assert.ok(!source.includes('analysisEvents.filter(event=>event.minute!==null)'));
  // An unmeasured event has no height on this scale and rides a named lane
  // instead of being dropped on the floor of the plot.
  assert.ok(source.includes('LANE_Y'));
  assert.ok(source.includes('Ölçülmedi'));
});
test("the reference change is a vertical rebase, never a slope across minutes",async()=>{
  const source=await readFile(new URL('./MatchJourneyChart.tsx',import.meta.url),'utf8');
  assert.ok(source.includes('journeyVertices(points)'));
});
test("period scorelines are drawn and titled apart from events",async()=>{
  const source=await readFile(new URL('./MatchJourneyChart.tsx',import.meta.url),'utf8');
  assert.ok(source.includes("event.group==='PERIOD'"));
  assert.ok(source.includes("event.group==='EVENT'"));
  assert.ok(source.includes('DEVRE VE MAÇ SONU SKOR DEĞERLENDİRMESİ'));
  // The ring vocabulary stays reserved for things that happened.
  assert.ok(source.includes('skoru sürprizi'));
});
