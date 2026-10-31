import assert from "node:assert/strict";
import test from "node:test";
import fixtureData from "../api/fixtures/btb-rebuild-v1.json";
import { rebuildMatchSchema } from "../api/rebuild-schemas";
import { candidateGroups, jinxBlockers, jinxOutlook } from "./jinx-outlook";
import { rebuildPresentation } from "./rebuild-presentation";

function setup() {
  const data = rebuildMatchSchema.parse(structuredClone(fixtureData));
  const now = Date.parse(data.current!.validUntil) - 1_000;
  const waiting = (reason: string) => { data.availability = "WAITING_DATA"; data.reason = reason; data.current = null;
    data.candidates.forEach(candidate => { candidate.selected = false; candidate.admitted = false; }); };
  return { data, now, waiting };
}

test("a valid current selection is the only state that reads as actionable", () => {
  const s = setup(), outlook = jinxOutlook({ status: "LIVE", data: s.data, now: s.now });
  assert.equal(outlook.kind, "ACT"); assert.equal(outlook.label, "GÜNCEL SEÇİM"); assert.equal(outlook.tone, "positive");
  const expired = jinxOutlook({ status: "LIVE", data: s.data, now: Date.parse(s.data.current!.validUntil) + 1 });
  assert.equal(expired.kind, "WATCH"); assert.equal(expired.label, "KARAR GELEBİLİR"); assert.equal(expired.tone, "warning");
});

test("missing red-card data says plainly that no decision follows without it, instead of promising it", () => {
  const s = setup(); s.waiting("NO_SELECTION"); s.data.candidates[0]!.reason = "RED_CARD_UNKNOWN";
  const outlook = jinxOutlook({ status: "LIVE", data: s.data, now: s.now });
  assert.equal(outlook.kind, "NONE"); assert.equal(outlook.label, "KARAR BEKLENMİYOR");
  assert.match(outlook.text, /kırmızı kart sayısını göndermiyor/); assert.match(outlook.text, /gelmezse/);
  assert.doesNotMatch(outlook.text + outlook.label, /bekleniyor/i);
  assert.equal(outlook.detail, "Skor ve baskı izlenmeye devam ediyor.");
  s.data.candidates[0]!.reason = "MARKET_CLOSED"; s.data.reason = "RED_CARD_UNKNOWN";
  assert.equal(jinxOutlook({ status: "LIVE", data: s.data, now: s.now }).kind, "NONE");
});

test("the outlook pill never echoes the hero's match-state label, even partially", () => {
  const s = setup();
  for (const [status, reason, availability] of [["LIVE", "RED_CARD_UNKNOWN"], ["FINISHED", "NO_SELECTION"], ["NOT_PLAYED", "NO_SELECTION"],
    ["LIVE", "NO_SELECTION"], ["HALF_TIME", "SECOND_HALF_REQUIRED"], ["LIVE", "CONFIRMATION_PENDING"], ["LIVE", "ENDPOINT_STALE"],
    ["LIVE", "SOURCE_INVALID"], ["LIVE", "MODEL_NOT_ENABLED"], ["NOT_STARTED", "NOT_STARTED", "NOT_STARTED"]] as const) {
    s.waiting(reason); if (availability) s.data.availability = availability;
    const hero = rebuildPresentation({ status, summary: s.data, now: s.now, redUnknown: reason === "RED_CARD_UNKNOWN" }).label;
    const pill = jinxOutlook({ status, data: s.data, now: s.now }).label;
    assert.ok(!hero.includes(pill) && !pill.includes(hero), `${status}/${reason}: hero "${hero}" vs pill "${pill}"`);
  }
});

test("finished and unplayed matches promise nothing further, even with a stale current row", () => {
  const s = setup();
  for (const status of ["FINISHED", "NOT_PLAYED"]) {
    const outlook = jinxOutlook({ status, data: s.data, now: s.now });
    assert.equal(outlook.kind, "NONE"); assert.match(outlook.text, /öneri üretilmez/);
  }
});

