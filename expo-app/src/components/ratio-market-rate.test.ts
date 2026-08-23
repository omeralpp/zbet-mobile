import assert from "node:assert/strict";
import test from "node:test";
import { ratioMarketRateDisplay } from "./ratio-market-rate";

test("uses the live rate before the kickoff fallback", () => {
  assert.deepEqual(
    ratioMarketRateDisplay(
      { sort: 1, betType: "Ms1", liveRate: 1.84, kickoffRate: 2.42 },
      "LIVE"
    ),
    {
      label: "Canlı oran",
      text: "1,84",
      isClosed: false,
      accessibilityText: "canlı oran 1,84"
    }
  );
});

test("shows the kickoff rate when the live rate has not arrived", () => {
  assert.deepEqual(
    ratioMarketRateDisplay(
      { sort: 1, betType: "Ms1", liveRate: null, kickoffRate: 2.42 },
      "KICK_OFF"
    ),
    {
      label: "Kick-off oranı",
      text: "2,42",
      isClosed: false,
      accessibilityText: "Kick-off oranı 2,42"
    }
  );
});

test("keeps the closed-live meaning when a kickoff reference is shown later", () => {
  assert.deepEqual(
    ratioMarketRateDisplay(
      { sort: 1, betType: "Ms1", liveRate: null, kickoffRate: 2.42 },
      "LIVE"
    ),
    {
      label: "Canlı kapalı · KO",
      text: "2,42",
      isClosed: false,
      accessibilityText: "canlı oran kapalı, Kick-off oranı 2,42"
    }
  );
});

test("keeps the market closed when neither source has a rate", () => {
  assert.deepEqual(
    ratioMarketRateDisplay(
      { sort: 1, betType: "Ms1X", liveRate: null, kickoffRate: null },
      "KICK_OFF"
    ),
    {
      label: "Canlı oran",
      text: "kapalı",
      isClosed: true,
      accessibilityText: "canlı oran kapalı"
    }
  );
});
