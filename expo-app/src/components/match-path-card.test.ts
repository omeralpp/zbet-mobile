import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("Maçın yolu is its own card under Jinx, outside the evidence grid and its chips", async () => {
  // v45 boards W-MacYolu / M-MacYolu, owner approval 2026-10-22.
  const source = await read("../screens/MatchDetailView.tsx");
  const jinx = source.indexOf("<RebuildJinxCard");
  const card = source.indexOf("<MatchPathCard");
  const evidence = source.indexOf(">Maçın kanıtları<");
  assert.ok(jinx > 0 && card > jinx && evidence > card);
  const nodes = source.slice(source.indexOf("const moduleNodes"), source.indexOf("const moduleItems"));
  assert.ok(!nodes.includes("matchPath: ("));
  assert.ok(!source.includes('{ id: "matchPath", label: "Yol" }'));
  assert.ok(source.includes('collapsed.includes("matchPath")'));
});

test("RB1 binds statistics and pressure history and never draws a legacy pool line", async () => {
  const source = await read("../screens/MatchDetailView.tsx");
  assert.ok(source.includes('rebuildStatisticsQuery(isRebuild ? key : "")'));
  assert.ok(source.includes('rebuildPressureHistoryQuery(isRebuild ? key : "")'));
  assert.ok(source.includes("<RebuildPressureChart"));
  assert.ok(source.includes("<RebuildStatisticsPanel"));
  assert.ok(source.includes("const legacyPath = !isRebuild && matchPathEnabled;"));
  assert.ok(source.includes("journeyPoints: legacyPath && journey.data?.matchKey === key ? journey.data.points : []"));
});

test("the new card and panels keep the published type floor and renderable weights", async () => {
  const { minimumFontSize, renderableWeights } = await import("../theme/typography");
  for (const file of ["./MatchPathCard.tsx", "./RebuildPressureChart.tsx", "./RebuildStatisticsPanel.tsx", "./ComparisonRow.tsx"]) {
    const source = await read(file);
    const sizes = [...source.matchAll(/fontSize[:=]\s*\{?\s*(\d+)/g)].map((match) => Number(match[1]));
    assert.deepEqual(sizes.filter((size) => size < minimumFontSize), [], `${file} renders below ${minimumFontSize}pt`);
    const weights = [...source.matchAll(/(?:fontWeight:\s*|Font\()["'](\d+)["']/g)].map((match) => match[1]!);
    assert.deepEqual(weights.filter((weight) => !renderableWeights.includes(weight as never)), [], `${file} uses an unrenderable weight`);
  }
});

test("every mark is a 44 pt target and the chart owns physical input in one gesture", async () => {
  const source = await read("./MatchPathCard.tsx");
  assert.match(source, /mark: \{ position: "absolute", width: 44, height: 44/);
  assert.ok(source.includes("Gesture.Exclusive(pan, tap)"));
  assert.ok(source.includes('accessibilityRole="button"'));
  // Stars stay consistency and evidence quality, never a probability.
  assert.ok(source.includes("kazanma olasılığı değildir"));
});
