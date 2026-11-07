import type { MatchSummary } from "@/src/api/schemas";

/**
 * The human layer of Özet: a greeting for the time of day and one line about
 * what happens next. Only facts the screen already holds are used; nothing is
 * predicted, ranked or read into results.
 */

const timeZone = "Europe/Istanbul";
const minute = 60_000;
const hour = 60 * minute;

function istanbulParts(at: number): { day: string; hour: number; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(at));
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    day: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number(value("hour")),
    time: `${value("hour")}:${value("minute")}`
  };
}

/** Günaydın / İyi günler / İyi akşamlar / İyi geceler, by Istanbul time. */
export function timeOfDayGreeting(at: number): string {
  const { hour: current } = istanbulParts(at);
  if (current >= 5 && current < 12) return "Günaydın";
  if (current >= 12 && current < 18) return "İyi günler";
  if (current >= 18) return "İyi akşamlar";
  return "İyi geceler";
}

/** Kickoff instant of a fixture; API times are Istanbul local without an offset. */
export function kickoffAt(match: Pick<MatchSummary, "matchDate" | "matchTime">): number | null {
  if (!match.matchDate || !/^\d{2}:\d{2}$/.test(match.matchTime)) return null;
  const parsed = new Date(`${match.matchDate}T${match.matchTime}:00+03:00`).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

export interface NextKickoff {
  match: MatchSummary;
  at: number;
}

/**
 * The earliest fixture that has not started and whose kickoff is still ahead.
 * A `NOT_STARTED` match past its kickoff is a delayed or stale reading, never
 * "next", so the line cannot point at the past.
 */
export function nextKickoff(matches: readonly MatchSummary[], now: number): NextKickoff | null {
  let next: NextKickoff | null = null;
  for (const match of matches) {
    if (match.status !== "NOT_STARTED") continue;
    const at = kickoffAt(match);
    if (at === null || at <= now) continue;
    if (!next || at < next.at) next = { match, at };
  }
  return next;
}

/** "birazdan", "25 dk sonra", "2 sa sonra", "1 sa 20 dk sonra"; null beyond a day. */
export function formatCountdown(ms: number): string | null {
  if (!Number.isFinite(ms) || ms < 0 || ms >= 24 * hour) return null;
  if (ms < minute) return "birazdan";
  const totalMinutes = Math.ceil(ms / minute);
  if (totalMinutes < 60) return `${totalMinutes} dk sonra`;
  const hours = Math.floor(totalMinutes / 60);
  const rest = totalMinutes % 60;
  return rest ? `${hours} sa ${rest} dk sonra` : `${hours} sa sonra`;
}

/** "21:45", "yarın 00:30" or "12 Kas 18:00", relative to the Istanbul day. */
export function formatKickoffLabel(at: number, now: number): string {
  const target = istanbulParts(at);
  const today = istanbulParts(now);
  if (target.day === today.day) return target.time;
  if (target.day === istanbulParts(now + 24 * hour).day) return `yarın ${target.time}`;
  const date = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone }).format(new Date(at));
  return `${date} ${target.time}`;
}

/**
 * The one line under the greeting: what is next, or that it is quiet. Live
 * counts stay in the figures below, so the line never repeats them.
 */
export function overviewStoryLine({ liveCount, next, now }: {
  liveCount: number | null;
  next: NextKickoff | null;
  now: number;
}): string | null {
  if (next) {
    const countdown = formatCountdown(next.at - now);
    const label = formatKickoffLabel(next.at, now);
    return countdown ? `Sıradaki maç ${label} · ${countdown}` : `Sıradaki maç ${label}`;
  }
  if (liveCount === null) return null;
  return liveCount > 0 ? "Canlı maçlar sürüyor" : "Şu an canlı maç yok";
}

/** "Galatasaray – Fenerbahçe · 21:45 · 1 sa 20 dk sonra" for a quiet-state hint. */
export function describeNextKickoff(next: NextKickoff, now: number): string {
  const countdown = formatCountdown(next.at - now);
  return [`${next.match.homeTeam} – ${next.match.awayTeam}`, formatKickoffLabel(next.at, now), countdown]
    .filter(Boolean)
    .join(" · ");
}
