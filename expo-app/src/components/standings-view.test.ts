import assert from "node:assert/strict";
import test from "node:test";
import { analysisContextSchema, matchStandingsSchema } from "@/src/api/schemas";
import { standingsOrder, standingsRecordLine } from "./standings-view";

const lugano = { position: 1, played: 3, won: 3, draw: 0, lost: 0, goalsFor: 11, goalsAgainst: 4,
  goalDifference: 7, points: 9, zone: "Son 16 Turu" };
const jablonec = { position: 24, played: 3, won: 0, draw: 2, lost: 1, goalsFor: 3, goalsAgainst: 4,
  goalDifference: -1, points: 2, zone: "Play Off" };

test("a table row reads as one short line: played and results", () => {
  assert.equal(standingsRecordLine(lugano), "3 maç · 3G 0B 0M");
  assert.equal(standingsRecordLine(jablonec), "3 maç · 0G 2B 1M");
});

test("the team higher in the table comes first, whichever side it plays", () => {
  // Jablonec (home, 24th) - Lugano (away, 1st): Lugano on top.
  assert.deepEqual(standingsOrder(jablonec, lugano), [lugano, jablonec]);
  assert.deepEqual(standingsOrder(lugano, jablonec), [lugano, jablonec]);
  type Ranked = { position: number | null; points: number | null };
  const home: Ranked = { position: null, points: 10 };
  const away: Ranked = { position: null, points: 14 };
  assert.deepEqual(standingsOrder(home, away), [away, home]);
  const unknown: Ranked = { position: null, points: null };
  assert.deepEqual(standingsOrder(unknown, away), [unknown, away]);
});

test("btb-match-standings.v1 parses, and an older BFF without standings still parses", () => {
  const standings = matchStandingsSchema.parse({ contractVersion: "btb-match-standings.v1",
    matchKey: "2026-11-26:3326540:20:45:00", availability: "OK", source: "BILYONER",
    capturedAt: "2026-11-26T19:00:00.000Z", competition: "Uluslararası", home: jablonec, away: lugano });
  assert.equal(standings.home?.goalsAgainst, 4);
  const shape = analysisContextSchema.shape.sources.shape;
  assert.equal(shape.standings.parse(undefined), undefined);
  assert.equal(shape.standings.parse({ contractVersion: "other" }), null);
});
