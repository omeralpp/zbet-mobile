/**
 * Shared Turkish text handling for every Jinx guard.
 *
 * Both Jinx surfaces — the daily quip and the M15 match outlook — have to match
 * banned wording against text that may or may not have been written with
 * Turkish characters. Folding is the piece they genuinely share, so it lives
 * here rather than being reimplemented per surface, where the two copies would
 * eventually disagree about which letters fold.
 */

const diacriticFolds: [RegExp, string][] = [
  [/[ıİ]/g, "i"],
  [/ş/g, "s"],
  [/ğ/g, "g"],
  [/ü/g, "u"],
  [/ö/g, "o"],
  [/ç/g, "c"],
  [/â/g, "a"]
];

/**
 * Lowercases and strips Turkish diacritics.
 *
 * Guards match against the folded copy so a line written as "kesin" and one
 * written as "kesın" are the same line to the rule that refuses it.
 */
export function foldDiacritics(text: string): string {
  return diacriticFolds.reduce(
    (folded, [pattern, replacement]) => folded.replace(pattern, replacement),
    text.toLowerCase()
  );
}
