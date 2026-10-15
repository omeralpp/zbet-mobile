import assert from "node:assert/strict";
import test from "node:test";
import type { MatchSummary, SuperLog, TotoProgram } from "@/src/api/schemas";
import { buildPaletteItems, foldTurkish, searchPalette } from "./command-palette";

const match = (over: Partial<MatchSummary>): MatchSummary => ({
  key: "2026-07-28:472961:19:15:00",
  id: 472961,
  matchDate: "2026-07-28",
  matchTime: "19:15",
  league: "Türkiye Trendyol Süper Lig",
  homeTeam: "Yukatel Adana Demirspor",
  awayTeam: "Fatih Karagümrük Spor Kulübü",
  homeScore: 4,
  awayScore: 3,
  elapsed: 90,
  status: "LIVE",
  selectedOdd: "Ms2/AltÜst25",
  rating: 5,
  liveRate: 14.5,
  currentRate: null,
  pressureDiff: null,
  totalPressure: null,
  pressureSource: null,
  lastUpdatedAt: "2026-07-28T19:00:00.000Z",
  ...over
});

const superLog: SuperLog = {
  key: "super-472780-82",
  matchKey: "2026-07-28:472780:20:45:00",
  matchName: "VPS - Ilves",
  createdAt: "2026-07-28T20:45:00.000Z",
  elapsed: 82,
  selectedOdd: "Ms25a",
  rating: 3,
  reason: "PRESSURE_RECHECK",
  liveRate: 2.14,
  currentRate: null,
  result: "WON",
  profit: 1.14,
  finalScore: "2-1",
  pressureAdjustment: 0,
  stateAdjustment: 0
};

const toto = { key: "362:1", gcNo: 362, version: 1, weekText: "16.10 - 19.10 Programı", status: "ACTIVE" } as TotoProgram;

const items = buildPaletteItems({
  matches: [
    match({}),
    match({ key: "b", homeTeam: "Inter Turku", awayTeam: "Gnistan", league: "Finland Veikkausliiga", status: "NOT_STARTED", matchTime: "20:45" })
  ],
  superLogs: [superLog],
  totoPrograms: [toto]
});

test("Turkish letters fold so a plain keyboard finds them", () => {
  assert.equal(foldTurkish("KARAGÜMRÜK İstanbul Işık Çağ"), "karagumruk istanbul isik cag");
  assert.equal(foldTurkish("Inter"), "inter");
});

test("an empty query lists the pages and the live matches only", () => {
  const titles = searchPalette(items, "  ").map((entry) => entry.title);
  assert.deepEqual(titles, [
    "Özet",
    "Canlı",
    "Super",
    "Toto",
    "Daha Fazla",
    "Yukatel Adana Demirspor - Fatih Karagümrük Spor Kulübü"
  ]);
});

test("every word must match, accent-insensitively, and links point at real routes", () => {
  const [first] = searchPalette(items, "karagumruk adana");
  assert.equal(first?.kind, "match");
  assert.deepEqual(first?.href, { pathname: "/match/[key]", params: { key: "2026-07-28:472961:19:15:00" } });
  assert.deepEqual(searchPalette(items, "karagumruk ilves"), []);
  const [superHit] = searchPalette(items, "ilves");
  assert.deepEqual(superHit?.href, { pathname: "/super/[key]", params: { key: "super-472780-82" } });
  const [totoHit] = searchPalette(items, "362");
  assert.deepEqual(totoHit?.href, { pathname: "/toto/[gcNo]/[version]", params: { gcNo: "362", version: "1" } });
});

test("title prefixes rank above incidental matches", () => {
  const ranked = searchPalette(items, "inter").map((entry) => entry.title);
  assert.equal(ranked[0], "Inter Turku - Gnistan");
  const pages = searchPalette(items, "toto").map((entry) => entry.kind);
  assert.equal(pages[0], "page");
});

test("the result list is bounded", () => {
  const many = buildPaletteItems({
    matches: Array.from({ length: 60 }, (_, index) => match({ key: `k${index}`, homeTeam: `Takım ${index}` }))
  });
  assert.equal(searchPalette(many, "takim", 30).length, 30);
});
