import assert from "node:assert/strict";
import test from "node:test";
import { reconcileModuleOrder } from "./module-layout";
import {
  liveDetailModules,
  moduleLayoutAnchors,
  overviewModules,
  retiredLiveDetailModules,
  moduleCollapseDefaults
} from "./module-registry";

test("overview defaults put live value before brand support", () => {
  assert.deepEqual(overviewModules, [
    "featured",
    "metrics",
    "recentSuper",
    "toto"
  ]);
});

test("overview retains functional modules and retires the decorative hero", () => {
  assert.deepEqual(
    new Set(overviewModules),
    new Set(["metrics", "featured", "recentSuper", "toto"])
  );
});

test("Maçın Nabzı and the separate score/star flow are retired from live detail", () => {
  // Owner decision 2026-10-16: the Bilyoner Game Pulse module is removed and
  // the score and star flow moves inside Maçın Yolu (matchPath).
  for (const retired of retiredLiveDetailModules) {
    assert.equal(
      (liveDetailModules as readonly string[]).includes(retired),
      false,
      `${retired} must not be a live detail module`
    );
  }
  assert.equal(liveDetailModules.indexOf("matchPath"), 0);
});

test("no live detail anchor names a retired or unknown module", () => {
  const known = new Set<string>(liveDetailModules);
  for (const anchor of moduleLayoutAnchors.liveDetail) {
    assert.equal(known.has(anchor.id), true, `${anchor.id} must be current`);
    assert.equal(known.has(anchor.after), true, `${anchor.after} must be current`);
  }
});

test("a stored layout drops the retired modules and keeps the user's order", () => {
  const stored = [
    "odds",
    "decision",
    "gamePulse",
    "matchPath",
    "timeline",
    "askJinx",
    "teamForm",
    "standings",
    "statistics",
    "scoreDistribution"
  ];

  const migrated = reconcileModuleOrder(
    stored,
    liveDetailModules,
    moduleLayoutAnchors.liveDetail
  );

  assert.deepEqual(migrated, [
    "odds",
    "decision",
    "matchPath",
    "teamForm",
    "standings",
    "statistics",
    "scoreDistribution"
  ]);
});

test("a layout stored before Maçın Yolu gains it directly after the decision", () => {
  const legacy = [
    "decision",
    "gamePulse",
    "timeline",
    "standings",
    "odds",
    "statistics",
    "scoreDistribution"
  ];

  const migrated = reconcileModuleOrder(
    legacy,
    liveDetailModules,
    moduleLayoutAnchors.liveDetail
  );

  assert.deepEqual(migrated.slice(0, 3), [
    "decision",
    "matchPath",
    "teamForm"
  ]);
  assert.equal(new Set(migrated).size, liveDetailModules.length);
});

test("new live detail defaults keep the journey open and Jinx outside customizable panels", () => {
  assert.equal((liveDetailModules as readonly string[]).includes("askJinx"), false);
  assert.equal(moduleCollapseDefaults.liveDetail.includes("matchPath"), false);
  assert.equal(moduleCollapseDefaults.liveDetail.length, liveDetailModules.length - 1);
});
