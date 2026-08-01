import assert from "node:assert/strict";
import test from "node:test";
import { mockSuperLogs } from "@/src/api/mock-data";
import { matchSuperLogTab } from "./super-log-tabs";

test("Karar Günlüğü sabit sekmeleri yıldız seçiminden etkilenmez", () => {
  const open = { ...mockSuperLogs[0]!, rating: 1 as const, result: "OPEN" as const };
  const won = { ...open, result: "WON" as const };

  assert.equal(matchSuperLogTab(open, "ALL", "STAR_4_PLUS"), true);
  assert.equal(matchSuperLogTab(open, "OPEN", "STAR_4_PLUS"), true);
  assert.equal(matchSuperLogTab(won, "OPEN", "STAR_4_PLUS"), false);
  assert.equal(matchSuperLogTab(open, "STAR", "STAR_4_PLUS"), false);
});
