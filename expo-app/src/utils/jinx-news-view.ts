import type { JinxNewsBrief } from "@/src/api/jinx-news-schema";

export type JinxNewsView =
  | { kind: "HIDDEN" }
  | { kind: "LOADING" | "EMPTY" | "FAILED" | "LIMITED"; message: string; canRefresh: boolean; generated: string | null }
  | { kind: "AVAILABLE"; items: { key: string; date: string; text: string; sources: { number: number; title: string; url: string }[] }[];
      canRefresh: boolean; generated: string | null };

const dayLabel = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "short" });
const timeLabel = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false });

/** "24 Kas" for a bullet's yyyy-mm-dd date. */
export function newsDay(date: string): string {
  return dayLabel.format(new Date(`${date}T00:00:00Z`));
}

/**
 * The Maç gündemi block's state. A disabled feature hides the block; a read
 * error reads as FAILED with a retry. Refresh is offered once the BFF's
 * spacing allows it, so a press never only waits on the cache.
 */
export function jinxNewsView(brief: JinxNewsBrief | undefined, state: { loading: boolean; error: boolean; now: number }): JinxNewsView {
  if (state.loading && !brief) return { kind: "LOADING", message: "Jinx maç gündemini tarıyor…", canRefresh: false, generated: null };
  if (!brief) return state.error ? { kind: "FAILED", message: "Maç gündemi alınamadı.", canRefresh: true, generated: null } : { kind: "HIDDEN" };
  if (brief.status === "DISABLED") return { kind: "HIDDEN" };
  const canRefresh = brief.refreshAvailableAt ? Date.parse(brief.refreshAvailableAt) <= state.now : brief.status !== "LIMITED";
  const generated = brief.generatedAt ? `Taranma ${timeLabel.format(new Date(brief.generatedAt))}` : null;
  switch (brief.status) {
    case "AVAILABLE":
      return { kind: "AVAILABLE", canRefresh, generated, items: brief.bullets.map((bullet, index) => ({
        key: `${index}-${bullet.date}`, date: newsDay(bullet.date), text: bullet.text,
        sources: bullet.sources.map((source) => ({ number: source + 1, ...brief.sources[source]! })) })) };
    case "NO_RECENT_NEWS":
      return { kind: "EMPTY", message: "Son 7 günde bu maç ve takımlarla ilgili kaynaklı bir haber bulunamadı.", canRefresh, generated };
    case "LIMITED":
      return { kind: "LIMITED", message: "Günlük arama sınırına ulaşıldı; gündem yarın yeniden taranabilir.", canRefresh: false, generated };
    default:
      return { kind: "FAILED", message: "Maç gündemi alınamadı.", canRefresh: true, generated };
  }
}
