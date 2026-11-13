import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

// Maç detayı review batch (NXT-OBS-241): source-level guards for wiring that
// the logic tests cannot reach without a renderer.
const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("section shortcuts follow the module order on screen and skip empty modules", async () => {
  const source = await read("../screens/MatchDetailView.tsx");
  assert.ok(source.includes("const visibleChips = moduleItems.flatMap("));
  assert.ok(source.includes("!emptyModules.has(item.id)"));
  assert.ok(source.includes("liveDetailLiveModules"));
  assert.match(source, /\r?\n        masonry\r?\n/);
  // The reset belongs after the list it changes, and it can be undone.
  assert.ok(source.indexOf(">Düzeni sıfırla<") > source.indexOf("<ReorderableModuleList"));
  assert.ok(source.includes(">Geri al<"));
});

test("the hero never claims a current selection without its record and names a pending result", async () => {
  const source = await read("../screens/MatchDetailView.tsx");
  assert.ok(source.includes("rebuildHeroFallback({"));
  assert.ok(!source.includes("rebuildPresentation("));
  assert.ok(source.includes("<ResultPill state={hero.record.result.state} subject />"));
  assert.ok(source.includes("<EvidenceQuality stars={heroStars} />"));
  assert.ok(source.includes("İY {periodScoreQuery.data.halfTimeScore.homeScore}–"));
});

test("the web live dot breathes in CSS and still stops under reduced motion", async () => {
  const source = await read("./LiveDot.web.tsx");
  assert.ok(source.includes("animationKeyframes"));
  assert.ok(source.includes("allowsAmbientMotion(reduceMotion) ? breathe : null"));
  assert.ok(!source.includes("Animated.loop"));
});

test("Maçın yolu states each absence once and keeps 44 pt targets", async () => {
  const source = await read("./MatchPathCard.tsx");
  assert.ok(!source.includes("statusPill("));
  assert.ok(source.includes("sideBySide && hasLine"));
  assert.ok(!source.includes("Hareketlilik penceresi yok"));
  assert.match(source, /backAction: \{ minHeight: 44/);
  assert.ok(source.includes("export const MatchPathCard = memo("));
});

test("decision rows stay inside the card corners and keep their separators on web", async () => {
  const source = await read("./RebuildEvidencePanel.tsx");
  assert.match(source, /cardClip: \{ borderRadius: 19, overflow: "hidden" \}/);
  assert.ok(source.includes('{"\\u00a0·\\u00a0"}'));
  assert.ok(source.includes("Karar kanıtının tamamı: Karar özeti"));
});
