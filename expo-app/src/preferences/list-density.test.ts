import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { defaultListDensity, normalizeListDensity, usesCompactCards } from "./list-density";

test("the accepted comfortable cards stay the default (NXT-OBS-251)", () => {
  assert.equal(defaultListDensity, "COMFORTABLE");
  for (const stored of [null, undefined, "", "compact", "DENSE", "{}"]) assert.equal(normalizeListDensity(stored), "COMFORTABLE");
  assert.equal(normalizeListDensity("COMPACT"), "COMPACT");
});

test("compact cards apply to the phone lists only", () => {
  assert.equal(usesCompactCards("COMPACT", false), true);
  assert.equal(usesCompactCards("COMPACT", true), false, "the desktop table and split view keep their own layout");
  assert.equal(usesCompactCards("COMFORTABLE", false), false);
});

test("both lists and the settings switch read the one preference", () => {
  const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  assert.match(source("../../app/(tabs)/live.tsx"), /usesCompactCards\(density, splitLayout\)/);
  assert.match(source("../components/RebuildDecisionLog.tsx"), /dense=\{usesCompactCards\(density, false\)\}/);
  assert.match(source("../../app/(tabs)/more.tsx"), /setDensity\(compact \? "COMPACT" : "COMFORTABLE"\)/);
});
