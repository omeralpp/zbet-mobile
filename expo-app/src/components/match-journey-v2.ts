import type { LiveContext, MatchDetail, MatchInsight, SuperLog } from "@/src/api/schemas";

type Distribution = MatchDetail["scoreDistribution"];
type Side = "HOME" | "AWAY";
export const journeyBucketMinutes = 5;
// Display constants only; neither the scale nor the pressure cap is fitted.
const pressureTrendCap = 0.05;
const maxObservationGapMs = 90_000;

export function journeyMinute(value: number | null | undefined): number | null {
  // CHAR5 is decoded once by the shared BFF journey/Super helper. UI data is
  // numeric already; do not add another, potentially disagreeing CHAR5 parser.
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 150
    ? value : null;
}

/** The legacy match DTO can use zero for a cleared SAP clock. Never put a
 * completed/nonzero-score match at kick-off, or invent a final minute. */
export function journeyMatchMinute(match: MatchDetail): number | null {
  const minute = journeyMinute(match.elapsed);
  if (minute === null || match.status === "NOT_PLAYED" || match.status === "NOT_STARTED") return null;
  if (match.status === "FINISHED" && minute < 90) return null;
  if (match.status === "HALF_TIME" && minute < 45) return null;
  if (minute === 0 && match.homeScore + match.awayScore > 0) return null;
  return minute;
}

export function scorePair(score: string): [number, number] | null {
  const pair = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(score);
  return pair ? [Number(pair[1]), Number(pair[2])] : null;
}

/** Visible SAP slice, not a new population and never renormalised to 100%. */
export function scoreAnchor(rows: Distribution, home: number, away: number) {
  const parsed = rows.map((row) => ({ ...row, pair: scorePair(row.score) }));
  if (!parsed.length || parsed.some((row) => !row.pair || !Number.isFinite(row.probability) ||
      row.probability < 0 || row.probability > 1 || !Number.isInteger(row.rank) || (row.rank ?? 0) < 1)) return null;
  if (new Set(parsed.map((row) => row.pair?.join("-"))).size !== parsed.length ||
      new Set(parsed.map((row) => row.rank)).size !== parsed.length) return null;
  // Check the sum against the published row count/rounding precision. No count
  // or reliability estimate can be recovered from percentage-only rows.
  if (parsed.reduce((sum, row) => sum + row.probability, 0) > 1 + rows.length * 0.00005 + 1e-8) return null;
  const ranked = [...parsed].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  if (ranked.some((row, index) => index > 0 && row.probability > (ranked[index - 1]?.probability ?? 0))) return null;
  const current = parsed.find((row) => row.pair?.[0] === home && row.pair?.[1] === away);
  // Missing/hidden is unknown, not zero probability or extreme surprise.
  if (!current || !current.rank) return null;
  const top = Math.max(...parsed.map((row) => row.probability));
  if (!(top > 0)) return null;
  return {
    rank: current.rank,
    probability: current.probability,
    // Rank one at 40% is ordinary-leaning. Rank and actual rate both matter.
    // This index is a visual ordering, NEVER a probability of being ordinary.
    level: (1 / current.rank + current.probability) / 2
  };
}

export function favouriteSide(insight: MatchInsight | undefined): Side | null {
  const home = insight?.marketRates.find((rate) => rate.betType.toLowerCase() === "ms1")?.kickoffRate;
  const away = insight?.marketRates.find((rate) => rate.betType.toLowerCase() === "ms2")?.kickoffRate;
  if (!home || !away || home <= 1 || away <= 1 || home === away) return null;
  return home < away ? "HOME" : "AWAY";
}

export type JourneySample = {
  matchKey: string;
  minute: number;
  observedAt: number;
  home: number;
  away: number;
  rows: Distribution;
  favourite: Side | null;
  anchor: ReturnType<typeof scoreAnchor>;
  level: number | null;
  underdogPressure: number | null;
  connects: boolean;
};

export function sampleJourney(match: MatchDetail, insight: MatchInsight | undefined, observedAt: number): JourneySample | null {
  const minute = journeyMatchMinute(match);
  if (minute === null || !Number.isFinite(observedAt)) return null;
  const anchor = scoreAnchor(match.scoreDistribution, match.homeScore, match.awayScore);
  const favourite = favouriteSide(insight);
  const pressureAt = Date.parse(match.pressureSnapshotAt ?? "");
  const fresh = match.status === "LIVE" && match.pressureSource === "CURRENT_MATCH" &&
    Number.isFinite(pressureAt) && observedAt >= pressureAt && observedAt - pressureAt <= 120_000;
  const total = match.totalPressure;
  const diff = match.pressureDiff;
  const directional = fresh && favourite && total !== null && total > 0 && diff !== null && Math.abs(diff) <= total
    ? (favourite === "HOME" ? diff : -diff) / total : null;
  return {
    matchKey: match.key, minute, observedAt, home: match.homeScore, away: match.awayScore,
    rows: match.scoreDistribution.map((row) => ({ ...row })), favourite, anchor,
    level: anchor?.level ?? null,
    // Red-card inputs deliberately do not occur here; they already enter SAP pressure.
    underdogPressure: directional === null ? null : Math.max(0, -directional),
    connects: false
  };
}

