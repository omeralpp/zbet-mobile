import assert from "node:assert/strict";
import test from "node:test";
import fixture from "../api/fixtures/btb-rebuild-v1.json";
import { rebuildMatchSchema, rebuildQuotesSchema } from "../api/rebuild-schemas";
import { mockMatchSummaries, mockDashboard } from "../api/mock-data";
import { activeMatch, activeStarCounts, publishedStarCounts, rebuildCardHero } from "./rebuild-cards";
import { displayedDecision, rebuildHero, requestedDecision } from "./rebuild-hero";
import { publishedExplanation } from "./rebuild-presentation";
import { matchLiveTab } from "./live-match-tabs";
import { overviewLiveSelections } from "./overview-live-selections";

function setup() {
  const data = rebuildMatchSchema.parse(structuredClone(fixture));
  const { history, candidates, jinx: _jinx, ...summary } = data;
  const now = Date.parse(data.asOf);
  const quote = candidates.find(item => item.market === history[0]!.market)!;
  quote.quoteAt = data.asOf;
  const rebuildQuotes = rebuildQuotesSchema.parse({ contractVersion: "btb-market-quotes.v1", matchKey: data.matchKey, asOf: data.asOf,
    candidates: candidates.map(({market,admitted,reason,quote,quoteAt})=>({market,admitted,reason,quote,quoteAt})) });
  const match = { ...mockMatchSummaries[0]!, key: data.matchKey, id: 17, status: "LIVE" as const,
    selectedOdd: data.current!.market, rating: data.current!.stars, rebuild: summary, rebuildQuotes };
  return { data, history, match, now };
}

test("published cards and star views stay playable after native model expiry", () => {
  const { match, history, now } = setup();
  const dashboard = { ...mockDashboard, liveStarSelections: [{matchKey:match.key,stars:3,validUntil:match.rebuild.current!.validUntil}] };
  assert.equal(activeStarCounts(dashboard,now).ALL,1);
  assert.equal(matchLiveTab(match,"STAR","STAR_3_PLUS",now),true);
  const later = now + 16_000;
  assert.equal(activeStarCounts(dashboard,later).ALL,0);
  assert.equal(activeMatch(match,later).selectedOdd,"");
  assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",later),false);
  assert.equal(matchLiveTab(match,"STAR","STAR_3_PLUS",later,history),true);
  assert.equal(publishedStarCounts([match],history,later).STAR_3,1);
  assert.equal(overviewLiveSelections([match],history,"STAR_3_PLUS",later).length,1);
  const hero = rebuildCardHero(match,history,later)!;
  assert.equal(hero.record.quote,history[0]!.quote);
  assert.equal(hero.record.stars,3);
  assert.equal(hero.active,false);
  assert.equal(hero.currentQuote,"2.25");
  assert.equal(hero.playable,true);
});

test("a playable last selection enters star filters and counts even after native eligibility ends", () => {
  const { match, history, now } = setup();
  match.rebuild.current = null;
  match.rebuild.availability = "WAITING_DATA";
  const candidate = match.rebuildQuotes.candidates.find(c=>c.market===history[0]!.market)!;
  candidate.admitted = false; candidate.reason = "PRESSURE_FAILED";
  candidate.quote = "1.45";
  assert.equal(rebuildCardHero(match,history,now)!.currentQuote,"1.45");
  assert.equal(rebuildCardHero(match,history,now)!.active,false);
  assert.equal(rebuildCardHero(match,history,now)!.playable,true);
  assert.equal(rebuildCardHero(match,history,now)!.stateLabel,"SEÇİM AKTİF");
  assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",now),false);
  assert.equal(matchLiveTab(match,"STAR","STAR_3_PLUS",now,history),true);
  assert.equal(matchLiveTab(match,"STAR","STAR_4_PLUS",now,history),false);
  assert.equal(activeMatch(match,now,history).rating,3);
  assert.equal(activeMatch(match,now,history).currentRate,1.45);
  assert.equal(publishedStarCounts([match],history,now).STAR_3,1);
});

