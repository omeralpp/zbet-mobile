import assert from "node:assert/strict";
import test from "node:test";
import { decisionMatchState } from "./decision-match-state";

test("unplayed and unavailable matches never present a completed 0–0 result", () => {
  assert.deepEqual(decisionMatchState({ status: "NOT_PLAYED", homeScore: 0, awayScore: 0, elapsed: 0 }), { score: "—", label: "oynanmadı", live: false });
  assert.deepEqual(decisionMatchState(undefined), { score: "—", label: "maç bilgisi alınamadı", live: false });
  assert.equal(decisionMatchState(undefined, true).label, "maç bilgisi yükleniyor");
  assert.equal(decisionMatchState({ status: "NOT_STARTED", homeScore: 0, awayScore: 0, elapsed: 0 }).score, "—");
});

test("a played final draw stays a result; half-time remains live context", () => {
  assert.deepEqual(decisionMatchState({ status: "FINISHED", homeScore: 0, awayScore: 0, elapsed: 90 }), { score: "0–0", label: "maç sonucu", live: false });
  assert.deepEqual(decisionMatchState({ status: "HALF_TIME", homeScore: 1, awayScore: 2, elapsed: 45 }), { score: "1–2", label: "devre arası", live: true });
});
