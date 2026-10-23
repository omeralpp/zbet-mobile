import type { RebuildCurrentPressure, RebuildObservation, RebuildPressureHistory } from "@/src/api/rebuild-statistics-schemas";
import { pressureLeader, type PressureLeader } from "@/src/components/pressure-chart";
import { formatDecimal } from "./rebuild-display";

/**
 * RB1 pressure as the backend persisted it (btb-pressure-history.v1). One
 * interval per verified sample, drawn from its start to its end minute and
 * joined to the next only where the backend says `connects`. Values are shown,
 * never recomputed: the decimal text stays the source of every label.
 */
export interface PressureInterval {
  key: string;
  startMinute: number;
  endMinute: number;
  home: number;
  away: number;
  homeText: string;
  awayText: string;
  estimated: boolean;
  connects: boolean;
  score: string;
  windowStartMinute?: number;
}

export function pressureIntervals(history: RebuildPressureHistory | undefined): PressureInterval[] {
  if (!history || history.availability !== "AVAILABLE") return [];
  return history.samples.map((sample) => ({
    key: sample.captureId,
    startMinute: sample.startMinute,
    endMinute: sample.endMinute,
    home: Number(sample.home),
    away: Number(sample.away),
    homeText: formatDecimal(sample.home),
    awayText: formatDecimal(sample.away),
    estimated: sample.estimated,
    connects: sample.connects,
    score: `${sample.homeScore}–${sample.awayScore}`
  }));
}

/** A column is the delivered five-minute activity estimate ending at that minute. */
export function activityIntervals(history: RebuildPressureHistory | undefined): PressureInterval[] {
  if (!history || !["AVAILABLE", "PARTIAL"].includes(history.availability) || history.activity?.availability !== "AVAILABLE") return [];
  return history.activity.points.filter(point=>point.reason === "AVAILABLE" && point.home !== null && point.away !== null).map(point=>({
    key: point.captureId, startMinute: Math.max(0,point.minute - 1), endMinute: point.minute,
    home: point.home!, away: point.away!, homeText: formatDecimal(String(point.home)), awayText: formatDecimal(String(point.away)),
    estimated: true, connects: point.connects, score: "", windowStartMinute: history.observations.find(o=>o.captureId === point.baselineCaptureId)?.minute ?? point.minute - 5
  }));
}

/** Consecutive intervals the backend joined; a gap or transition starts a new run. */
export function pressureRuns(intervals: readonly PressureInterval[]): PressureInterval[][] {
  const runs: PressureInterval[][] = [];
  for (const interval of intervals) {
    const run = runs.at(-1);
    if (run && interval.connects) run.push(interval);
    else runs.push([interval]);
  }
  return runs;
}

export interface IntervalReading {
  range: string;
  leader: PressureLeader;
  headline: string;
  homeText: string;
  awayText: string;
}

/** The latest persisted interval in words: who pressed in it, with both values. */
export function latestIntervalReading(intervals: readonly PressureInterval[], teams: { homeTeam: string; awayTeam: string }): IntervalReading | null {
  const latest = intervals.at(-1);
  if (!latest) return null;
  const { leader } = pressureLeader(latest.home, latest.away);
  const headline = leader === "HOME" ? `${teams.homeTeam} baskın` : leader === "AWAY" ? `${teams.awayTeam} baskın`
    : leader === "BALANCED" ? "Dengede" : "Belirgin baskı yok";
  return { range: `${latest.windowStartMinute ?? latest.startMinute}–${latest.endMinute}′`, leader, headline, homeText: latest.homeText, awayText: latest.awayText };
}

export type ObservedChange = { key: string; minute: number; side: "HOME" | "AWAY"; kind: "GOAL" | "RED_CARD" | "CORRECTION"; score: string };

/**
 * Score and red-card changes as the observations recorded them. The minute is
 * the first observation that shows the new state, not a provider event time;
 * a lower score is a correction, never a goal.
 */
export function observedChanges(observations: readonly RebuildObservation[]): ObservedChange[] {
  const changes: ObservedChange[] = [];
  observations.forEach((observation, index) => {
    const before = observations[index - 1];
    if (!before) return;
    const score = `${observation.homeScore}–${observation.awayScore}`;
    const scoreKey = `${observation.captureId}:score`;
    if (observation.homeScore > before.homeScore) changes.push({ key: scoreKey, minute: observation.minute, side: "HOME", kind: "GOAL", score });
    else if (observation.awayScore > before.awayScore) changes.push({ key: scoreKey, minute: observation.minute, side: "AWAY", kind: "GOAL", score });
    else if (observation.homeScore < before.homeScore || observation.awayScore < before.awayScore) {
      changes.push({ key: scoreKey, minute: observation.minute, side: observation.homeScore < before.homeScore ? "HOME" : "AWAY", kind: "CORRECTION", score });
    }
    if (observation.homeRedCards > before.homeRedCards) changes.push({ key: `${observation.captureId}:home-red`, minute: observation.minute, side: "HOME", kind: "RED_CARD", score });
    if (observation.awayRedCards > before.awayRedCards) changes.push({ key: `${observation.captureId}:away-red`, minute: observation.minute, side: "AWAY", kind: "RED_CARD", score });
  });
  return changes;
}

/** Half-time score as the last first-half observation saw it. */
export function observedHalfTimeScore(observations: readonly RebuildObservation[]): string | null {
  const last = observations.filter((observation) => observation.phase === "1H").at(-1);
  return last && observations.some((observation) => observation.phase === "2H") ? `${last.homeScore}–${last.awayScore}` : null;
}

const optionalLabels = { box: "Ceza sahasında temas", blocked: "Engellenen şut", saves: "Rakip kaleci kurtarışı" } as const;

export interface CurrentPressureView {
  range: string;
  homeText: string;
  awayText: string;
  estimated: boolean;
  extended: { baseHome: string; baseAway: string; extraHome: string; extraAway: string; optional: { label: string; used: boolean }[] } | null;
}

/**
 * The backend's latest same-state interval from the statistics endpoint, with
 * the 74A parts as delivered (base plus capped extra per side). Saves count for
 * the attacking side, so the label names the opponent's goalkeeper.
 */
const clock = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Istanbul" });

export function currentPressureView(pressure: RebuildCurrentPressure | null): CurrentPressureView | null {
  if (!pressure) return null;
  const components = pressure.components;
  return {
    // Clock times as measured; a match minute would be inferred, not delivered.
    range: `${clock.format(new Date(pressure.startsAt))}–${clock.format(new Date(pressure.endsAt))}`,
    homeText: formatDecimal(pressure.home),
    awayText: formatDecimal(pressure.away),
    estimated: pressure.estimated,
    extended: components ? {
      baseHome: formatDecimal(components.baseHome), baseAway: formatDecimal(components.baseAway),
      extraHome: formatDecimal(components.cappedExtraHome), extraAway: formatDecimal(components.cappedExtraAway),
      optional: components.optional.map((item) => ({ label: optionalLabels[item.metric], used: item.used }))
    } : null
  };
}
