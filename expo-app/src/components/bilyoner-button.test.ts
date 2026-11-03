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

test("the shared button keeps one geometry and announces a link", async () => {
  const source = await read("./BilyonerButton.tsx");
  assert.match(source, /minHeight: 48/);
  assert.match(source, /borderRadius: radii\.round/);
  assert.match(source, /alignSelf: "flex-start"/);
  assert.match(source, /accessibilityRole="link"/);
  assert.match(source, /label = "Bilyoner'de aç"/);
});
