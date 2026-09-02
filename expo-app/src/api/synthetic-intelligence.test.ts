import assert from "node:assert/strict";
import test from "node:test";
import {
  hashKey,
  syntheticStateForKey,
  withSyntheticIntelligence
} from "./synthetic-intelligence";
import type { MobileApi } from "./mobile-api";

const realKeys = [
  "2026-09-02:512001:19:00:00",
  "2026-09-02:512002:19:30:00",
  "2026-09-02:512003:20:00:00",
  "2026-09-02:512004:20:45:00",
  "2026-09-02:512005:21:00:00",
  "2026-09-02:512006:21:30:00",
  "2026-09-02:512007:22:00:00",
  "2026-09-02:512008:22:30:00",
  "2026-09-02:512009:17:00:00",
  "2026-09-02:512010:18:00:00",
  "2026-09-02:512011:16:00:00",
  "2026-09-02:512012:15:30:00"
];

/* ---------------------------------------------------------------- *
 * State selection on keys the fixtures have never seen
 * ---------------------------------------------------------------- */

test("the same key always resolves to the same state", () => {
  // A match whose card changed state on every refresh would be unreviewable.
  for (const key of realKeys) {
    assert.equal(syntheticStateForKey(key), syntheticStateForKey(key));
  }
});

test("real match keys do not all collapse onto one state", () => {
  // The preview fixtures key off mock match ids, which no real fixture list
  // contains; without hashing, every live match would land on the same state.
  const states = new Set(realKeys.map(syntheticStateForKey));
  assert.ok(states.size > 1, `expected a spread, got ${[...states]}`);
});

test("the populated case is the common one", () => {
  const populated = realKeys.filter(
    (key) => syntheticStateForKey(key) === "POPULATED"
  );
  assert.ok(
    populated.length >= realKeys.length / 3,
    "the layout under review should be the one most often shown"
  );
});

test("the hash is stable and stays a positive 32-bit value", () => {
  assert.equal(hashKey("2026-09-02:512001:19:00:00"), hashKey("2026-09-02:512001:19:00:00"));
  for (const key of [...realKeys, "", "a"]) {
    const hash = hashKey(key);
    assert.ok(Number.isInteger(hash) && hash >= 0 && hash <= 0xffffffff);
  }
});

test("different keys generally hash apart", () => {
  assert.notEqual(hashKey(realKeys[0] ?? ""), hashKey(realKeys[1] ?? ""));
});

/* ---------------------------------------------------------------- *
 * The wrapper substitutes exactly three routes and nothing else
 * ---------------------------------------------------------------- */

function baseApi(): MobileApi {
  const unexpected = (name: string) => () => {
    throw new Error(`${name} should have been passed through`);
  };
  return {
    getDashboard: unexpected("getDashboard"),
    getMatches: unexpected("getMatches"),
    getMatchInsights: unexpected("getMatchInsights"),
    getMatchInsight: unexpected("getMatchInsight"),
    getMatchLeagueContext: unexpected("getMatchLeagueContext"),
    getMatch: unexpected("getMatch"),
    getMatchPeriodScore: unexpected("getMatchPeriodScore"),
    getMatchLiveContext: unexpected("getMatchLiveContext"),
    getMatchTeamForm: unexpected("getMatchTeamForm"),
    getMatchPath: unexpected("getMatchPath"),
    getMatchJinxOutlook: unexpected("getMatchJinxOutlook"),
    getMatchSuperLogs: unexpected("getMatchSuperLogs"),
    getSuperLogs: unexpected("getSuperLogs"),
    getSuperKpis: unexpected("getSuperKpis"),
    getSuperLog: unexpected("getSuperLog"),
    getSuperLogPeriodScore: unexpected("getSuperLogPeriodScore"),
    getTotoPrograms: unexpected("getTotoPrograms"),
    getTotoProgram: unexpected("getTotoProgram"),
    getJinxQuip: unexpected("getJinxQuip"),
    registerDevice: unexpected("registerDevice"),
    unregisterDevice: unexpected("unregisterDevice")
  } as unknown as MobileApi;
}

test("the three M15 reads are answered without touching the base API", async () => {
  const api = withSyntheticIntelligence(baseApi());
  const key = realKeys[0] ?? "";
  await api.getMatchTeamForm(key);
  await api.getMatchPath(key);
  await api.getMatchJinxOutlook(key);
});

test("live Team Form passes through unchanged while other surfaces stay synthetic", async () => {
  const base = baseApi();
  base.getMatchTeamForm = async () => { throw new Error("live route unavailable"); };
  const api = withSyntheticIntelligence(base, { teamForm: false, matchPath: true, jinxOutlook: true });
  assert.equal(api.getMatchTeamForm, base.getMatchTeamForm);
  await assert.rejects(api.getMatchTeamForm(realKeys[0] ?? ""), /live route unavailable/);
  assert.equal((await api.getMatchPath(realKeys[0] ?? "")).origin, "SYNTHETIC");
  assert.equal((await api.getMatchJinxOutlook(realKeys[0] ?? "")).origin, "SYNTHETIC");
});

test("all-live selection replaces none of the API methods", () => {
  const base = baseApi();
  const api = withSyntheticIntelligence(base, { teamForm: false, matchPath: false, jinxOutlook: false });
  assert.equal(api.getMatchTeamForm, base.getMatchTeamForm);
  assert.equal(api.getMatchPath, base.getMatchPath);
  assert.equal(api.getMatchJinxOutlook, base.getMatchJinxOutlook);
});

test("every other route is passed straight through", () => {
  const api = withSyntheticIntelligence(baseApi());
  // Anything the wrapper did not deliberately replace must still be the base
  // implementation, so a route added later cannot become synthetic by omission.
  assert.throws(() => api.getMatches(), /getMatches should have been passed/);
  assert.throws(() => api.getDashboard(), /getDashboard should have been passed/);
  assert.throws(
    () => api.getMatchLiveContext("k"),
    /getMatchLiveContext should have been passed/
  );
});

/* ---------------------------------------------------------------- *
 * Everything it serves declares itself synthetic
 * ---------------------------------------------------------------- */

test("every payload the wrapper serves is marked SYNTHETIC", async () => {
  // This is the property that lets fixtures reach a real device at all.
  const api = withSyntheticIntelligence(baseApi());
  for (const key of realKeys) {
    const [form, path, outlook] = await Promise.all([
      api.getMatchTeamForm(key),
      api.getMatchPath(key),
      api.getMatchJinxOutlook(key)
    ]);
    assert.equal(form.origin, "SYNTHETIC");
    assert.equal(path.origin, "SYNTHETIC");
    assert.equal(outlook.origin, "SYNTHETIC");
    assert.notEqual(form.origin, "LIVE");
  }
});

test("every payload the wrapper serves satisfies its own contract", async () => {
  // The wrapper parses through the same schemas the HTTP client uses, so a
  // fixture that drifts from the contract fails here rather than on a phone.
  const api = withSyntheticIntelligence(baseApi());
  for (const key of realKeys) {
    const path = await api.getMatchPath(key);
    assert.equal(path.contractVersion, "match-path.v1");
    const form = await api.getMatchTeamForm(key);
    assert.equal(form.contractVersion, "team-form.v1");
    const outlook = await api.getMatchJinxOutlook(key);
    assert.equal(outlook.contractVersion, "jinx-match-outlook.v1");
  }
});
