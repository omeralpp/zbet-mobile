import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { selectionHistorySchema, emptySelectionHistory } from "./selection-history-schema";
import { historicalSelection } from "../components/selection-lab-view";
import { mockMobileApi } from "./mock-mobile-api";
const require = createRequire(import.meta.url);
const { history } = require("../../../../zbet-cap/test/fixtures/selection-history.js");

test("shared client accepts the BFF history and preserves original quote after expiry", () => {
  const data=selectionHistorySchema.parse(history());
  const first=historicalSelection(data,data.matchKey,Date.parse("2026-12-01T00:00:00Z"));
  assert.equal(first?.quote,1.4);assert.equal(first?.reference?.quote,1.5);assert.equal(data.currentOffer,false);
  assert.equal(historicalSelection(data,"different-key",Date.now()),null);
  assert.equal(historicalSelection(data,data.matchKey,0),null);
  assert.equal(historicalSelection(data,data.matchKey,Date.parse("2026-12-01T00:00:00Z"),true),null);
});
test("history rejects current-offer, result, probability and original-price inventions", () => {
  type MutableFixture={currentOffer:boolean;availability:string;firstDecision:Record<string,unknown>};
  const mutations=[(x: MutableFixture)=>{x.currentOffer=true;},(x: MutableFixture)=>{x.firstDecision.resultStatus="WON";},
    (x: MutableFixture)=>{x.firstDecision.probability=0.9;},(x: MutableFixture)=>{x.firstDecision.quoteAt="2026-11-08T18:00:01Z";},
    (x: MutableFixture)=>{x.firstDecision.recordedAt="2026-11-08T18:00:15Z";},(x: MutableFixture)=>{x.availability="UNAVAILABLE";}];
  for(const mutate of mutations){const data=history();mutate(data);assert.equal(selectionHistorySchema.safeParse(data).success,false);}
});
test("mock mode never fabricates a historical alternative decision", async () => {
  assert.deepEqual(await mockMobileApi.getMatchSelectionHistory("TEST_KEY"),emptySelectionHistory("TEST_KEY"));
});
