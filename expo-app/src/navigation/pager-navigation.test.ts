import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

test("main tabs use a native, eagerly painted pager with a fixed bottom bar", () => {
  const layout = source("app/(tabs)/_layout.tsx");

  assert.match(layout, /from "expo-router\/js-top-tabs"/);
  assert.match(layout, /tabBarPosition="bottom"/);
  assert.match(layout, /lazy=\{false\}/);
  assert.match(layout, /tabBar=\{BottomTabBar\}/);
  assert.match(layout, /swipeEnabled=\{!reduceMotion\}/);
});

test("pager scene and stack share the BTB background token", () => {
  const stack = source("app/_layout.tsx");
  const tabs = source("app/(tabs)/_layout.tsx");

  assert.match(
    stack,
    /contentStyle:\s*\{\s*backgroundColor:\s*colors\.background\s*\}/
  );
  assert.match(tabs, /scene:\s*\{\s*backgroundColor:\s*colors\.background\s*\}/);
  assert.equal(/scene:\s*\{\s*backgroundColor:\s*["'#]/.test(tabs), false);
});

test("live uses one switch, pins, and keeps the native star-filter page", () => {
  const live = source("app/(tabs)/live.tsx");
  const matchCard = source("src/components/MatchCard.tsx");
  const superLog = source("app/(tabs)/super.tsx");

  assert.match(live, /\["LIVE", "FIXTURE", "STAR"\]/);
  assert.match(live, /<LiveSwitch/);
  assert.match(live, /title: "Sabitlenenler"/);
  assert.match(matchCard, /name=\{pinned \? "pin" : "pin-outline"\}/);
  assert.doesNotMatch(live, /SCOUT|Scout|binoculars/);
  assert.doesNotMatch(matchCard, /Scout|binoculars/);
  assert.match(superLog, /\["ALL", "STAR"\]/);
  assert.match(live, /<LocalTabPager/);
  assert.match(superLog, /<LocalTabPager/);
});

test("the shared screen no longer installs a competing main-tab pan", () => {
  const screen = source("src/components/Screen.tsx");
  assert.doesNotMatch(screen, /tabSwipe/);
  assert.match(screen, /\.enabled\(edgeSwipeBack\)/);
});

test("the Fiori shell does not paint the legacy BTB WEB badge", () => {
  const fiori = source("app/fiori.tsx");

  assert.doesNotMatch(fiori, /optionalBadge/);
  assert.doesNotMatch(fiori, /optionalBadgeText/);
});

test("Super outcome band owns current-match navigation without a second button", () => {
  const detail = source("app/super/[key].tsx");

  assert.match(
    detail,
    /<Pressable\s+accessibilityHint="Bu karşılaşmanın güncel maç detayını açar"/
  );
  assert.match(detail, /onPress=\{openCurrentMatch\}/);
  assert.match(detail, /currentMatchKey \? \(/);
  assert.match(detail, /name="chevron-right"/);
  assert.doesNotMatch(
    detail,
    /<Text[^>]*>\s*Güncel maç görünümünü aç\s*<\/Text>/s
  );
});
