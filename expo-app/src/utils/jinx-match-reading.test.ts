import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import fixtureData from "../api/fixtures/btb-rebuild-v1.json";
import { rebuildMatchSchema } from "../api/rebuild-schemas";
import { analysisContextSchema, type AnalysisContext } from "../api/schemas";
import { mockMatches } from "../api/mock-data";
import { jinxMatchReading } from "./jinx-match-reading";
import { jinxScoreCondition } from "./jinx-score-condition";

function setup() {
  const data = rebuildMatchSchema.parse(structuredClone(fixtureData)), record = data.history[0]!;
  const now = Date.parse(data.asOf) + 1_000;
  const context: AnalysisContext = { contractVersion: "btb-analysis-context.v1", matchKey: data.matchKey,
    snapshotId: "TEST", evidenceRevision: "TEST", selectionKey: record.decisionId,
    acquiredAt: data.asOf, expiresAt: new Date(now + 120_000).toISOString(), valueEvidence: null,
    sourceAvailability: { matchDetail: "AVAILABLE" }, sources: { matchDetail: { ...mockMatches[0]!, key: data.matchKey,
      currentMatchRecord: true, status: "LIVE", homeScore: record.homeScore, awayScore: record.awayScore,
      elapsed: record.minute, lastUpdatedAt: data.asOf }, insight: null, periodScore: null, leagueContext: null,
      superLogs: null, liveContext: null, teamForm: null, matchPath: null, matchJourney: null } };
  const candidate = data.candidates.find(c => c.market === record.market)!;
  const waiting = () => { data.availability = "WAITING_DATA"; data.reason = "NO_SELECTION"; data.current = null; candidate.selected = false; };
  const laterVotes = () => { candidate.votes = record.votes.map((vote, index) => ({ ...vote,
    startsAt: new Date(now - 60_000 + index * 20_000).toISOString(),
    endsAt: new Date(now - 30_000 + index * 20_000).toISOString() })); };
  const run = (options: { now?: number; context?: AnalysisContext | null; sourceFailed?: boolean } = {}) =>
    jinxMatchReading({ record, data: rebuildMatchSchema.parse(data), matchKey: data.matchKey,
      context: options.context === null ? undefined : analysisContextSchema.parse(options.context ?? context),
      now: options.now ?? now, sourceFailed: options.sourceFailed ?? false });
  return { data, record, candidate, context, now, waiting, laterVotes, run };
}

test("compares later evaluated pressure with the frozen decision without changing its stars or result", () => {
  const s = setup(); s.waiting(); s.laterVotes();
  s.candidate.admitted = false; s.candidate.reason = "PRESSURE_FAILED";
  s.candidate.votesSupport = 1; s.candidate.votesUsed = 2; s.candidate.votes[1]!.supports = false;
  const before = JSON.stringify(s.record), reading = s.run();
  assert.equal(reading.title, "Baskı desteği azaldı");
  assert.deepEqual(reading.comparison, { label: "Baskı teyidi", before: "2/2", after: "1/2" });
  assert.match(reading.text, /oran açık olsa da son hesap bu pazarı teyit etmiyor/);
  assert.equal(JSON.stringify(s.record), before);
  assert.ok(reading.sources.some(source => source.label === "Son baskı aralıkları"));
});

test("a larger support fraction is described without increasing the original rating", () => {
  const s = setup(); s.record.votesSupport = 1; s.record.dissent = true; s.laterVotes();
  s.candidate.votesSupport = 2; s.candidate.votesUsed = 2;
  const reading = s.run(); assert.equal(reading.title, "Baskı desteği arttı");
  assert.match(reading.text, /ilk kararın yıldızını değiştirmez/); assert.equal(s.record.stars, 3);
  s.waiting(); s.candidate.admitted = false; s.candidate.reason = "SCORE_FAILED";
  assert.match(s.run().text, /son hesap bu pazarı yine de uygun bulmuyor/);
});

test("reduced pressure is not mislabeled as lost native admission when the backend still confirms the selection", () => {
  const s = setup(); s.laterVotes(); s.candidate.votesUsed = 3; s.candidate.votesSupport = 2;
  s.candidate.votes.push({ ...s.candidate.votes[1]!, supports: false,
    startsAt: new Date(s.now - 8_000).toISOString(), endsAt: new Date(s.now - 1_000).toISOString() });
  const reading = s.run(); assert.equal(reading.title, "Baskı desteği azaldı");
  assert.match(reading.text, /son hesap bu seçimi yine de teyit ediyor/);
  assert.equal(reading.comparison?.after, "2/3");
});

test("a changed number of windows with the same support fraction is not a fabricated deterioration", () => {
  const s = setup(); s.laterVotes(); s.candidate.votesSupport = 1; s.candidate.votesUsed = 1;
  assert.notEqual(s.run().title, "Baskı desteği azaldı");
});

