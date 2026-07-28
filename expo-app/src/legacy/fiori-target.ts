import { buildLegacyMatchUrl, buildLegacyTotoUrl } from "./routes";

export type FioriTarget = "launchpad" | "match" | "toto";

export type FioriTargetParams = {
  target: FioriTarget;
  matchKey?: string;
  gcNo?: number;
  version?: number;
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
  return launchpadUrl;
}

export function fioriTargetTitle(target: FioriTarget): string {
  if (target === "match") {
    return "Fiori maç ayrıntısı";
  }
  if (target === "toto") {
    return "Fiori Toto programı";
  }
  return "Fiori Launchpad";
}
