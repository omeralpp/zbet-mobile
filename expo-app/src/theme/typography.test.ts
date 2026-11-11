import assert from "node:assert/strict";
import test from "node:test";
import {
  fontFamilies,
  desktopTypeStep,
  hasReadableLineBox,
  loadedOnDesktop,
  minimumFontSize,
  renderableWeights,
  smallTextCeiling,
  typeScale,
  type TypeRole
} from "./typography";

const roles = Object.entries(typeScale) as [string, TypeRole][];

test("no role drops below the readable floor", () => {
  for (const [name, role] of roles) {
    assert.ok(
      role.fontSize >= minimumFontSize,
      `${name} renders at ${role.fontSize}pt, below the ${minimumFontSize}pt floor`
    );
  }
});

test("every weight resolves to a bundled face", () => {
  for (const [name, role] of roles) {
    assert.ok(
      renderableWeights.includes(role.fontWeight),
      `${name} asks for ${role.fontWeight}, which resolves to another face`
    );
  }
});

test("numerics use the condensed family and words use the text family", () => {
  const numeric = ["display", "score", "metric", "metricCompact"];
  for (const [name, role] of roles) {
    assert.equal(
      role.fontFamily,
      numeric.includes(name) ? fontFamilies.numeric : fontFamilies.text,
      `${name} uses the wrong family`
    );
  }
});

test("line boxes leave room for Turkish descenders and dotted capitals", () => {
  for (const [name, role] of roles) {
    assert.ok(hasReadableLineBox(role), `${name} clips its own glyphs`);
  }
});

test("prose is lighter than the numerics it sits under", () => {
  assert.ok(
    Number(typeScale.body.fontWeight) < Number(typeScale.metric.fontWeight)
  );
  assert.ok(
    Number(typeScale.bodyCompact.fontWeight) < Number(typeScale.score.fontWeight)
  );
  assert.ok(
    Number(typeScale.identity.fontWeight) < Number(typeScale.display.fontWeight)
  );
});

test("the scale keeps its headline order", () => {
  assert.ok(typeScale.display.fontSize > typeScale.pageTitle.fontSize);
  assert.ok(typeScale.pageTitle.fontSize > typeScale.moduleTitle.fontSize);
  assert.ok(typeScale.moduleTitle.fontSize > typeScale.decision.fontSize);
  assert.ok(typeScale.decision.fontSize > typeScale.identity.fontSize);
  assert.ok(typeScale.metric.fontSize > typeScale.metricCompact.fontSize);
});

test("only the tracked kicker is uppercased", () => {
  const uppercased = roles
    .filter(([, role]) => role.textTransform === "uppercase")
    .map(([name]) => name);
  assert.deepEqual(uppercased, ["eyebrow"]);
  assert.ok(typeScale.eyebrow.letterSpacing >= 1);
});

test("only the hero numeric tightens and small text opens up", () => {
  assert.ok(typeScale.display.letterSpacing < 0);
  assert.ok(typeScale.score.letterSpacing <= 0);
  assert.ok(typeScale.micro.letterSpacing > 0);
  assert.ok(typeScale.label.letterSpacing > 0);
});

test("the desktop step lifts only the small roles, by one point (NXT-OBS-252)", () => {
  const stepped = desktopTypeStep(typeScale);
  for (const [name, role] of roles) {
    const next = stepped[name as keyof typeof typeScale];
    const small = role.fontSize <= smallTextCeiling;
    assert.equal(next.fontSize, role.fontSize + (small ? 1 : 0), name);
    assert.equal(next.lineHeight, role.lineHeight + (small ? 1 : 0), name);
    assert.ok(hasReadableLineBox(next), `${name} clips after the step`);
    assert.equal(next.fontWeight, role.fontWeight, name);
    assert.equal(next.fontFamily, role.fontFamily, name);
  }
  assert.ok(roles.some(([, role]) => role.fontSize <= smallTextCeiling));
  assert.equal(stepped.display.fontSize, typeScale.display.fontSize);
});

test("Android and the unit tests keep the base scale", () => {
  assert.equal(loadedOnDesktop(), false);
  assert.equal(typeScale.label.fontSize, 12);
  assert.equal(typeScale.micro.fontSize, minimumFontSize);
});
