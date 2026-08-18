import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveSemanticColors,
  semanticCollisions,
  type SemanticPalette
} from "./semantic";

const palette: SemanticPalette = {
  background: "#bg",
  backgroundElevated: "#bge",
  surface: "#sf",
  surfaceStrong: "#sfs",
  border: "#bd",
  borderSoft: "#bds",
  text: "#tx",
  textMuted: "#txm",
  textSubtle: "#txs",
  blue: "#blue",
  blueSoft: "#blues",
  green: "#green",
  greenSoft: "#greens",
  gold: "#gold",
  goldSoft: "#golds",
  red: "#red",
  redSoft: "#reds",
  teal: "#teal",
  tealSoft: "#teals",
  orange: "#orange"
};

test("meaning maps onto the hue each surface already uses", () => {
  const semantic = resolveSemanticColors(palette);
  assert.equal(semantic.intelligence, palette.blue);
  assert.equal(semantic.positive, palette.green);
  assert.equal(semantic.negative, palette.red);
  assert.equal(semantic.live, palette.teal);
  assert.equal(semantic.stale, palette.gold);
  assert.equal(semantic.unavailable, palette.textSubtle);
});

test("a decision and a match state stay distinguishable from each other", () => {
  const semantic = resolveSemanticColors(palette);
  assert.notEqual(semantic.positive, semantic.negative);
  assert.notEqual(semantic.intelligence, semantic.positive);
  assert.notEqual(semantic.warning, semantic.positive);
});

test("every recorded collision is real", () => {
  const semantic = resolveSemanticColors(palette);
  for (const collision of semanticCollisions) {
    const [first, second] = collision.roles;
    assert.equal(
      semantic[first],
      semantic[second],
      `${first}/${second} is recorded as a collision but already resolves apart`
    );
    assert.ok(collision.note.length > 0);
  }
});

test("live state no longer borrows the colour of a lost decision", () => {
  const semantic = resolveSemanticColors(palette);
  assert.notEqual(
    semantic.live,
    semantic.negative,
    "a match in progress must not read as a decision that lost"
  );
  assert.notEqual(semantic.live, semantic.positive);
  assert.notEqual(
    semantic.live,
    semantic.intelligence,
    "live energy and BTB's analytical accent are different statements"
  );
  const stale = semanticCollisions.some(
    (collision) =>
      collision.roles.includes("live") && collision.roles.includes("negative")
  );
  assert.equal(stale, false, "the resolved overlap must leave the register");
});
