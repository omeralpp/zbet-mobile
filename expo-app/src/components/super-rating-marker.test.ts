import assert from "node:assert/strict";
import test from "node:test";
import { buildSuperRatingMarker } from "./super-rating-marker";

test("keeps every supported Super rating inside one marker", () => {
  for (const rating of [1, 2, 3, 4, 5]) {
    assert.deepEqual(buildSuperRatingMarker(rating), {
      accessibilityLabel: `BTB rating ${rating}/5`,
      starCount: rating
    });
  }
});

test("bounds malformed marker ratings without rendering more than five stars", () => {
  assert.equal(buildSuperRatingMarker(0).starCount, 1);
  assert.equal(buildSuperRatingMarker(8).starCount, 5);
  assert.equal(buildSuperRatingMarker(Number.NaN).starCount, 1);
});
