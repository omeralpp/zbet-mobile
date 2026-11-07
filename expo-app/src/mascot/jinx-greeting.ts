/**
 * Jinx's first words when the app opens: one friendly line about what is on
 * right now. The Özet heading already says good evening, so Jinx does not
 * repeat it; he says what he is watching. Neutral by design (owner decision
 * 2026-10-21): no results, money or mood, only whether matches are on.
 */
export function jinxGreeting(liveCount: number | null): string {
  if (liveCount === null) return "Buradayım!";
  if (liveCount === 0) return "Şu an sakin, maçları bekliyorum.";
  return `${liveCount} maç canlı, takipteyim!`;
}
