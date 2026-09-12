import fs from "node:fs";
import { pathToFileURL } from "node:url";

const featureVariables = Object.freeze({
  matchJourney: "EXPO_PUBLIC_MATCH_PATH_INTELLIGENCE",
  teamForm: "EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE",
  jinx: "EXPO_PUBLIC_MOBILE_INTELLIGENCE"
});

const embeddedProperties = Object.freeze({
  matchJourney: "matchPathIntelligence",
  teamForm: "teamFormIntelligence",
  jinx: "mobileIntelligence"
});

const allowedModes = new Set(["OFF", "SYNTHETIC", "LIVE"]);

function requireMode(environment, feature) {
  const variable = featureVariables[feature];
  const value = String(environment[variable] ?? "").trim().toUpperCase();
  if (!value) {
    throw new Error(`Pilot APK requires ${variable}.`);
  }
  if (!allowedModes.has(value)) {
    throw new Error(`${variable} must be one of: off, synthetic, live.`);
  }
  return value;
}

export function resolvePilotFeatureModes(environment) {
  const modes = {
    matchJourney: requireMode(environment, "matchJourney"),
    teamForm: requireMode(environment, "teamForm"),
    jinx: requireMode(environment, "jinx")
  };

  // TASK-0011 scoped owner authorization: LIVE may be built for the physical
  // pilot. This selects the existing pull-only client, never deploys its BFF.

  return modes;
}

function expoRoot(config) {
  if (config && typeof config === "object" && config.expo) {
    return config.expo;
  }
  return config;
}

export function verifyEmbeddedPilotConfig(config, expectedModes) {
  const root = expoRoot(config);
  const extra = root?.extra;
  if (!extra || typeof extra !== "object") {
    throw new Error("Embedded app config has no extra object.");
  }

  const expectedPublicSettings = {
    mobileApiUrl: "https://api.surklase.com",
    authMode: "pilot",
    useMocks: false
  };
  for (const [property, expected] of Object.entries(expectedPublicSettings)) {
    if (extra[property] !== expected) {
      throw new Error(
        `Embedded ${property} is ${JSON.stringify(extra[property])}; expected ${JSON.stringify(expected)}.`
      );
    }
  }

  const effectiveModes = {};
  for (const [feature, property] of Object.entries(embeddedProperties)) {
    const actual = String(extra[property] ?? "").trim().toUpperCase();
    const expected = expectedModes[feature];
    if (actual !== expected) {
      throw new Error(
        `Embedded ${property} is ${JSON.stringify(actual)}; expected ${JSON.stringify(expected)}.`
      );
    }
    effectiveModes[feature] = actual;
  }

  return {
    schemaVersion: 1,
    effectiveSettings: {
      ...expectedPublicSettings,
      ...effectiveModes
    }
  };
}

function runCli() {
  const command = process.argv[2];
  const expectedModes = resolvePilotFeatureModes(process.env);

  if (command === "validate-env") {
    process.stdout.write(`${JSON.stringify(expectedModes)}\n`);
    return;
  }

  if (command === "verify-config") {
    const configPath = process.argv[3];
    if (!configPath) {
      throw new Error("verify-config requires an embedded app config path.");
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    process.stdout.write(
      `${JSON.stringify(verifyEmbeddedPilotConfig(config, expectedModes))}\n`
    );
    return;
  }

  throw new Error("Expected command: validate-env or verify-config.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runCli();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  }
}
