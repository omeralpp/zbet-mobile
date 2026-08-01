import assert from "node:assert/strict";
import test from "node:test";
import { mockMatchSummaries, mockSuperLogs } from "@/src/api/mock-data";
import {
  isStarDecisionFilter,
  liveStarMetricCount,
  normalizeStoredStarDecisionFilter,
  matchDecisionFilter,
  starMetricLabel,
  superDecisionFilter
} from "./decision-filters";

test("sabit seçili sekmesi ile yıldız kriterleri ayrı semantik taşır", () => {
  const selected = { ...mockMatchSummaries[0]!, selectedOdd: "Ms1", rating: 4 };
  const unselected = { ...selected, selectedOdd: "", rating: 0 };
  const unratedSelection = { ...selected, rating: 0 };

  assert.equal(matchDecisionFilter(selected, "SELECTED"), true);
  assert.equal(matchDecisionFilter(unselected, "SELECTED"), false);
  assert.equal(matchDecisionFilter(selected, "STAR_1_PLUS"), true);
  assert.equal(matchDecisionFilter(unselected, "STAR_1_PLUS"), false);
  assert.equal(matchDecisionFilter(unratedSelection, "STAR_1_PLUS"), false);
  assert.equal(matchDecisionFilter(selected, "STAR_4_PLUS"), true);
  assert.equal(matchDecisionFilter(selected, "STAR_3_PLUS"), true);
  assert.equal(
    matchDecisionFilter({ ...selected, rating: 3 }, "STAR_4_PLUS"),
    false
  );
});

test("overview yıldız kartı kalıcı filtreyi kullanıcı dilinde adlandırır", () => {
  assert.equal(isStarDecisionFilter("STAR_4_PLUS"), true);
  assert.equal(isStarDecisionFilter("STAR_4"), false);
  assert.equal(isStarDecisionFilter("ALL"), false);
  assert.equal(isStarDecisionFilter("SELECTED"), false);
  assert.equal(normalizeStoredStarDecisionFilter("ALL"), "STAR_1_PLUS");
  assert.equal(normalizeStoredStarDecisionFilter("STAR_2"), "STAR_2_PLUS");
  assert.equal(normalizeStoredStarDecisionFilter("STAR_5"), "STAR_4_PLUS");
  assert.equal(starMetricLabel("STAR_1_PLUS"), "1+ yıldız");
  assert.equal(starMetricLabel("STAR_4_PLUS"), "4+ yıldız");
  assert.equal(starMetricLabel("STAR_3_PLUS"), "3+ yıldız");
  const counts = {
    ALL: 10,
    STAR_1: 2,
    STAR_2: 3,
    STAR_3: 1,
    STAR_4: 3,
    STAR_5: 1
  };
  assert.equal(liveStarMetricCount(counts, "STAR_1_PLUS"), 10);
  assert.equal(liveStarMetricCount(counts, "STAR_2_PLUS"), 8);
  assert.equal(liveStarMetricCount(counts, "STAR_4_PLUS"), 4);
});

test("Super yıldız kriteri yalnız yıldız sekmesinde kullanılabilir", () => {
  const log = { ...mockSuperLogs[0]!, rating: 3 as const };
  assert.equal(superDecisionFilter(log, "STAR_1_PLUS"), true);
  assert.equal(superDecisionFilter(log, "STAR_3_PLUS"), true);
  assert.equal(superDecisionFilter(log, "STAR_4_PLUS"), false);
});
