/** Search is deliberately independent of keyboard locale (I/İ/ı/i included). */
export function normalizeSearchText(value: string): string {
  return value.replace(/[ıİ]/g, "i").toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[%\s]+/g, " ").trim();
}

/** Bounded Damerau-Levenshtein: typos and adjacent transpositions, not arbitrary substrings. */
function closeWord(query: string, word: string): boolean {
  const limit = query.length >= 8 ? 2 : 1;
  if (query.length < 4 || Math.abs(query.length - word.length) > limit) return false;
  let beforePrevious: number[] = [];
  let previous = Array.from({ length: word.length + 1 }, (_, i) => i);
  for (let i = 1; i <= query.length; i++) {
    const row = [i];
    for (let j = 1; j <= word.length; j++) {
      row[j] = Math.min(row[j - 1]! + 1, previous[j]! + 1,
        previous[j - 1]! + (query[i - 1] === word[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && query[i - 1] === word[j - 2] && query[i - 2] === word[j - 1]) {
        row[j] = Math.min(row[j]!, beforePrevious[j - 2]! + 1);
      }
    }
    beforePrevious = previous;
    previous = row;
  }
  return previous[word.length]! <= limit;
}

/** Every query word must match. Exact/substring matches rank ahead of typo matches. */
export function searchTextScore(text: string, query: string): number | null {
  const haystack = normalizeSearchText(text), needle = normalizeSearchText(query);
  if (!needle || haystack.includes(needle)) return 0;
  const candidates = haystack.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  let score = 1;
  for (const word of needle.split(" ")) {
    if (haystack.includes(word)) continue;
    if (!candidates.some(candidate => closeWord(word, candidate))) return null;
    score += 10;
  }
  return score;
}
