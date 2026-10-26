import type { MatchSummary } from "@/src/api/schemas";
import { formatElapsed } from "./format";

/** Current match context, separate from the frozen Super decision/result. */
export function decisionMatchState(match: Pick<MatchSummary, "status" | "homeScore" | "awayScore" | "elapsed" | "clock"> | undefined, loading = false) {
  if (!match) return { score: "—", label: loading ? "maç bilgisi yükleniyor" : "maç bilgisi alınamadı", live: false };
  if (match.status === "NOT_PLAYED") return { score: "—", label: "oynanmadı", live: false };
  if (match.status === "NOT_STARTED") return { score: "—", label: "başlamadı", live: false };
  const score = `${match.homeScore}–${match.awayScore}`;
  if (match.status === "LIVE" || match.status === "HALF_TIME") {
    return { score, label: match.status === "HALF_TIME" ? "devre arası" : `${formatElapsed(match.status, match.elapsed, match.clock)} canlı`, live: true };
  }
  return { score, label: "maç sonucu", live: false };
}
