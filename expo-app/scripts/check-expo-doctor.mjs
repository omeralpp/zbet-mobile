import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function doctorEnvironment(profile, source) {
  if (!["preview", "configured"].includes(profile)) {
    throw new Error("Choose --profile preview or --profile configured.");
  }
  const env = { ...source, CI: "1" };
  if (profile === "preview") {
    // Child process only. Dotenv must not reintroduce an owner pilot key.
    for (const name of Object.keys(env)) {
      if (name.startsWith("EXPO_PUBLIC_AUTH_")) delete env[name];
    }
    delete env.EXPO_PUBLIC_MOBILE_PILOT_KEY;
    Object.assign(env, {
      EXPO_NO_DOTENV: "1",
      EXPO_PUBLIC_USE_MOCKS: "true",
      EXPO_PUBLIC_MOBILE_AUTH_MODE: "preview",
      EXPO_PUBLIC_MOBILE_INTELLIGENCE: "synthetic",
      EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE: "synthetic"
    });
  } else if (!["pilot", "oauth"].includes(env.EXPO_PUBLIC_MOBILE_AUTH_MODE)) {
    throw new Error("Configured checks require an explicit pilot or oauth auth mode in the process environment.");
  }
  return env;
}

export function doctorPassed(result) {
  if (result.error || result.signal || result.status !== 0) return false;
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.replace(/\u001b\[[0-9;]*m/g, "");
  const summaries = [...output.matchAll(/\b(\d+)\/(\d+) checks passed\b/g)];
  if (summaries.length !== 1) return false;
  const [, passed, total] = summaries[0];
  const announced = output.match(/Running (\d+) checks/);
  return Number(total) > 0 && passed === total &&
    (!announced || announced[1] === total) &&
    !/(?:^|\n)\s*(?:Error:|ConfigError:|CommandError:|✖)|\b[1-9]\d* checks? failed\b/.test(output);
}

export function redactDoctorOutput(output, env) {
  let safe = String(output ?? "");
  const values = Object.entries(env)
    .filter(([name, value]) => /KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL/i.test(name) && value)
    .map(([, value]) => String(value))
    .sort((left, right) => right.length - left.length);
  for (const value of values) safe = safe.split(value).join("[REDACTED]");
  return safe.replace(/-----BEGIN [\s\S]*?PRIVATE KEY-----[\s\S]*?-----END [\s\S]*?PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]");
}

function packageBin(name, command) {
  const manifestPath = require.resolve(`${name}/package.json`);
  const manifest = require(manifestPath);
  const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin[command];
  return resolve(dirname(manifestPath), bin);
}

export function runDoctor({ profile, sourceEnv = process.env, run = spawnSync, write = console.log }) {
  const env = doctorEnvironment(profile, sourceEnv);
  const options = { cwd: appRoot, env, encoding: "utf8", windowsHide: true, timeout: 120_000, maxBuffer: 10 * 1024 * 1024 };
  write(`Mobile Doctor profile: ${profile} (child-process settings only).`);
  const configResult = run(process.execPath, [packageBin("expo", "expo"), "config", "--json", "--full"], options);
  // Config stdout can contain a pilot key. Never print the resolved config,
  // or raw config exceptions, even when the child reports an error.
  if (configResult.error || configResult.signal || configResult.status !== 0) {
    write("FAIL: Expo config could not be evaluated. Check the selected auth profile and required settings; config output was withheld.");
    return 1;
  }
  try {
    // `expo config --full` wraps the resolved app config in `exp`.
    const config = JSON.parse(configResult.stdout).exp;
    const expected = profile === "preview" ? "preview" : sourceEnv.EXPO_PUBLIC_MOBILE_AUTH_MODE;
    if (config?.extra?.authMode !== expected || config?.extra?.useMocks !== (expected === "preview")) throw new Error("Profile mismatch");
  } catch {
    write("FAIL: Expo config did not return valid JSON with the requested auth profile; config output was withheld.");
    return 1;
  }
  const result = run(process.execPath, [packageBin("expo-doctor", "expo-doctor")], options);
  write(redactDoctorOutput(`${result.stdout ?? ""}\n${result.stderr ?? ""}`, env).trim());
  if (!doctorPassed(result)) {
    write("FAIL: Expo Doctor must exit zero and report that every announced check passed.");
    return 1;
  }
  write(`PASS: Expo Doctor completed for ${profile}. This is not artifact or device acceptance.`);
  return 0;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== "--profile") throw new Error("Use --profile preview or --profile configured.");
    process.exitCode = runDoctor({ profile: args[1] });
  } catch {
    console.error("FAIL: Mobile Doctor could not start. Check --profile and the locally installed Expo dependencies.");
    process.exitCode = 1;
  }
}
