import type { RebuildRecommendation } from "@/src/api/rebuild-schemas";
import type { MatchStatus, MatchSummary, TotoProgram } from "@/src/api/schemas";
import { formatSelection } from "@/src/utils/format";
import { resultPresentation } from "@/src/utils/rebuild-display";
import { desktopDestinations } from "./desktop-nav";
import { normalizeSearchText as foldTurkish, searchTextScore } from "@/src/utils/search";
export { normalizeSearchText as foldTurkish } from "@/src/utils/search";

/**
 * The desktop command palette's search model, free of UI so it can be tested.
 * It indexes only data the screens already loaded (the shared query cache):
 * the five pages, current matches, RB1 published Super records and Toto
 * programs. Nothing is fetched for the palette and nothing is written.
 */
export type PaletteKind = "page" | "match" | "super" | "toto";

export type PaletteHref = {
  pathname: string;
  params?: Record<string, string>;
};

export type PaletteItem = {
  id: string;
  kind: PaletteKind;
  title: string;
  subtitle: string;
  href: PaletteHref;
  live: boolean;
  /** Folded search text: title, subtitle and kind words. */
  haystack: string;
};

const statusLabels: Record<MatchStatus, string> = {
  LIVE: "Canlı",
  HALF_TIME: "Devre arası",
  NOT_STARTED: "Başlamadı",
  FINISHED: "Bitti",
  NOT_PLAYED: "Oynanmadı"
};

const totoStatusLabels: Record<TotoProgram["status"], string> = {
  ACTIVE: "Aktif",
  WAITING_RESULT: "Sonuç bekleniyor",
  RESULTED: "Sonuçlandı",
  ERROR: "Hata"
};

function item(
  id: string,
  kind: PaletteKind,
  title: string,
  subtitle: string,
  href: PaletteHref,
  live: boolean,
  keywords: string
): PaletteItem {
  return {
    id,
    kind,
    title,
    subtitle,
    href,
    live,
    haystack: foldTurkish(`${title} ${subtitle} ${keywords}`)
  };
}

export function buildPaletteItems({
  matches = [],
  recommendations = [],
  totoPrograms = []
}: {
  matches?: readonly MatchSummary[];
  recommendations?: readonly RebuildRecommendation[];
  totoPrograms?: readonly TotoProgram[];
}): PaletteItem[] {
  const pages = desktopDestinations.map((destination) =>
    item(
      `page:${destination.route}`,
      "page",
      destination.label,
      `Sayfa · g ${destination.chordKey}`,
      { pathname: destination.path },
      false,
      "sayfa git"
    )
  );
  const matchItems = matches.map((match) => {
    const live = match.status === "LIVE" || match.status === "HALF_TIME";
    const score = match.status === "NOT_STARTED" ? match.matchTime : `${match.homeScore}-${match.awayScore}`;
    return item(
      `match:${match.key}`,
      "match",
      `${match.homeTeam} - ${match.awayTeam}`,
      `${match.league} · ${statusLabels[match.status]} · ${score}`,
      { pathname: "/match/[key]", params: { key: match.key } },
      live,
      `mac ${match.selectedOdd}`
    );
  });
  const superItems = recommendations.map((record) =>
    item(
      `super:${record.decisionId}`,
      "super",
      `${record.homeTeam} - ${record.awayTeam}`,
      `Super · ${formatSelection(record.market)} · ${"★".repeat(record.stars)} · ${resultPresentation[record.result.state].label}`,
      { pathname: "/super/[key]", params: { key: record.decisionId, match: record.matchKey } },
      record.result.state === "PENDING",
      `super karar ${record.market}`
    )
  );
  const totoItems = totoPrograms.map((program) =>
    item(
      `toto:${program.key}`,
      "toto",
      `Toto Program ${program.gcNo}`,
      `${program.weekText} · ${totoStatusLabels[program.status]}`,
      {
        pathname: "/toto/[gcNo]/[version]",
        params: { gcNo: String(program.gcNo), version: String(program.version) }
      },
      program.status === "ACTIVE",
      "toto program kupon"
    )
  );
  return [...pages, ...matchItems, ...superItems, ...totoItems];
}

const kindOrder: Record<PaletteKind, number> = { page: 0, match: 1, super: 2, toto: 3 };

/**
 * Every query word must appear. An exact title ranks first, then titles that
 * start with the query, then live/open items, then the natural kind order. An
 * empty query lists the pages and whatever is live right now.
 */
export function searchPalette(items: readonly PaletteItem[], query: string, limit = 30): PaletteItem[] {
  const words = foldTurkish(query).split(" ").filter(Boolean);
  if (!words.length) {
    return items.filter((entry) => entry.kind === "page" || (entry.kind === "match" && entry.live)).slice(0, limit);
  }
  const scored: { entry: PaletteItem; score: number; index: number }[] = [];
  items.forEach((entry, index) => {
    const matchScore = searchTextScore(entry.haystack, query);
    if (matchScore === null) {
      return;
    }
    const title = foldTurkish(entry.title);
    const phrase = words.join(" ");
    let score = kindOrder[entry.kind] + matchScore * 100;
    if (title === phrase) {
      score -= 30;
    } else if (title.startsWith(phrase)) {
      score -= 20;
    } else if (words.every((word) => title.includes(word))) {
      score -= 10;
    }
    if (entry.live) {
      score -= 5;
    }
    scored.push({ entry, score, index });
  });
  return scored
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ entry }) => entry);
}
