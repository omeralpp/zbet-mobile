const PARTICIPANT_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

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
