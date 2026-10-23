import assert from "node:assert/strict";
import test from "node:test";
import fixture from "../api/fixtures/btb-rebuild-v1.json";
import { rebuildMatchSchema, rebuildQuotesSchema } from "../api/rebuild-schemas";
import { mockMatchSummaries, mockDashboard } from "../api/mock-data";
import { activeMatch, activeStarCounts, rebuildCardHero } from "./rebuild-cards";
import { displayedDecision, rebuildHero, requestedDecision } from "./rebuild-hero";
import { publishedExplanation } from "./rebuild-presentation";
import { matchLiveTab } from "./live-match-tabs";

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

test("list cards retain first facts while active filtering and all counts expire on the same clock", () => {
  const { match, history, now } = setup();
  const dashboard = { ...mockDashboard, liveStarSelections: [{matchKey:match.key,stars:3,validUntil:match.rebuild.current!.validUntil}] };
  assert.equal(activeStarCounts(dashboard,now).ALL,1);
  assert.equal(matchLiveTab(match,"STAR","STAR_3_PLUS",now),true);
  const later = now + 16_000;
  assert.equal(activeStarCounts(dashboard,later).ALL,0);
  assert.equal(activeMatch(match,later).selectedOdd,"");
  assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",later),false);
  const hero = rebuildCardHero(match,history,later)!;
  assert.equal(hero.record.quote,history[0]!.quote);
  assert.equal(hero.record.stars,3);
  assert.equal(hero.active,false);
  assert.equal(hero.currentQuote,null);
});

test("an inactive card has its own fresh price without entering active-star counts", () => {
  const { match, history, now } = setup();
  match.rebuild.current = null;
  match.rebuild.availability = "WAITING_DATA";
  const candidate = match.rebuildQuotes.candidates.find(c=>c.market===history[0]!.market)!;
  candidate.admitted = false; candidate.reason = "PRESSURE_FAILED";
  candidate.quote = "1.45";
  assert.equal(rebuildCardHero(match,history,now)!.currentQuote,"1.45");
  assert.equal(rebuildCardHero(match,history,now)!.active,false);
  assert.equal(matchLiveTab(match,"STAR","STAR_1_PLUS",now),false);
});

test("wrong-fixture and duplicate quote packets cannot price the last selection", () => {
  const { match, history, now } = setup();
  match.rebuild.current = null; match.rebuild.availability = "WAITING_DATA";
  match.rebuildQuotes.matchKey = "other";
  assert.equal(rebuildCardHero(match,history,now)!.currentQuote,null);
  const packet = {...match.rebuildQuotes,candidates:[...match.rebuildQuotes.candidates,match.rebuildQuotes.candidates[0]!]};
  assert.equal(rebuildQuotesSchema.safeParse(packet).success,false);
});

test("older BFFs can provide their validated active quote, never an inactive fallback", () => {
  const { match, history, now } = setup();
  const {rebuildQuotes:_quotes,...older}=match;
  assert.equal(rebuildCardHero(older,history,now)!.currentQuote,match.rebuild.current!.quote);
  assert.equal(rebuildCardHero(older,history,now+16_000)!.currentQuote,null);
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
