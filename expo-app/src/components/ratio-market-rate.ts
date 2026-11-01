import type { MatchMarketRate } from "@/src/api/schemas";
import { formatRate } from "@/src/utils/format";

export type RatioMarketRateDisplay = {
  label: "Canlı oran" | "Maç önü oranı" | "Canlı kapalı · maç önü oranı" | "Oran";
  text: string;
  isClosed: boolean;
  accessibilityText: string;
};

export function ratioMarketRateDisplay(
  marketRate: MatchMarketRate | undefined,
  phase: "KICK_OFF" | "HALF_TIME" | "LIVE" | null
): RatioMarketRateDisplay {
  if (marketRate?.liveRate !== null && marketRate?.liveRate !== undefined) {
    return {
      label: "Canlı oran",
      text: formatRate(marketRate.liveRate),
      isClosed: false,
      accessibilityText: `canlı oran ${formatRate(marketRate.liveRate)}`
    };
  }
  if (marketRate?.kickoffRate !== null && marketRate?.kickoffRate !== undefined) {
    const kickoffText = formatRate(marketRate.kickoffRate);
    return phase === "KICK_OFF"
      ? {
          label: "Maç önü oranı",
          text: kickoffText,
          isClosed: false,
          accessibilityText: `maç önü oranı ${kickoffText}`
        }
      : {
          label: "Canlı kapalı · maç önü oranı",
          text: kickoffText,
          isClosed: false,
          accessibilityText: `canlı oran kapalı, maç önü oranı ${kickoffText}`
        };
  }
  if (marketRate) {
    return {
      label: "Canlı oran",
      text: "kapalı",
      isClosed: true,
      accessibilityText: "canlı oran kapalı"
    };
  }
  return {
    label: "Oran",
    text: "—",
    isClosed: false,
    accessibilityText: "oran verisi yok"
  };
}
