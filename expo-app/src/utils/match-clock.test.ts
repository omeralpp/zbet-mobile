import assert from "node:assert/strict";
import test from "node:test";
import { matchClockSchema } from "../api/schemas";
import { formatElapsed } from "./format";
import { deriveMatchMinuteProgress } from "./match-minute-progress";
import { matchPeriodLabel } from "./match-period";

test("added-time labels display numeric minutes on both surfaces, including older BFF plus labels",()=>{
  for(const [label,elapsed,period,phase] of [["45+",45,"1H","1. YARI"],["90+",90,"2H","2. YARI"],["45+2",47,"1H","1. YARI"],["90+4",94,"2H","2. YARI"]] as const){
    const clock=matchClockSchema.parse({contractVersion:"match-clock.v1",label,period});
    assert.equal(formatElapsed("LIVE",elapsed,clock),`${elapsed}'`);
    assert.equal(deriveMatchMinuteProgress("LIVE",elapsed,clock).label,`${elapsed}'`);
    assert.equal(matchPeriodLabel({status:"LIVE",elapsed,clock},"2H"),phase);
  }
});
test("source extra time and penalties override an old regulation pressure phase",()=>{
  const clock=matchClockSchema.parse({contractVersion:"match-clock.v1",label:"105",period:"ET"});
  assert.equal(matchPeriodLabel({status:"LIVE",elapsed:105,clock},"2H"),"UZATMA");
  assert.equal(deriveMatchMinuteProgress("LIVE",105,clock).label,"105' · UZATMA");
  assert.equal(formatElapsed("LIVE",120,{label:null,period:"PENALTIES"}),"PENALTILAR");
  assert.equal(matchPeriodLabel({status:"LIVE",elapsed:105},"2H"),null);
});
test("unknown clock is distinct from a genuine kick-off zero, and terminal wording is preserved",()=>{
  const clock=matchClockSchema.parse({contractVersion:"match-clock.v1",label:null,period:"2H"});
  assert.equal(formatElapsed("LIVE",0,clock),"—");
  assert.equal(deriveMatchMinuteProgress("LIVE",0,clock).label,"—");
  assert.equal(formatElapsed("LIVE",0,{label:"0",period:"1H"}),"0'");
  assert.equal(formatElapsed("HALF_TIME",45,clock),"DEVRE");
  assert.equal(formatElapsed("FINISHED",120,clock),"MS");
});
