import assert from "node:assert/strict";
import test from "node:test";
import {
  moduleLayoutStorageKey,
  moduleLayoutSurfaces,
  moveModule,
  parseStoredModuleOrder,
  reconcileModuleOrder,
  resolveDropIndex,
  resolveVisibleMove
} from "./module-layout";

const defaults = ["pressure", "gamePulse", "odds", "statistics"] as const;

test("keeps one distinct persistence key per surface", () => {
  const keys = moduleLayoutSurfaces.map(moduleLayoutStorageKey);
  assert.equal(new Set(keys).size, moduleLayoutSurfaces.length);
  assert.equal(
    moduleLayoutStorageKey("liveDetail"),
    "btb-mobile-next-module-layout-liveDetail-v1"
  );
});

test("returns the canonical default when nothing is stored", () => {
  assert.deepEqual(reconcileModuleOrder(null, defaults), [...defaults]);
  assert.deepEqual(reconcileModuleOrder(undefined, defaults), [...defaults]);
});

test("restores a valid custom order exactly", () => {
  const stored = ["odds", "pressure", "statistics", "gamePulse"];
  assert.deepEqual(reconcileModuleOrder(stored, defaults), stored);
});

test("ignores removed or unknown module ids", () => {
  assert.deepEqual(
    reconcileModuleOrder(["odds", "retiredModule", "pressure"], defaults),
    ["odds", "pressure", "gamePulse", "statistics"]
  );
});

test("appends a newly introduced default module instead of hiding it", () => {
  const stored = ["pressure", "gamePulse", "odds", "statistics"];
  const nextRelease = [...defaults, "xGAnalysis"] as const;
  assert.deepEqual(reconcileModuleOrder(stored, nextRelease), [
    "pressure",
    "gamePulse",
    "odds",
    "statistics",
    "xGAnalysis"
  ]);
});

test("keeps Game Pulse in a stored order and adds it when it is new", () => {
  assert.deepEqual(
    reconcileModuleOrder(["gamePulse", "pressure", "odds", "statistics"], defaults),
    ["gamePulse", "pressure", "odds", "statistics"]
  );
  assert.deepEqual(
    reconcileModuleOrder(["pressure", "odds", "statistics"], defaults),
    ["pressure", "odds", "statistics", "gamePulse"]
  );
});

test("repairs duplicated module ids by keeping the first slot", () => {
  assert.deepEqual(
    reconcileModuleOrder(
      ["odds", "pressure", "odds", "gamePulse", "pressure"],
      defaults
    ),
    ["odds", "pressure", "gamePulse", "statistics"]
  );
});

test("falls back to the canonical default for corrupted storage", () => {
  assert.deepEqual(reconcileModuleOrder("not-an-array", defaults), [...defaults]);
  assert.deepEqual(reconcileModuleOrder({ order: [] }, defaults), [...defaults]);
  assert.deepEqual(reconcileModuleOrder([1, 2, 3], defaults), [...defaults]);
  assert.deepEqual(
    reconcileModuleOrder(parseStoredModuleOrder("{oops"), defaults),
    [...defaults]
  );
  assert.deepEqual(
    reconcileModuleOrder(parseStoredModuleOrder(null), defaults),
    [...defaults]
  );
});

test("round-trips a stored order through serialized storage text", () => {
  const stored = ["statistics", "odds", "gamePulse", "pressure"];
  assert.deepEqual(
    reconcileModuleOrder(
      parseStoredModuleOrder(JSON.stringify(stored)),
      defaults
    ),
    stored
  );
});

test("moves a module without losing or duplicating entries", () => {
  assert.deepEqual(moveModule(defaults, 0, 2), [
    "gamePulse",
    "odds",
    "pressure",
    "statistics"
  ]);
  assert.deepEqual(moveModule(defaults, 3, 0), [
    "statistics",
    "pressure",
    "gamePulse",
    "odds"
  ]);
});

