import type { RebuildPressureHistory } from "@/src/api/rebuild-statistics-schemas";
import { activityIntervals, type PressureInterval } from "@/src/utils/rebuild-pressure";
import type { PathMoment } from "./match-path-model";

type Match = { key?: string; homeTeam: string; awayTeam: string; status: string; elapsed: number };

/** One display series only. Missing rolling windows never fall back to native model pressure. */
export function matchActivity(history: RebuildPressureHistory | undefined, match: Match) {
  if (match.key && history?.matchKey !== match.key) return [];
  const live = ["LIVE", "HALF_TIME"].includes(match.status);
  if (match.status === "NOT_STARTED") return [];
  return activityIntervals(history).filter(point => !live || point.endMinute <= match.elapsed);
}

export function activityAt(intervals: readonly PressureInterval[], minute: number) {
  return intervals.find(point => point.endMinute === Math.round(minute)) ?? null;
}

export function activityHeadline(point: PressureInterval | null | undefined, match: Match) {
  if (!point) return "Bu dakikada doğrulanmış 5 dakikalık pencere yok.";
  const leader = point.home === point.away ? "İki takım dengede" : `${point.home > point.away ? match.homeTeam : match.awayTeam} daha hareketli`;
  return `${point.windowStartMinute ?? point.endMinute - 5}–${point.endMinute}′ · ${leader}`;
}

export function activityMoment(intervals: readonly PressureInterval[], minute: number, match: Match): PathMoment {
  const point = activityAt(intervals, minute);
  return { key: `activity:${minute}`, minute, kind: "ACTIVITY", side: null, score: null, record: null,
    label: `${minute}. dakika, beş dakikalık hareketlilik`, railTitle: `${minute}′ · Hareketlilik`, railSub: "",
    lines: [activityHeadline(point, match), ...(point ? [`${match.homeTeam} ${point.homeText} · ${match.awayTeam} ${point.awayText}`] : []),
      "Son 5 dakikanın tahmini hareketliliği; seçim veya yıldız hesabına katılmaz."] };
}
