import assert from "node:assert/strict";
import test from "node:test";
import type { TotoFixture, TotoPrediction, TotoProgram } from "@/src/api/schemas";
import { couponStructure, coverageTrend, dayRange, fixtureInstant, formatCost, kickoffCountdown, kickoffLabel, kickoffText, nextMatchLine, outOf, payoutRows, programAction, totoInPlay, totoProgress } from "./toto-lifecycle";

const at = (date: string, time: string) => Date.parse(`${date}T${time}:00+03:00`);
const fixture = (matchNo: number, matchDate: string, matchTime: string, actualResult: TotoFixture["actualResult"] = null): TotoFixture =>
  ({ matchNo, matchName: `Maç ${matchNo}`, matchDate, matchTime, eventId: null, actualResult, homeScore: null, awayScore: null });
const prediction = (matchNo: number, matchDate: string, matchTime: string, result: TotoPrediction["result"]): TotoPrediction =>
  ({ ...fixture(matchNo, matchDate, matchTime, result === "OPEN" ? null : "1"), mainPick: "1", coverage: "1", confidence: 0.5, riskScore: 0.2, result });
const program = (rows: TotoPrediction[], extra: Partial<TotoProgram> = {}) =>
  ({ status: "WAITING_RESULT", columns: 8, singleCount: 12, doubleCount: 0, tripleCount: 3, fixtures: rows, predictions: rows, ...extra }) as TotoProgram;

test("kickoff is read as Istanbul wall-clock time and unknown dates stay unknown", () => {
  assert.equal(fixtureInstant({ matchDate: "2026-11-02", matchTime: "19:00" }), Date.parse("2026-11-02T16:00:00Z"));
  assert.equal(fixtureInstant({ matchDate: "", matchTime: "19:00" }), null);
  assert.equal(fixtureInstant({ matchDate: "2026-11-02", matchTime: "" }), null);
  assert.match(kickoffLabel(at("2026-11-02", "19:00")), /^2 Kas Pzt 19:00$/);
});

test("countdown speaks in the largest whole unit and never counts down a started match", () => {
  const now = at("2026-11-01", "12:00");
  assert.equal(kickoffCountdown(now + 2 * 86_400_000 + 3_600_000, now), "2 gün sonra");
  assert.equal(kickoffCountdown(now + 5 * 3_600_000 + 59 * 60_000, now), "5 saat sonra");
  assert.equal(kickoffCountdown(now + 40 * 60_000, now), "40 dk sonra");
  assert.equal(kickoffCountdown(now, now), "başladı");
  assert.equal(kickoffCountdown(now - 1, now), "başladı");
  assert.equal(kickoffText(at("2026-11-03", "12:00"), now), "3 Kas Sal 12:00 · 2\u00a0gün\u00a0sonra", "the countdown never breaks across lines");
});

test("a waiting program reports progress, the coverage ceiling and the next unsettled match", () => {
  const rows = [prediction(1, "2026-10-30", "19:00", "MAIN_HIT"), prediction(2, "2026-10-30", "21:00", "COVERED"),
    prediction(3, "2026-10-31", "19:00", "MISS"), prediction(4, "2026-11-01", "21:00", "OPEN"), prediction(5, "2026-11-01", "16:00", "OPEN")];
  const progress = totoProgress(program(rows), at("2026-11-01", "12:00"));
  assert.deepEqual([progress.total, progress.settled, progress.coverageHits, progress.mainHits, progress.misses, progress.open], [5, 3, 2, 1, 1, 2]);
  assert.equal(progress.maxCoverage, 4, "only settled misses lower the ceiling");
  assert.deepEqual(progress.next, { matchNo: 5, matchName: "Maç 5", at: at("2026-11-01", "16:00"), started: false, inPlay: false }, "earliest open kickoff, not the lowest number");
  assert.equal(progress.firstKickoff, at("2026-10-30", "19:00")); assert.equal(progress.lastKickoff, at("2026-11-01", "21:00"));
  assert.equal(totoProgress(program(rows), at("2026-11-01", "17:00")).next?.started, true);
});