test("leaves the order untouched for an out-of-range or no-op move", () => {
  assert.deepEqual(moveModule(defaults, 1, 1), [...defaults]);
  assert.deepEqual(moveModule(defaults, -1, 2), [...defaults]);
  assert.deepEqual(moveModule(defaults, 0, 9), [...defaults]);
});

test("maps a drag between visible modules onto stored slots", () => {
  const order = ["pressure", "gamePulse", "odds", "statistics"];
  const visible = ["pressure", "odds", "statistics"];

  assert.deepEqual(resolveVisibleMove(order, visible, 0, 2), {
    from: 0,
    to: 3
  });
  assert.deepEqual(
    moveModule(order, 0, 3),
    ["gamePulse", "odds", "statistics", "pressure"]
  );

  assert.deepEqual(resolveVisibleMove(order, visible, 2, 0), {
    from: 3,
    to: 0
  });
  assert.deepEqual(
    moveModule(order, 3, 0),
    ["statistics", "pressure", "gamePulse", "odds"]
  );
});

test("keeps a hidden module in place when visible modules move around it", () => {
  const order = ["a", "hidden", "b"];
  const move = resolveVisibleMove(order, ["a", "b"], 0, 1);
  assert.ok(move);
  assert.deepEqual(moveModule(order, move.from, move.to), ["hidden", "b", "a"]);
});

test("ignores a visible move that cannot be mapped", () => {
  const order = ["a", "b"];
  assert.equal(resolveVisibleMove(order, ["a", "b"], 0, 0), null);
  assert.equal(resolveVisibleMove(order, ["a", "b"], 0, 5), null);
  assert.equal(resolveVisibleMove(order, ["a", "ghost"], 0, 1), null);
});

test("resolves the drop slot from travelled distance and neighbour heights", () => {
  const heights = [100, 200, 120, 80];
  assert.equal(resolveDropIndex(heights, 0, 40), 0);
  assert.equal(resolveDropIndex(heights, 0, 140), 1);
  assert.equal(resolveDropIndex(heights, 0, 400), 3);
  assert.equal(resolveDropIndex(heights, 3, -50), 3);
  assert.equal(resolveDropIndex(heights, 3, -80), 2);
  assert.equal(resolveDropIndex(heights, 3, -1000), 0);
});

/* ---------------------------------------------------------------- *
 * Existing-install migration for modules introduced later
 * ---------------------------------------------------------------- */

const liveDefaults = [
  "decision",
  "gamePulse",
  "timeline",
  "relatedSuper",
  "standings",
  "odds",
  "statistics",
  "pressure",
  "scoreDistribution"
];

const liveAnchors = [{ id: "timeline", after: "gamePulse" }];

/** The persisted liveDetail order shipped before Live Context v1. */
const legacyStored = [
  "decision",
  "gamePulse",
  "relatedSuper",
  "standings",
  "odds",
  "statistics",
  "pressure",
  "scoreDistribution"
];

test("a fresh layout uses the intended default order", () => {
  assert.deepEqual(
    reconcileModuleOrder(null, liveDefaults, liveAnchors),
    liveDefaults
  );
});

test("a legacy layout gains timeline after gamePulse", () => {
  assert.deepEqual(reconcileModuleOrder(legacyStored, liveDefaults, liveAnchors), [
    "decision",
    "gamePulse",
    "timeline",
    "relatedSuper",
    "standings",
    "odds",
    "statistics",
    "pressure",
    "scoreDistribution"
  ]);
});

test("a reordered legacy layout keeps its relative order", () => {
  const userOrder = [
    "odds",
    "decision",
    "scoreDistribution",
    "gamePulse",
    "statistics",
    "relatedSuper",
    "standings",
    "pressure"
  ];

  const migrated = reconcileModuleOrder(userOrder, liveDefaults, liveAnchors);

  assert.deepEqual(migrated, [
    "odds",
    "decision",
    "scoreDistribution",
    "gamePulse",
    "timeline",
    "statistics",
    "relatedSuper",
    "standings",
    "pressure"
  ]);

  // Every previously stored module keeps its relative order among itself.
  const before = migrated.filter((id) => userOrder.includes(id));
  assert.deepEqual(before, userOrder);
});

