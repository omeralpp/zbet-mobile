import assert from "node:assert/strict";
import test from "node:test";
import type { SuperLog } from "@/src/api/schemas";
import { defaultSuperSort, nextSuperSort, sortSuperLogs } from "./super-table";

function log(key: string, over: Partial<SuperLog>): SuperLog {
  return {
    key,
    matchKey: `2026-10-15:${key}:20:00:00`,
    matchName: "A - B",
    createdAt: "2026-10-15T18:00:00.000Z",
    elapsed: 50,
    selectedOdd: "Ms1",
    rating: 3,
    reason: "PRESSURE_RECHECK",
    liveRate: 1.5,
    currentRate: null,
    result: "WON",
    profit: 0.5,
    finalScore: "1-0",
    pressureAdjustment: 0,
    stateAdjustment: 0,
    ...over
  };
}

const logs = [
  log("a", { createdAt: "2026-10-15T18:00:00.000Z", rating: 2, profit: -1, result: "LOST", matchName: "Çorum - Rize" }),
  log("b", { createdAt: "2026-10-15T20:00:00.000Z", rating: 5, profit: null, result: "OPEN", liveRate: null, matchName: "Adana - Fatih" }),
  log("c", { createdAt: "2026-10-15T19:00:00.000Z", rating: 5, profit: 1.2, result: "WON", matchName: "Bursa - Gaziantep" })
];

test("the default sort is newest first, as on the phone", () => {
  assert.deepEqual(sortSuperLogs(logs, defaultSuperSort).map((entry) => entry.key), ["b", "c", "a"]);
});

test("ties keep the incoming order and missing values sort last both ways", () => {
  assert.deepEqual(sortSuperLogs(logs, { column: "rating", direction: "desc" }).map((e) => e.key), ["b", "c", "a"]);
  assert.deepEqual(sortSuperLogs(logs, { column: "profit", direction: "desc" }).map((e) => e.key), ["c", "a", "b"]);
  assert.deepEqual(sortSuperLogs(logs, { column: "profit", direction: "asc" }).map((e) => e.key), ["a", "c", "b"]);
  assert.deepEqual(sortSuperLogs(logs, { column: "rate", direction: "asc" }).map((e) => e.key), ["a", "c", "b"]);
});

test("open decisions lead an ascending result sort; names sort with Turkish rules", () => {
  assert.deepEqual(sortSuperLogs(logs, { column: "result", direction: "asc" }).map((e) => e.key), ["b", "c", "a"]);
  assert.deepEqual(sortSuperLogs(logs, { column: "match", direction: "asc" }).map((e) => e.key), ["b", "c", "a"]);
});

test("header clicks flip the active column and start new ones naturally", () => {
  assert.deepEqual(nextSuperSort(defaultSuperSort, "createdAt"), { column: "createdAt", direction: "asc" });
  assert.deepEqual(nextSuperSort(defaultSuperSort, "match"), { column: "match", direction: "asc" });
  assert.deepEqual(nextSuperSort(defaultSuperSort, "profit"), { column: "profit", direction: "desc" });
});
