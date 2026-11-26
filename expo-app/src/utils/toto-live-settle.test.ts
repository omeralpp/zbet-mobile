import assert from "node:assert/strict";
import test from "node:test";
import type { TotoFixture, TotoPrediction, TotoProgram } from "@/src/api/schemas";
import { predictionOutcome, settleTotoFromLive } from "./toto-live-settle";
import { totoProgress } from "./toto-lifecycle";

type Live = NonNullable<TotoFixture["live"]>;
const live = (status: Live["status"], provisionalResult: Live["provisionalResult"], homeScore = 2, awayScore = 1): Live =>
  ({ status, provisionalResult, minute: status === "LIVE" ? 50 : null, homeScore, awayScore, halfTimeHomeScore: null,
    halfTimeAwayScore: null, updatedAt: null });
const fixture = (matchNo: number, liveRow: Live | null, actualResult: TotoFixture["actualResult"] = null): TotoFixture =>
  ({ matchNo, matchName: `Maç ${matchNo}`, matchDate: "2026-11-24", matchTime: "23:00", eventId: null, actualResult,
    homeScore: null, awayScore: null, live: liveRow });
const prediction = (matchNo: number, mainPick: TotoPrediction["mainPick"], coverage: string, actualResult: TotoPrediction["actualResult"] = null,
  result: TotoPrediction["result"] = "OPEN"): TotoPrediction =>
  ({ ...fixture(matchNo, null, actualResult), mainPick, coverage, confidence: 0.4, riskScore: 0.2, result });
const program = (fixtures: TotoFixture[], predictions: TotoPrediction[], extra: Partial<TotoProgram> = {}) =>
  ({ status: "WAITING_RESULT", columns: 1944, singleCount: 7, doubleCount: 3, tripleCount: 5, mainHits: null, coverageHits: null,
    fixtures, predictions, ...extra }) as TotoProgram;

test("a coupon row's outcome: main pick, other coverage, or a miss", () => {
  assert.equal(predictionOutcome({ mainPick: "1", coverage: "1X2" }, "1"), "MAIN_HIT");
  assert.equal(predictionOutcome({ mainPick: "1", coverage: "1X" }, "X"), "COVERED");
  assert.equal(predictionOutcome({ mainPick: "1", coverage: "1" }, "2"), "MISS");
});

test("a match finished on the live feed is settled at once, with its score and the program counts (owner 2026-11-26)", () => {
  const settled = settleTotoFromLive(program(
    [fixture(1, live("FINISHED", "1", 1, 0)), fixture(2, live("FINISHED", "X", 1, 1)), fixture(3, live("FINISHED", "2", 0, 1)),
      fixture(4, live("LIVE", null)), fixture(5, null)],
    [prediction(1, "1", "1"), prediction(2, "1", "1X"), prediction(3, "1", "1"), prediction(4, "1", "1X2"), prediction(5, "2", "2")]));
  assert.deepEqual(settled.predictions.map((row) => row.result), ["MAIN_HIT", "COVERED", "MISS", "OPEN", "OPEN"]);
  assert.deepEqual(settled.fixtures.map((row) => row.actualResult), ["1", "X", "2", null, null]);
  assert.deepEqual([settled.predictions[0]!.homeScore, settled.predictions[0]!.awayScore], [1, 0]);
  assert.equal(settled.mainHits, 1);
  assert.equal(settled.coverageHits, 2);
  const progress = totoProgress(settled, Date.parse("2026-11-26T21:00:00Z"));
  assert.equal(progress.settled, 3);
  assert.equal(progress.inPlay, 1);
  assert.equal(progress.waiting, 1);
  assert.equal(progress.maxCoverage, 4);
});

test("an official result wins, an unproven final waits, and a program without finals is untouched", () => {
  const official = settleTotoFromLive(program([fixture(1, live("FINISHED", "2"), "1")], [prediction(1, "1", "1", "1", "MAIN_HIT")],
    { mainHits: 1, coverageHits: 1 }));
  assert.equal(official.predictions[0]!.result, "MAIN_HIT");
  assert.equal(official.fixtures[0]!.actualResult, "1");
  const unproven = program([fixture(1, live("FINISHED", null))], [prediction(1, "1", "1")]);
  assert.equal(settleTotoFromLive(unproven), unproven);
  const resulted = settleTotoFromLive(program([fixture(1, live("FINISHED", "1"))], [prediction(1, "1", "1")],
    { status: "RESULTED", mainHits: 9, coverageHits: 12 }));
  assert.equal(resulted.coverageHits, 12, "a resulted program keeps its official counts");
});
