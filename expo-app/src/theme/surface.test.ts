import assert from "node:assert/strict";
import test from "node:test";
import {
  contrastRatio,
  keepsCardEdgeReadable,
  keepsEnergyScarce,
  pageBackgrounds,
  resolveEdgeTrace,
  resolveSurfaceGradient,
  traceOpacity,
  traceWidthRatio
} from "./surface";

/** Separation the flat fill had before the material existed. */
const flatSurfaceSeparation = {
  dark: contrastRatio("#0A1D31", pageBackgrounds.dark),
  light: contrastRatio("#FFFFFF", pageBackgrounds.light)
};

test("a trace can never close into a border", () => {
  assert.ok(
    traceWidthRatio < 1,
    "a full-width trace is an outline, which is the neon failure this avoids"
  );
  assert.equal(resolveEdgeTrace(undefined, "#111111").widthRatio, traceWidthRatio);
  assert.equal(resolveEdgeTrace("#3AD9CB", "#111111").widthRatio, traceWidthRatio);
});

test("a trace always fades out rather than stopping flat", () => {
  const trace = resolveEdgeTrace("#3AD9CB", "#111111");
  assert.deepEqual(trace.colors, ["#3AD9CB", "#3AD9CB00"]);
});

test("an inert surface stays quiet and borrows no colour of its own", () => {
  const inert = resolveEdgeTrace(undefined, "#173B59");
  assert.deepEqual(inert.colors, ["#173B59", "#173B5900"]);
  assert.equal(inert.opacity, traceOpacity.inert);
});

test("energy is reserved for surfaces that report something", () => {
  const inert = resolveEdgeTrace(undefined, "#173B59");
  const lit = resolveEdgeTrace("#3AD9CB", "#173B59");
  assert.ok(
    lit.opacity > inert.opacity,
    "a live card must be brighter than the calm ones around it"
  );
});

test("card material is lit from the top and sinks at the bottom", () => {
  const [top, bottom] = resolveSurfaceGradient("dark");
  assert.notEqual(top, bottom, "a flat fill is not material");
  assert.ok(top > bottom, "the dark top stop is the lighter of the pair");
});

test("depth is never bought with the edge of the card", () => {
  // The failure this guards is one-sided and easy to miss by eye: a gradient can
  // lift its top edge convincingly while sinking its bottom into the page, and
  // the cards then dissolve downward. Every stop stays at least as separated as
  // the flat fill it replaced.
  assert.ok(
    keepsCardEdgeReadable(
      resolveSurfaceGradient("dark"),
      pageBackgrounds.dark,
      flatSurfaceSeparation.dark
    ),
    "a dark card must keep both edges readable against the page"
  );
});

test("a light card stays lighter than the page it sits on", () => {
  const [top, bottom] = resolveSurfaceGradient("light");
  assert.ok(top > pageBackgrounds.light);
  assert.ok(
    bottom > pageBackgrounds.light,
    "shading a light card past its own page inverts the material"
  );
});

test("the material adds real depth rather than a token gradient", () => {
  const dark = resolveSurfaceGradient("dark");
  assert.ok(
    contrastRatio(dark[0], pageBackgrounds.dark) >
      contrastRatio("#0A1D31", pageBackgrounds.dark),
    "the lit top edge is the point: it must beat the old flat fill"
  );
});

test("both themes define their own material", () => {
  assert.notDeepEqual(
    resolveSurfaceGradient("dark"),
    resolveSurfaceGradient("light")
  );
});

test("scarcity holds only while most surfaces stay calm", () => {
  assert.equal(keepsEnergyScarce(2, 8), true);
  assert.equal(keepsEnergyScarce(4, 8), true);
  assert.equal(keepsEnergyScarce(5, 8), false, "if most cards glow, none does");
  assert.equal(keepsEnergyScarce(0, 0), true);
});
