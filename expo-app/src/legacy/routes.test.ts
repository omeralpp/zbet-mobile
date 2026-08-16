import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLegacyMatchUrl,
  buildLegacySuperLogUrl,
  buildLegacyTotoUrl,
  buildWorkZoneHomeUrl,
  normalizeWorkZoneBaseUrl
} from "./routes";

const launchpad = "https://example.test/site?siteId=btb";
const misconfiguredLaunchpad = `${launchpad}#Shell-home`;

function hashCount(url: string): number {
  return (url.match(/#/g) ?? []).length;
}

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

test("normalizeWorkZoneBaseUrl leaves a fragment-free base untouched", () => {
  assert.equal(normalizeWorkZoneBaseUrl(launchpad), launchpad);
});

test("normalizeWorkZoneBaseUrl strips an accidentally-configured #Shell-home", () => {
  assert.equal(normalizeWorkZoneBaseUrl(misconfiguredLaunchpad), launchpad);
});

test("buildWorkZoneHomeUrl produces exactly one # from a clean base", () => {
  const url = buildWorkZoneHomeUrl(launchpad);
  assert.equal(url, `${launchpad}#Shell-home`);
  assert.equal(hashCount(url), 1);
});

test("buildWorkZoneHomeUrl never doubles the hash when the base already carries #Shell-home", () => {
  const url = buildWorkZoneHomeUrl(misconfiguredLaunchpad);
  assert.equal(url, `${launchpad}#Shell-home`);
  assert.equal(hashCount(url), 1);
  assert.doesNotMatch(url, /#Shell-home#/);
});

test("BTB match intent produces exactly one # from a clean base", () => {
  const url = buildLegacyMatchUrl(launchpad, "2026-07-28:472910:20:45:00");
  assert.equal(hashCount(url), 1);
});

test("BTB match intent never doubles the hash on a misconfigured base", () => {
  const url = buildLegacyMatchUrl(
    misconfiguredLaunchpad,
    "2026-07-28:472910:20:45:00"
  );
  assert.equal(hashCount(url), 1);
  assert.doesNotMatch(url, /#Shell-home#/);
  assert.match(url, /^https:\/\/example\.test\/site\?siteId=btb#btb-manage\?/);
  assert.match(url, /id=472910/);
  assert.match(url, /PT20H45M00S/);
  assert.match(url, /FCLLayout=MidColumnFullScreen/);
});

test("Toto intent produces exactly one # from a clean base", () => {
  const url = buildLegacyTotoUrl(launchpad, 350, 1);
  assert.equal(hashCount(url), 1);
});

test("Toto intent never doubles the hash on a misconfigured base", () => {
  const url = buildLegacyTotoUrl(misconfiguredLaunchpad, 350, 1);
  assert.equal(hashCount(url), 1);
  assert.doesNotMatch(url, /#Shell-home#/);
  assert.match(
    url,
    /^https:\/\/example\.test\/site\?siteId=btb#SporToto-manage\?/
  );
  assert.match(url, /Programs\(gc_no=350,version_no=1\)/);
});

test("Super Log intent produces exactly one # from a clean base", () => {
  const url = buildLegacySuperLogUrl(launchpad, {
    matchDate: "2026-07-29",
    matchId: 472910,
    elapsed: 67,
    selectedOdd: "Ms1X",
    rating: 4,
    reason: "SCORE_CHANGED / HOME"
  });
  assert.equal(hashCount(url), 1);
});

test("Super Log intent never doubles the hash on a misconfigured base", () => {
  const url = buildLegacySuperLogUrl(misconfiguredLaunchpad, {
    matchDate: "2026-07-29",
    matchId: 472910,
    elapsed: 67,
    selectedOdd: "Ms1X",
    rating: 4,
    reason: "SCORE_CHANGED / HOME"
  });
  assert.equal(hashCount(url), 1);
  assert.doesNotMatch(url, /#Shell-home#/);
  assert.match(
    url,
    /^https:\/\/example\.test\/site\?siteId=btb#SuperLog-display\?/
  );
  assert.match(url, /SuperLog\(datum=2026-07-29,id=472910/);
  assert.match(url, /selected_odd='Ms1X'/);
  assert.match(url, /FCLLayout=MidColumnFullScreen/);
});

test("normalizeWorkZoneBaseUrl generalizes to any semantic-object intent (e.g. a future BTBAdmin-manage caller), not just the three Mobile currently wires", () => {
  const base = normalizeWorkZoneBaseUrl(misconfiguredLaunchpad);
  const url = `${base}#BTBAdmin-manage?sap-ui-app-id-hint=saas_approuter_com.btb.admin`;
  assert.equal(hashCount(url), 1);
  assert.doesNotMatch(url, /#Shell-home#/);
});

test("no route builder introduces the retired old-tenant host", () => {
  const realWorkZoneBase =
    "https://34dfc21ftrial.launchpad.cfapps.us10.hana.ondemand.com/site" +
    "?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f";
  const misconfiguredRealBase = `${realWorkZoneBase}#Shell-home`;

  for (const base of [realWorkZoneBase, misconfiguredRealBase]) {
    const urls = [
      buildWorkZoneHomeUrl(base),
      buildLegacyMatchUrl(base, "2026-07-28:472910:20:45:00"),
      buildLegacyTotoUrl(base, 350, 1),
      buildLegacySuperLogUrl(base, {
        matchDate: "2026-07-29",
        matchId: 472910,
        elapsed: 67,
        selectedOdd: "Ms1X",
        rating: 4,
        reason: "SCORE_CHANGED / HOME"
      })
    ];
    for (const url of urls) {
      assert.equal(hashCount(url), 1);
      assert.doesNotMatch(url, /188b143btrial/);
      assert.match(url, /^https:\/\/34dfc21ftrial\./);
    }
  }
});
