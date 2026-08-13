import assert from "node:assert/strict";
import test from "node:test";
import { adjacentMainTab } from "./main-tabs";

test("moves between main tabs without wrapping", () => {
  assert.equal(adjacentMainTab("/", "NEXT"), "/live");
  assert.equal(adjacentMainTab("/super", "PREVIOUS"), "/live");
  assert.equal(adjacentMainTab("/more", "NEXT"), null);
  assert.equal(adjacentMainTab("/", "PREVIOUS"), null);
});

test("does not activate on detail routes", () => {
  assert.equal(adjacentMainTab("/match/example", "NEXT"), null);
});
