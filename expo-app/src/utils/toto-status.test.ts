import assert from "node:assert/strict";
import test from "node:test";
import {
  hasTheoreticalPrize,
  isProgramInPlay,
  totoProgramTone
} from "./toto-status";

test("every lifecycle status gets its own tone", () => {
  const tones = (["ACTIVE", "WAITING_RESULT", "RESULTED", "ERROR"] as const).map(
    totoProgramTone
  );
  assert.equal(
    new Set(tones).size,
    tones.length,
    "collapsing statuses is what made a failed program look like a waiting one"
  );
});

test("a failed program is the only one treated as a problem", () => {
  assert.equal(totoProgramTone("ERROR"), "PROBLEM");
  for (const status of ["ACTIVE", "WAITING_RESULT", "RESULTED"] as const) {
    assert.notEqual(totoProgramTone(status), "PROBLEM", status);
  }
});

test("an active program carries the same meaning as a live match", () => {
  assert.equal(totoProgramTone("ACTIVE"), "LIVE");
});

test("waiting for a result is open, not a caution", () => {
  assert.equal(totoProgramTone("WAITING_RESULT"), "OPEN");
});

test("a resulted program is history and recedes", () => {
  assert.equal(totoProgramTone("RESULTED"), "SETTLED");
});

test("in-play covers exactly the statuses that can still change", () => {
  assert.equal(isProgramInPlay("ACTIVE"), true);
  assert.equal(isProgramInPlay("WAITING_RESULT"), true);
  assert.equal(isProgramInPlay("RESULTED"), false);
  assert.equal(isProgramInPlay("ERROR"), false);
});

test("theoretical prize icon requires a resulted program and positive source value", () => {
  assert.equal(
    hasTheoreticalPrize({ status: "RESULTED", theoreticalPrize: 14580 }),
    true
  );
  assert.equal(
    hasTheoreticalPrize({ status: "RESULTED", theoreticalPrize: null }),
    false
  );
  assert.equal(
    hasTheoreticalPrize({ status: "ACTIVE", theoreticalPrize: 14580 }),
    false
  );
});
