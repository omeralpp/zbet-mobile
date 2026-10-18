import assert from "node:assert/strict";
import test from "node:test";
import { accessibleColors } from "./accessible-colors";
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
