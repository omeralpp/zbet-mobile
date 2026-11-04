import type { RebuildPressureHistory } from "@/src/api/rebuild-statistics-schemas";
import { activityIntervals, type PressureInterval } from "@/src/utils/rebuild-pressure";
import type { PathMoment } from "./match-path-model";

type Match = { key?: string; homeTeam: string; awayTeam: string; status: string; elapsed: number };

/** One display series only. Missing observed windows never borrow native model pressure. */
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
  if (!point) return "Bu dakikada doğrulanmış hareketlilik ölçümü yok.";
  const leader = point.home === point.away ? "İki takım dengede" : `${point.home > point.away ? match.homeTeam : match.awayTeam} daha hareketli`;
  const range = point.windowStartMinute === undefined ? `${point.endMinute}′ gözlemi` : `${point.windowStartMinute}–${point.endMinute}′`;
  return `${range} · ${leader}`;
}

/** Duration is taken from acquisition timestamps, never the football clock. */
export function activityWindowDuration(point: PressureInterval | null | undefined) {
  const seconds = point?.windowSeconds;
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) return null;
  const rounded = Math.round(seconds), minutes = Math.floor(rounded / 60), rest = rounded % 60;
  const duration = `${minutes ? `${minutes} dk` : ""}${minutes && rest ? " " : ""}${rest ? `${rest} sn` : ""}`;
  return `${seconds === rounded ? "" : "Yaklaşık "}${duration}`;
}

export function activityTeamReading(team: string, value: string) {
  return `${team}: dakikada ${value} tahmini hareketlilik birimi.`;
}

/** Shared Android/web copy: old observations are labelled as the last measurement. */
export function activitySummary(intervals: readonly PressureInterval[], match: Match, failed: boolean, loading: boolean) {
  const last = intervals.at(-1);
  const ended = match.status === "FINISHED" || match.status === "NOT_PLAYED";
  const duration = activityWindowDuration(last);
  return {
    last,
    eyebrow: last ? "SON ÖLÇÜLEN ARALIK" : "MAÇIN RİTMİ",
    headline: last ? activityHeadline(last, match) : loading ? "Hareketlilik yükleniyor…" : ended
      ? "Bu maç için doğrulanmış hareketlilik ölçümü yok." : "Henüz doğrulanmış hareketlilik ölçümü yok.",
    note: last ? `${failed ? "Yenileme başarısız · son kayıt gösteriliyor. " : ""}${duration ? `${duration} ölçüm · ` : ""}Tahmini hareketlilik / dk. Seçim veya yıldız hesabına katılmaz.`
      : failed ? "Yenileme başarısız. Yeni ölçüm alınamadı." : null
  };
}

export function activityMoment(intervals: readonly PressureInterval[], minute: number, match: Match): PathMoment {
  const point = activityAt(intervals, minute);
  const duration = activityWindowDuration(point);
  return { key: `activity:${minute}`, minute, kind: "ACTIVITY", side: null, score: null, record: null,
    label: `${minute}. dakika, ${point ? activityHeadline(point, match) : "hareketlilik ölçümü yok"}${duration ? `, ${duration} ölçüm` : ""}`,
    railTitle: `${minute}′ · Hareketlilik`, railSub: duration ?? "",
    lines: [activityHeadline(point, match), ...(point ? [`${match.homeTeam} ${point.homeText} / dk · ${match.awayTeam} ${point.awayText} / dk`] : []),
      `${duration ? `${duration} ölçüm. ` : ""}Değerler dakika başına tahmini hareketlilik; seçim veya yıldız hesabına katılmaz.`] };
}
