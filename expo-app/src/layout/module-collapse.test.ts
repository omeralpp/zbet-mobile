import assert from "node:assert/strict";
import test from "node:test";
import {
  moduleCollapseStorageKey,
  reconcileCollapsedModules,
  shouldTogglePanel,
  toggleCollapsedModule
} from "./module-collapse";
import {
  moduleLayoutStorageKey,
  moduleLayoutSurfaces,
  moduleReorderActivationDelayMs,
  moduleReorderActivationSlop,
  parseStoredModulePreference,
  reconcileModuleOrder
} from "./module-layout";
import { moduleLayoutDefaults } from "./module-registry";

const modules = ["decision", "odds", "statistics", "pressure"] as const;

function press(overrides: Partial<Parameters<typeof shouldTogglePanel>[0]>) {
  return shouldTogglePanel({
    endedAt: 1_000,
    endX: 100,
    endY: 200,
    startedAt: 1_000,
    startX: 100,
    startY: 200,
    ...overrides
  });
}

test("keeps one distinct collapse key per surface", () => {
  const keys = moduleLayoutSurfaces.map(moduleCollapseStorageKey);
  assert.equal(new Set(keys).size, moduleLayoutSurfaces.length);
  assert.equal(
    moduleCollapseStorageKey("liveDetail"),
    "btb-mobile-next-module-collapse-liveDetail-v1"
  );
});

test("never shares a storage key with the order preference", () => {
  for (const surface of moduleLayoutSurfaces) {
    assert.notEqual(
      moduleCollapseStorageKey(surface),
      moduleLayoutStorageKey(surface)
    );
  }
});

test("opens every module when nothing has been stored", () => {
  assert.deepEqual(reconcileCollapsedModules(null, modules), []);
  assert.deepEqual(reconcileCollapsedModules(undefined, modules), []);
});

test("opens every module when the store is corrupted", () => {
  assert.deepEqual(
    reconcileCollapsedModules(parseStoredModulePreference("{oops"), modules),
    []
  );
  assert.deepEqual(reconcileCollapsedModules({ odds: true }, modules), []);
  assert.deepEqual(reconcileCollapsedModules("odds", modules), []);
});

test("restores exactly the modules the user closed", () => {
  assert.deepEqual(
    reconcileCollapsedModules(
      parseStoredModulePreference(JSON.stringify(["odds", "pressure"])),
      modules
    ),
    ["odds", "pressure"]
  );
});

test("drops a retired module instead of keeping it collapsed", () => {
  assert.deepEqual(
    reconcileCollapsedModules(["odds", "lineups", "pressure"], modules),
    ["odds", "pressure"]
  );
});

test("collapses a duplicated entry to one", () => {
  assert.deepEqual(reconcileCollapsedModules(["odds", "odds"], modules), [
    "odds"
  ]);
});

test("leaves a newly shipped module open for an existing install", () => {
  // The stored preference predates `xGAnalysis`, so nothing in it can close a
  // module the user has never seen.
  const stored = ["odds", "pressure"];
  const nextRelease = [...modules, "xGAnalysis"] as const;
  assert.deepEqual(reconcileCollapsedModules(stored, nextRelease), [
    "odds",
    "pressure"
  ]);
});

test("collapse and order stay independent preferences", () => {
  const storedOrder = ["pressure", "decision", "statistics", "odds"];
  const storedCollapse = ["odds", "decision"];

  // Collapsing cannot move a module: the reconciled order is reached without
  // the collapse set ever being consulted.
  assert.deepEqual(reconcileModuleOrder(storedOrder, modules), storedOrder);
  // Reordering cannot open or close one either: the same collapse preference
  // survives whichever arrangement the surface is currently in.
  assert.deepEqual(
    reconcileCollapsedModules(storedCollapse, modules),
    storedCollapse
  );
  assert.deepEqual(
    reconcileCollapsedModules(storedCollapse, storedOrder),
    storedCollapse
  );
});

test("every published analytical module can be persisted as collapsed", () => {
  // Guards a rename: a module id that stops round-tripping here would silently
  // lose its collapse preference on the release that renamed it.
  for (const surface of ["liveDetail", "superDetail"] as const) {
    const ids = [...moduleLayoutDefaults[surface]];
    assert.ok(ids.length > 0);
    assert.deepEqual(reconcileCollapsedModules(ids, ids), ids);
  }
});

test("toggling closes an open module and reopens a closed one", () => {
  assert.deepEqual(toggleCollapsedModule([], "odds"), ["odds"]);
  assert.deepEqual(toggleCollapsedModule(["odds"], "odds"), []);
  assert.deepEqual(toggleCollapsedModule(["odds"], "pressure"), [
    "odds",
    "pressure"
  ]);
});

test("toggling one module leaves the others alone", () => {
  assert.deepEqual(
    toggleCollapsedModule(["odds", "pressure", "decision"], "pressure"),
    ["odds", "decision"]
  );
});

test("a still tap on a panel header toggles it", () => {
  assert.equal(press({ endedAt: 1_120 }), true);
});

test("a press that already armed the reorder hold does not toggle", () => {
  assert.equal(
    press({ endedAt: 1_000 + moduleReorderActivationDelayMs }),
    false
  );
  assert.equal(
    press({ endedAt: 1_000 + moduleReorderActivationDelayMs + 200 }),
    false
  );
});

test("a horizontal swipe across a header does not toggle it", () => {
  assert.equal(
    press({ endX: 100 + moduleReorderActivationSlop + 1, endedAt: 1_090 }),
    false
  );
  assert.equal(
    press({ endX: 100 - moduleReorderActivationSlop - 1, endedAt: 1_090 }),
    false
  );
});

test("a vertical scroll that starts on a header does not toggle it", () => {
  assert.equal(
    press({ endY: 200 - moduleReorderActivationSlop - 1, endedAt: 1_090 }),
    false
  );
});

test("travel within the slop still counts as a tap", () => {
  assert.equal(
    press({
      endX: 100 + moduleReorderActivationSlop,
      endY: 200 + moduleReorderActivationSlop,
      endedAt: 1_090
    }),
    true
  );
});
