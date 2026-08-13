import assert from "node:assert/strict";
import test from "node:test";
import { mockSuperLogs } from "@/src/api/mock-data";
import { sortSuperLogs } from "./decision-filters";

test("keeps the provider order when Super sorting is default", () => {
  assert.equal(sortSuperLogs(mockSuperLogs, "DEFAULT"), mockSuperLogs);
});

test("sorts Super decisions by rating and uses newest decision as tie break", () => {
  const rows = [
    { ...mockSuperLogs[0]!, key: "older-four", rating: 4, createdAt: "2026-08-13T08:00:00Z" },
    { ...mockSuperLogs[0]!, key: "one", rating: 1, createdAt: "2026-08-13T10:00:00Z" },
    { ...mockSuperLogs[0]!, key: "newer-four", rating: 4, createdAt: "2026-08-13T09:00:00Z" }
  ];

  assert.deepEqual(
    sortSuperLogs(rows, "RATING_DESC").map((row) => row.key),
    ["newer-four", "older-four", "one"]
  );
  assert.deepEqual(
    sortSuperLogs(rows, "RATING_ASC").map((row) => row.key),
    ["one", "newer-four", "older-four"]
  );
});
