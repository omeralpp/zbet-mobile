import assert from "node:assert/strict";
import test from "node:test";
import type { TotoPrediction } from "@/src/api/schemas";
import { summarizeTotoResults } from "./toto-results";

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
