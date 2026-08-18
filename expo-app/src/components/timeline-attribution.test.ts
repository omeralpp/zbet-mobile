import assert from "node:assert/strict";
import test from "node:test";
import {
  isInset,
  resolveSideAlignment,
  resolveSideLabel,
  spokenSide
} from "./timeline-attribution";
import { describeEvent, visibleEvents } from "./live-context-view";
import type { LiveContext } from "@/src/api/schemas";

const teams = { home: "Pachuca", away: "Puebla" };

function goal(minute: number, side: "HOME" | "AWAY" | null, home: number, away: number, scorer: string) {
  return {
    eventKey: `g-${minute}`,
    kind: "GOAL" as const,
    minute,
    side,
    scorer: { rawName: scorer },
    scoreAfter: { home, away }
  };
}

function redCard(minute: number, side: "HOME" | "AWAY" | null, player: string) {
  return {
    eventKey: `r-${minute}`,
    kind: "RED_CARD" as const,
    minute,
    side,
    player: { rawName: player },
    redCardType: "STRAIGHT" as const
  };
}

function contextOf(timeline: unknown[]): LiveContext {
  return { availability: "AVAILABLE", timeline } as unknown as LiveContext;
}

test("a home goal is attributed home without reading the club name", () => {
  assert.equal(resolveSideAlignment("HOME"), "HOME");
  assert.equal(resolveSideLabel("HOME"), "EV");
  assert.equal(isInset("HOME"), false);
});

test("an away goal is attributed away and inset", () => {
  assert.equal(resolveSideAlignment("AWAY"), "AWAY");
  assert.equal(resolveSideLabel("AWAY"), "DEP");
  assert.equal(isInset("AWAY"), true);
});

test("an unattributed event stays unattributed rather than guessing", () => {
  assert.equal(resolveSideAlignment(null), "UNKNOWN");
  assert.equal(resolveSideLabel(null), null);
  assert.equal(isInset(null), false);
  assert.equal(spokenSide(null), null);
});

test("the side is spoken in full for a listener", () => {
  assert.equal(spokenSide("HOME"), "ev sahibi");
  assert.equal(spokenSide("AWAY"), "deplasman");
});

test("consecutive away goals all read as away", () => {
  const events = visibleEvents(
    contextOf([
      goal(16, "AWAY", 0, 1, "Guzman"),
      goal(33, "AWAY", 0, 2, "Palacios")
    ]).timeline
  );
  const sides = events.map((e) => resolveSideAlignment(describeEvent(e, teams).side));
  assert.deepEqual(sides, ["AWAY", "AWAY"]);
  assert.deepEqual(
    events.map((e) => isInset(describeEvent(e, teams).side)),
    [true, true],
    "a run of same-side goals must form one visible column"
  );
});

test("consecutive home goals all read as home", () => {
  const events = visibleEvents(
    contextOf([goal(5, "HOME", 1, 0, "Rondon"), goal(12, "HOME", 2, 0, "Idrissi")])
      .timeline
  );
  assert.deepEqual(
    events.map((e) => resolveSideAlignment(describeEvent(e, teams).side)),
    ["HOME", "HOME"]
  );
});

test("alternating goals alternate their alignment", () => {
  const events = visibleEvents(
    contextOf([
      goal(16, "AWAY", 0, 1, "Guzman"),
      goal(42, "HOME", 1, 1, "Rondon"),
      goal(70, "AWAY", 1, 2, "Palacios")
    ]).timeline
  );
  assert.deepEqual(
    events.map((e) => resolveSideAlignment(describeEvent(e, teams).side)),
    ["AWAY", "HOME", "AWAY"]
  );
});

test("the running score progresses with the events", () => {
  const events = visibleEvents(
    contextOf([
      goal(16, "AWAY", 0, 1, "Guzman"),
      goal(42, "HOME", 1, 1, "Rondon"),
      goal(70, "AWAY", 1, 2, "Palacios")
    ]).timeline
  );
  assert.deepEqual(
    events.map((e) => describeEvent(e, teams).score),
    ["0-1", "1-1", "1-2"]
  );
});

test("red cards carry a side and never a score", () => {
  const events = visibleEvents(
    contextOf([redCard(58, "HOME", "Sanchez"), redCard(84, "AWAY", "Ortiz")])
      .timeline
  );
  const displays = events.map((e) => describeEvent(e, teams));
  assert.deepEqual(
    displays.map((d) => resolveSideAlignment(d.side)),
    ["HOME", "AWAY"]
  );
  assert.deepEqual(
    displays.map((d) => d.score),
    [null, null],
    "a red card has no scoreline of its own"
  );
});

test("the team name is still resolved, but is no longer the only cue", () => {
  const events = visibleEvents(contextOf([goal(16, "AWAY", 0, 1, "Guzman")]).timeline);
  const display = describeEvent(events[0]!, teams);
  assert.equal(display.team, "Puebla");
  assert.equal(
    resolveSideLabel(display.side),
    "DEP",
    "the side is readable even if the reader does not know which club is away"
  );
});

test("a long player name does not affect attribution", () => {
  const long = "Kevin Alejandro Castañeda Villavicencio";
  const events = visibleEvents(contextOf([goal(90, "AWAY", 2, 3, long)]).timeline);
  const display = describeEvent(events[0]!, teams);
  assert.equal(display.player, long);
  assert.equal(resolveSideLabel(display.side), "DEP");
});
