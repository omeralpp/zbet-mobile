import {
  buildLegacyMatchUrl,
  buildLegacySuperLogUrl,
  buildLegacyTotoUrl,
  buildWorkZoneHomeUrl
} from "./routes";

export type FioriTarget = "launchpad" | "match" | "super" | "toto";

export type FioriTargetParams = {
  target: FioriTarget;
  matchKey?: string;
  gcNo?: number;
  version?: number;
  superKey?: {
    matchDate: string;
    matchId: number;
    elapsed: number;
    selectedOdd: string;
    rating: number;
    reason: string;
  };
};

export function resolveFioriTargetUrl(
  launchpadUrl: string,
  params: FioriTargetParams
): string {
  if (params.target === "match" && params.matchKey) {
    return buildLegacyMatchUrl(launchpadUrl, params.matchKey);
  }
  if (
    params.target === "toto" &&
    params.gcNo &&
    params.version
  ) {
    return buildLegacyTotoUrl(
      launchpadUrl,
      params.gcNo,
      params.version
    );
  }
  if (params.target === "super" && params.superKey) {
    return buildLegacySuperLogUrl(launchpadUrl, params.superKey);
  }
  return buildWorkZoneHomeUrl(launchpadUrl);
}

export function fioriTargetTitle(target: FioriTarget): string {
  if (target === "match") {
    return "Fiori maç ayrıntısı";
  }
  if (target === "toto") {
    return "Fiori Toto programı";
  }
  if (target === "super") {
    return "Fiori Super kararı";
  }
  return "Fiori Launchpad";
}
