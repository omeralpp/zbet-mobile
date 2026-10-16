import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { completePair, stampWeb, verifyAndroidDelivery, verifyPair, verifyWeb } from "./client-release.mjs";

const source = { sourceSha: "a".repeat(40), sourceTree: "b".repeat(40), sourceDirty: false };
const hash = (data) => createHash("sha256").update(data).digest("hex").toUpperCase();
function fixture(t, { mocks = false, dirty = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), "btb-client-release-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const web = join(root, "web");
  mkdirSync(web);
  writeFileSync(join(web, "index.html"), "<!doctype html><p>Test fixture</p>");
  writeFileSync(join(web, "bundle.js"), "/* synthetic test fixture */");
  stampWeb(web, { ...source, sourceDirty: dirty }, { mocks });
  const apk = join(root, "fixture.apk");
  const bytes = Buffer.from("synthetic apk test fixture");
  writeFileSync(apk, bytes);
  const receipt = { schemaVersion: 1, ...source, bytes: bytes.length, sha256: hash(bytes), architecture: "arm64-v8a",
    effectiveSettings: { authMode: "pilot", mobileApiUrl: "https://api.surklase.com", useMocks: false,
      matchJourney: "LIVE", teamForm: "LIVE", jinx: "LIVE" } };
  writeFileSync(apk+".config.json", JSON.stringify(receipt));
  return { root, web, apk, receipt, updateReceipt: () => writeFileSync(apk+".config.json", JSON.stringify(receipt)) };
}
function delivery(pair) {
  return { schemaVersion: 1, batchId: pair.batchId, sourceSha: pair.sourceSha,
    apkSha256: pair.android.sha256, bytes: pair.android.bytes, installedApkSha256: pair.android.sha256,
    privateOwnerOnly: true, remoteReadbackVerified: true, signatureVerified: true, abiVerified: true,
    installedVerified: true, evidence: "SYNTHETIC TEST ONLY" };
}
function publication(pair) {
  return { sourceSha: pair.sourceSha, pairedBatchId: pair.batchId, androidSha256: pair.android.sha256,
    pairedWebTreeSha256: pair.web.treeSha256, localProbe: { ok: true }, publicGate: { protected: true } };
}
function acceptance(pair) {
  return { batchId: pair.batchId, sourceSha: pair.sourceSha, apkSha256: pair.android.sha256,
    webTreeSha256: pair.web.treeSha256, androidSmokePassed: true, webSmokePassed: true, evidence: "SYNTHETIC TEST ONLY" };
}