test("old, future, reversed and absent intervals cannot manufacture a measured change", () => {
  for (const change of [
    (s: ReturnType<typeof setup>) => s.candidate.votes.forEach(v => { v.endsAt = s.record.publishedAt; v.startsAt = s.record.publishedAt; }),
    (s: ReturnType<typeof setup>) => s.candidate.votes.forEach(v => { v.endsAt = new Date(s.now + 1_000).toISOString(); }),
    (s: ReturnType<typeof setup>) => s.candidate.votes.forEach(v => { v.startsAt = new Date(s.now + 1_000).toISOString(); }),
    (s: ReturnType<typeof setup>) => { s.candidate.votes = []; },
    (s: ReturnType<typeof setup>) => { s.candidate.votesUsed = 0; s.candidate.votesSupport = 0; }
  ]) {
    const s = setup(); s.waiting(); s.laterVotes(); s.candidate.admitted = false;
    s.candidate.reason = "LEADER_FAILED"; s.candidate.votesSupport = 1; change(s);
    const reading = s.run(); assert.notEqual(reading.title, "Baskı desteği azaldı");
    assert.match(reading.text, /lider skorlardan/);
    assert.equal(reading.comparison, undefined);
  }
});

test("a closed or decided market takes precedence over apparently helpful pressure", () => {
  const s = setup(); s.waiting(); s.laterVotes(); s.candidate.marketOpen = false;
  s.candidate.admitted = false; s.candidate.reason = "QUOTE_CLOSED";
  assert.equal(s.run().title, "Pazar kapalı"); assert.match(s.run().text, /güncel işlem fiyatı değil/);
  s.candidate.reason = "MARKET_ALREADY_DECIDED"; assert.equal(s.run().title, "Pazar sonuçlandı");
});

test("native missing-card and stale-source gates cannot be replaced with a new score narrative", () => {
  const s = setup(); s.waiting(); s.data.reason = "RED_CARD_UNKNOWN";
  assert.equal(s.run().title, "Kart verisi bekleniyor");
  for (const reason of ["ENDPOINT_STALE", "QUOTE_STALE", "TRANSACTION_RECONCILIATION_REQUIRED"]) {
    s.data.reason = reason; assert.equal(s.run().title, "Güncel kanıt bekleniyor");
  }
});

test("expired, future, wrong-fixture and unverified current context falls back to a clearly historical reading", () => {
  for (const change of [
    (s: ReturnType<typeof setup>) => { s.context.expiresAt = new Date(s.now - 1).toISOString(); },
    (s: ReturnType<typeof setup>) => { s.context.acquiredAt = new Date(s.now + 1).toISOString(); },
    (s: ReturnType<typeof setup>) => { s.context.acquiredAt = new Date(Date.parse(s.record.publishedAt) - 1).toISOString(); },
    (s: ReturnType<typeof setup>) => { s.context.matchKey = "another"; },
    (s: ReturnType<typeof setup>) => { s.context.sources.matchDetail.key = "another"; },
    (s: ReturnType<typeof setup>) => { s.context.sources.matchDetail.currentMatchRecord = false; },
    (s: ReturnType<typeof setup>) => { s.context.sourceAvailability.matchDetail = "UNAVAILABLE"; },
    (s: ReturnType<typeof setup>) => { s.context.sourceAvailability.matchDetail = "UNKNOWN"; },
    (s: ReturnType<typeof setup>) => { s.context.acquiredAt = new Date(s.now - 40_000).toISOString(); }
  ]) {
    const s = setup(); change(s); assert.equal(s.run().title, "Karar anı"); assert.equal(s.run().comparison, undefined);
  }
  assert.equal(setup().run({ context: null }).title, "Karar anı");
});

test("stale, future, unavailable or failed RB1 reads never retain a live comparison", () => {
  const s = setup();
  assert.equal(s.run({ now: s.now + 31_000 }).title, "Güncel kontrol bekleniyor");
  assert.equal(s.run({ sourceFailed: true }).comparison, undefined);
  s.data.asOf = new Date(s.now + 1).toISOString(); assert.equal(s.run().title, "Güncel kontrol bekleniyor");
  s.data.asOf = new Date(s.now).toISOString(); s.waiting(); s.data.availability = "UNAVAILABLE";
  assert.equal(s.run().title, "Güncel kontrol bekleniyor");
});

test("the score's next critical boundary is actionable context, without a forecast", () => {
  const s = setup(); s.context.sources.matchDetail.homeScore = 1; s.context.sources.matchDetail.awayScore = 0;
  const reading = s.run(); assert.equal(reading.title, "Skorun kritik koşulu");
  assert.match(reading.text, /^Bir gol daha alt koşulunu bozar\./);
  assert.match(reading.text, /Havuz kapsamı, kalite tavanını 3 yıldızla sınırlamış/);
  assert.deepEqual(reading.comparison, { label: "Skor", before: "60′ · 0–0", after: "60′ · 1–0" });
  s.context.sources.matchDetail.homeScore = 2;
  assert.equal(s.run().title, "Skor koşulu belirleyici"); assert.match(s.run().text, /alt koşulu bu skorla karşılanmıyor/);
});

