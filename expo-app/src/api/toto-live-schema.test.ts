import assert from "node:assert/strict";
import test from "node:test";
import { mockTotoPrograms } from "./mock-data";
import { totoProgramSchema } from "./schemas";

const program = mockTotoPrograms[0]!;
const live = { status: "LIVE", minute: 45, homeScore: 1, awayScore: 0, halfTimeHomeScore: null, halfTimeAwayScore: null,
  provisionalResult: null, updatedAt: "2026-11-24T20:45:00.000Z" };
const withLive = (value: unknown) => ({ ...program, predictions: program.predictions.map((p, i) => (i === 0 ? { ...p, live: value } : p)),
  fixtures: program.fixtures.map((f, i) => (i === 0 ? { ...f, live: value } : f)) });

test("a BFF without btb-toto-live.v1 still parses and leaves `live` absent", () => {
  const parsed = totoProgramSchema.parse(program);
  assert.equal(parsed.predictions.every((p) => p.live === undefined), true);
});

test("the live projection is accepted with the BFF's shape, null included, and refused when malformed", () => {
  assert.deepEqual(totoProgramSchema.parse(withLive(live)).predictions[0]?.live, live);
  assert.equal(totoProgramSchema.parse(withLive(null)).predictions[0]?.live, null);
  for (const bad of [{ status: "PLAYING" }, { minute: -1 }, { provisionalResult: "0" }, { extra: 1 }])
    assert.equal(totoProgramSchema.safeParse(withLive({ ...live, ...bad })).success, false, JSON.stringify(bad));
});
