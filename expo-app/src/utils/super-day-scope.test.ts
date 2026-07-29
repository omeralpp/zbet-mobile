import assert from "node:assert/strict";
import test from "node:test";
import { getSuperDayScopeAction } from "./super-day-scope";

test("Karar Günlüğü gün kapsamı iki yönde değişir", () => {
  assert.deepEqual(getSuperDayScopeAction(true), {
    label: "Tüm günler",
    nextScope: null
  });
  assert.deepEqual(getSuperDayScopeAction(false), {
    label: "Bugün",
    nextScope: "LATEST_DAY"
  });
});