test("published stars stay frozen when the native current stars change",()=>{
  const {match,history,now}=setup();
  match.rebuild.current!.stars=5;
  assert.equal(activeMatch(match,now,history).rating,3);
  assert.equal(matchLiveTab(match,"STAR","STAR_4_PLUS",now,history),false);
  assert.equal(publishedStarCounts([match,match],history,now).ALL,1);
  assert.equal(publishedStarCounts([match],history,now).STAR_5,0);
});

test("retained last-verified history stays visible but cannot reactivate while its report is unavailable",()=>{
  const {match,history,now}=setup();
  const hero=rebuildCardHero(match,history,now,true)!;
  assert.equal(hero.record.decisionId,history[0]!.decisionId);
  assert.equal(hero.record.quote,history[0]!.quote);
  assert.equal(hero.record.stars,history[0]!.stars);
  assert.equal(hero.currentQuote,null);
  assert.equal(hero.playable,false);
  assert.equal(hero.stateLabel,"PİYASA DOĞRULANIYOR");
  assert.equal(publishedStarCounts([match],history,now,true).ALL,0);
  assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",now,history,true),false);
});

test("market updates and availability, not wall time, control filters and counts",()=>{
  const {match,history,now}=setup();
  const check=(at:number,expected:boolean,error=false)=>{
    assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",at,history,error),expected);
    assert.equal(!!activeMatch(match,at,history,error).selectedOdd,expected);
    assert.equal(publishedStarCounts([match],history,at,error).ALL,expected?1:0);
  };
  check(now,true); check(now+15_000,true); check(now+15_001,true); check(now+300_000,true); check(now,false,true);
  match.rebuildQuotes.asOf=new Date(now+20_000).toISOString();
  match.rebuildQuotes.candidates.find(c=>c.market===history[0]!.market)!.quoteAt=match.rebuildQuotes.asOf;
  check(now+20_000,true);
  const candidate=match.rebuildQuotes.candidates.find(c=>c.market===history[0]!.market)!;
  candidate.reason="QUOTE_CLOSED";candidate.admitted=false;
  check(now+20_000,false);
  candidate.reason="PRESSURE_FAILED";
  check(now+20_000,true);
  assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",now+20_000,[]),false);
});

test("Overview follows the selected Live star threshold across open, closed and settled last publications",()=>{
  const {match,history,now}=setup();
  const later=now+300_000;
  assert.deepEqual(overviewLiveSelections([match,match],history,"STAR_3_PLUS",later).map(m=>m.key),[match.key]);
  assert.equal(overviewLiveSelections([match],history,"STAR_4_PLUS",later).length,0);
  assert.equal(overviewLiveSelections([match],history,"STAR_3_PLUS",later,true).length,0);
  const candidate=match.rebuildQuotes.candidates.find(c=>c.market===history[0]!.market)!;
  candidate.reason="QUOTE_CLOSED";
  assert.equal(overviewLiveSelections([match],history,"STAR_3_PLUS",later).length,0);
  candidate.reason="ADMITTED";history[0]!.result.state="WIN";
  assert.equal(overviewLiveSelections([match],history,"STAR_3_PLUS",later).length,0);
});

test("closed, decided, unknown and settled selections never enter last-selection star filters",()=>{
  for(const reason of ["QUOTE_CLOSED","MARKET_ALREADY_DECIDED","PERIOD_CONTEXT_INVALID"] as const){
    const {match,history,now}=setup();
    const candidate=match.rebuildQuotes.candidates.find(c=>c.market===history[0]!.market)!;
    candidate.admitted=false; candidate.reason=reason;
    assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",now,history),false,reason);
    assert.equal(publishedStarCounts([match],history,now).ALL,0,reason);
  }
  for(const state of ["WIN","LOSS","VOID","UNRESOLVED"] as const){
    const {match,history,now}=setup(); history[0]!.result.state=state;
    assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",now,history),false,state);
  }
  const {match,history,now}=setup();
  assert.equal(matchLiveTab({...match,status:"HALF_TIME"},"STAR","STAR_1_PLUS",now,history),true);
  assert.equal(publishedStarCounts([{...match,status:"FINISHED"}],history,now).ALL,0);
});

