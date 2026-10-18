import assert from "node:assert/strict";
import test from "node:test";
import { dialogKeyAction, suspendDialogBackground } from "./dialog-focus";

test("Tab wraps at both boundaries and recovers focus from outside the dialog", () => {
  assert.deepEqual(dialogKeyAction("Tab", false, 2, 3), { kind: "focus", index: 0 });
  assert.deepEqual(dialogKeyAction("Tab", true, 0, 3), { kind: "focus", index: 2 });
  assert.deepEqual(dialogKeyAction("Tab", false, -1, 3), { kind: "focus", index: 0 });
  assert.deepEqual(dialogKeyAction("Tab", true, -1, 3), { kind: "focus", index: 2 });
  assert.deepEqual(dialogKeyAction("Tab", false, 1, 3), { kind: "none" });
});
test("empty and one-control dialogs cannot send Tab behind the modal", () => {
  assert.deepEqual(dialogKeyAction("Tab", false, -1, 0), { kind: "focus", index: -1 });
  assert.deepEqual(dialogKeyAction("Tab", true, 0, 1), { kind: "focus", index: 0 });
  assert.deepEqual(dialogKeyAction("Escape", false, 0, 1), { kind: "close" });
  assert.deepEqual(dialogKeyAction("ArrowDown", false, 0, 1), { kind: "none" });
});
test("closing a dialog preserves pre-existing inert and aria-hidden states", () => {
  function element(inert: boolean, hidden: string | null) {
    const attrs = new Map<string, string>(hidden === null ? [] : [["aria-hidden", hidden]]);
    return { inert, getAttribute: (name: string) => attrs.get(name) ?? null, setAttribute: (name: string, value: string) => { attrs.set(name, value); }, removeAttribute: (name: string) => { attrs.delete(name); } };
  }
  const page = element(false, null), alreadyHidden = element(true, "false");
  const restore = suspendDialogBackground([page, alreadyHidden]);
  assert.equal(page.inert, true);
  assert.equal(page.getAttribute("aria-hidden"), "true");
  restore();
  assert.equal(page.inert, false);
  assert.equal(page.getAttribute("aria-hidden"), null);
  assert.equal(alreadyHidden.inert, true);
  assert.equal(alreadyHidden.getAttribute("aria-hidden"), "false");
});
