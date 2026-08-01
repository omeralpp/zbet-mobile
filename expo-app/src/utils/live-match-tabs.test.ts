import assert from "node:assert/strict";
import test from "node:test";
import { mockMatchSummaries } from "@/src/api/mock-data";
import { matchLiveTab } from "./live-match-tabs";

test("Canlı Maçlar sabit sekmeleri yıldız seçiminden etkilenmez", () => {
  const base = { ...mockMatchSummaries[0]!, rating: 1, selectedOdd: "Ms1" };
  const upcoming = { ...base, status: "NOT_STARTED" as const };

  assert.equal(matchLiveTab(base, "LIVE", "STAR_4_PLUS"), true);
  assert.equal(matchLiveTab(upcoming, "ALL", "STAR_4_PLUS"), true);
  assert.equal(matchLiveTab(base, "STAR", "STAR_4_PLUS"), false);
});
