import assert from "node:assert/strict";
import test from "node:test";
import { overviewModules } from "./module-registry";

test("overview defaults put live value before brand support", () => {
  assert.deepEqual(overviewModules, [
    "featured",
    "metrics",
    "recentSuper",
    "toto",
    "hero"
  ]);
});

test("overview priority keeps every existing module", () => {
  assert.deepEqual(
    new Set(overviewModules),
    new Set(["hero", "metrics", "featured", "recentSuper", "toto"])
  );
});
