#!/usr/bin/env node
/**
 * The only entry point for web builds of BTB Mobile Next.
 *
 *   node scripts/web.mjs start  [--mocks]            local dev server
 *   node scripts/web.mjs export [--mocks] [--out d]  static export + secret scan
 *   node scripts/web.mjs verify [--mocks] [--out d]  re-verify an existing export
 *
 * Both run Expo with an allowlisted environment (see web-build-policy.mjs), so
 * no pilot key, OAuth setting or server secret from the developer's shell can
 * reach the browser bundle. `export` then scans the output for the parent
 * environment's secret values and fails without printing any of them.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findSecretLeaks,
  secretCandidates,
  verifyRuntimeMode,
  webBuildEnvironment
} from "./web-build-policy.mjs";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expoCli = join(appRoot, "node_modules", "expo", "bin", "cli");
const [command, ...rest] = process.argv.slice(2);
const mocks = rest.includes("--mocks");
const outIndex = rest.indexOf("--out");
const outDir = resolve(appRoot, outIndex >= 0 ? rest[outIndex + 1] ?? "" : "dist-web");

function runExpo(args) {
  const result = spawnSync(process.execPath, [expoCli, ...args], {
    cwd: appRoot,
    env: webBuildEnvironment(process.env, { mocks }),
    stdio: "inherit"
  });
  return result.status ?? 1;
}

/** Verifies an export in place: embedded mode, then the secret scan. */
function verifyExport({ deleteOnFailure }) {
  const bundleDir = join(outDir, "_expo", "static", "js", "web");
  const entry = existsSync(bundleDir)
    ? readdirSync(bundleDir).find((name) => /^index-.*\.js$/.test(name))
    : undefined;
  if (!entry) {
    console.error("Web export has no entry bundle.");
    process.exit(1);
  }
  const fail = (message) => {
    if (deleteOnFailure) {
      rmSync(outDir, { recursive: true, force: true });
    }
    console.error(deleteOnFailure ? `Web export deleted: ${message}` : `Web export rejected: ${message}`);
    process.exit(1);
  };
  const mode = verifyRuntimeMode(readFileSync(join(bundleDir, entry), "utf8"), { mocks });
  if (!mode.ok) {
    fail(
      `expected ${mode.expectedMode}/useMocks=${mocks}/intelligence=${mode.expectedIntelligence}, bundle embeds ` +
        `authMode=${mode.authModes.join("|") || "none"} useMocks=${mode.useMocks.join("|") || "none"}.`
    );
  }
  const { scannedFiles, findings } = findSecretLeaks(outDir, secretCandidates(process.env));
  if (scannedFiles === 0) {
    fail("no scannable files.");
  }
  if (findings.length) {
    for (const finding of findings) {
      console.error(`SECRET LEAK: ${finding.name} in ${finding.file}`);
    }
    fail("a secret value reached the bundle.");
  }
  console.log(`Web export clean: ${scannedFiles} files scanned, mode ${mocks ? "mocks" : "edge"}, ${outDir}`);
}

if (command === "start") {
  process.exit(runExpo(["start", "--web", "--clear"]));
} else if (command === "export") {
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true, force: true });
  }
  // --clear: the app config is inlined at transform time, so a cached
  // transform from another mode (e.g. a running mock dev server) would leak in.
  const status = runExpo(["export", "--platform", "web", "--clear", "--output-dir", outDir]);
  if (status !== 0) {
    process.exit(status);
  }
  verifyExport({ deleteOnFailure: true });
} else if (command === "verify") {
  verifyExport({ deleteOnFailure: false });
} else {
  console.error("Usage: node scripts/web.mjs start|export|verify [--mocks] [--out <dir>]");
  process.exit(2);
}
