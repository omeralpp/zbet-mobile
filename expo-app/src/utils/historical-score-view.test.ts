import test from "node:test";
import assert from "node:assert/strict";
import { rebuildPoolPathSchema } from "@/src/api/rebuild-statistics-schemas";
import { historicalScoreView } from "./historical-score-view";
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
