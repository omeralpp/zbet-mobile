import type { DailyCouponDay, DailyCouponLeg, DailyCouponMatchState, DailyCouponSettlement, DailyCouponTier } from "@/src/api/daily-coupons-schema";
import type { Tone } from "@/src/utils/rebuild-display";
import { shiftDay } from "@/src/utils/rebuild-log";

export const tierNames = { BANKO: "Banko", DENGELI: "Dengeli", RISKLI: "Riskli" } as const;
export const tierOrder = ["BANKO", "DENGELI", "RISKLI"] as const;
export type CouponTierName = (typeof tierOrder)[number];
export type AvailableTier = Extract<DailyCouponTier, { status: "AVAILABLE" }>;

/** Pill text and tone of a coupon result; capitals keep the Turkish İ. */
export const settlementPresentation: Record<DailyCouponSettlement, { label: string; tone: Tone }> = {
  PENDING: { label: "BEKLİYOR", tone: "pending" },
  WON: { label: "KAZANDI", tone: "positive" },
  LOST: { label: "KAYBETTİ", tone: "negative" },
  VOID: { label: "İPTAL", tone: "neutral" }
};

export const legResultLabel: Record<DailyCouponSettlement, string> = {
  PENDING: "Sonuç bekliyor",
  WON: "Tuttu",
  LOST: "Yattı",
  VOID: "İptal"
};

export function sortedTiers(day: { tiers: readonly DailyCouponTier[] }) {
  return [...day.tiers].sort((left, right) => tierOrder.indexOf(left.tier) - tierOrder.indexOf(right.tier));
}

/** The match key's fixture id, as the coupon leg carries it. */
export function fixtureIdOfMatchKey(key: string): string | null {
  const id = key.split(":")[1];
  return id && /^\d+$/.test(id) ? String(Number(id)) : null;
}

/** The legs that lost the coupon: the ones SAP marked LOST. */
export function losingLegs(tier: AvailableTier): DailyCouponLeg[] {
  return tier.settlement === "LOST" ? tier.legs.filter((leg) => leg.result === "LOST") : [];
}

export type CouponResultFilter = "ALL" | "WON" | "LOST" | "PENDING";
export type CouponTierFilter = "ALL" | CouponTierName;

export interface CouponEntry {
  day: string;
  tier: AvailableTier;
}

export type LiveLegState = { score: string | null; label: string };

export function liveLegStates(matches: readonly DailyCouponMatchState[] | undefined): Map<string, LiveLegState> {
  return new Map(matches?.map(({ matchKey, status, score, elapsed }) => {
    const label = {
      LIVE: elapsed === null ? "Canlı" : `Canlı · ${elapsed}′`,
      HALF_TIME: "Devre arası",
      FINISHED: "Bitti · sonuç işleniyor",
      NOT_PLAYED: "Oynanmadı · sonuç bekleniyor"
    }[status];
    return [matchKey, { score: score ? `${score.home}–${score.away}` : null, label }];
  }));
}

export function currentCouponMatchKeys(entries: readonly CouponEntry[], today: string) {
  const yesterday = shiftDay(today, -1);
  const keys = new Set<string>();
  for (const { day, tier } of entries) {
    if (day < yesterday || day > today) continue;
    for (const { matchKey, result } of tier.legs) {
      if (matchKey && (result === null || result === "PENDING")) keys.add(matchKey);
    }
  }
  return [...keys].sort();
}

/** Every published coupon of a window, newest day first, tiers in fixed order. */
export function couponEntries(days: readonly DailyCouponDay[]): CouponEntry[] {
  return [...days].sort((left, right) => right.bettingDate.localeCompare(left.bettingDate))
    .flatMap((day) => sortedTiers(day).filter((tier): tier is AvailableTier => tier.status === "AVAILABLE")
      .map((tier) => ({ day: day.bettingDate, tier })));
}

export function filterCoupons(entries: readonly CouponEntry[], tier: CouponTierFilter, result: CouponResultFilter): CouponEntry[] {
  return entries.filter((entry) => (tier === "ALL" || entry.tier.tier === tier)
    && (result === "ALL" || (result === "LOST" ? entry.tier.settlement === "LOST" : entry.tier.settlement === result)));
}

export interface CouponSummary {
  coupons: number;
  wins: number;
  losses: number;
  pending: number;
  voids: number;
  /** Hit rate over won and lost coupons, 0..1; null before any is settled. */
  hitRate: number | null;
  /** One unit per coupon at its published total odds; void returns the unit. */
  net: number;
  roi: number | null;
}

export function summarizeCoupons(entries: readonly CouponEntry[]): CouponSummary {
  let wins = 0, losses = 0, pending = 0, voids = 0, net = 0;
  for (const { tier } of entries) {
    if (tier.settlement === "WON") { wins += 1; net += tier.totalOdds - 1; }
    else if (tier.settlement === "LOST") { losses += 1; net -= 1; }
    else if (tier.settlement === "VOID") voids += 1;
    else pending += 1;
  }
  const decided = wins + losses;
  const staked = decided + voids;
  return {
    coupons: entries.length, wins, losses, pending, voids,
    hitRate: decided ? wins / decided : null,
    net: Math.round(net * 100) / 100,
    roi: staked ? net / staked : null
  };
}

export function countByResult(entries: readonly CouponEntry[]): Record<CouponResultFilter, number> {
  return {
    ALL: entries.length,
    WON: entries.filter((entry) => entry.tier.settlement === "WON").length,
    LOST: entries.filter((entry) => entry.tier.settlement === "LOST").length,
    PENDING: entries.filter((entry) => entry.tier.settlement === "PENDING").length
  };
}

/** The coupon legs of one match on a published day, with their tier. */
export function couponsForMatch(day: { tiers: readonly DailyCouponTier[] } | undefined, matchKey: string) {
  const fixtureId = fixtureIdOfMatchKey(matchKey);
  if (!day || !fixtureId) return [];
  return sortedTiers(day).flatMap((tier) => tier.status !== "AVAILABLE" ? [] : tier.legs
    .filter((leg) => (leg.matchKey ? leg.matchKey === matchKey : String(Number(leg.fixtureId)) === fixtureId))
    .map((leg) => ({ tier, leg })));
}