test("a newer publication replaces the earlier market rather than reviving an old playable selection",()=>{
  const {match,history,now}=setup();
  const next={...history[0]!,decisionId:"A".repeat(32),publishedAt:match.rebuild.asOf,market:"MsX",stars:2 as const};
  const candidate=match.rebuildQuotes.candidates.find(c=>c.market===next.market)!;
  candidate.admitted=false; candidate.reason="QUOTE_CLOSED";
  assert.equal(publishedStarCounts([match],[...history,next],now).ALL,0);
  candidate.admitted=true; candidate.reason="ADMITTED";candidate.quote="1.67";candidate.quoteAt=match.rebuild.asOf;
  assert.equal(publishedStarCounts([match],[...history,next],now).STAR_2,1);
  assert.equal(matchLiveTab(match,"STAR","STAR_3_PLUS",now,[...history,next]),false);
});

test("wrong-fixture and duplicate quote packets cannot price the last selection", () => {
  const { match, history, now } = setup();
  match.rebuild.current = null; match.rebuild.availability = "WAITING_DATA";
  match.rebuildQuotes.matchKey = "other";
  assert.equal(rebuildCardHero(match,history,now)!.currentQuote,null);
  assert.equal(publishedStarCounts([match],history,now).ALL,0);
  const packet = {...match.rebuildQuotes,candidates:[...match.rebuildQuotes.candidates,match.rebuildQuotes.candidates[0]!]};
  assert.equal(rebuildQuotesSchema.safeParse(packet).success,false);
});

test("older BFFs can provide their validated active quote, never an inactive fallback", () => {
  const { match, history, now } = setup();
  const {rebuildQuotes:_quotes,...older}=match;
  assert.equal(rebuildCardHero(older,history,now)!.currentQuote,match.rebuild.current!.quote);
  assert.equal(rebuildCardHero(older,history,now+16_000)!.currentQuote,null);
  assert.equal(publishedStarCounts([older],history,now).ALL,1);
  match.rebuildQuotes.matchKey="other";
  assert.equal(publishedStarCounts([match],history,now).ALL,0);
});

test("decision panels default to the latest publication but preserve explicit historical and push targets", () => {
  const { match, history } = setup();
  const first = history[0]!;
  const next = {...first,decisionId:"A".repeat(32),publishedAt:"2026-10-20T11:59:00Z",minute:73,market:"MsX"};
  const records = [next,first];
  assert.equal(displayedDecision(records,match.key,null)?.decisionId,next.decisionId);
  assert.equal(displayedDecision(records,match.key,first.decisionId)?.decisionId,first.decisionId);
  assert.equal(displayedDecision(records,match.key,"F".repeat(32)),null);
  const data={...match.rebuild,history:records,candidates:match.rebuildQuotes.candidates};
  const inspected=rebuildHero({data,matchKey:match.key,status:"LIVE",now:Date.parse(match.rebuild.asOf),decisionId:first.decisionId});
  assert.equal(inspected?.record.decisionId,first.decisionId);
});

test("the Live star-filter parameter cannot masquerade as a historical decision link",()=>{
  for(const filter of ["STAR_1_PLUS","STAR_3_PLUS","ALL","SELECTED",undefined,["A".repeat(32)]])
    assert.equal(requestedDecision(filter),null);
  assert.equal(requestedDecision("A".repeat(32)),"A".repeat(32));
});

test("match Jinx explains frozen decision facts without consuming today's pressure or stars", () => {
  const { data, history } = setup();
  const before = publishedExplanation(history[0]!);
  data.current!.stars = 5;
  data.current!.quote = "3.45";
  data.candidates[0]!.votesSupport = 0;
  assert.equal(publishedExplanation(history[0]!),before);
  assert.match(before,/2\/2 baskı teyidi, 36\/40 havuz desteği/);
  assert.match(before,/karar anına aittir/);
});

test("duplicate snapshot entries and terminal matches cannot manufacture active stars", () => {
  const { match, now } = setup();
  const entry = {matchKey:match.key,stars:3,validUntil:match.rebuild.current!.validUntil};
  assert.equal(activeStarCounts({...mockDashboard,liveStarSelections:[entry,entry]},now).ALL,1);
  assert.equal(matchLiveTab({...match,status:"FINISHED"},"STAR","STAR_1_PLUS",now),false);
});
