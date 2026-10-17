import {
  analysisContextSchema,
  jinxAssessmentSchema,
  jinxMatchOutlookSchema,
  matchPathContextSchema,
  teamFormContextSchema
} from "./schemas";
import {
  mockJinxOutlook,
  mockMatchPath,
  mockRetainedJourney,
  mockTeamForm,
  type MockIntelligenceState
} from "./mock-data";
import type { MobileApi } from "./mobile-api";
import { MobileApiError } from "./mobile-api";
import type { AnalysisContext } from "./schemas";

/**
 * Serves the three M15 routes from the built-in fixtures while every other
 * route keeps using the real API.
 *
 * This exists so the surfaces can be reviewed on a real device before the BFF
 * publishes the routes behind them. It is honest because the payloads declare
 * `origin: SYNTHETIC` and every card that renders one shows a sample-data
 * badge — the numbers are visibly not evidence.
 *
 * It is applied only when the build explicitly asks for `SYNTHETIC`, never as a
 * reaction to a failed request. A 404-triggered fallback would tie the data
 * source to a network result, so an outage could swap measured values for
 * invented ones without anything on screen changing.
 */

/**
 * Preview fixtures key their state off the mock match ids, which no real
 * fixture list contains, so on live data every match would land on the same
 * state. Hashing the key instead gives a real device a stable spread across
 * the populated, thin, partial and unavailable cases.
 *
 * FNV-1a: tiny, dependency-free and stable across runs, which is all that is
 * needed. Nothing here is security-sensitive.
 */
export function hashKey(key: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * The state one match gets, weighted toward the populated case.
 *
 * The point of putting this on a device is to judge the populated layout, so
 * that case is the common one; the rest still appear often enough that the
 * degraded states get looked at too.
 */
export function syntheticStateForKey(key: string): MockIntelligenceState {
  const bucket = hashKey(key) % 10;
  if (bucket <= 5) {
    return "POPULATED";
  }
  if (bucket === 6) {
    return "LOW_SAMPLE";
  }
  if (bucket === 7) {
    return "PARTIAL";
  }
  if (bucket === 8) {
    return "EMPTY";
  }
  return "UNAVAILABLE";
}

/**
 * Wraps an API so only the three M15 reads are answered from fixtures.
 *
 * Every other method is passed through untouched by spreading the base first,
 * so a route added to `MobileApi` later cannot accidentally start returning
 * synthetic data by omission.
 */
export function withSyntheticIntelligence(
  base: MobileApi,
  features = { teamForm: true, matchPath: true, jinxOutlook: true }
): MobileApi {
  const synthetic = features.teamForm || features.matchPath || features.jinxOutlook;
  const contexts = new Map<string, AnalysisContext>();
  return {
    ...base,
    ...(synthetic ? {
      async getMatchAnalysisContext(key: string, signal?: AbortSignal) {
        const packet = await base.getMatchAnalysisContext(key, signal);
        const state = syntheticStateForKey(key);
        const sources = { ...packet.sources,
          ...(features.teamForm ? { teamForm: mockTeamForm(key, state) } : {}),
          ...(features.matchPath ? { matchPath: mockMatchPath(key, state), matchJourney: mockRetainedJourney(key) } : {}) };
        const sourceAvailability = { ...packet.sourceAvailability,
          ...(features.teamForm ? { teamForm: "SYNTHETIC" } : {}),
          ...(features.matchPath ? { matchPath: "SYNTHETIC", matchJourney: "SYNTHETIC" } : {}) };
        const snapshot = analysisContextSchema.parse({ ...packet, sources, sourceAvailability,
          snapshotId: `synthetic-${packet.snapshotId}`, valueEvidence: null,
          evidenceRevision: `${packet.evidenceRevision}:synthetic:${JSON.stringify(sources)}` });
        if (contexts.size >= 128) contexts.delete(contexts.keys().next().value!);
        contexts.set(snapshot.snapshotId, snapshot);
        return snapshot;
      },
      async getMatchJinxAssessment(key: string, snapshotId: string) {
        const packet = contexts.get(snapshotId);
        if (!packet || packet.matchKey !== key || Date.parse(packet.expiresAt) <= Date.now())
          throw new MobileApiError("Maç verisini yenileyip tekrar sor.", 409, "ANALYSIS_SNAPSHOT_EXPIRED");
        return jinxAssessmentSchema.parse({ contractVersion: "jinx-match-outlook.v3", matchKey: key,
          snapshotId, evidenceRevision: packet.evidenceRevision, selectionKey: packet.selectionKey,
          evaluatedAt: new Date().toISOString(), expiresAt: packet.expiresAt, verdict: "WAIT",
          reasonCode: "VALUE_UNAVAILABLE", shortReason: "Jinx önizleme kipinde; canlı oyun kararı üretmiyor.",
          riskNote: "Önizleme verileri gerçek karar kanıtı olarak kullanılmaz.", evidence: [], value: null,
          sourceAvailability: packet.sourceAvailability, explanationOrigin: "DETERMINISTIC" });
      }
    } : {}),
    ...(features.teamForm
      ? {
          async getMatchTeamForm(key: string) {
            return teamFormContextSchema.parse(
              mockTeamForm(key, syntheticStateForKey(key))
            );
          }
        }
      : {}),
    ...(features.matchPath
      ? {
          async getMatchJourney(key: string) {
            return mockRetainedJourney(key);
          },
          async getMatchPath(key: string) {
            return matchPathContextSchema.parse(
              mockMatchPath(key, syntheticStateForKey(key))
            );
          }
        }
      : {}),
    ...(features.jinxOutlook
      ? {
          async getMatchJinxOutlook(key: string) {
            return jinxMatchOutlookSchema.parse(
              mockJinxOutlook(key, syntheticStateForKey(key))
            );
          }
        }
      : {})
  };
}