/** Ephemeral detail-screen state only. No files, storage, BFF cache or DDIC capture. */
export function appendJourney(samples: JourneySample[], next: JourneySample): JourneySample[] {
  const last = samples.at(-1);
  if (last && last.matchKey === next.matchKey && next.observedAt <= last.observedAt) return samples;
  const sameMatch = !last || last.matchKey === next.matchKey;
  // A clock/score correction invalidates the ambiguous forward segment. A
  // same-minute refresh replaces its display node rather than making a spike.
  const prior = sameMatch ? samples.filter((sample) => sample.minute < next.minute) : [];
  const previous = prior.at(-1);
  const connects = Boolean(previous && previous.level !== null && next.level !== null &&
    next.observedAt - previous.observedAt <= maxObservationGapMs && next.minute - previous.minute <= 2 &&
    next.home >= previous.home && next.away >= previous.away);
  const modulation = connects && next.underdogPressure !== null && previous
    ? pressureTrendCap * next.underdogPressure * Math.min(1, (next.minute - previous.minute) / journeyBucketMinutes)
    : 0;
  return [...prior, { ...next, connects, level: next.level === null ? null : Math.max(0, next.level - modulation) }];
}

export function journeyRuns(samples: JourneySample[]) {
  const runs: JourneySample[][] = [];
  for (const sample of samples) {
    if (sample.level === null) continue;
    if (!sample.connects || !runs.length) runs.push([]);
    runs.at(-1)?.push(sample);
  }
  return runs;
}

export function journeyHeightAt(samples: JourneySample[], minute: number): number | null {
  const exact = samples.find((sample) => sample.minute === minute);
  if (exact) return exact.level;
  const afterIndex = samples.findIndex((sample) => sample.minute > minute);
  const after = samples[afterIndex];
  const before = samples[afterIndex - 1];
  if (!after?.connects || !before || before.level === null || after.level === null) return null;
  return before.level + (after.level - before.level) * (minute - before.minute) / (after.minute - before.minute);
}

export function journeyDecisions(logs: SuperLog[], matchKey: string, samples: JourneySample[]) {
  return logs.flatMap((log) => {
    const minute = journeyMinute(log.elapsed);
    if (log.matchKey !== matchKey || minute === null) return [];
    return [{ key: log.key, minute, rating: log.rating, market: log.selectedOdd,
      level: journeyHeightAt(samples, minute) }];
  }).sort((a, b) => a.minute - b.minute || a.key.localeCompare(b.key));
}

export type JourneyEvent = { key: string; minute: number; label: string; direction: "AGAINST" | "TOWARD" | "NEUTRAL" | "UNKNOWN"; bucket: string };

export function journeyEvents(context: LiveContext | undefined, samples: JourneySample[]): JourneyEvent[] {
  if (!context || context.freshness?.stale || context.freshness?.refreshFailed) return [];
  if (context.matchKey && samples.length && context.matchKey !== samples[0]?.matchKey) return [];
  return (context.timeline ?? []).flatMap((event): JourneyEvent[] => {
    const minute = journeyMinute(event.minute);
    if (minute === null || event.kind === "UNKNOWN") return [];
    const bucketStart = Math.floor(minute / journeyBucketMinutes) * journeyBucketMinutes;
    // Only a genuinely PRE-event observation in this time bucket is eligible.
    // A later current distribution must never be projected back onto a goal.
    const before = samples.filter((sample) => sample.minute < minute &&
      sample.minute >= bucketStart && sample.anchor !== null).at(-1);
    let direction: JourneyEvent["direction"] = "UNKNOWN";
    if (before && event.kind === "GOAL" && event.scoreAfter) {
      const dh = event.scoreAfter.home - before.home;
      const da = event.scoreAfter.away - before.away;
      const after = scoreAnchor(before.rows, event.scoreAfter.home, event.scoreAfter.away);
      if (after && dh >= 0 && da >= 0 && dh + da === 1 && before.anchor) {
        direction = after.probability < before.anchor.probability ? "AGAINST" :
          after.probability > before.anchor.probability ? "TOWARD" : "NEUTRAL";
      }
    } else if (before?.favourite && event.kind === "RED_CARD" && event.side) {
      const top = before.rows.find((row) => row.rank === 1);
      const score = top ? scorePair(top.score) : null;
      const leader = score && score[0] !== score[1] ? (score[0] > score[1] ? "HOME" : "AWAY") : null;
      if (leader === before.favourite) direction = event.side === before.favourite ? "AGAINST" : "TOWARD";
    }
    return [{ key: event.eventKey, minute, direction,
      label: `${event.kind === "GOAL" ? "Gol" : "Kırmızı kart"}${event.side ? event.side === "HOME" ? " · ev" : " · deplasman" : ""}`,
      bucket: `${bucketStart}–${bucketStart + journeyBucketMinutes - 1}′` }];
  });
}