test("a program without predictions reads its fixtures and claims no plan or ceiling", () => {
  const fixtures = [fixture(1, "2026-11-03", "20:00"), fixture(2, "2026-11-03", "17:00")];
  const progress = totoProgress({ status: "ACTIVE", columns: 0, singleCount: 0, doubleCount: 0, tripleCount: 0, fixtures, predictions: [] }, at("2026-11-01", "12:00"));
  assert.equal(progress.planned, false); assert.equal(progress.maxCoverage, null); assert.equal(progress.total, 2);
  assert.equal(progress.firstKickoff, at("2026-11-03", "17:00")); assert.equal(progress.next?.matchNo, 2); assert.equal(progress.structure, null);
});

test("structure, date span, trend and action labels read only existing fields", () => {
  assert.equal(couponStructure({ singleCount: 8, doubleCount: 0, tripleCount: 7 }), "8 tek · 7 üçlü");
  assert.equal(couponStructure({ singleCount: 6, doubleCount: 2, tripleCount: 7 }), "6 tek · 2 çift · 7 üçlü");
  assert.equal(dayRange(at("2026-10-23", "19:00"), at("2026-10-25", "21:00")), "23–25 Eki");
  assert.equal(dayRange(at("2026-10-30", "19:00"), at("2026-11-02", "21:00")), "30 Eki – 2 Kas");
  assert.equal(dayRange(at("2026-10-30", "13:00"), at("2026-10-30", "21:00")), "30 Eki");
  const programs = [{ gcNo: 363, status: "RESULTED", coverageHits: 12 }, { gcNo: 366, status: "WAITING_RESULT", coverageHits: 7 },
    { gcNo: 365, status: "RESULTED", coverageHits: 12 }, { gcNo: 364, status: "RESULTED", coverageHits: 10 }, { gcNo: 362, status: "RESULTED", coverageHits: null },
    { gcNo: 361, status: "RESULTED", coverageHits: 9 }] as const;
  assert.deepEqual(coverageTrend(programs), [12, 10, 12], "newest resulted first; running counts of a waiting program are excluded");
  assert.deepEqual(["ACTIVE", "WAITING_RESULT", "RESULTED", "ERROR"].map(status => programAction(status as TotoProgram["status"])),
    ["Kuponu incele", "Sonuç takibini aç", "Sonuçları incele", "Programı incele"]);
  assert.equal(programAction("ACTIVE", false), "Fikstürü incele", "no coupon exists before the plan");
  assert.deepEqual([outOf(12, 15), outOf(null, 15), outOf(10, 3)], ["12/15", "—", "10"], "an inconsistent count is never shown as a false fraction");
});

test("SAP's coupon close is the deadline when known; the first kickoff stands in only when it is not", () => {
  const rows = [prediction(1, "2026-11-02", "19:00", "OPEN")];
  const now = at("2026-11-01", "12:00");
  assert.deepEqual(totoProgress(program(rows, { payinEndsAt: "2026-11-02T13:00:00.000Z" }), now).deadline, { at: Date.parse("2026-11-02T13:00:00.000Z"), label: "Kupon kapanışı" });
  assert.deepEqual(totoProgress(program(rows, { payinEndsAt: null }), now).deadline, { at: at("2026-11-02", "19:00"), label: "İlk maç" });
  assert.equal(totoProgress(program(rows, { payinEndsAt: "not a date" }), now).deadline?.label, "İlk maç");
});

test("cost carries SAP's unit when known and never assumes one", () => {
  assert.equal(formatCost(21870, "TRY").replace(/\s/g, ""), "₺21.870");
  assert.equal(formatCost(21870.5, "TRY").replace(/\s/g, ""), "₺21.870,50");
  assert.equal(formatCost(21870, null), "21.870");
});

test("prize tiers read highest first and say how many coupon columns each one pays", () => {
  const rows = payoutRows([
    { correct: 12, winners: 1204, amountPerColumn: 85.5, couponWinningColumns: 3, theoreticalTotal: 256.5 },
    { correct: 15, winners: 0, amountPerColumn: 0, couponWinningColumns: 0, theoreticalTotal: 0 }
  ], "TRY");
  assert.deepEqual(rows.map(row => row.label), ["15 bilen", "12 bilen"]);
  assert.equal(rows[0]!.oursLabel, "kuponda yok");
  assert.match(rows[1]!.detail.replace(/\s/g, " "), /^1\.204 kazanan · kolon başı ₺85,50$/);
  assert.match(rows[1]!.oursLabel.replace(/\s/g, " "), /^kuponda 3 kolon · ₺256,50$/);
});

