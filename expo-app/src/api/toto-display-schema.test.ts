import assert from "node:assert/strict";
import test from "node:test";
import { mockTotoPrograms } from "./mock-data";
import { totoProgramSchema } from "./schemas";

const { payinEndsAt, costCurrency, unitPrice, bestColumnHits, payouts, ...published } = mockTotoPrograms[0]!;

test("a BFF without btb-toto-display.v1 still parses, with every display fact unknown", () => {
  const program = totoProgramSchema.parse(published);
  assert.deepEqual([program.payinEndsAt, program.costCurrency, program.unitPrice, program.bestColumnHits, program.payouts], [null, null, null, null, null]);
  assert.equal([payinEndsAt, costCurrency, unitPrice, bestColumnHits, payouts].every((value) => value === null), true);
});

test("display facts are accepted with SAP's shapes and refused when malformed", () => {
  const tier = { correct: 12, winners: 1204, amountPerColumn: 85.5, couponWinningColumns: 3, theoreticalTotal: 256.5 };
  const program = totoProgramSchema.parse({ ...published, payinEndsAt: "2026-08-01T14:00:00.000Z", costCurrency: "TRY", unitPrice: 10,
    bestColumnHits: 12, payouts: [tier] });
  assert.equal(program.costCurrency, "TRY"); assert.deepEqual(program.payouts, [tier]);
  for (const bad of [{ costCurrency: "TL" }, { unitPrice: 0 }, { bestColumnHits: 16 }, { payouts: [{ ...tier, correct: 16 }] }, { payouts: [{ ...tier, extra: 1 }] }])
    assert.equal(totoProgramSchema.safeParse({ ...published, ...bad }).success, false, JSON.stringify(bad));
});
