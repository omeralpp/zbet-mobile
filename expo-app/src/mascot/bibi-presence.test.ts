import assert from "node:assert/strict";
import test from "node:test";
import {
  allowsAmbientBibi,
  bibiPresence,
  shouldRenderBibi
} from "./bibi-presence";

test("dense analytical detail surfaces lose the ambient mascot", () => {
  assert.equal(bibiPresence("/match/2026-08-18-PSG-AVL"), "GUIDE_ONLY");
  assert.equal(bibiPresence("/super/8871"), "GUIDE_ONLY");
});

test("brand, orientation and helper surfaces keep Bibi", () => {
  assert.equal(bibiPresence("/"), "FULL");
  assert.equal(bibiPresence("/live"), "FULL");
  assert.equal(bibiPresence("/toto"), "FULL");
  assert.equal(bibiPresence("/more"), "FULL");
  assert.equal(bibiPresence("/sign-in"), "FULL");
});

test("a list and its detail are told apart by the segment boundary", () => {
  assert.equal(bibiPresence("/super"), "FULL", "the decision log is a list");
  assert.equal(bibiPresence("/super/1234"), "GUIDE_ONLY");
  assert.equal(
    bibiPresence("/super/"),
    "FULL",
    "a bare prefix names no decision, so it reads as the list"
  );
});

test("an unresolved pathname does not silently hide Bibi", () => {
  assert.equal(bibiPresence(null), "FULL");
  assert.equal(bibiPresence(undefined), "FULL");
  assert.equal(bibiPresence(""), "FULL");
});

test("ambient behaviour belongs to full presence only", () => {
  assert.equal(allowsAmbientBibi("FULL"), true);
  assert.equal(allowsAmbientBibi("GUIDE_ONLY"), false);
});

test("the tutorial still reaches the surfaces it targets", () => {
  assert.equal(
    shouldRenderBibi("GUIDE_ONLY", true),
    true,
    "tutorial steps target /match/ and /super/ and Bibi is what renders them"
  );
  assert.equal(shouldRenderBibi("GUIDE_ONLY", false), false);
});

test("full presence does not wait for a tutorial step", () => {
  assert.equal(shouldRenderBibi("FULL", false), true);
  assert.equal(shouldRenderBibi("FULL", true), true);
});
