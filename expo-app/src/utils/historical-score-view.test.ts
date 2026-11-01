import test from "node:test";
import assert from "node:assert/strict";
import { rebuildPoolPathSchema } from "@/src/api/rebuild-statistics-schemas";
import { historicalOverview, historicalScoreReachability, historicalScoreView, retainHistoricalReference } from "./historical-score-view";
const now=Date.parse("2026-10-23T14:31:00Z");
const pool=rebuildPoolPathSchema.parse({contractVersion:"btb-pool-path.v1",modelRegime:"BTB_RB1_20261018",matchKey:"M1",asOf:new Date(now).toISOString(),availability:"AVAILABLE",reason:"AVAILABLE",source:"VERIFIED_RB1_OBSERVATION_POOLS",label:"Havuzda kalan pay",unit:"SURVIVING_REFERENCE_SHARE",winningProbability:false,historical:true,fullMatchCoverageProven:false,points:[],
 scoreDistribution:{period:"1H",captureId:"C1",observedAt:"2026-10-23T14:30:15Z",minute:17,homeScore:1,awayScore:0,total:3,winningProbability:false,rows:[{score:"1–0",count:2,share:2/3},{score:"2–0",count:1,share:1/3}]}});
const match={status:"LIVE",elapsed:18,homeScore:1,awayScore:0};
test("first-half outcomes retain verified counts and clear period labels",()=>{
 const view=historicalScoreView(match,pool,now);assert.equal(view.label,"İlk yarı sonuçları");assert.equal(view.source?.total,3);
 assert.equal(historicalScoreView({...match,elapsed:47,phase:"1H"},{...pool,scoreDistribution:{...pool.scoreDistribution!,minute:46}},now).period,"1H");
});
test("old score, stale pool, wrong half and incomplete contract cannot become current outcomes",()=>{
 assert.equal(historicalScoreView({...match,homeScore:2},pool,now).source,null);
 assert.equal(historicalScoreView(match,pool,now+121000).source,null);
 assert.equal(historicalScoreView({...match,elapsed:46,phase:"2H"},{...pool,scoreDistribution:{...pool.scoreDistribution!,minute:45}},now).source,null);
 assert.equal(historicalScoreView({...match,status:"FINISHED"},pool,now).source,null);
 assert.equal(historicalScoreView(match,undefined,now).source,null);
 assert.equal(rebuildPoolPathSchema.safeParse({...pool,scoreDistribution:{...pool.scoreDistribution!,total:4}}).success,false);
});

test("a goal mutes lower score outcomes and a correction restores their reachability",()=>{
 const current={...match,phase:"2H",homeScore:2,awayScore:1,lastUpdatedAt:new Date(now-1000).toISOString()};
 for(const score of ["1–1","1-2","1:3","2–0"]) assert.equal(historicalScoreReachability(score,current,"2H",now),"UNREACHABLE");
 for(const score of ["2–1","2-2","3–1"]) assert.equal(historicalScoreReachability(score,current,"2H",now),"REACHABLE");
 assert.equal(historicalScoreReachability("1–1",{...current,homeScore:1},"2H",now),"REACHABLE");
});

test("unverified time, scores and a different half never fabricate inactive outcomes",()=>{
 const current={...match,phase:"2H",homeScore:2,awayScore:1,lastUpdatedAt:new Date(now-1000).toISOString()};
 for(const patch of [{lastUpdatedAt:undefined},{lastUpdatedAt:new Date(now-121000).toISOString()},
   {lastUpdatedAt:new Date(now+1000).toISOString()},{homeScore:NaN},{phase:undefined},{status:"NOT_STARTED"}]) {
   assert.equal(historicalScoreReachability("0–0",{...current,...patch},"2H",now),"UNKNOWN");
 }
 assert.equal(historicalScoreReachability("0–0",current,"1H",now),"UNKNOWN");
 assert.equal(historicalScoreReachability("invalid",current,"2H",now),"UNKNOWN");
 assert.equal(historicalScoreReachability("0–0",{...current,status:"HALF_TIME",phase:"1H"},"1H",now),"UNREACHABLE");
});

test("the recorded reference preserves original counts through goals and resets on a new half",()=>{
 const first={period:"1H" as const,source:pool.scoreDistribution!};
 const before=structuredClone(first);
 const changed={...pool.scoreDistribution!,captureId:"C2",homeScore:2,rows:[{score:"2–0",count:1,share:1}]};
 assert.equal(retainHistoricalReference(first,"1H",changed),first);
 assert.deepEqual(first,before);
 const second=retainHistoricalReference(first,"2H",null);
 assert.deepEqual(second,{period:"2H",source:null});
 assert.equal(retainHistoricalReference(second,"2H",{...changed,period:"2H"}).source?.captureId,"C2");
});

test("a current second-half clock overrides an old first-half observation",()=>{
 const current={...match,phase:"1H",clock:{period:"2H"},elapsed:60,lastUpdatedAt:new Date(now-1000).toISOString()};
 assert.equal(historicalScoreView(current,pool,now).period,"2H");
 assert.equal(historicalScoreView(current,pool,now).source,null);
 assert.equal(historicalScoreReachability("0–0",current,"1H",now),"UNKNOWN");
 assert.equal(historicalScoreReachability("0–0",{...current,clock:{period:"ET"}},"2H",now),"UNKNOWN");
});

test("the overview leads with reachable scores and folds unreachable ones without renormalizing (NXT-OBS-241)",()=>{
 const rows=[{score:"0–0",reachability:"UNREACHABLE",probability:0.4,count:4},{score:"1–1",reachability:"REACHABLE",probability:0.3,count:3},
  {score:"1–0",reachability:"UNREACHABLE",probability:0.2,count:2},{score:"2–1",reachability:"UNKNOWN",probability:0.1,count:1}];
 const view=historicalOverview(rows,6);
 assert.deepEqual(view.overview.map(row=>row.score),["1–1","2–1"]);
 assert.deepEqual(view.ordered.map(row=>row.score),["1–1","2–1","0–0","1–0"]);
 assert.equal(view.unreachable?.scores,2);assert.equal(view.unreachable?.records,6);
 assert.ok(Math.abs((view.unreachable?.share??0)-0.6)<1e-9);
 assert.equal(historicalOverview([{...rows[0]!,count:null}]).unreachable?.records,null);
 assert.equal(historicalOverview(rows.filter(row=>row.reachability!=="UNREACHABLE")).unreachable,null);
 assert.deepEqual(historicalOverview(rows,1).overview.map(row=>row.score),["1–1"]);
});
