import assert from "node:assert/strict";
import test from "node:test";
import { moveModule, resolveVisibleMove } from "./module-layout";
import { moduleLayoutDefaults } from "./module-registry";
import { moduleReorderLabel, resolveModuleStep } from "./module-reorder-accessibility";

test("accessible moves reject boundaries and modules no longer visible", () => {
  const ids = ["pressure", "odds", "statistics"];
  assert.equal(resolveModuleStep(ids, "pressure", -1), null);
  assert.equal(resolveModuleStep(ids, "statistics", 1), null);
  assert.equal(resolveModuleStep(ids, "decision", 1), null);
  assert.equal(resolveModuleStep([], "pressure", 1), null);
});

test("repeated accessible moves resolve the current position and announce it", () => {
  const ids = ["pressure", "odds", "statistics"];
  const first = resolveModuleStep(ids, "pressure", 1);
  assert.ok(first);
  assert.deepEqual([first.from, first.to], [0, 1]);
  assert.equal(first.announcement, "Baskı grafiği, toplam 3 bölümün 2. sırasına taşındı.");
  const next = moveModule(ids, first.from, first.to);
  const second = resolveModuleStep(next, "pressure", 1);
  assert.ok(second);
  assert.deepEqual([second.from, second.to], [1, 2]);
  assert.equal(second.announcement, "Baskı grafiği, toplam 3 bölümün 3. sırasına taşındı.");
});

test("accessible visible moves use the existing persisted-order mapping", () => {
  const stored = ["decision", "pressure", "teamForm", "odds", "statistics"];
  const visible = ["pressure", "odds", "statistics"];
  const step = resolveModuleStep(visible, "odds", -1);
  assert.ok(step);
  const mapped = resolveVisibleMove(stored, visible, step.from, step.to);
  assert.ok(mapped);
  assert.deepEqual(moveModule(stored, mapped.from, mapped.to), [
    "decision", "odds", "pressure", "teamForm", "statistics"
  ]);
});

test("every customizable module has a human-readable spoken name", () => {
  for (const id of Object.values(moduleLayoutDefaults).flat()) {
    assert.notEqual(moduleReorderLabel(id), "Bölüm", id);
    assert.notEqual(moduleReorderLabel(id), id, id);
  }
  assert.equal(moduleReorderLabel("future-module"), "Bölüm");
});
