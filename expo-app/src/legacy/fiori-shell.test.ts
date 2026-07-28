import assert from "node:assert/strict";
import test from "node:test";
import { fioriShellFocusScript } from "./fiori-shell";

test("Fiori tam ekran betiği resmi renderer API'siyle shell başlığını gizler", () => {
  assert.match(fioriShellFocusScript, /getRenderer\("fiori2"\)/);
  assert.match(
    fioriShellFocusScript,
    /setHeaderVisibility\(false, true\)/
  );
  assert.match(fioriShellFocusScript, /hashchange/);
});