test("the migration is idempotent", () => {
  const once = reconcileModuleOrder(legacyStored, liveDefaults, liveAnchors);
  const twice = reconcileModuleOrder(once, liveDefaults, liveAnchors);
  const thrice = reconcileModuleOrder(twice, liveDefaults, liveAnchors);

  assert.deepEqual(twice, once);
  assert.deepEqual(thrice, once);
});

test("a user-moved timeline is never repositioned again", () => {
  // Once persisted, position belongs to the user — including at the very end,
  // which is exactly where the un-migrated build had put it.
  const userMoved = [
    "decision",
    "gamePulse",
    "relatedSuper",
    "standings",
    "odds",
    "statistics",
    "pressure",
    "scoreDistribution",
    "timeline"
  ];

  assert.deepEqual(
    reconcileModuleOrder(userMoved, liveDefaults, liveAnchors),
    userMoved
  );
});

test("a timeline moved to the top stays at the top", () => {
  const userMoved = [
    "timeline",
    "decision",
    "gamePulse",
    "relatedSuper",
    "standings",
    "odds",
    "statistics",
    "pressure",
    "scoreDistribution"
  ];

  assert.deepEqual(
    reconcileModuleOrder(userMoved, liveDefaults, liveAnchors),
    userMoved
  );
});

test("a missing anchor falls back to appending rather than hiding", () => {
  // gamePulse absent from the stored layout: timeline anchors on nothing.
  const withoutAnchor = ["decision", "odds", "statistics"];

  const migrated = reconcileModuleOrder(
    withoutAnchor,
    liveDefaults,
    liveAnchors
  );

  assert.equal(migrated.includes("timeline"), true);
  for (const id of withoutAnchor) {
    assert.equal(migrated.includes(id), true);
  }
});

test("anchors never drop, duplicate or hide a module", () => {
  const migrated = reconcileModuleOrder(legacyStored, liveDefaults, liveAnchors);

  assert.equal(migrated.length, liveDefaults.length);
  assert.equal(new Set(migrated).size, migrated.length);
  for (const id of liveDefaults) {
    assert.equal(migrated.includes(id), true, `${id} must survive`);
  }
});

test("surfaces without anchors are unaffected", () => {
  const overviewDefaults = ["hero", "metrics", "featured", "recentSuper", "toto"];
  const stored = ["toto", "hero", "metrics"];

  assert.deepEqual(reconcileModuleOrder(stored, overviewDefaults, []), [
    "toto",
    "hero",
    "metrics",
    "featured",
    "recentSuper"
  ]);
});

test("a retired module is dropped from an existing install's layout", () => {
  // `lineups` shipped with Live Context v1 and was removed when the slice
  // narrowed to goals and red cards. Reconciliation is the whole migration:
  // an id that is no longer canonical is dropped on the next read, so nothing
  // has to be written to storage to retire a module.
  const storedWithRetired = [
    "decision",
    "gamePulse",
    "timeline",
    "lineups",
    "relatedSuper",
    "standings",
    "odds",
    "statistics",
    "pressure",
    "scoreDistribution"
  ];

  const migrated = reconcileModuleOrder(
    storedWithRetired,
    liveDefaults,
    liveAnchors
  );

  assert.equal(migrated.includes("lineups"), false);
  // Every surviving module keeps the position the user arranged.
  assert.deepEqual(
    migrated,
    storedWithRetired.filter((id) => id !== "lineups")
  );
});

test("a retired module does not disturb a user's custom order", () => {
  const userOrder = [
    "odds",
    "lineups",
    "decision",
    "timeline",
    "gamePulse",
    "relatedSuper",
    "standings",
    "statistics",
    "pressure",
    "scoreDistribution"
  ];

  const migrated = reconcileModuleOrder(userOrder, liveDefaults, liveAnchors);

  assert.equal(migrated.includes("lineups"), false);
  // timeline was already stored, so the anchor must not move it back.
  assert.equal(migrated.indexOf("timeline"), 2);
  assert.equal(migrated[0], "odds");
});
