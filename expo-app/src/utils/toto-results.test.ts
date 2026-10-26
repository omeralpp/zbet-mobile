import assert from "node:assert/strict";
import test from "node:test";
import type { TotoPrediction } from "@/src/api/schemas";
import { filterTotoResults, summarizeTotoResults } from "./toto-results";

test("coverage filter includes main hits and covered-only rows, without changing the full summary", () => {
  const predictions = ["MAIN_HIT", "COVERED", "MISS", "OPEN"].map((result, index) => ({ matchNo: index + 1, result })) as TotoPrediction[];
  assert.deepEqual(filterTotoResults(predictions, "COVERAGE").map(row => row.matchNo), [1, 2]);
  assert.deepEqual(filterTotoResults(predictions, "OPEN").map(row => row.matchNo), [4]);
  assert.deepEqual(filterTotoResults(predictions, "MISS").map(row => row.matchNo), [3]);
  assert.equal(filterTotoResults(predictions, "ALL").length, 4);
  assert.equal(summarizeTotoResults(predictions).settled, 3);
  assert.equal(predictions.length, 4);
});

test("Toto sonuç özeti sonuçlanma ile isabeti birbirine karıştırmaz", () => {
  const predictions = [
    ...Array.from({ length: 9 }, () => ({ result: "MAIN_HIT" })),
    ...Array.from({ length: 3 }, () => ({ result: "COVERED" })),
    ...Array.from({ length: 3 }, () => ({ result: "MISS" }))
  ] as TotoPrediction[];

  assert.deepEqual(summarizeTotoResults(predictions), {
    total: 15,
    settled: 15,
    mainHits: 9,
    coveredOnly: 3,
    coverageHits: 12,
    misses: 3,
    open: 0
  });
});