test("finished analysis compares the decision score with final score and honors native pending/void/unresolved states", () => {
  const s = setup(); s.waiting(); s.context.sources.matchDetail.status = "FINISHED";
  s.context.sources.matchDetail.elapsed = 90; s.context.sources.matchDetail.awayScore = 1;
  s.record.result = { state: "WIN", revision: 2, net: "1" };
  assert.equal(s.run().title, "Maç sonu değerlendirme"); assert.match(s.run().text, /0–0 skoru 0–1.*sağlanmış/);
  s.context.sources.matchDetail.awayScore = 2;
  assert.equal(s.run().title, "Sonuç kontrolü gerekli");
  s.record.result = { state: "PENDING", revision: 3, net: null };
  assert.equal(s.run().title, "Sonuç kaydı bekleniyor"); assert.equal(s.record.result.state, "PENDING");
  s.record.result = { state: "VOID", revision: 4, net: "0" }; assert.equal(s.run().title, "Karar geçersiz");
  s.record.result = { state: "UNRESOLVED", revision: 5, net: null }; assert.equal(s.run().title, "Sonuç doğrulanıyor");
});

test("a resolved decision never borrows a later live snapshot as a fresh signal", () => {
  const s = setup(); s.record.result = { state: "LOSS", revision: 2, net: "-1" };
  assert.equal(s.run().title, "Karar anı"); assert.equal(s.run().comparison, undefined);
});

test("a newer native decision is named instead of silently reusing its evidence for the old one", () => {
  const s = setup(); const next = { ...structuredClone(s.record), decisionId: "A".repeat(32), market: "MsX", publishedAt: s.data.asOf };
  s.data.history.push(next); s.candidate.selected = false;
  const selected = s.data.candidates.find(c => c.market === "MsX")!;
  selected.admitted = true; selected.selected = true;
  s.data.current = { ...s.data.current!, decisionId: next.decisionId, market: "MsX" };
  assert.equal(s.run().title, "Yeni karar var");
  assert.equal(s.run().comparison?.after, "Beraberlik"); assert.equal(s.record.market, "Ms15a");
  assert.equal(s.run().decisionId, next.decisionId);
  s.data.current.validUntil = new Date(s.now - 1).toISOString();
  assert.equal(s.run().decisionId, next.decisionId, "A historical record link must not inherit live-admission expiry");
});

test("score decrease is surfaced instead of being described as ordinary forward match progress", () => {
  const s = setup(); s.record.homeScore = 1; s.record.awayScore = 1;
  const reading = s.run(); assert.equal(reading.title, "Skor geriye değişmiş");
  assert.equal(reading.tone, "warning"); assert.match(reading.comparison!.before, /1–1/);
  assert.match(reading.comparison!.after, /0–0/);
});

test("an unplayed fixture is not misclassified as a live score correction", () => {
  const s = setup(); s.record.homeScore = 1; s.context.sources.matchDetail.status = "NOT_PLAYED";
  assert.equal(s.run().title, "Maç oynanmadı"); assert.equal(s.run().comparison, undefined);
});

test("a record from another fixture cannot supply even historical evidence to this card", () => {
  const s = setup(); s.record.matchKey = "2026-10-20:999:00:00:00";
  const reading = s.run(); assert.equal(reading.title, "Kayıt doğrulanamadı"); assert.deepEqual(reading.sources, []);
});

test("all supported market truth conditions match the already accepted BFF display semantics", () => {
  const require = createRequire(import.meta.url);
  const { MARKET_LABELS, marketState } = require("../../../../zbet-cap/srv/mobile-bff/jinx-market-state.js");
  for (const market of Object.keys(MARKET_LABELS)) for (let home = 0; home <= 5; home++) for (let away = 0; away <= 5; away++) {
    const expected = marketState({ selectedOdd: market, homeScore: home, awayScore: away });
    const actual = jinxScoreCondition(market, home, away)!;
    assert.equal(actual.holds, ["HOLDING", "SETTLED_FOR"].includes(expected.status), `${market} ${home}-${away}`);
    assert.equal(actual.irreversible, ["SETTLED_FOR", "SETTLED_AGAINST"].includes(expected.status));
    assert.ok(actual.text.length < 115);
  }
  assert.equal(jinxScoreCondition("UNKNOWN", 0, 0), null);
  assert.equal(jinxScoreCondition("Ms2", -1, 0), null);
});

test("normal, changed and final readings stay short and contain no win probability, recommendation or model-success claim", () => {
  const s = setup();
  const readings = [s.run()]; s.waiting(); s.laterVotes(); s.candidate.admitted = false;
  s.candidate.reason = "PRESSURE_FAILED"; s.candidate.votesSupport = 1; readings.push(s.run());
  s.context.sources.matchDetail.status = "FINISHED"; readings.push(s.run());
  for (const reading of readings) {
    assert.ok(reading.text.length <= 210); assert.ok((reading.text.match(/\./g) ?? []).length <= 2);
    assert.doesNotMatch(reading.text, /%|olasılık|banko|garanti|oyna|kupon|başarılı model|kazanacak/);
    assert.ok(reading.sources.length >= 1);
  }
});
