import assert from "node:assert/strict";
import test from "node:test";
import { activeDestination } from "./desktop-nav";
import { chordWindowMs, createShortcutReader, type ShortcutKey } from "./shortcuts";

function key(value: string, at: number, extra: Partial<ShortcutKey> = {}): ShortcutKey {
  return { key: value, ctrlKey: false, metaKey: false, altKey: false, editable: false, at, ...extra };
}

test("g chords navigate to each top-level destination", () => {
  const read = createShortcutReader();
  const paths = ["o", "l", "s", "t", "m"].map((second, index) => {
    assert.equal(read(key("g", index * 10_000)), null);
    return read(key(second, index * 10_000 + 200));
  });
  assert.deepEqual(
    paths.map((action) => (action?.kind === "navigate" ? action.path : null)),
    ["/", "/live", "/super", "/toto", "/more"]
  );
});

test("a chord expires and an unknown second key does nothing", () => {
  const read = createShortcutReader();
  read(key("g", 0));
  assert.equal(read(key("l", chordWindowMs + 1)), null);
  read(key("g", 10_000));
  assert.equal(read(key("x", 10_100)), null);
  assert.equal(read(key("l", 10_200)), null);
});

test("typing in a field never navigates, but Ctrl+K still opens the palette", () => {
  const read = createShortcutReader();
  assert.equal(read(key("g", 0, { editable: true })), null);
  assert.equal(read(key("l", 100, { editable: true })), null);
  assert.equal(read(key("/", 200, { editable: true })), null);
  assert.deepEqual(read(key("k", 300, { editable: true, ctrlKey: true })), { kind: "palette" });
  assert.deepEqual(read(key("K", 400, { metaKey: true })), { kind: "palette" });
});

test("help, palette and escape keys", () => {
  const read = createShortcutReader();
  assert.deepEqual(read(key("?", 0)), { kind: "help" });
  assert.deepEqual(read(key("/", 10)), { kind: "palette" });
  assert.deepEqual(read(key("Escape", 20)), { kind: "escape" });
  assert.equal(read(key("k", 30)), null);
  assert.equal(read(key("k", 40, { ctrlKey: true, altKey: true })), null);
});

test("detail screens keep their tab active in the sidebar", () => {
  assert.equal(activeDestination("/"), "index");
  assert.equal(activeDestination("/live"), "live");
  assert.equal(activeDestination("/match/2026-07-28:472961:19:15:00"), "live");
  assert.equal(activeDestination("/super/super-472780-82"), "super");
  assert.equal(activeDestination("/toto/350/1?from=%2Ftoto"), "toto");
  assert.equal(activeDestination("/more"), "more");
});
