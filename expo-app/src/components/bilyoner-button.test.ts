import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

// NXT-OBS-243: one Bilyoner action, one size and one spelling across the app.
const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const screens = [
  "../screens/MatchDetailView.tsx",
  "../../app/toto/[gcNo]/[version].tsx",
  "./TotoCouponList.tsx"
];

test("every Bilyoner button is the shared component", async () => {
  for (const path of screens) {
    const source = await read(path);
    assert.match(source, /<BilyonerButton\b/, path);
    assert.doesNotMatch(source, /styles\.bilyoner(Action|Primary|Secondary)\b/, path);
  }
});

test("Bilyoner takes the front-vowel suffix everywhere", async () => {
  for (const path of [...screens, "./BilyonerButton.tsx", "../web/TotoCouponGrid.tsx"]) {
    const source = await read(path);
    assert.doesNotMatch(source, /Bilyoner(&apos;|')da\b/, path);
  }
});

test("the shared button is the Toto green, spans its column like Maç detayına git and announces a link", async () => {
  const source = await read("./BilyonerButton.tsx");
  assert.match(source, /backgroundColor: colors\.green/);
  assert.match(source, /color: colors\.background/);
  assert.match(source, /minHeight: 56/);
  assert.match(source, /borderRadius: 18/);
  assert.match(source, /alignSelf: "stretch"/);
  assert.match(source, /justifyContent: "center"/);
  assert.doesNotMatch(source, /primary/);
  assert.match(source, /accessibilityRole="link"/);
  assert.match(source, /label = "Bilyoner'de aç"/);
  // Same 56 pt, 18 pt-corner, centred shape as the Super kararı match button.
  assert.match(await read("../screens/RebuildDecisionView.tsx"), /matchButton: \{ minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 18/);
});

test("no screen asks for a separate outlined or primary Bilyoner form", async () => {
  for (const path of screens) assert.doesNotMatch(await read(path), /primary=\{/, path);
});
