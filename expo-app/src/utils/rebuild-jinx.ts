import type { RebuildRecommendation } from "../api/rebuild-schemas";
import type { JinxRb1Explanation } from "../api/jinx-rb1-schema";

// Wire identity of frozen displayed fields, shared with the BFF contract.
export function rb1EvidenceKey(record: RebuildRecommendation) {
  return JSON.stringify([record.decisionId, record.matchKey, record.market, record.publishedAt,
    record.minute, record.homeScore, record.awayScore, record.quote, record.votesSupport,
    record.votesUsed, record.poolWins, record.poolTotal, record.directionConflict]);
}

export function currentRb1Explanation(explanation: JinxRb1Explanation | null | undefined,
  record: RebuildRecommendation | undefined, matchKey: string, sourceFailed = false) {
  return !sourceFailed && explanation?.availability === "OK" && record
    && explanation.matchKey === matchKey && explanation.decisionId === record.decisionId
    && explanation.evidenceKey === rb1EvidenceKey(record) ? explanation : null;
}
