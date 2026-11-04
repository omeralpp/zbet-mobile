import assert from "node:assert/strict";
import test from "node:test";
import fixture from "./fixtures/btb-pressure-history-v2.json";
import legacy from "./fixtures/btb-pressure-history-v1.json";
import { rebuildObservedPressureHistorySchema, rebuildPressureHistorySchema } from "./rebuild-statistics-schemas";
import { activityIntervals } from "../utils/rebuild-pressure";

// Constructed 120s raw captures, passed through the production BFF activity
// builder by scripts/generate-pressure-activity-fixture.cjs. No football sample.
test("the BFF-built 120s fixture produces honest 4/6-minute columns on Android and web", () => {
  const parsed = rebuildObservedPressureHistorySchema.parse(fixture);
  assert.equal(parsed.activity?.contractVersion,"btb-pressure-activity.v2");
  const columns = activityIntervals(parsed);
  assert.equal(columns.length,6);
  assert.deepEqual(columns.map(point=>point.endMinute),[4,6,8,10,12,14]);
  assert.equal(columns[0]!.windowSeconds,240);
  assert.equal(columns[0]!.observationCount,3);
  assert.equal(columns[1]!.windowSeconds,360);
  assert.equal(columns[1]!.observationCount,4);
  assert.equal(columns.every(point=>!point.connects),true);
  assert.equal(parsed.samples.length,0); // Activity never borrows model pressure.
});

test("requested v2 rejects missing, legacy and mixed-version substitutions", () => {
  assert.equal(rebuildPressureHistorySchema.safeParse(legacy).success,true);
  for (const body of [legacy,{...fixture,activity:undefined},{...fixture,activity:null},
    {...fixture,activity:{...fixture.activity,method:"OBSERVED_ROLLING_5M_BASE_V1"}},
    {...fixture,activity:{...fixture.activity,contractVersion:"btb-pressure-activity.v3"}}]) {
    assert.equal(rebuildObservedPressureHistorySchema.safeParse(body).success,false);
  }
  assert.equal(rebuildObservedPressureHistorySchema.safeParse({...fixture,availability:"UNAVAILABLE",reason:"NO_HISTORY",
    observations:[],activity:null}).success,true);
});

test("available v2 values need the actual span, valid count and linked endpoints", () => {
  const edits: [string,(body: typeof fixture)=>void][] = [
    ["wrong duration",body=>{body.activity.points[2]!.windowSeconds=300;}],
    ["below boundary",body=>{body.activity.points[2]!.windowSeconds=239.999;}],
    ["wrong receipt count",body=>{body.activity.points[2]!.observationCount=4;}],
    ["fractional count",body=>{body.activity.points[2]!.observationCount=3.5;}],
    ["missing endpoint",body=>{body.activity.points[2]!.captureId="unrecorded";}],
    ["missing baseline",body=>{body.activity.points[2]!.baselineCaptureId="unrecorded";}],
    ["epoch changed",body=>{body.observations[1]!.producerSha="F".repeat(64);}],
    ["phase changed",body=>{body.observations[1]!.phase="2H";}],
    ["score correction",body=>{body.observations[1]!.homeScore=1;}],
    ["backward clock",body=>{body.observations[1]!.minute=5;}],
    ["incoherent jump",body=>{body.observations[2]!.minute=6;body.activity.points[2]!.minute=6;}],
    ["duplicate receipt",body=>{body.observations[1]!.captureId=body.observations[0]!.captureId;}],
    ["invented connection",body=>{body.activity.points[2]!.connects=true;}],
    ["invented quiet zero",body=>{body.activity.points[0]!.home=0;}]
  ];
  for (const [name,edit] of edits) {
    const body=structuredClone(fixture);edit(body);
    assert.equal(rebuildObservedPressureHistorySchema.safeParse(body).success,false,name);
  }
});

test("coherent goals and repeated-clock receipts preserve count without inventing a minute", () => {
  const goals=structuredClone(fixture);
  for (const observation of goals.observations.slice(1)) observation.homeScore=1;
  assert.equal(rebuildObservedPressureHistorySchema.safeParse(goals).success,true);
  const repeated=structuredClone(fixture);
  const extra={...repeated.observations[0]!,captureId:"A".repeat(32),observedAt:"2026-10-20T11:00:20.000Z",observedAtExact:"2026-10-20T11:00:20.000Z"};
  repeated.observations.splice(1,0,extra);
  repeated.activity.points[0]!.captureId=extra.captureId;repeated.activity.points[0]!.observedAt=extra.observedAt;
  for (const point of repeated.activity.points.filter(point=>point.reason === "AVAILABLE")) {
    const first=repeated.observations.findIndex(observation=>observation.captureId === point.baselineCaptureId);
    const last=repeated.observations.findIndex(observation=>observation.captureId === point.captureId);
    point.observationCount=last-first+1;
  }
  assert.equal(rebuildObservedPressureHistorySchema.safeParse(repeated).success,true);
  assert.equal(activityIntervals(rebuildObservedPressureHistorySchema.parse(repeated))[0]!.observationCount,4);
});
