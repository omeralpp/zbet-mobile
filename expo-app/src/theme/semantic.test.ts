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
  orange: "#orange"
};

test("meaning maps onto the hue each surface already uses", () => {
  const semantic = resolveSemanticColors(palette);
  assert.equal(semantic.intelligence, palette.blue);
  assert.equal(semantic.positive, palette.green);
  assert.equal(semantic.negative, palette.red);
  assert.equal(semantic.live, palette.red);
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

test("the live and negative collision stays flagged for the owner", () => {
  const live = semanticCollisions.find(
    (collision) =>
      collision.roles.includes("live") && collision.roles.includes("negative")
  );
  assert.ok(live, "the live and negative overlap must stay on the register");
  assert.equal(live?.ownerDecision, true);
});
