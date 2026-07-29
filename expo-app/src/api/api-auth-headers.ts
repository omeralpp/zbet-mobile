export function getApiAuthHeaders(
  pilotAccessKey: string,
  accessToken?: string | null
): Record<string, string> {
  const pilotKey = pilotAccessKey.trim();
  if (pilotKey) {
    return {
      "X-BTB-Pilot-Key": pilotKey
    };
  }

  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`
      }
    : {};
}
