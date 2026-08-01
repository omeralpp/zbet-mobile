import assert from "node:assert/strict";
import test from "node:test";
import { mockMatchSummaries } from "@/src/api/mock-data";
import { groupMatchesByKickoff } from "./match-groups";

test("maçları filtre sonrası başlangıç tarih ve saatine göre gruplar", () => {
  const base = mockMatchSummaries[0]!;
  const groups = groupMatchesByKickoff(
    [
      { ...base, key: "later", matchDate: "2026-08-02", matchTime: "20:00" },
      { ...base, key: "same-1", matchDate: "2026-08-01", matchTime: "19:00" },
      { ...base, key: "same-2", matchDate: "2026-08-01", matchTime: "19:00" }
    ],
    new Date(2026, 7, 1, 12, 0, 0)
  );

  assert.equal(groups[0]?.title, "Bugün · 19:00");
  assert.deepEqual(groups[0]?.data.map((match) => match.key), ["same-1", "same-2"]);
  assert.equal(groups[1]?.key, "2026-08-02T20:00");
});
