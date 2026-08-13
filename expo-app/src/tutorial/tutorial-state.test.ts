import assert from "node:assert/strict";
import test from "node:test";
import {
  activeTutorialTip,
  defaultTutorialState,
  parseTutorialState,
  tutorialVersion
} from "./tutorial-state";

test("enables the versioned tutorial on first install", () => {
  assert.deepEqual(parseTutorialState(null), defaultTutorialState());
  assert.equal(activeTutorialTip("/", defaultTutorialState())?.id, "home-summary");
});

test("continues with the next unseen tip on the same screen", () => {
  assert.equal(
    activeTutorialTip("/live", {
      version: tutorialVersion,
      enabled: true,
      completedTipIds: ["live-filters"]
    })?.id,
    "live-rate"
  );
});

test("keeps disable state and rejects stale or unknown progress", () => {
  const disabled = parseTutorialState(
    JSON.stringify({
      version: tutorialVersion,
      enabled: false,
      completedTipIds: ["live-rate", "unknown", "live-rate"]
    })
  );
  assert.deepEqual(disabled.completedTipIds, ["live-rate"]);
  assert.equal(activeTutorialTip("/live", disabled), null);
  assert.deepEqual(
    parseTutorialState(JSON.stringify({ version: 0, enabled: false })),
    defaultTutorialState()
  );
});
