import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLegacyMatchUrl,
  buildLegacySuperLogUrl,
  buildLegacyTotoUrl
} from "./routes";

const launchpad = "https://example.test/site?siteId=btb";

test("builds the existing BTB Fiori object page key", () => {
  const url = buildLegacyMatchUrl(
    launchpad,
    "2026-07-28:472910:20:45:00"
  );

  assert.match(url, /#btb-manage/);
  assert.match(url, /id=472910/);
  assert.match(url, /PT20H45M00S/);
  assert.match(url, /FCLLayout=MidColumnFullScreen/);
});

test("falls back to the BTB list for malformed keys", () => {
  assert.equal(buildLegacyMatchUrl(launchpad, "bad-key"), `${launchpad}#btb-manage`);
});

test("builds the existing Toto Fiori object page key", () => {
  const url = buildLegacyTotoUrl(launchpad, 350, 1);
  assert.match(url, /#SporToto-manage/);
  assert.match(url, /Programs\(gc_no=350,version_no=1\)/);
});

test("builds the exact Super Log object page key", () => {
  const url = buildLegacySuperLogUrl(launchpad, {
    matchDate: "2026-07-29",
    matchId: 472910,
    elapsed: 67,
    selectedOdd: "Ms1X",
    rating: 4,
    reason: "SCORE_CHANGED / HOME"
  });
  assert.match(url, /#SuperLog-display/);
  assert.match(url, /SuperLog\(datum=2026-07-29,id=472910/);
  assert.match(url, /selected_odd='Ms1X'/);
  assert.match(url, /FCLLayout=MidColumnFullScreen/);
});
