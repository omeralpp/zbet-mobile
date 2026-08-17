import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

/* ---------------------------------------------------------------- *
 * Scene background — main-tab swipe white flash regression
 * ---------------------------------------------------------------- */

test("the tab navigator paints its own scene container", () => {
  // React Navigation's default theme background is rgb(242,242,242). The
  // navigator's scene container sits *behind* every screen, so `Screen`'s own
  // background cannot cover it: during the shift transition that container is
  // briefly visible between the two translated screens and reads as a white
  // flash on the dark theme. The stack already sets `contentStyle`, which is
  // why Detail -> List swipe-back never showed it.
  const layout = readFileSync(
    join(process.cwd(), "app/(tabs)/_layout.tsx"),
    "utf8"
  );

  assert.match(
    layout,
    /sceneStyle:\s*\{\s*backgroundColor:\s*colors\.background\s*\}/,
    "the tab navigator must paint its scene container with the theme background"
  );
});

test("the stack and the tabs agree on the transition background", () => {
  const stack = readFileSync(join(process.cwd(), "app/_layout.tsx"), "utf8");
  const tabs = readFileSync(
    join(process.cwd(), "app/(tabs)/_layout.tsx"),
    "utf8"
  );

  assert.match(stack, /contentStyle:\s*\{\s*backgroundColor:\s*colors\.background\s*\}/);
  assert.match(tabs, /sceneStyle:\s*\{\s*backgroundColor:\s*colors\.background\s*\}/);
});

test("no literal colour is hard-coded as the scene background", () => {
  const tabs = readFileSync(
    join(process.cwd(), "app/(tabs)/_layout.tsx"),
    "utf8"
  );

  // A literal would break the other theme; the token has to be the source.
  assert.equal(/sceneStyle:\s*\{\s*backgroundColor:\s*["'#]/.test(tabs), false);
});
