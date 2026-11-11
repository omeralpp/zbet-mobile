import assert from "node:assert/strict";
import test from "node:test";
import { accessibleColors, statusText } from "./accessible-colors";
import { experiencePalettes } from "./experience-palette";
import { surfaceGradients } from "./surface";

function luminance(hex: string): number {
  const [r, g, b] = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * r! + .7152 * g! + .0722 * b!;
}
function contrast(first: string, second: string): number {
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
test("enabled action text clears 4.5:1 in both themes without rounding up", () => {
  for (const pair of Object.values(accessibleColors)) assert.ok(contrast(pair.actionFill, pair.onAction) >= 4.5);
});
test("body, secondary and action text clear 4.5:1 on approved reading surfaces", () => {
  for (const mode of ["dark", "light"] as const) {
    const palette = experiencePalettes[mode];
    for (const surface of [palette.background, palette.surface, palette.soft, ...surfaceGradients[mode]]) {
      for (const text of [palette.text, palette.muted, accessibleColors[mode].textSubtle, palette.blue])
        assert.ok(contrast(text, surface) >= 4.5, `${mode} ${text} on ${surface}`);
    }
  }
});
test("unearned stars clear 3:1 on the card surface in both themes (NXT-OBS-257)", () => {
  for (const mode of ["dark", "light"] as const) {
    const ratio = contrast(accessibleColors[mode].starOff, experiencePalettes[mode].surface);
    assert.ok(ratio >= 3, `${mode} star-off reads ${ratio.toFixed(2)}:1`);
    // Still clearly quieter than an earned star's gold.
    assert.ok(ratio < contrast(experiencePalettes[mode].warning, experiencePalettes[mode].surface), mode);
  }
});
test("positive status text clears 4.5:1 on its soft fill and on cards (NXT-OBS-256)", () => {
  for (const mode of ["dark", "light"] as const) {
    const palette = experiencePalettes[mode];
    for (const surface of [palette.accentSoft, palette.surface])
      assert.ok(contrast(statusText[mode].positive, surface) >= 4.5, `${mode} positive on ${surface}`);
  }
});
