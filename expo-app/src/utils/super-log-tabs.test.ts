import assert from "node:assert/strict";
import test from "node:test";
import { mockSuperLogs } from "@/src/api/mock-data";
import { matchSuperLogTab } from "./super-log-tabs";

test("Açık switch'i tümü ve yıldız filtresiyle bağımsız birleşir", () => {
  const open = { ...mockSuperLogs[0]!, rating: 1 as const, result: "OPEN" as const };
  const won = { ...open, result: "WON" as const };

  assert.equal(matchSuperLogTab(open, "ALL", "STAR_4_PLUS"), true);
  assert.equal(matchSuperLogTab(open, "ALL", "STAR_4_PLUS", true), true);
  assert.equal(matchSuperLogTab(won, "ALL", "STAR_4_PLUS", true), false);
  assert.equal(matchSuperLogTab(open, "STAR", "STAR_4_PLUS"), false);
});

test("Açık switch'i yıldız tercihini değiştirmez", () => {
  const open = { ...mockSuperLogs[0]!, rating: 5 as const, result: "OPEN" as const };
  const won = { ...open, result: "WON" as const };

  assert.equal(matchSuperLogTab(open, "STAR", "STAR_4_PLUS", true), true);
  assert.equal(matchSuperLogTab(won, "STAR", "STAR_4_PLUS", true), false);
  assert.equal(matchSuperLogTab(won, "STAR", "STAR_4_PLUS", false), true);
});
