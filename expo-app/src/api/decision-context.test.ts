import assert from "node:assert/strict";
import test from "node:test";
import { decisionContextSchema } from "./schemas";
import { derivePressureBalance } from "../utils/pressure-balance";
import { currentIntervalPressure } from "../utils/recent-pressure";

function unavailable() {
  return {contractVersion:"decision-context.v2",recentPressure:{availability:"UNAVAILABLE",reason:"PRODUCER_NOT_ACCEPTED",
    units:"WEIGHTED_ACTIVITY_PER_MINUTE",home:null,away:null,total:null,difference:null,intervalSeconds:null,observedAt:null,
    sourceTimingKnown:false,xgCovered:false,stateRevision:null},decisionCoherence:{availability:"UNAVAILABLE",
      reason:"CAPTURE_V2_UNAVAILABLE",stateRevision:null,quoteRevision:null}};
}
test("V2 unavailable pressure never contains invented zero measurements",()=>{
  assert.doesNotThrow(()=>decisionContextSchema.parse(unavailable()));
  const value=unavailable();
  assert.equal(decisionContextSchema.safeParse({...value,recentPressure:{...value.recentPressure,total:0}}).success,false);
});
test("coherence cannot be marked available without state and quote revisions",()=>{
  const value=unavailable();
  assert.equal(decisionContextSchema.safeParse({...value,decisionCoherence:{...value.decisionCoherence,
    availability:"AVAILABLE",reason:null}}).success,false);
  assert.equal(decisionContextSchema.safeParse({...value,decisionCoherence:{...value.decisionCoherence,
    availability:"AVAILABLE",reason:null,stateRevision:"STATE-1",quoteRevision:"QUOTE-1"}}).success,true);
  assert.equal(decisionContextSchema.safeParse({...value,decisionCoherence:{...value.decisionCoherence,
    reason:null}}).success,false);
});
test("measured quiet interval remains known and balanced",()=>{
  const value=unavailable();
  assert.doesNotThrow(()=>decisionContextSchema.parse({...value,recentPressure:{...value.recentPressure,
    availability:"AVAILABLE",reason:null,home:0,away:0,total:0,difference:0,intervalSeconds:60,
    observedAt:"2026-10-11T15:01:00Z",stateRevision:"STATE-1"}}));
  assert.deepEqual(derivePressureBalance(0,0,true),{direction:"BALANCED",magnitudeRatio:0,hasData:true});
  assert.equal(derivePressureBalance(null,null,true).hasData,false);
});
test("current interval pressure expires without falling back to older or cumulative data",()=>{
  const value=unavailable();
  const context=decisionContextSchema.parse({...value,recentPressure:{...value.recentPressure,
    availability:"AVAILABLE",reason:null,home:0,away:0,total:0,difference:0,intervalSeconds:60,
    observedAt:"2026-10-11T15:01:00Z",stateRevision:"STATE-1"}});
  assert.equal(currentIntervalPressure(context,Date.parse("2026-10-11T15:05:00Z")).measured,true);
  assert.equal(currentIntervalPressure(context,Date.parse("2026-10-11T15:05:01Z")).measured,false);
  assert.equal(currentIntervalPressure(context,Date.parse("2026-10-11T15:00:59Z")).measured,false);
  assert.equal(currentIntervalPressure(undefined).total,null);
});

test("sampled estimates keep local identity separate from provider revisions", () => {
  const value = unavailable();
  const pressure = { ...value.recentPressure, availability: "AVAILABLE", reason: null,
    policyId: "OBSERVED_PILOT_V1", estimated: true, observedEpoch: "LOCAL-EPOCH",
    units: "EST_SAMPLED_ACTIVITY_PER_MIN", home: 2, away: 8, total: 10, difference: -6,
    intervalSeconds: 60, observedAt: "2026-10-13T15:01:00Z" };
  const context = decisionContextSchema.parse({ ...value, recentPressure: pressure });
  assert.equal(context.recentPressure.stateRevision, null);
  assert.equal(context.decisionCoherence.availability, "UNAVAILABLE");
  assert.equal(currentIntervalPressure(context, Date.parse("2026-10-13T15:01:10Z")).difference, -6);
  for (const change of [{ sourceTimingKnown: true }, { stateRevision: "PROVIDER" },
    { estimated: false }, { observedEpoch: null }, { units: "WEIGHTED_ACTIVITY_PER_MINUTE" },
    { policyId: "MEASUREMENT_V1" }]) {
    assert.equal(decisionContextSchema.safeParse({ ...value, recentPressure: { ...pressure, ...change } }).success, false);
  }
});