test("a matching pair is prepared, never implicitly released", (t) => {
  const f = fixture(t);
  const pair = verifyPair(f.apk, f.web, source);
  assert.equal(pair.status, "PREPARED");
  assert.equal(pair.releaseComplete, false);
  assert.equal(verifyPair(f.apk, f.web, source).batchId, pair.batchId);
});
test("web-only release is refused", (t) => {
  const f = fixture(t);
  assert.throws(() => verifyPair(undefined, f.web, source), /matching Android APK/);
});
test("an Android build from another commit is refused", (t) => {
  const f = fixture(t);
  f.receipt.sourceSha = "c".repeat(40); f.updateReceipt();
  assert.throws(() => verifyPair(f.apk, f.web, source), /same clean source/);
});
test("a different source tree is refused even if the commit field matches", (t) => {
  const f = fixture(t);
  f.receipt.sourceTree = "c".repeat(40); f.updateReceipt();
  assert.throws(() => verifyPair(f.apk, f.web, source), /same clean source/);
});
test("dirty or unstamped web builds cannot be released", (t) => {
  const f = fixture(t, { dirty: true });
  assert.throws(() => verifyWeb(f.web, source), /clean and committed/);
  rmSync(join(f.web, "web-build-receipt.json"));
  assert.throws(() => verifyWeb(f.web, source), /ENOENT/);
});
test("an altered web asset cannot borrow the old build receipt", (t) => {
  const f = fixture(t);
  writeFileSync(join(f.web, "bundle.js"), "different build");
  assert.throws(() => verifyPair(f.apk, f.web, source), /changed after/);
});
test("an altered APK cannot borrow its old config receipt", (t) => {
  const f = fixture(t);
  writeFileSync(f.apk, "altered APK");
  assert.throws(() => verifyPair(f.apk, f.web, source), /hash\/size/);
});
test("mock web, emulator APK and divergent features are refused", (t) => {
  const mocks = fixture(t, { mocks: true });
  assert.throws(() => verifyPair(mocks.apk, mocks.web, source), /mock web/);
  const f = fixture(t);
  f.receipt.architecture = "x86_64"; f.updateReceipt();
  assert.throws(() => verifyPair(f.apk, f.web, source), /physical-phone ARM64/);
  f.receipt.architecture = "arm64-v8a";
  f.receipt.effectiveSettings.jinx = "OFF"; f.updateReceipt();
  assert.throws(() => verifyPair(f.apk, f.web, source), /feature modes differ/);
});
test("publication metadata does not change the exported asset identity", (t) => {
  const f = fixture(t);
  const before = verifyPair(f.apk, f.web, source);
  writeFileSync(join(f.web, "release-manifest.json"), JSON.stringify({ sourceSha: source.sourceSha }));
  assert.deepEqual(verifyPair(f.apk, f.web, source), before);
});
test("delivery of an old APK cannot unlock a new web release", (t) => {
  const f = fixture(t); const pair = verifyPair(f.apk, f.web, source);
  const d = delivery(pair); d.apkSha256 = "0".repeat(64);
  assert.throws(() => verifyAndroidDelivery(pair, d), /does not match/);
});
test("unverified signing, readback or installation leaves delivery blocked", (t) => {
  const f = fixture(t); const pair = verifyPair(f.apk, f.web, source);
  for (const flag of ["privateOwnerOnly", "remoteReadbackVerified", "signatureVerified", "abiVerified", "installedVerified"]) {
    assert.throws(() => verifyAndroidDelivery(pair, { ...delivery(pair), [flag]: false }), /requires verified/);
  }
  assert.throws(() => verifyAndroidDelivery(pair, { ...delivery(pair), installedApkSha256: "0".repeat(64) }), /Exact APK/);
  assert.equal(verifyAndroidDelivery(pair, delivery(pair)).releaseComplete, false);
});
test("only matching delivery, publication and both smoke checks complete a release", (t) => {
  const f = fixture(t); const pair = verifyPair(f.apk, f.web, source);
  assert.equal(completePair(pair, delivery(pair), publication(pair), acceptance(pair)).releaseComplete, true);
  assert.throws(() => completePair(pair, delivery(pair), { ...publication(pair), sourceSha: "c".repeat(40) }, acceptance(pair)), /publication evidence/);
  for (const flag of ["androidSmokePassed", "webSmokePassed"]) {
    assert.throws(() => completePair(pair, delivery(pair), publication(pair), { ...acceptance(pair), [flag]: false }), /Both Android and web/);
  }
});
test("published web with a failed public gate cannot be called complete", (t) => {
  const f = fixture(t); const pair = verifyPair(f.apk, f.web, source);
  assert.throws(() => completePair(pair, delivery(pair), { ...publication(pair), publicGate: { protected: false } }, acceptance(pair)), /publication evidence/);
});
test("publisher refuses missing Android companions before reading runtime config", { skip: process.platform !== "win32" }, () => {
  const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  const script = join(workspace, "zbet-cap/scripts/publish-web-client.ps1");
  for (const confirm of ["PUBLISH-WEB", "ROLLBACK-WEB"]) {
    const run = spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script, "-Confirm", confirm], { encoding: "utf8" });
    assert.notEqual(run.status, 0);
    assert.match(run.stdout+run.stderr, /Coordinated client release requires/);
  }
});
