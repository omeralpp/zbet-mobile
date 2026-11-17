import type { DailyCouponDay, DailyCouponLeg, DailyCoupons, DailyCouponWindow } from "./daily-coupons-schema";

/**
 * Mock mode only: clearly labelled sample coupons so the populated Özet
 * module, decision log and match-detail card can be reviewed. The legs point
 * at the mock matches, so a tap opens their sample detail. Never a real
 * recommendation; the publication says "Örnek veri" and is DEMO mode.
 */
type Sample = { key: string; home: string; away: string; time: string; market: string; selection: string; odds: number };

const matches: Record<string, Sample> = {
  turku: { key: "2026-07-28:472910:20:45:00", home: "Inter Turku", away: "Gnistan", time: "20:45:00", market: "Çifte Şans", selection: "Ev sahibi / beraberlik", odds: 1.42 },
  molde: { key: "2026-07-28:472924:21:00:00", home: "Molde", away: "Haugesund", time: "21:00:00", market: "Toplam Gol 2,5", selection: "Alt", odds: 1.3 },
  lech: { key: "2026-07-28:472938:21:30:00", home: "Lech Poznan", away: "Gornik Zabrze", time: "21:30:00", market: "Çifte Şans", selection: "Beraberlik / deplasman", odds: 1.64 },
  hammarby: { key: "2026-07-28:472950:22:00:00", home: "Hammarby", away: "Sirius", time: "22:00:00", market: "Maç Sonucu", selection: "Ev Sahibi (1)", odds: 1.88 },
  adana: { key: "2026-07-28:472961:19:15:00", home: "Yukatel Adana Demirspor", away: "Fatih Karagümrük Spor Kulübü", time: "19:15:00", market: "Toplam Gol 3,5", selection: "Üst", odds: 2.03 },
  brondby: { key: "2026-07-28:472962:16:00:00", home: "Brondby", away: "Midtjylland", time: "16:00:00", market: "Karşılıklı Gol", selection: "Var", odds: 1.72 }
};

type LegOutcome = { result: DailyCouponLeg["result"]; score?: [number, number] };

function leg(day: string, sample: Sample, outcome: LegOutcome): DailyCouponLeg {
  return {
    fixtureId: sample.key.split(":")[1]!,
    home: sample.home,
    away: sample.away,
    kickoffAt: `${day}T${sample.time}+03:00`,
    market: sample.market,
    selection: sample.selection,
    odds: sample.odds,
    quotedAt: `${day}T10:59:00+03:00`,
    quoteTimeBasis: "CAPTURE_UPPER_BOUND",
    rationale: "Örnek gerekçe: benzer oranlı maçların çoğunda bu sonuç çıktı.",
    matchKey: sample.key,
    result: outcome.result,
    finalScore: outcome.score ? { home: outcome.score[0], away: outcome.score[1] } : null
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function sampleDay(day: string, settled: boolean): DailyCouponDay {
  const banko = [leg(day, matches.turku!, settled ? { result: "WON", score: [1, 0] } : { result: "PENDING" }),
    leg(day, matches.molde!, settled ? { result: "WON", score: [0, 0] } : { result: "PENDING" })];
  const dengeli = [leg(day, matches.lech!, settled ? { result: "LOST", score: [2, 1] } : { result: "PENDING" }),
    leg(day, matches.hammarby!, settled ? { result: "WON", score: [2, 0] } : { result: "PENDING" })];
  const riskli = [leg(day, matches.adana!, settled ? { result: "WON", score: [4, 3] } : { result: "PENDING" }),
    leg(day, matches.brondby!, settled ? { result: "LOST", score: [0, 2] } : { result: "PENDING" })];
  const total = (legs: DailyCouponLeg[]) => round(legs.reduce((product, item) => product * item.odds, 1));
  const tier = (name: "BANKO" | "DENGELI" | "RISKLI", legs: DailyCouponLeg[], settlement: "PENDING" | "WON" | "LOST") => ({
    tier: name, status: "AVAILABLE" as const, reason: null, totalOdds: total(legs), legs, settlement,
    expiresAt: `${day}T13:00:00.000Z`,
    ...(settlement === "PENDING" ? {} : { settlementUpdatedAt: `${day}T21:30:00+03:00`, settlementRevision: 1 })
  });
  return {
    contractVersion: "daily-coupons.v2",
    bettingDate: day,
    status: "AVAILABLE",
    publication: { cutoffAt: `${day}T11:00:00+03:00`, publishedAt: `${day}T11:00:06+03:00`, expiresAt: `${day}T16:00:00+03:00`, sourceChannel: "Örnek veri", mode: "DEMO" },
    tiers: [
      tier("BANKO", banko, settled ? "WON" : "PENDING"),
      tier("DENGELI", dengeli, settled ? "LOST" : "PENDING"),
      tier("RISKLI", riskli, settled ? "LOST" : "PENDING")
    ]
  };
}

function shift(day: string, days: number) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Today is still open; earlier sample days are settled. */
export function mockDailyCoupons(date: string, today: string): DailyCoupons {
  const history = [1, 2, 3].map((back) => ({ bettingDate: shift(today, -back), status: "AVAILABLE" as const }))
    .filter((row) => row.bettingDate !== date);
  if (date > today) return { contractVersion: "daily-coupons.v2", bettingDate: date, status: "UNAVAILABLE", publication: null, tiers: [], history };
  return { ...sampleDay(date, date < today), history };
}

export function mockDailyCouponWindow(through: string, days: 1 | 7 | 30, today: string): DailyCouponWindow {
  const from = shift(through, -(days - 1));
  const entries = [0, 1, 2, 3].map((back) => shift(today, -back))
    .filter((day) => day >= from && day <= through)
    .map((day) => sampleDay(day, day < today));
  return {
    contractVersion: "daily-coupons-window.v2",
    window: { days, from, through },
    todayStatus: through === today ? "AVAILABLE" : null,
    unavailableDays: [],
    entries
  };
}
