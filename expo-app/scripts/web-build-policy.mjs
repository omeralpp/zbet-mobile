import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

/**
 * Web-build guard rails, kept free of side effects so they can be tested.
 *
 * A browser bundle is public. The web build therefore never inherits the
 * developer's environment: it starts from a short allowlist of process
 * variables, and every EXPO_PUBLIC_* value it carries is set here.
 */
const inheritedNames = new Set(
  [
    "PATH",
    "PATHEXT",
    "SYSTEMROOT",
    "SYSTEMDRIVE",
    "WINDIR",
    "COMSPEC",
    "TEMP",
    "TMP",
    "HOME",
    "USERPROFILE",
    "APPDATA",
    "LOCALAPPDATA",
    "PROGRAMDATA",
    "PROGRAMFILES",
    "PROGRAMFILES(X86)",
    "NUMBER_OF_PROCESSORS",
    "PROCESSOR_ARCHITECTURE",
    "LANG",
    "TERM",
    "CI"
  ].map((name) => name.toUpperCase())
);

const intelligenceVariables = [
  "EXPO_PUBLIC_MATCH_PATH_INTELLIGENCE",
  "EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE",
  "EXPO_PUBLIC_MOBILE_INTELLIGENCE"
];
const intelligenceProperties = ["matchPathIntelligence", "teamFormIntelligence", "mobileIntelligence"];

export function webBuildEnvironment(parent, { mocks }) {
  const child = {};
  for (const [name, value] of Object.entries(parent)) {
    if (value !== undefined && inheritedNames.has(name.toUpperCase())) {
      child[name] = value;
    }
  }
  child.BTB_WEB_BUILD = "1";
  child.EXPO_PUBLIC_USE_MOCKS = mocks ? "true" : "false";
  if (!mocks) {
    // Feature parity with the accepted pilot APK: Match Journey, Team Form and
    // Jinx read the live BFF. Named explicitly so a web build can never
    // silently inherit OFF; mock builds keep the SYNTHETIC preview default.
    for (const name of intelligenceVariables) {
      child[name] = "live";
    }
  }
  child.EXPO_NO_TELEMETRY = "1";
  // Expo CLI loads the project's .env files on its own; that would reopen the
  // door this allowlist closes, so a web build never reads them.
  child.EXPO_NO_DOTENV = "1";
  return child;
}

const secretName = /(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|SHA256)/i;

/**
 * Values the parent environment holds that must never appear in a bundle:
 * the pilot key, its SHA-256, and every BTB_/EXPO_PUBLIC_ variable whose name
 * marks it as a secret. Short values are skipped; they would match by chance.
 */
export function secretCandidates(parent) {
  const candidates = [];
  for (const [name, raw] of Object.entries(parent)) {
    const value = String(raw ?? "").trim();
    if (value.length < 12) {
      continue;
    }
    if (/^(BTB_|EXPO_PUBLIC_)/i.test(name) && secretName.test(name)) {
      candidates.push({ name, value });
    }
  }
  const pilotKey = String(parent.EXPO_PUBLIC_MOBILE_PILOT_KEY ?? "").trim();
  if (pilotKey.length >= 12) {
    const digest = createHash("sha256").update(pilotKey).digest("hex");
    candidates.push({ name: "sha256(EXPO_PUBLIC_MOBILE_PILOT_KEY)", value: digest });
    candidates.push({ name: "SHA256(EXPO_PUBLIC_MOBILE_PILOT_KEY)", value: digest.toUpperCase() });
  }
  return candidates;
}

/**
 * Reads the auth mode and mock flag the bundle actually embedded. Metro caches
 * transforms, and the app config is inlined at transform time, so a build can
 * silently carry another build's settings; the export verifies instead of
 * trusting the environment it asked for. Quotes may be JSON-escaped.
 */
export function embeddedRuntimeMode(text) {
  const authModes = new Set(
    [...text.matchAll(/\\?"authMode\\?"\s*:\s*\\?"([a-z]+)\\?"/g)].map((match) => match[1])
  );
  const useMocks = new Set(
    [...text.matchAll(/\\?"useMocks\\?"\s*:\s*(true|false)/g)].map((match) => match[1] === "true")
  );
  const intelligence = Object.fromEntries(
    intelligenceProperties.map((property) => [
      property,
      [
        ...new Set(
          [...text.matchAll(new RegExp(`\\\\?"${property}\\\\?"\\s*:\\s*\\\\?"([A-Z]+)\\\\?"`, "g"))].map(
            (match) => match[1]
          )
        )
      ].sort()
    ])
  );
  return {
    authModes: [...authModes].sort(),
    useMocks: [...useMocks].sort(),
    intelligence
  };
}

export function verifyRuntimeMode(text, { mocks }) {
  const embedded = embeddedRuntimeMode(text);
  const expectedMode = mocks ? "preview" : "edge";
  const expectedIntelligence = mocks ? "SYNTHETIC" : "LIVE";
  const ok =
    embedded.authModes.length === 1 &&
    embedded.authModes[0] === expectedMode &&
    embedded.useMocks.length === 1 &&
    embedded.useMocks[0] === mocks &&
    intelligenceProperties.every(
      (property) =>
        embedded.intelligence[property].length === 1 &&
        embedded.intelligence[property][0] === expectedIntelligence
    );
  return { ok, expectedMode, expectedIntelligence, ...embedded };
}

const scannedExtensions = new Set([".js", ".mjs", ".html", ".json", ".map", ".css", ".txt"]);
const embeddedPilotKey = /pilotAccessKey["']?\s*:\s*["'][^"']+["']/;

function* walk(root) {
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      yield* walk(path);
    } else {
      yield path;
    }
  }
}

/**
 * Returns leak findings by variable name and file only. A finding never
 * carries the matched value, so the report is safe to print or log.
 */
export function findSecretLeaks(root, candidates) {
  const findings = [];
  let scannedFiles = 0;
  for (const path of walk(root)) {
    if (!scannedExtensions.has(extname(path).toLowerCase())) {
      continue;
    }
    scannedFiles += 1;
    const text = readFileSync(path, "utf8");
    const file = relative(root, path).replaceAll("\\", "/");
    for (const { name, value } of candidates) {
      if (text.includes(value)) {
        findings.push({ file, name });
      }
    }
    if (embeddedPilotKey.test(text)) {
      findings.push({ file, name: "non-empty pilotAccessKey" });
    }
  }
  return { scannedFiles, findings };
}
