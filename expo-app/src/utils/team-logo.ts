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
