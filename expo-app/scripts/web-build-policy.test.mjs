import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  findSecretLeaks,
  secretCandidates,
  verifyRuntimeMode,
  webBuildEnvironment
} from "./web-build-policy.mjs";

const pilotKey = "p".repeat(40) + "-pilot";

test("the web build never inherits EXPO_PUBLIC or server secrets", () => {
  const child = webBuildEnvironment(
    {
      PATH: "/bin",
      SystemRoot: "C:\\Windows",
      EXPO_PUBLIC_MOBILE_PILOT_KEY: pilotKey,
      EXPO_PUBLIC_MOBILE_API_URL: "https://api.surklase.com",
      EXPO_PUBLIC_AUTH_CLIENT_ID: "client",
      BTB_MOBILE_SAP_PASSWORD: "sap-password-value",
      BTB_JINX_LLM_API_KEY: "llm-key-value-0000"
    },
    { mocks: false }
  );
  assert.deepEqual(Object.keys(child).sort(), [
    "BTB_WEB_BUILD",
    "EXPO_NO_DOTENV",
    "EXPO_NO_TELEMETRY",
    "EXPO_PUBLIC_MATCH_PATH_INTELLIGENCE",
    "EXPO_PUBLIC_MOBILE_INTELLIGENCE",
    "EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE",
    "EXPO_PUBLIC_USE_MOCKS",
    "PATH",
    "SystemRoot"
  ]);
  assert.equal(child.EXPO_PUBLIC_USE_MOCKS, "false");
  assert.equal(child.EXPO_NO_DOTENV, "1");
  assert.equal(child.EXPO_PUBLIC_MOBILE_INTELLIGENCE, "live");
  const mockChild = webBuildEnvironment({}, { mocks: true });
  assert.equal(mockChild.EXPO_PUBLIC_USE_MOCKS, "true");
  assert.equal(mockChild.EXPO_PUBLIC_MOBILE_INTELLIGENCE, undefined);
});

test("secret candidates cover the pilot key, its digest and named secrets only", () => {
  const names = secretCandidates({
    EXPO_PUBLIC_MOBILE_PILOT_KEY: pilotKey,
    BTB_MOBILE_SAP_PASSWORD: "sap-password-value",
    BTB_LIVE_CONTEXT_BRIDGE_TOKEN: "bridge-token-value",
    BTB_MOBILE_SAP_BASE_URL: "http://127.0.0.1:50000",
    EXPO_PUBLIC_MOBILE_API_URL: "https://api.surklase.com",
    BTB_SHORT_KEY: "short"
  }).map((candidate) => candidate.name);
  assert.ok(names.includes("EXPO_PUBLIC_MOBILE_PILOT_KEY"));
  assert.ok(names.includes("sha256(EXPO_PUBLIC_MOBILE_PILOT_KEY)"));
  assert.ok(names.includes("BTB_MOBILE_SAP_PASSWORD"));
  assert.ok(names.includes("BTB_LIVE_CONTEXT_BRIDGE_TOKEN"));
  assert.ok(!names.includes("BTB_MOBILE_SAP_BASE_URL"));
  assert.ok(!names.includes("EXPO_PUBLIC_MOBILE_API_URL"));
  assert.ok(!names.includes("BTB_SHORT_KEY"));
});

test("a leaked value is reported by name and file, never by value", () => {
  const root = mkdtempSync(join(tmpdir(), "btb-web-scan-"));
  try {
    mkdirSync(join(root, "_expo"));
    writeFileSync(join(root, "index.html"), "<html></html>");
    writeFileSync(join(root, "_expo", "clean.js"), "const a = 1;");
    writeFileSync(join(root, "_expo", "leak.js"), `const k = "${pilotKey}";`);
    writeFileSync(join(root, "_expo", "extra.js"), `({"pilotAccessKey":"abc"})`);
    writeFileSync(join(root, "logo.png"), pilotKey);
    const { scannedFiles, findings } = findSecretLeaks(
      root,
      secretCandidates({ EXPO_PUBLIC_MOBILE_PILOT_KEY: pilotKey })
    );
    assert.equal(scannedFiles, 4);
    assert.deepEqual(findings, [
      { file: "_expo/extra.js", name: "non-empty pilotAccessKey" },
      { file: "_expo/leak.js", name: "EXPO_PUBLIC_MOBILE_PILOT_KEY" }
    ]);
    assert.ok(!JSON.stringify(findings).includes(pilotKey));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the export verifies the auth mode the bundle really embedded", () => {
  const live = String.raw`\"matchPathIntelligence\":\"LIVE\",\"teamFormIntelligence\":\"LIVE\",\"mobileIntelligence\":\"LIVE\"`;
  const escaped = String.raw`"extra":{\"mobileApiUrl\":\"\",\"authMode\":\"edge\",\"useMocks\":false,` + live + "}";
  assert.equal(verifyRuntimeMode(escaped, { mocks: false }).ok, true);
  assert.equal(verifyRuntimeMode(escaped, { mocks: true }).ok, false);
  const offFeatures = escaped.replace(String.raw`\"mobileIntelligence\":\"LIVE\"`, String.raw`\"mobileIntelligence\":\"OFF\"`);
  assert.equal(verifyRuntimeMode(offFeatures, { mocks: false }).ok, false);
  const stale = String.raw`{\"authMode\":\"preview\",\"useMocks\":true}`;
  const result = verifyRuntimeMode(stale, { mocks: false });
  assert.equal(result.ok, false);
  assert.deepEqual(result.authModes, ["preview"]);
  const mixed = `{"authMode":"edge","useMocks":false} {"authMode":"preview","useMocks":true}`;
  assert.equal(verifyRuntimeMode(mixed, { mocks: false }).ok, false);
  assert.equal(verifyRuntimeMode("no config here", { mocks: false }).ok, false);
});

test("an empty pilotAccessKey is not a leak", () => {
  const root = mkdtempSync(join(tmpdir(), "btb-web-scan-"));
  try {
    writeFileSync(join(root, "bundle.js"), `({"pilotAccessKey":"","authMode":"edge"})`);
    assert.deepEqual(findSecretLeaks(root, []).findings, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
