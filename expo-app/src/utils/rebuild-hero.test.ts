import assert from "node:assert/strict";
import test from "node:test";
import fixture from "../api/fixtures/btb-rebuild-v1.json";
import { rebuildMatchSchema } from "../api/rebuild-schemas";
import { rebuildHero } from "./rebuild-hero";

function setup() {
  const data = rebuildMatchSchema.parse(structuredClone(fixture));
  const now = Date.parse(data.asOf);
  const input = { data, matchKey: data.matchKey, status: "LIVE", now };
  const candidate = data.candidates.find(item => item.market === data.history[0]!.market)!;
  candidate.quoteAt = data.asOf;
  candidate.quote = "2.25";
  return { data, now, input, candidate, first: data.history[0]! };
}

test("the hero keeps the published price and stars even when the current evaluation changes them", () => {
  const { data, input, first } = setup();
  data.current!.stars = 5;
  const hero = rebuildHero(input)!;
  assert.equal(hero.record.quote, first.quote);
  assert.equal(hero.record.stars, 3);
  assert.equal(hero.currentQuote, "2.25");
  assert.equal(hero.active, true);
});

test("expiry hides the current price and active status, but never erases the published selection", () => {
  const { input, now, first } = setup();
  const hero = rebuildHero({ ...input, now: now + 15_001 })!;
  assert.equal(hero.record.decisionId, first.decisionId);
  assert.equal(hero.record.quote, first.quote);
  assert.equal(hero.active, false);
  assert.equal(hero.currentQuote, null);
  assert.equal(hero.quoteLabel, "Güncel oran bekleniyor");
});

test("an ineligible selection can still show its own verified fresh market price without becoming active", () => {
  const { input, data, candidate } = setup();
  data.current = null;
  data.availability = "WAITING_DATA";
  data.reason = "PRESSURE_FAILED";
  candidate.admitted = false;
  candidate.selected = false;
  candidate.reason = "PRESSURE_FAILED";
  const hero = rebuildHero(input)!;
  assert.equal(hero.active, false);
  assert.equal(hero.stateLabel, "ŞU ANDA AKTİF DEĞİL");
  assert.equal(hero.currentQuote, "2.25");
});

test("closed, decided, missing and unproven quotes never borrow the original price", () => {
  const { input, data, candidate } = setup();
  data.current = null;
  data.availability = "WAITING_DATA";
  candidate.admitted = false;
  for (const reason of ["QUOTE_CLOSED", "MARKET_CLOSED", "QUOTE_STATE_UNPROVEN", "QUOTE_INVALID", "QUOTE_MISSING", "MARKET_ALREADY_DECIDED"]) {
    candidate.reason = reason;
    const hero = rebuildHero(input)!;
    assert.equal(hero.currentQuote, null, reason);
    if (reason.endsWith("CLOSED")) assert.equal(hero.quoteLabel, "Oran kapalı");
  }
});

test("the latest publication replaces the hero without changing or removing older history", () => {
  const { input, data, first } = setup();
  const latest = { ...structuredClone(first), decisionId: "A".repeat(32), market: "MsX", quote: "1.45", minute: 73,
    stars: 1, publishedAt: "2026-10-20T11:59:00.000Z" };
  data.history.unshift(latest); // do not rely on response ordering
  const hero = rebuildHero(input)!;
  assert.equal(hero.record.decisionId, latest.decisionId);
  assert.equal(hero.record.quote, "1.45");
  assert.equal(hero.active, false); // an older active decision cannot activate the latest record
  assert.equal(hero.currentQuote, null); // the old selection's price is a different market
  assert.equal(data.history.length, 2);
  assert.equal(first.quote, fixture.history[0]!.quote);
});

test("finished and unplayed matches retain the recommendation and outcome without a current quote", () => {
  const { input, first } = setup();
  first.result = { state: "WIN", net: "1.123456789012345678901234567890123", revision: 2 };
  for (const status of ["FINISHED", "NOT_PLAYED"]) {
    const hero = rebuildHero({ ...input, status })!;
    assert.equal(hero.active, false);
    assert.equal(hero.currentQuote, null);
    assert.equal(hero.record.result.state, "WIN");
    assert.equal(hero.quoteLabel, status === "FINISHED" ? "Maç tamamlandı" : "Maç oynanmadı");
  }
});

test("failed refresh, future quotes, unsupported outcomes and duplicate markets cannot provide a live price", () => {
  const { input, data, candidate, now } = setup();
  const failed = rebuildHero({ ...input, error: true })!;
  assert.equal(failed.record.quote, data.history[0]!.quote);
  assert.equal(failed.active, false);
  assert.equal(failed.currentQuote, null);
  candidate.quoteAt = new Date(now + 1).toISOString();
  assert.equal(rebuildHero(input)!.currentQuote, null);
  candidate.quoteAt = data.asOf;
  candidate.admitted = false;
  candidate.reason = "UNKNOWN_REASON";
  assert.equal(rebuildHero(input)!.currentQuote, null);
  candidate.admitted = true;
  data.candidates.push(structuredClone(candidate));
  assert.equal(rebuildHero(input)!.currentQuote, null);
});

test("no recommendation is invented for empty history or a different fixture", () => {
  const { input, data } = setup();
  assert.equal(rebuildHero({ ...input, matchKey: "other" }), null);
  data.history = [];
  assert.equal(rebuildHero(input), null);
  assert.equal(rebuildHero({ ...input, data: undefined }), null);
});

test("a frozen unknown kickoff does not hide the same SAP fixture's recommendation", () => {
  const { input, first } = setup();
  first.matchKey = "2026-10-20:17:00:00:00";
  assert.equal(rebuildHero(input)!.record.decisionId, first.decisionId);
  first.matchKey = "2026-10-20:18:13:00:00";
  assert.equal(rebuildHero(input), null);
});
