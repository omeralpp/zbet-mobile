import assert from "node:assert/strict";
import test from "node:test";
import { liveEmptyKind } from "./live-list-state";

test("a search miss in a populated fixture scope is not an absence of fixtures", () => {
  for (const tab of ["LIVE", "FIXTURE", "STAR"] as const) {
    assert.equal(liveEmptyKind(tab, true, false, false), "SEARCH");
  }
});

test("selection loading and unavailable evidence cannot be presented as zero search results", () => {
  for (const hasSearch of [true, false]) {
    assert.equal(liveEmptyKind("STAR", hasSearch, true, true), "LOADING");
    assert.equal(liveEmptyKind("STAR", hasSearch, false, true), "UNAVAILABLE");
  }
});

test("a missing selection report does not block the live or fixture list", () => {
  assert.equal(liveEmptyKind("LIVE", false, true, true), "NO_LIVE");
  assert.equal(liveEmptyKind("FIXTURE", false, false, true), "NO_FIXTURE");
  assert.equal(liveEmptyKind("LIVE", true, false, true), "SEARCH");
});

test("an empty scope retains its actual live, fixture or star-filter meaning", () => {
  assert.equal(liveEmptyKind("LIVE", false, false, false), "NO_LIVE");
  assert.equal(liveEmptyKind("FIXTURE", false, false, false), "NO_FIXTURE");
  assert.equal(liveEmptyKind("STAR", false, false, false), "NO_SELECTION");
});
