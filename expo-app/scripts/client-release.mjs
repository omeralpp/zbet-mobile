/** One release identity for Android and web. This tool grants no approval. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstatSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mobileRoot = resolve(appRoot, "..");
const metadata = new Set(["web-build-receipt.json", "release-manifest.json", "publish-receipt.json"]);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex").toUpperCase();
const readJson = (path) => JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
const requireFact = (condition, message) => { if (!condition) throw new Error(message); };
const exactSha = (sha) => requireFact(/^[a-f0-9]{40}$/.test(sha), "A full source commit SHA is required.");

export function sourceIdentity() {
  const git = (...args) => execFileSync("git", ["-C", mobileRoot, ...args], { encoding: "utf8" }).trim();
  return {
    sourceSha: git("rev-parse", "HEAD"),
    sourceTree: git("rev-parse", "HEAD:expo-app"),
    sourceDirty: git("status", "--porcelain=v1", "--", "expo-app") !== ""
  };
}

function requirePushedSource(sourceSha) {
  const git = (...args) => execFileSync("git", ["-C", mobileRoot, ...args], { encoding: "utf8" }).trim();
  const branch = git("branch", "--show-current");
  requireFact(branch, "Check out the published client branch to verify its remote source.");
  const remoteSha = git("ls-remote", "--exit-code", "origin", `refs/heads/${branch}`).split(/\s/)[0];
  exactSha(remoteSha);
  // Older paired rollback commits must remain ancestors of the live remote branch.
  git("merge-base", "--is-ancestor", sourceSha, remoteSha);
}

export function webTree(root) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const item = lstatSync(path);
      requireFact(!item.isSymbolicLink(), "Web release symlinks are refused.");
      if (item.isDirectory()) visit(path);
      else {
        const key = relative(root, path).replaceAll("\\", "/");
        if (!metadata.has(key)) files.push({ path: key, bytes: item.size, sha256: hash(readFileSync(path)) });
      }
    }
  }
  visit(root);
  requireFact(files.some((file) => file.path === "index.html"), "Web export has no index.html.");
  files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return { treeSha256: hash(JSON.stringify(files)), files };
}

export function stampWeb(root, source, { mocks = false } = {}) {
  const receipt = { schemaVersion: 1, ...source, runtimeMode: mocks ? "mocks" : "edge",
    features: mocks ? {} : { matchJourney: "LIVE", teamForm: "LIVE", jinx: "LIVE" },
    ...webTree(root) };
  writeFileSync(join(root, "web-build-receipt.json"), JSON.stringify(receipt, null, 2)+"\n", { flag: "wx" });
  return receipt;
}

export function verifyWeb(root, expected) {
  exactSha(expected.sourceSha);
  requireFact(/^[a-f0-9]{40}$/.test(expected.sourceTree), "A full committed Expo source tree is required.");
  const receipt = readJson(join(root, "web-build-receipt.json"));
  requireFact(receipt.schemaVersion === 1 && receipt.sourceSha === expected.sourceSha &&
    receipt.sourceTree === expected.sourceTree, "Web build source differs from the release commit.");
  requireFact(receipt.sourceDirty === false && expected.sourceDirty === false, "Release source must be clean and committed.");
  requireFact(receipt.runtimeMode === "edge", "A mock web export cannot be released.");
  const actual = webTree(root);
  requireFact(actual.treeSha256 === receipt.treeSha256 && JSON.stringify(actual.files) === JSON.stringify(receipt.files),
    "Web export changed after its build receipt.");
  return receipt;
}

export function verifyPair(apkPath, webRoot, expected) {
  requireFact(apkPath, "A matching Android APK is required for every web release.");
  const web = verifyWeb(webRoot, expected);
  const android = readJson(apkPath+".config.json");
  const bytes = readFileSync(apkPath);
  requireFact(android.schemaVersion === 1 && android.architecture === "arm64-v8a", "A verified physical-phone ARM64 APK is required.");
  requireFact(android.sourceSha === expected.sourceSha && android.sourceTree === expected.sourceTree && android.sourceDirty === false,
    "Android and web must be built from the same clean source commit.");
  requireFact(android.bytes === bytes.length && android.sha256 === hash(bytes), "Android artifact hash/size differs from its build receipt.");
  const settings = android.effectiveSettings;
  requireFact(settings?.useMocks === false && settings.authMode === "pilot" && settings.mobileApiUrl === "https://api.surklase.com",
    "Android artifact does not target the owner-only pilot.");
  for (const feature of ["matchJourney", "teamForm", "jinx"]) {
    requireFact(settings[feature] === "LIVE" && web.features?.[feature] === settings[feature], "Android/web feature modes differ.");
  }
  return { schemaVersion: 1, batchId: `client-${expected.sourceSha}-${android.sha256.slice(0, 12)}-${web.treeSha256.slice(0, 12)}`,
    sourceSha: expected.sourceSha, sourceTree: expected.sourceTree,
    android: { sha256: android.sha256, bytes: android.bytes, architecture: android.architecture },
    web: { treeSha256: web.treeSha256 }, status: "PREPARED", releaseComplete: false };
}

export function verifyAndroidDelivery(pair, receipt) {
  requireFact(receipt?.schemaVersion === 1 && receipt.batchId === pair.batchId && receipt.sourceSha === pair.sourceSha &&
    receipt.apkSha256 === pair.android.sha256 && receipt.bytes === pair.android.bytes,
    "Android delivery receipt does not match this release batch.");
  for (const fact of ["privateOwnerOnly", "remoteReadbackVerified", "signatureVerified", "abiVerified", "installedVerified"]) {
    requireFact(receipt[fact] === true, `Android delivery requires verified ${fact}.`);
  }
  requireFact(receipt.installedApkSha256 === pair.android.sha256 && typeof receipt.evidence === "string" && receipt.evidence.trim(),
    "Exact APK installation and delivery evidence are required before web publication.");
  return { ...pair, status: "ANDROID_INSTALLED_WEB_PENDING", releaseComplete: false };
}

export function completePair(pair, delivery, publication, acceptance) {
  verifyAndroidDelivery(pair, delivery);
  requireFact(publication?.sourceSha === pair.sourceSha && publication.pairedBatchId === pair.batchId &&
    publication.androidSha256 === pair.android.sha256 && publication.pairedWebTreeSha256 === pair.web.treeSha256 &&
    publication.localProbe?.ok === true && publication.publicGate?.protected === true,
    "Matching successful web publication evidence is required.");
  requireFact(acceptance?.batchId === pair.batchId && acceptance.sourceSha === pair.sourceSha &&
    acceptance.apkSha256 === pair.android.sha256 && acceptance.webTreeSha256 === pair.web.treeSha256 &&
    acceptance.androidSmokePassed === true && acceptance.webSmokePassed === true &&
    typeof acceptance.evidence === "string" && acceptance.evidence.trim(),
    "Both Android and web owner smoke results are required to complete the batch.");
  return { ...pair, status: "COMPLETE", releaseComplete: true };
}

function cli() {
  const [command, ...args] = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    requireFact(args[i]?.startsWith("--") && args[i+1] && !args[i+1].startsWith("--"), "Expected named option/value pairs.");
    options[args[i].slice(2)] = args[i+1];
  }
  const allowed = new Set(["apk", "web-root", "source-sha", "delivery", "publication", "acceptance", "output"]);
  requireFact(Object.keys(options).every((key) => allowed.has(key)), "Unknown client release option.");
  requireFact(["source", "verify-web", "verify", "complete"].includes(command), "Use source, verify-web, verify or complete.");
  if (command === "verify" || command === "complete") requireFact(options.apk, "A matching Android APK is required for every client release.");
  if (command === "complete") requireFact(options.delivery && options.publication && options.acceptance,
    "Completion requires delivery, publication and acceptance receipts.");
  let source = sourceIdentity();
  if (options["source-sha"]) {
    exactSha(options["source-sha"]);
    source = { sourceSha: options["source-sha"], sourceDirty: false,
      sourceTree: execFileSync("git", ["-C", mobileRoot, "rev-parse", `${options["source-sha"]}:expo-app`], { encoding: "utf8" }).trim() };
  }
  if (command !== "source") requirePushedSource(source.sourceSha);
  let result;
  if (command === "source") result = source;
  else if (command === "verify-web") result = verifyWeb(resolve(options["web-root"] ?? join(appRoot, "dist-web")), source);
  else {
    requireFact(command === "verify" || command === "complete", "Use source, verify-web, verify or complete.");
    result = verifyPair(options.apk, resolve(options["web-root"] ?? join(appRoot, "dist-web")), source);
    if (options.delivery) result = verifyAndroidDelivery(result, readJson(options.delivery));
    if (command === "complete") {
      requireFact(options.delivery && options.publication && options.acceptance, "Completion requires delivery, publication and acceptance receipts.");
      result = completePair(result, readJson(options.delivery), readJson(options.publication), readJson(options.acceptance));
    }
  }
  if (options.output) writeFileSync(options.output, JSON.stringify(result, null, 2)+"\n", { flag: "wx" });
  process.stdout.write(JSON.stringify(result)+"\n");
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { cli(); } catch (error) {
    process.stderr.write(`Client release gate: ${error.message}\n`);
    process.exitCode = 1;
  }
}
