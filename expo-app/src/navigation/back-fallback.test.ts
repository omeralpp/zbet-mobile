import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { backFallbackTarget, needsBackFallback } from "./back-fallback";

test("a header draws its own back control only without history and without a sidebar (NXT-OBS-256)", () => {
  assert.equal(needsBackFallback(true, "android", "compact"), false, "the navigator's own arrow is kept");
  assert.equal(needsBackFallback(true, "web", "compact"), false);
  assert.equal(needsBackFallback(false, "android", "compact"), true);
  assert.equal(needsBackFallback(false, "android", "medium"), true, "Android has no sidebar at any width");
  assert.equal(needsBackFallback(false, "web", "compact"), true);
  assert.equal(needsBackFallback(false, "web", "medium"), false, "the web rail already leads out");
  assert.equal(needsBackFallback(false, "web", "wide"), false);
});

test("the fallback leads where each screen's edge swipe already does", () => {
  assert.equal(backFallbackTarget("match/[key]"), "/");
  assert.equal(backFallbackTarget("super/[key]"), "/super");
  assert.equal(backFallbackTarget("toto/[gcNo]/[version]"), "/toto");
  assert.equal(backFallbackTarget("+not-found"), "/");
  const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  assert.match(source("../screens/MatchDetailView.tsx"), /router\.replace\("\/"\)/);
  assert.match(source("../../app/super/[key].tsx"), /router\.replace\("\/super"\)/);
  assert.match(source("../../app/toto/[gcNo]/[version].tsx"), /router\.replace\("\/toto"\)/);
});
