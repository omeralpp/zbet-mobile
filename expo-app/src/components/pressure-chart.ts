import type { MatchDetail, MatchJourney } from "@/src/api/schemas";

/**
 * NXT-OBS-175/176: pressure is read as a balance between the two sides, never
 * as raw per-minute activity. One sample per measured interval: journey points
 * that repeat the same observation collapse into one bar.
 */
export type PressureSample = { key: string; minute: number; home: number; away: number };
export type PressureLeader = "HOME" | "AWAY" | "BALANCED" | "NONE";
export type PressureGoal = { key: string; minute: number; side: "HOME" | "AWAY"; kind?: "GOAL" | "SCORE_UPDATE" };

/** Darker scoring-side ink distinguishes events from measured pressure bars. */
export function pressureGoalInk(color: string) {
  return `#${color.replace(/^#/, "").match(/.{2}/g)!.map(value => Math.round(parseInt(value, 16) * 0.78).toString(16).padStart(2, "0")).join("")}`;
}

/** Only explicit provider goals receive a football event marker. */
export function pressureGoalAnnotation(goals: readonly PressureGoal[]) {
  const confirmed = goals.length > 0 && goals.every(goal=>goal.kind === "GOAL");
  const first = goals[0], last = goals.at(-1);
  const text = confirmed && first && last ? goals.length === 1 ? `${first.minute}′ gol` : `${first.minute}′–${last.minute}′ · ${goals.length} gol`
    : `${goals.length > 1 ? `${goals.length} ` : ""}${first?.kind === "SCORE_UPDATE" ? "skor" : "gol"}`;
  return {confirmed,text,width:Math.max(36,text.length*6.2),gap:confirmed?12:8};
}

/** Nearby goals share one label, while their original minutes remain explicit. */
export function pressureGoalGroups(goals: readonly PressureGoal[], x: (minute: number) => number, gap = 48) {
  const groups: { key: string; side: PressureGoal["side"]; minute: number; goals: PressureGoal[] }[] = [];
  for (const goal of [...goals].sort((a, b) => a.minute - b.minute || a.key.localeCompare(b.key))) {
    const previous = groups.findLast(group => group.side === goal.side && group.goals[0]?.kind === goal.kind);
    if (previous && x(goal.minute) - x(previous.goals.at(-1)!.minute) < gap) {
      previous.goals.push(goal);
      previous.minute = previous.goals.reduce((sum, item) => sum + item.minute, 0) / previous.goals.length;
    } else groups.push({ key: goal.key, side: goal.side, minute: goal.minute, goals: [goal] });
  }
  return groups;
}

/** Same 60/40 rule the BFF uses to name the pressing side for Jinx. */
export const dominanceShare = 0.6;
const maxCurrentAgeMs = 240_000;

export function pressureLeader(home: number, away: number): { leader: PressureLeader; homeShare: number | null } {
  const total = home + away;
  if (!(total > 0)) return { leader: "NONE", homeShare: null };
  const homeShare = home / total;
  return { homeShare,
    leader: homeShare >= dominanceShare ? "HOME" : homeShare <= 1 - dominanceShare ? "AWAY" : "BALANCED" };
}

export function pressureSeries(journey: MatchJourney | undefined, match: MatchDetail, now = Date.now()) {
  const points = journey?.matchKey === match.key ? journey.points : [];
  const byObservation = new Map<string, PressureSample>();
  for (const point of points) {
    const pressure = point.decisionContext?.recentPressure;
    if (pressure?.availability !== "AVAILABLE" || pressure.home === null || pressure.away === null || point.plotMinute === null) continue;
    const key = pressure.observedAt ?? point.key;
    byObservation.set(key, { key, minute: point.plotMinute, home: pressure.home, away: pressure.away });
  }
  const current = match.decisionContext?.recentPressure;
  const age = current?.observedAt ? now - Date.parse(current.observedAt) : NaN;
  if (["LIVE", "HALF_TIME"].includes(match.status) && current?.availability === "AVAILABLE" && current.observedAt
    && current.home !== null && current.away !== null && age >= 0 && age <= maxCurrentAgeMs && !byObservation.has(current.observedAt)) {
    byObservation.set(current.observedAt, { key: current.observedAt, minute: Math.min(150, match.elapsed), home: current.home, away: current.away });
  }
  const samples = [...byObservation.values()].sort((a, b) => a.minute - b.minute);
  const goals: PressureGoal[] = [];
  points.forEach((point, index) => {
    const before = points[index - 1];
    if (point.kind !== "GOAL" || point.plotMinute === null || !before || [point.home, point.away, before.home, before.away].some(v => v === null)) return;
    if (point.home! > before.home!) goals.push({ key: point.key, minute: point.plotMinute, side: "HOME" });
    else if (point.away! > before.away!) goals.push({ key: point.key, minute: point.plotMinute, side: "AWAY" });
  });
  const latest = samples.at(-1) ?? null;
  const peak = samples.reduce((max, sample) => Math.max(max, sample.home, sample.away), 0);
  return { samples, goals, latest, peak, balance: latest ? pressureLeader(latest.home, latest.away) : null };
}

/**
 * Where a short label beside a mark goes: to the right, or flipped to the left
 * when it would run past the plot's right edge (owner, 2026-10-18: labels must
 * never be cut by the chart frame).
 */
export function edgeSafeLabel(x: number, left: number, right: number, labelWidth: number, gap = 8) {
  return x + gap + labelWidth <= right || x - gap - labelWidth < left
    ? { x: x + gap, anchor: "start" as const }
    : { x: x - gap, anchor: "end" as const };
}

/** "Göztepe baskın · %82", "Dengede · ev %55", or null without a measurement. */
export function pressureHeadline(balance: { leader: PressureLeader; homeShare: number | null } | null,
  teams: { homeTeam: string; awayTeam: string }) {
  if (!balance) return null;
  if (balance.leader === "NONE" || balance.homeShare === null) return "Belirgin baskı yok";
  const home = Math.round(balance.homeShare * 100);
  if (balance.leader === "BALANCED") return `Dengede · ev %${home} · deplasman %${100 - home}`;
  return balance.leader === "HOME" ? `${teams.homeTeam} baskın · %${home}` : `${teams.awayTeam} baskın · %${100 - home}`;
}