test("btb-toto-live.v1 polling: only an open program with a match in play or awaiting its first reading", () => {
  const now = at("2026-11-24", "23:45");
  const kicked = fixture(1, "2026-11-24", "23:00");
  const livePart = { minute: 45, homeScore: 1, awayScore: 0, halfTimeHomeScore: null, halfTimeAwayScore: null, updatedAt: null };
  const withLive = (live: TotoFixture["live"], row = kicked): TotoFixture => ({ ...row, live });
  const open = (rows: TotoFixture[], status: TotoProgram["status"] = "WAITING_RESULT") => ({ status, fixtures: rows });
  assert.equal(totoInPlay(open([kicked]), now), false, "no live field: older BFF or SAP, no polling");
  assert.equal(totoInPlay(open([withLive({ status: "LIVE", provisionalResult: null, ...livePart })]), now), true);
  assert.equal(totoInPlay(open([withLive(null)]), now), true, "kicked off, first reading pending");
  assert.equal(totoInPlay(open([withLive(null, fixture(1, "2026-11-25", "23:00"))]), now), false, "not kicked off yet");
  assert.equal(totoInPlay(open([withLive(null, fixture(1, "2026-11-24", "15:00"))]), now), false, "outside the live window");
  assert.equal(totoInPlay(open([withLive({ status: "FINISHED", provisionalResult: "1", ...livePart })]), now), false, "provisional final: done");
  assert.equal(totoInPlay(open([withLive({ status: "LIVE", provisionalResult: null, ...livePart }, fixture(1, "2026-11-24", "23:00", "1"))]), now), false, "official result");
  assert.equal(totoInPlay(open([withLive({ status: "LIVE", provisionalResult: null, ...livePart })], "RESULTED"), now), false);
  assert.equal(totoInPlay(undefined, now), false);
});

test("matches finished on the live feed stop waiting; settled stays official (owner 2026-11-26)", () => {
  const now = at("2026-11-26", "23:50");
  const live = (status: NonNullable<TotoFixture["live"]>["status"], provisionalResult: "1" | "X" | "2" | null) =>
    ({ status, provisionalResult, minute: status === "LIVE" ? 45 : null, homeScore: 1, awayScore: 0, halfTimeHomeScore: null,
      halfTimeAwayScore: null, updatedAt: null });
  const rows = [prediction(1, "2026-11-24", "20:45", "OPEN"), prediction(2, "2026-11-25", "23:00", "OPEN"),
    prediction(3, "2026-11-26", "23:00", "OPEN"), prediction(4, "2026-11-27", "20:00", "OPEN")];
  // The live reading sits on the fixtures, as the BFF sends it.
  const fixtures = [{ ...fixture(1, "2026-11-24", "20:45"), live: live("FINISHED", "1") }, { ...fixture(2, "2026-11-25", "23:00"), live: live("FINISHED", "X") },
    { ...fixture(3, "2026-11-26", "23:00"), live: live("LIVE", null) }, fixture(4, "2026-11-27", "20:00")];
  const progress = totoProgress(program(rows, { fixtures }), now);
  assert.equal(progress.settled, 0);
  assert.equal(progress.provisional, 2);
  assert.equal(progress.inPlay, 1);
  assert.equal(progress.waiting, 1);
  assert.equal(progress.next?.matchNo, 3);
  assert.equal(progress.next?.inPlay, true);
  assert.match(nextMatchLine(progress, kickoffLabel) ?? "", /^Canlı: Maç 3 · 26 Kas/);
  const done = [{ ...fixtures[0]! }, { ...fixtures[1]! }];
  const finished = totoProgress(program(rows.slice(0, 2), { fixtures: done }), now);
  assert.equal(finished.next, null);
  assert.equal(nextMatchLine(finished, kickoffLabel), "Tüm maçlar bitti · resmî sonuç bekleniyor");
  const upcoming = totoProgress(program([prediction(4, "2026-11-27", "20:00", "OPEN")], { fixtures: [fixture(4, "2026-11-27", "20:00")] }), now);
  assert.match(nextMatchLine(upcoming, kickoffLabel) ?? "", /^Sıradaki: Maç 4/);
});
