import assert from 'node:assert/strict';
import test from 'node:test';
import { mockRetainedJourney } from '../api/mock-data';
import type { LiveContext } from '../api/schemas';
import { journeyMoments, journeyVertices, markerGroups, poolLeaders, pressureReading } from './journey-story';

const fixture=mockRetainedJourney('story');
test('pool rebase stays at the reference minute and retains the previous level until then',()=>{
  const a={...fixture.points[0]!,plotMinute:44,level:.2};
  const b={...a,key:'second',plotMinute:46,level:.9,referenceChange:true};
  assert.deepEqual(journeyVertices([a,b]),[{minute:44,level:.2},{minute:46,level:.2},{minute:46,level:.9}]);
});
test('missing clock and levels never produce invented points, including a null latest capture',()=>{
  const a={...fixture.points[0]!,plotMinute:5,level:.8};
  assert.deepEqual(journeyVertices([a,{...a,plotMinute:null},{...a,level:null}]),[{minute:5,level:.8}]);
});
test('one provider goal links only to its exact recorded score transition, not the nearest pressure sample',()=>{
  const p={...fixture.points[0]!,key:'goal',kind:'GOAL' as const,minute:26,plotMinute:26,home:1,away:1};
  const context:LiveContext={availability:'OK',timeline:[{eventKey:'g',kind:'GOAL',minute:26,scoreAfter:{home:1,away:1},side:'HOME'}]};
  const moments=journeyMoments([p],context);
  assert.equal(moments.length,1);
  assert.equal(moments[0]!.point?.key,'goal');
  assert.equal(moments[0]!.side,'HOME');
  assert.equal(journeyMoments([{...p,minute:60}],context).find(e=>e.key==='g')!.point,undefined);
  assert.equal(journeyMoments([{...p,minute:60}],context).length,1,'late capture must not duplicate the goal');
});
test('unplaced and coincident events remain separately selectable, with no manufactured minute',()=>{
  const context:LiveContext={availability:'OK',timeline:[{eventKey:'a',kind:'RED_CARD',minute:90,minuteLabel:'90+3'}, {eventKey:'b',kind:'GOAL',minute:90,minuteLabel:'90+3'},{eventKey:'c',kind:'RED_CARD',minute:null}]};
  const moments=journeyMoments([],context);
  assert.deepEqual(moments.map(e=>e.key),['a','b','c']);
  assert.equal(moments[2]!.minute,null);
  assert.equal(moments[0]!.label,'90+3');
});
test('pool leaders use the fixed denominator and preserve tied scores without mutating the source',()=>{
  const pool={...fixture.pools[0]!,count:100,rows:[{score:'2-1',count:15},{score:'1-1',count:30},{score:'0-0',count:30},{score:'3-0',count:5}]};
  assert.deepEqual(poolLeaders(pool).map(r=>[r.score,r.share]),[['1-1',.3],['0-0',.3],['2-1',.15]]);
  assert.equal(pool.rows[0]!.score,'2-1');
  assert.deepEqual(poolLeaders(undefined),[]);
});
test('pressure absence is distinct from balance, and alignment is never a team assertion',()=>{
  const p=fixture.points[0]!;
  assert.match(pressureReading({...p,pressureAlignment:null}),/ölçümü yok/);
  assert.equal(pressureReading({...p,pressureAlignment:0}),'Baskı dengede');
  assert.match(pressureReading({...p,pressureAlignment:-.3}),/beklentisine karşı/);
  assert.match(pressureReading({...p,pressureAlignment:.3}),/beklentisini destekliyor/);
});
const lane=(minutes:(number|null)[])=>journeyMoments([],{availability:'OK',timeline:minutes.map((minute,index)=>({eventKey:`e${index}`,kind:'GOAL' as const,minute}))});
const phone=(minute:number)=>58+minute/90*224;
const wide=(minute:number)=>58+minute/90*900;
test('marks that would overlap are grouped, and the same pair on a wider axis is not',()=>{
  assert.deepEqual(markerGroups(lane([42,46]),phone,26).map(g=>g.map(e=>e.key)),[['e0','e1']]);
  assert.deepEqual(markerGroups(lane([42,46]),wide,26).map(g=>g.map(e=>e.key)),[['e0'],['e1']]);
});
test('grouping never chains, so a run of near neighbours cannot outgrow one mark',()=>{
  assert.deepEqual(markerGroups(lane([10,18,26]),phone,26).map(g=>g.map(e=>e.key)),[['e0','e1'],['e2']]);
});
test('coincident events still share one mark at any scale, and unplaced events carry none',()=>{
  assert.deepEqual(markerGroups(lane([90,90]),wide,26).map(g=>g.length),[2]);
  assert.deepEqual(markerGroups(lane([null,null]),phone,26),[]);
});
test('every placed event appears exactly once, in minute order',()=>{
  const moments=lane([5,7,40,null,88]);
  assert.deepEqual(markerGroups(moments,phone,26).flat().map(e=>e.key),['e0','e1','e2','e4']);
});
