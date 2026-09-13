import type { MatchDetail } from "@/src/api/schemas";

export function jinxIsLive(status: string | undefined) {
  return status === "LIVE" || status === "HALF_TIME";
}

export function jinxSelectionKey(match: Pick<MatchDetail, "key" | "selectedOdd" | "rating" | "decisionMinute" | "decisionReason"> | undefined) {
  return match?.selectedOdd && match.rating > 0
    ? JSON.stringify([match.key, match.selectedOdd, match.rating, match.decisionMinute, match.decisionReason])
    : "";
}
