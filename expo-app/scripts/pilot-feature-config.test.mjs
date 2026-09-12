import assert from "node:assert/strict";
import test from "node:test";
import {
  resolvePilotFeatureModes,
  verifyEmbeddedPilotConfig
} from "./pilot-feature-config.mjs";

const configuredEnvironment = Object.freeze({
  EXPO_PUBLIC_MATCH_PATH_INTELLIGENCE: "live",
  EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE: "live",
  EXPO_PUBLIC_MOBILE_INTELLIGENCE: "synthetic"
});

test("pilot feature modes are required independently", () => {
  for (const missing of Object.keys(configuredEnvironment)) {
    const environment = { ...configuredEnvironment };
    delete environment[missing];
    assert.throws(
      () => resolvePilotFeatureModes(environment),
      new RegExp(missing)
    );
  }
});

test("invalid values identify the exact pilot setting", () => {
  for (const invalid of Object.keys(configuredEnvironment)) {
    assert.throws(
      () =>
        resolvePilotFeatureModes({
          ...configuredEnvironment,
          [invalid]: "liev"
        }),
      new RegExp(`${invalid}.*off, synthetic, live`)
    );
  }
});

test("Match Journey, Team Form and Jinx keep independent modes", () => {
  assert.deepEqual(resolvePilotFeatureModes(configuredEnvironment), {
    matchJourney: "LIVE",
    teamForm: "LIVE",
    jinx: "SYNTHETIC"
  });
  assert.deepEqual(
    resolvePilotFeatureModes({
      EXPO_PUBLIC_MATCH_PATH_INTELLIGENCE: "off",
      EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE: "synthetic",
      EXPO_PUBLIC_MOBILE_INTELLIGENCE: "OFF"
    }),
    {
      matchJourney: "OFF",
      teamForm: "SYNTHETIC",
      jinx: "OFF"
    }
  );
});

test("the authorized read-only Jinx engine can enter an owner pilot APK", () => {
  assert.equal(
      resolvePilotFeatureModes({
        ...configuredEnvironment,
        EXPO_PUBLIC_MOBILE_INTELLIGENCE: "live"
      }).jinx,
    "LIVE"
  );
});

test("artifact readback returns only allowlisted public settings", () => {
  const evidence = verifyEmbeddedPilotConfig(
    {
      expo: {
        extra: {
          mobileApiUrl: "https://api.surklase.com",
          authMode: "pilot",
          pilotAccessKey: "must-never-appear-in-evidence",
          useMocks: false,
          matchPathIntelligence: "LIVE",
          teamFormIntelligence: "LIVE",
          mobileIntelligence: "SYNTHETIC"
        }
      }
    },
    resolvePilotFeatureModes(configuredEnvironment)
  );

  assert.deepEqual(evidence.effectiveSettings, {
    mobileApiUrl: "https://api.surklase.com",
    authMode: "pilot",
    useMocks: false,
    matchJourney: "LIVE",
    teamForm: "LIVE",
    jinx: "SYNTHETIC"
  });
  assert.equal(JSON.stringify(evidence).includes("must-never-appear"), false);
  assert.equal(JSON.stringify(evidence).includes("pilotAccessKey"), false);
});

test("artifact readback checks every independent surface", () => {
  const validExtra = {
    mobileApiUrl: "https://api.surklase.com",
    authMode: "pilot",
    useMocks: false,
    matchPathIntelligence: "LIVE",
    teamFormIntelligence: "LIVE",
    mobileIntelligence: "SYNTHETIC"
  };

  for (const [property, wrongValue] of [
    ["matchPathIntelligence", "OFF"],
    ["teamFormIntelligence", "OFF"],
    ["mobileIntelligence", "OFF"]
  ]) {
    assert.throws(
      () =>
        verifyEmbeddedPilotConfig(
          { extra: { ...validExtra, [property]: wrongValue } },
          resolvePilotFeatureModes(configuredEnvironment)
        ),
      new RegExp(`${property}.*${wrongValue}`)
    );
  }
});