test("evaluated no-selection cycles keep watching; stale or unknown data asks for data, not a decision", () => {
  const s = setup();
  for (const [reason, text] of [["NO_SELECTION", /hiçbir pazar/], ["SECOND_HALF_REQUIRED", /ikinci yarı/], ["CONFIRMATION_PENDING", /İki destekleyici/]] as const) {
    s.waiting(reason); const outlook = jinxOutlook({ status: "LIVE", data: s.data, now: s.now });
    assert.equal(outlook.kind, "WATCH"); assert.equal(outlook.label, "KARAR GELEBİLİR"); assert.equal(outlook.tone, "pending"); assert.match(outlook.text, text);
  }
  for (const reason of ["ENDPOINT_STALE", "QUOTE_STALE", "SOURCE_INVALID"]) {
    s.waiting(reason); const outlook = jinxOutlook({ status: "LIVE", data: s.data, now: s.now });
    assert.equal(outlook.kind, "WATCH"); assert.equal(outlook.label, "KARAR GELEBİLİR"); assert.equal(outlook.tone, "warning");
  }
  s.waiting("NOT_STARTED"); s.data.availability = "NOT_STARTED";
  const notStarted = jinxOutlook({ status: "NOT_STARTED", data: s.data, now: s.now });
  assert.equal(notStarted.tone, "neutral"); assert.match(notStarted.text, /maç başlayınca/);
});

test("a failed read is an error state with its own retry, never a silent watch", () => {
  const s = setup(), outlook = jinxOutlook({ status: "LIVE", data: s.data, now: s.now, error: true });
  assert.equal(outlook.kind, "ERROR"); assert.equal(outlook.tone, "warning");
  assert.equal(jinxOutlook({ status: "LIVE", data: undefined, now: s.now, loading: true }).text, "Karar verisi okunuyor.");
});

test("blockers count rejected markets per reason without naming any market", () => {
  const s = setup(); s.waiting("NO_SELECTION");
  s.data.candidates.forEach((candidate, index) => { candidate.reason = index < 9 ? "PRESSURE_FAILED" : index < 12 ? "LEADER_FAILED" : index < 14 ? "SCORE_FAILED" : index < 17 ? "QUOTE_CLOSED" : "PRICE_CEILING"; });
  const rows = jinxBlockers(s.data);
  assert.deepEqual(rows.map(row => [row.reason, row.count]), [["PRESSURE_FAILED", 9], ["LEADER_FAILED", 3], ["QUOTE_CLOSED", 3], ["OTHER", 4]]);
  assert.equal(rows[0]!.label, "Son baskı ölçümleri seçimi desteklemiyor");
  for (const row of rows) for (const candidate of s.data.candidates) assert.doesNotMatch(row.label, new RegExp(`\\b${candidate.market}\\b`));
  assert.equal(rows.reduce((sum, row) => sum + row.count, 0), 19);
  s.data.candidates.forEach((candidate, index) => { if (index >= 12) candidate.reason = index < 18 ? "QUOTE_CLOSED" : "PRICE_CEILING"; });
  assert.deepEqual(jinxBlockers(s.data).map(row => row.reason), ["PRESSURE_FAILED", "QUOTE_CLOSED", "LEADER_FAILED", "PRICE_CEILING"],
    "a single leftover reason is named rather than hidden in a bucket");
});

test("a single reason that already is the main sentence is not repeated as a blocker row", () => {
  const s = setup(); s.waiting("SECOND_HALF_REQUIRED"); s.data.candidates.forEach(candidate => { candidate.reason = "SECOND_HALF_REQUIRED"; });
  assert.deepEqual(jinxBlockers(s.data), []);
  s.data.candidates[0]!.reason = "QUOTE_CLOSED";
  assert.deepEqual(jinxBlockers(s.data).map(row => row.count), [18, 1]);
  assert.deepEqual(jinxBlockers(undefined), []);
});

test("evidence lists chosen and eligible markets singly and groups the rest, with facts only where measured", () => {
  const s = setup(), groups = candidateGroups(s.data.candidates);
  assert.deepEqual(groups.listed.map(candidate => candidate.market), ["Ms15a"]);
  assert.equal(groups.rejected.length, 1); assert.equal(groups.rejected[0]!.reason, "MARKET_CLOSED");
  assert.equal(groups.rejected[0]!.count, 18); assert.equal(groups.rejected[0]!.measured.length, 0);
  const measured = s.data.candidates.find(candidate => candidate.market === "Ms2")!;
  Object.assign(measured, { reason: "PRESSURE_FAILED", consistencyScore: "40", votesUsed: 2, votesSupport: 1 });
  const regrouped = candidateGroups(s.data.candidates).rejected;
  assert.deepEqual(regrouped.map(group => [group.reason, group.count]), [["MARKET_CLOSED", 17], ["PRESSURE_FAILED", 1]]);
  assert.deepEqual(regrouped[1]!.measured.map(candidate => candidate.market), ["Ms2"]);
});
