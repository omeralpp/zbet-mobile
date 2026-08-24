import assert from "node:assert/strict";
import test from "node:test";
import {
  equalPinnedKeys,
  normalizeStoredPinnedKeys,
  reconcilePinnedKeys,
  serializePinnedKeys,
  splitPinnedMatches,
  togglePinnedKey
} from "./pinned-matches";

test("normalizes pinned storage without malformed or duplicate keys", () => {
  assert.deepEqual(
    [...normalizeStoredPinnedKeys('[" match-2 ","match-1","match-2",5,null]')],
    ["match-2", "match-1"]
  );
  assert.equal(normalizeStoredPinnedKeys("not-json").size, 0);
  assert.equal(normalizeStoredPinnedKeys('{"match-1":true}').size, 0);
});

test("toggles a pin without mutating the previous selection", () => {
  const current = new Set(["match-1"]);
  const added = togglePinnedKey(current, "match-2");
  const removed = togglePinnedKey(added, "match-1");

  assert.deepEqual([...current], ["match-1"]);
  assert.deepEqual([...added], ["match-1", "match-2"]);
  assert.deepEqual([...removed], ["match-2"]);
});

test("reconciles pins to the successful current feed", () => {
  const reconciled = reconcilePinnedKeys(
    new Set(["live", "fixture", "finished", "missing"]),
    ["fixture", "live", "finished"]
  );

  assert.deepEqual([...reconciled], ["live", "fixture", "finished"]);
  assert.equal(
    equalPinnedKeys(reconciled, new Set(["fixture", "live", "finished"])),
    true
  );
  assert.equal(serializePinnedKeys(reconciled), '["finished","fixture","live"]');
});

test("moves pinned matches to the front partition and preserves feed order", () => {
  const matches = [{ key: "a" }, { key: "b" }, { key: "c" }];
  const split = splitPinnedMatches(matches, new Set(["c", "a"]));

  assert.deepEqual(split.pinned, [{ key: "a" }, { key: "c" }]);
  assert.deepEqual(split.regular, [{ key: "b" }]);
  assert.deepEqual(matches, [{ key: "a" }, { key: "b" }, { key: "c" }]);
});
