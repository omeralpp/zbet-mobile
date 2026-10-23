import assert from "node:assert/strict";
import test from "node:test";
import fixture from "../api/fixtures/btb-pressure-history-v1.json";
import { rebuildPressureHistorySchema } from "../api/rebuild-statistics-schemas";
import { activityIntervals, latestIntervalReading, pressureIntervals } from "./rebuild-pressure";

function setup() {
  const history = rebuildPressureHistorySchema.parse(structuredClone(fixture));
  const baseline = {...history.observations[0]!,captureId:"baseline",minute:20,observedAt:"2026-10-22T12:00:00Z"};
  const endpoint = {...baseline,captureId:"endpoint",minute:26,observedAt:"2026-10-22T12:05:00Z"};
  history.observations = [baseline,endpoint];
  history.activity = {contractVersion:"btb-pressure-activity.v1",method:"OBSERVED_ROLLING_5M_BASE_V1",windowMinutes:5,
    units:"WEIGHTED_ACTIVITY_PER_MINUTE",displayOnly:true,affectsSelection:false,estimated:true,availability:"AVAILABLE",reason:"AVAILABLE",
    points:[{captureId:endpoint.captureId,baselineCaptureId:baseline.captureId,minute:26,phase:endpoint.phase,observedAt:endpoint.observedAt,
      startsAt:baseline.observedAt,endsAt:endpoint.observedAt,home:0.8,away:0,reason:"AVAILABLE",connects:false}]};
  return history;
}
test("activity is a one-column five-minute value; native pressure remains unchanged",()=>{
  const history=setup(),native=pressureIntervals(history);
  const columns=activityIntervals(rebuildPressureHistorySchema.parse(history));
  assert.equal(columns.length,1);assert.equal(columns[0]!.startMinute,25);assert.equal(columns[0]!.endMinute,26);
  assert.equal(columns[0]!.home,0.8);assert.equal(columns[0]!.awayText,"0");
  assert.equal(latestIntervalReading(columns,{homeTeam:"Home",awayTeam:"Away"})!.range,"20–26′");
  assert.deepEqual(pressureIntervals(history),native);
});
test("partial native history can display activity; missing windows are never synthesized",()=>{
  const history=setup();history.availability="PARTIAL";history.samples=[];
  history.activity!.points.unshift({...history.activity!.points[0]!,captureId:"gap",minute:25,baselineCaptureId:null,startsAt:null,endsAt:null,home:null,away:null,reason:"ACTIVITY_WARMUP"});
  history.observations.push({...history.observations[1]!,captureId:"gap",minute:25});
  assert.equal(activityIntervals(rebuildPressureHistorySchema.parse(history)).length,1);
  assert.deepEqual(pressureIntervals(history),[]);
  assert.deepEqual(activityIntervals({...history,availability:"UNAVAILABLE"}),[]);
});
test("unknown versions, partial values, missing proofs and contradictory availability fail validation",()=>{
  for(const change of [
    (h:ReturnType<typeof setup>)=>{h.activity!.points[0]!.away=null;},
    (h:ReturnType<typeof setup>)=>{h.activity!.points[0]!.baselineCaptureId=null;},
    (h:ReturnType<typeof setup>)=>{h.activity!.availability="UNAVAILABLE";},
    (h:ReturnType<typeof setup>)=>{h.activity!.points[0]!.captureId="foreign";},
    (h:ReturnType<typeof setup>)=>{h.activity!.points[0]!.startsAt="2026-10-22T12:04:00Z";}
  ]) {const history=setup();change(history);assert.equal(rebuildPressureHistorySchema.safeParse(history).success,false);}
  const bad=JSON.parse(JSON.stringify(setup()));bad.activity.contractVersion="future";
  assert.equal(rebuildPressureHistorySchema.safeParse(bad).success,false);
});
