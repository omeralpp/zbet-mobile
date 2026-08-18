import assert from "node:assert/strict";
import test from "node:test";
import {
  isSingleDepthTreatment,
  resolveDepth,
  type DepthPalette
} from "./elevation";

const palette: DepthPalette = {
  border: "#border",
  borderSoft: "#borderSoft",
  shadow: "#000000"
};

test("flat carries structure and nothing else", () => {
  const flat = resolveDepth("flat", palette, "dark");
  assert.equal(flat.borderColor, palette.borderSoft);
  assert.equal(flat.shadowColor, undefined);
  assert.equal(flat.elevation, undefined);
});

test("the ladder rises rather than repeating itself", () => {
  const raised = resolveDepth("raised", palette, "dark");
  const floating = resolveDepth("floating", palette, "dark");
  assert.ok((floating.elevation ?? 0) > (raised.elevation ?? 0));
  assert.ok((floating.shadowRadius ?? 0) > (raised.shadowRadius ?? 0));
  assert.ok((floating.shadowOpacity ?? 0) > (raised.shadowOpacity ?? 0));
});

test("dark surfaces need a heavier shadow than light ones", () => {
  const dark = resolveDepth("raised", palette, "dark");
  const light = resolveDepth("raised", palette, "light");
  assert.ok((dark.shadowOpacity ?? 0) > (light.shadowOpacity ?? 0));
});

test("glow is edge lighting, not a drop shadow", () => {
  const glow = resolveDepth("glow", palette, "dark", "#live");
  assert.deepEqual(glow.shadowOffset, { width: 0, height: 0 });
  assert.equal(glow.shadowColor, "#live");
  assert.equal(glow.borderColor, "#live");
});

test("glow without a meaning falls back instead of inventing one", () => {
  const glow = resolveDepth("glow", palette, "dark");
  assert.equal(glow.borderColor, palette.border);
  assert.equal(glow.shadowColor, palette.border);
});

test("a surface picks one rung", () => {
  assert.equal(isSingleDepthTreatment([]), true);
  assert.equal(isSingleDepthTreatment(["raised"]), true);
  assert.equal(isSingleDepthTreatment(["raised", "glow"]), false);
});
