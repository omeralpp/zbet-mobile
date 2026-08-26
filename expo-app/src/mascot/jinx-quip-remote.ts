import type { JinxQuipRequest } from "@/src/api/schemas";
import type { JinxDailyMood } from "./jinx-mood";

/**
 * Client-side half of the Jinx quip guard.
 *
 * The BFF already validates every candidate, but the phrase is user-facing and
 * the transport is not the only thing that can go wrong, so the same two checks
 * that matter most - length and "no number Jinx was not given" - run again here
 * before anything reaches the bubble. Anything rejected leaves the caller with
 * its own deterministic line.
 */

const maxQuipLength = 120;

// A figure spelled out in words walks past the digit check below, so it is
// refused outright. Matched against a diacritic-folded copy so a line written
// without Turkish characters cannot slip through.
const spelledNumberPattern =
  /\b(sifir|virgul|yirmi|otuz|kirk|elli|altmis|yetmis|seksen|doksan|yuz|bin)\w*/;

const diacriticFolds: [RegExp, string][] = [
  [/[ıİ]/g, "i"],
  [/ş/g, "s"],
  [/ğ/g, "g"],
  [/ü/g, "u"],
  [/ö/g, "o"],
  [/ç/g, "c"],
  [/â/g, "a"]
];

function foldDiacritics(text: string): string {
  return diacriticFolds.reduce(
    (folded, [pattern, replacement]) => folded.replace(pattern, replacement),
    text.toLowerCase()
  );
}

export function jinxQuipRequest(mood: JinxDailyMood): JinxQuipRequest | null {
  if (mood.kind === "UNKNOWN" || !mood.metricDate) {
    return null;
  }
  return {
    kind: mood.kind,
    filter: mood.filter,
    metricDate: mood.metricDate,
    won: mood.won,
    lost: mood.lost,
    profit: mood.profit
  };
}

function starThreshold(filter: JinxDailyMood["filter"]): number | null {
  const match = /^STAR_(\d)_PLUS$/.exec(filter);
  return match ? Number(match[1]) : null;
}

function allowedNumbers(mood: JinxDailyMood): number[] {
  const profit = Math.round(mood.profit * 100) / 100;
  const allowed = [0, profit, Math.abs(profit), mood.won, mood.lost];
  const threshold = starThreshold(mood.filter);
  return threshold === null ? allowed : [...allowed, threshold];
}

export function acceptRemoteQuip(
  candidate: string | null | undefined,
  mood: JinxDailyMood
): string | null {
  if (typeof candidate !== "string") {
    return null;
  }
  const text = candidate.trim();
  if (!text || text.length > maxQuipLength || /[\r\n]/.test(text)) {
    return null;
  }
  if (spelledNumberPattern.test(foldDiacritics(text))) {
    return null;
  }
  const allowed = allowedNumbers(mood);
  const tokens = text.match(/-?\d+(?:[.,]\d+)?/g) || [];
  const invented = tokens.some((token) => {
    const value = Number(token.replace(",", "."));
    return !Number.isFinite(value) || !allowed.includes(value);
  });
  return invented ? null : text;
}
