import type { TotoPrediction, TotoProgram } from "../api/schemas";
import { summarizeTotoResults } from "./toto-results";
import { totoLiveState } from "../web/toto-coupon";

/** The coupon outcome of a 1/X/2 result for one prediction row. */
export function predictionOutcome(row: Pick<TotoPrediction, "mainPick" | "coverage">, result: string): TotoPrediction["result"] {
  const main = row.mainPick.trim().toUpperCase();
  const coverage = row.coverage.trim().toUpperCase();
  return main === result ? "MAIN_HIT" : coverage.includes(result) ? "COVERED" : "MISS";
}

/**
 * A finished match is settled at once (owner 2026-11-26): when the live feed
 * has a proven regulation result and no official result exists yet, the row
 * takes that result, its score and its coupon outcome, and the program's
 * coverage and main-hit counts follow. An official result always wins, and
 * the official import replaces these values when it arrives. Display only:
 * nothing here reaches prediction, learning or the stored results.
 */
export function settleTotoFromLive(program: TotoProgram): TotoProgram {
  const settled = new Map<number, { result: "1" | "X" | "2"; home: number | null; away: number | null }>();
  for (const fixture of program.fixtures) {
    const live = fixture.live;
    if (live && live.provisionalResult && totoLiveState(fixture) === "PROVISIONAL") {
      settled.set(fixture.matchNo, { result: live.provisionalResult, home: live.homeScore, away: live.awayScore });
    }
  }
  if (!settled.size) return program;
  const fixtures = program.fixtures.map((fixture) => {
    const final = settled.get(fixture.matchNo);
    return final ? { ...fixture, actualResult: final.result, homeScore: final.home, awayScore: final.away } : fixture;
  });
  const predictions = program.predictions.map((prediction) => {
    const final = settled.get(prediction.matchNo);
    if (!final || prediction.actualResult) return prediction;
    return { ...prediction, actualResult: final.result, homeScore: final.home, awayScore: final.away,
      result: predictionOutcome(prediction, final.result) };
  });
  const summary = summarizeTotoResults(predictions);
  // Counts the BFF already has (official) stay; otherwise they come from the settled rows.
  const counted = program.status === "WAITING_RESULT" && summary.settled > 0;
  return { ...program, fixtures, predictions,
    mainHits: counted ? summary.mainHits : program.mainHits,
    coverageHits: counted ? summary.coverageHits : program.coverageHits };
}
