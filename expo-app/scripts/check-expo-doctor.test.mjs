import assert from "node:assert/strict";
import { test } from "node:test";
import { doctorEnvironment, doctorPassed, redactDoctorOutput, runDoctor } from "./check-expo-doctor.mjs";

const success = { status: 0, stdout: "Running 20 checks on your project...\n20/20 checks passed.", stderr: "" };

test("preview isolates inherited pilot settings without mutating the caller", () => {
  const source = { EXPO_PUBLIC_MOBILE_PILOT_KEY: "test-key", EXPO_PUBLIC_MOBILE_AUTH_MODE: "pilot", EXPO_PUBLIC_USE_MOCKS: "false", EXPO_PUBLIC_AUTH_CLIENT_SECRET: "test-secret" };
  const env = doctorEnvironment("preview", source);
  assert.equal(env.EXPO_PUBLIC_MOBILE_AUTH_MODE, "preview");
  assert.equal(env.EXPO_PUBLIC_USE_MOCKS, "true");
  assert.equal(env.EXPO_NO_DOTENV, "1");
  assert.equal(env.EXPO_PUBLIC_MOBILE_PILOT_KEY, undefined);
  assert.equal(env.EXPO_PUBLIC_AUTH_CLIENT_SECRET, undefined);
  assert.equal(source.EXPO_PUBLIC_MOBILE_PILOT_KEY, "test-key");
  assert.equal(source.EXPO_PUBLIC_USE_MOCKS, "false");
});

test("configured mode preserves the chosen real profile and rejects an implicit one", () => {
  assert.throws(() => doctorEnvironment("configured", {}));
  assert.throws(() => doctorEnvironment("unknown", {}));
  const source = { EXPO_PUBLIC_MOBILE_AUTH_MODE: "oauth", EXPO_PUBLIC_USE_MOCKS: "false", EXPO_PUBLIC_AUTH_ISSUER: "https://issuer.example" };
  assert.deepEqual(doctorEnvironment("configured", source), { ...source, CI: "1" });
});

test("a false zero exit, missing summary, interrupted run or partial check set never passes", () => {
  assert.equal(doctorPassed(success), true);
  for (const result of [
    { status: 0, stdout: "", stderr: "Error: config --json --full exited with non-zero code: 1" },
    { status: 0, stdout: "19/20 checks passed." },
    { ...success, status: 1 },
    { ...success, status: null, signal: "SIGTERM" },
    { ...success, error: new Error("timeout") },
    { ...success, stderr: "Error: config failed" },
    { status: 0, stdout: "Running 20 checks\n19/19 checks passed." },
    { status: 0, stdout: "0/0 checks passed." },
    { ...success, stderr: "1 check failed" }
  ]) assert.equal(doctorPassed(result), false);
});

test("config failure prevents Doctor and withholds its entire sensitive output", () => {
  const lines = [];
  let calls = 0;
  const exitCode = runDoctor({ profile: "preview", sourceEnv: {}, write: line => lines.push(line), run: () => {
    calls++;
    return { status: 1, stdout: "sensitive-config-value", stderr: "sensitive-config-value" };
  } });
  assert.equal(exitCode, 1);
  assert.equal(calls, 1);
  assert.ok(!lines.join("\n").includes("sensitive-config-value"));
});

test("invalid or wrong-profile config cannot reach Doctor even with exit zero", () => {
  for (const stdout of ["not-json", "{}", JSON.stringify({ extra: { authMode: "preview", useMocks: true } }), JSON.stringify({ exp: { extra: { authMode: "pilot", useMocks: false } } })]) {
    let calls = 0;
    assert.equal(runDoctor({ profile: "preview", sourceEnv: {}, write: () => {}, run: () => { calls++; return { status: 0, stdout }; } }), 1);
    assert.equal(calls, 1);
  }
});

test("verified preview reaches Doctor; false-zero Doctor remains a failing command", () => {
  for (const [doctorResult, expected] of [[success, 0], [{ status: 0, stderr: "Error: configuration failed" }, 1]]) {
    let calls = 0;
    assert.equal(runDoctor({ profile: "preview", sourceEnv: {}, write: () => {}, run: () => ++calls === 1
      ? { status: 0, stdout: JSON.stringify({ exp: { extra: { authMode: "preview", useMocks: true } } }) }
      : doctorResult }), expected);
    assert.equal(calls, 2);
  }
});

test("doctor diagnostic output redacts sensitive environment values", () => {
  const env = { EXPO_PUBLIC_MOBILE_PILOT_KEY: "unique-test-value", AUTH_SECRET: "another-test-value" };
  assert.equal(redactDoctorOutput("unique-test-value / another-test-value", env), "[REDACTED] / [REDACTED]");
});
