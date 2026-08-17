const PARTICIPANT_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

// One shared identity scale keeps crests predictable across list rows,
// standard cards and detail heroes instead of per-screen sizes.
export const teamLogoSizes = {
  compact: 18,
  standard: 24,
  hero: 40
} as const;

export type TeamLogoSize = keyof typeof teamLogoSizes;

export function resolveTeamLogoSize(size?: TeamLogoSize): number {
  return teamLogoSizes[size ?? "standard"];
}

export function getTeamLogoUrl(
  participantId: string | null | undefined
): string | null {
  if (typeof participantId !== "string") {
    return null;
  }
  const trimmed = participantId.trim();
  if (!PARTICIPANT_ID_PATTERN.test(trimmed)) {
    return null;
  }
  return `https://content.bilyoner.com/assets/participant/${trimmed}.png`;
}

export function hasAnyTeamLogo(
  ...participantIds: (string | null | undefined)[]
): boolean {
  return participantIds.some((id) => getTeamLogoUrl(id) !== null);
}

/**
 * Provider placeholder detection.
 *
 * The crest CDN answers HTTP 200 for a participant id it has no crest for,
 * serving a single provider-branded placeholder image. Because the request
 * succeeds, `onError` never fires and that placeholder would otherwise reach the
 * user as if it were the team's badge.
 *
 * The placeholder is distinguishable from a real crest by its intrinsic
 * dimensions alone, which React Native reports on load — so detection costs no
 * extra request, no byte comparison and no visual heuristic.
 *
 * Measured 2026-08-17 across eight participant ids:
 *   real crests  PNG,  height 64 (widths 64 and 49 observed)
 *   placeholder  WEBP, exactly 128x128, 1304 bytes, byte-identical every time
 *
 * If the provider ever ships real crests at 128x128 this rule needs revisiting;
 * it is deliberately narrow so a crest of any other geometry is always treated
 * as real.
 */
export const providerPlaceholderLogoSize = 128;

export function isProviderPlaceholderLogo(
  width: number | null | undefined,
  height: number | null | undefined
): boolean {
  return (
    width === providerPlaceholderLogoSize &&
    height === providerPlaceholderLogoSize
  );
}
