import assert from "node:assert/strict";
import test from "node:test";
import type { MatchSummary } from "../api/schemas";
import {
  describeNextKickoff,
  formatCountdown,
  formatKickoffLabel,
  kickoffAt,
  nextKickoff,
  overviewStoryLine,
  timeOfDayGreeting
} from "./overview-story";

const at = (iso: string) => new Date(iso).getTime();
const fixture = (key: string, status: MatchSummary["status"], matchDate: string, matchTime: string) =>
  ({ key, status, matchDate, matchTime, homeTeam: `${key} Ev`, awayTeam: `${key} Dep` }) as unknown as MatchSummary;

test("the greeting follows Istanbul time, not the device zone", () => {
  assert.equal(timeOfDayGreeting(at("2026-11-07T06:00:00+03:00")), "Günaydın");
  assert.equal(timeOfDayGreeting(at("2026-11-07T11:59:00+03:00")), "Günaydın");
  assert.equal(timeOfDayGreeting(at("2026-11-07T12:00:00+03:00")), "İyi günler");
  assert.equal(timeOfDayGreeting(at("2026-11-07T18:00:00+03:00")), "İyi akşamlar");
  assert.equal(timeOfDayGreeting(at("2026-11-07T23:59:00+03:00")), "İyi akşamlar");
  assert.equal(timeOfDayGreeting(at("2026-11-08T00:30:00+03:00")), "İyi geceler");
  assert.equal(timeOfDayGreeting(at("2026-11-08T04:59:00+03:00")), "İyi geceler");
  // 16:30 UTC is 19:30 in Istanbul.
  assert.equal(timeOfDayGreeting(at("2026-11-07T16:30:00Z")), "İyi akşamlar");
});

test("next kickoff is the earliest fixture still ahead; stale and live matches never qualify", () => {
  const now = at("2026-11-07T19:30:00+03:00");
  const matches = [
    fixture("live", "LIVE", "2026-11-07", "18:00"),
    fixture("stale", "NOT_STARTED", "2026-11-07", "19:00"),
    fixture("later", "NOT_STARTED", "2026-11-07", "22:00"),
    fixture("soon", "NOT_STARTED", "2026-11-07", "21:45"),
    fixture("undated", "NOT_STARTED", "", ""),
    fixture("finished", "FINISHED", "2026-11-07", "20:00")
  ];
  const next = nextKickoff(matches, now);
  assert.equal(next?.match.key, "soon");
  assert.equal(next?.at, at("2026-11-07T21:45:00+03:00"));
  assert.equal(nextKickoff(matches.filter((match) => match.key !== "soon" && match.key !== "later"), now), null);
  assert.equal(kickoffAt(fixture("bad", "NOT_STARTED", "2026-11-07", "9:5")), null);
});

test("countdowns are short Turkish phrases and stop at a day", () => {
  assert.equal(formatCountdown(20_000), "birazdan");
  assert.equal(formatCountdown(60_000), "1 dk sonra");
  assert.equal(formatCountdown(25 * 60_000 - 1), "25 dk sonra");
  assert.equal(formatCountdown(2 * 3_600_000), "2 sa sonra");
  assert.equal(formatCountdown(80 * 60_000), "1 sa 20 dk sonra");
  assert.equal(formatCountdown(24 * 3_600_000), null);
  assert.equal(formatCountdown(-1), null);
  assert.equal(formatCountdown(Number.NaN), null);
});

test("kickoff labels name today, tomorrow or the date", () => {
  const now = at("2026-11-07T19:30:00+03:00");
  assert.equal(formatKickoffLabel(at("2026-11-07T21:45:00+03:00"), now), "21:45");
  assert.equal(formatKickoffLabel(at("2026-11-08T00:30:00+03:00"), now), "yarın 00:30");
  assert.match(formatKickoffLabel(at("2026-11-12T18:00:00+03:00"), now), /^12 Kas 18:00$/);
});

test("the story line says what is next, or that it is quiet, and never repeats the live count", () => {
  const now = at("2026-11-07T19:30:00+03:00");
  const next = { match: fixture("soon", "NOT_STARTED", "2026-11-07", "21:45"), at: at("2026-11-07T21:45:00+03:00") };
  assert.equal(overviewStoryLine({ liveCount: 4, next, now }), "Sıradaki maç 21:45 · 2 sa 15 dk sonra");
  assert.equal(overviewStoryLine({ liveCount: 4, next: null, now }), "Canlı maçlar sürüyor");
  assert.equal(overviewStoryLine({ liveCount: 0, next: null, now }), "Şu an canlı maç yok");
  assert.equal(overviewStoryLine({ liveCount: null, next: null, now }), null);
  const far = { ...next, at: at("2026-11-09T18:00:00+03:00") };
  assert.match(overviewStoryLine({ liveCount: 0, next: far, now }) ?? "", /^Sıradaki maç 9 Kas 18:00$/);
  assert.equal(describeNextKickoff(next, now), "soon Ev – soon Dep · 21:45 · 2 sa 15 dk sonra");
});
