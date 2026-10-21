import assert from "node:assert/strict";
import test from "node:test";
import { parseSidebarPreference, resolveSidebarExpanded } from "./sidebar-preference";

test("only the two known choices are read back from storage", () => {
  assert.equal(parseSidebarPreference("expanded"), "expanded");
  assert.equal(parseSidebarPreference("collapsed"), "collapsed");
  assert.equal(parseSidebarPreference("open"), null);
  assert.equal(parseSidebarPreference(null), null);
  assert.equal(parseSidebarPreference(undefined), null);
});

test("without a choice the window width decides", () => {
  assert.equal(resolveSidebarExpanded(null, true), true);
  assert.equal(resolveSidebarExpanded(null, false), false);
});

test("a saved choice wins at every width", () => {
  assert.equal(resolveSidebarExpanded("collapsed", true), false);
  assert.equal(resolveSidebarExpanded("expanded", false), true);
});
