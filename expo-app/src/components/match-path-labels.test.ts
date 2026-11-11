import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { countBadgeEdge } from "./match-path-labels";

test("the count badge takes the side the minute label does not use (NXT-OBS-253)", () => {
  assert.equal(countBadgeEdge("GOAL", "HOME"), "BOTTOM");
  assert.equal(countBadgeEdge("RED_CARD", "HOME"), "BOTTOM");
  assert.equal(countBadgeEdge("GOAL", "AWAY"), "TOP");
  assert.equal(countBadgeEdge("RED_CARD", "AWAY"), "TOP");
  assert.equal(countBadgeEdge("BTB", null), "TOP");
});

test("the timeline places the badge through that rule, never at a fixed corner", () => {
  const card = readFileSync(new URL("./MatchPathCard.tsx", import.meta.url), "utf8");
  assert.ok(card.includes('countBadgeEdge(lead.kind, lead.side) === "BOTTOM" ? styles.countBadgeBottom : styles.countBadgeTop'));
  assert.doesNotMatch(card, /countBadge: \{[^}]*\btop:/);
});
