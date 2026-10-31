import assert from "node:assert/strict";
import test from "node:test";
import type { RebuildSummary, RebuildMatch } from "../api/rebuild-schemas";
import { candidateFacts, rebuildPresentation } from "./rebuild-presentation";
const make = (reason: string) => ({ reason, availability: "WAITING_DATA", current: null } as RebuildSummary);
test("finished matches never promise further confirmation", () => {
  assert.equal(rebuildPresentation({status:"FINISHED",summary:make("SOURCE_INVALID"),now:0}).text,"Maç tamamlandı · güncel seçim yok");
});
test("verified no-selection is distinct from invalid data", () => {
  assert.equal(rebuildPresentation({status:"LIVE",summary:make("NO_SELECTION"),now:0}).label,"MAÇ İZLENİYOR");
  assert.equal(rebuildPresentation({status:"LIVE",summary:make("SOURCE_INVALID"),now:0}).label,"GÜNCEL VERİ BEKLENİYOR");
});
test("unknown cards and expired selection stay explicit", () => {
  assert.equal(rebuildPresentation({status:"LIVE",summary:make("NO_SELECTION"),redUnknown:true,now:0}).label,"KART VERİSİ YOK");
  assert.equal(rebuildPresentation({status:"LIVE",summary:{...make("ACTIVE"),availability:"ACTIVE"},now:0}).text,"Oran / ölçüm güncel değil · güncel seçim yok");
});
test("early rejected candidate defaults are not presented as measured zero",()=>{
  const c={consistencyScore:null,poolTotal:0,poolWins:0,votesUsed:0,votesSupport:0,votes:[]} as unknown as RebuildMatch["candidates"][number];
  assert.equal(candidateFacts(c),"Puan hesaplanmadı · Teyit kaydı yok · Havuz desteği hesaplanmadı");
  assert.doesNotMatch(candidateFacts(c),/0\/0/);
  c.votes=[{supports:true},{supports:false}] as typeof c.votes;
  assert.match(candidateFacts(c),/1\/2 ölçüm destekliyor · teyit yok/);
});
