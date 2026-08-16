const bilyonerMatchBase =
  "https://www.bilyoner.com/mac-karti/futbol";
const bilyonerTotoUrl = "https://www.bilyoner.com/spor-toto";

/** Only this origin may ever be loaded inside the Game Pulse module. */
export const gamePulseOrigin = "https://content.bilyoner.com";
const gamePulsePath = "/statics/canli-anlatim-v2/";
const betRadarIdPattern = /^[1-9][0-9]{0,17}$/;

export function buildBilyonerMatchUrl(eventId: number): string {
  if (!Number.isSafeInteger(eventId) || eventId <= 0) {
    throw new TypeError("Geçerli bir Bilyoner etkinlik kimliği gerekir.");
  }
  return `${bilyonerMatchBase}/${eventId}/oranlar`;
}

export function buildBilyonerTotoUrl(): string {
  return bilyonerTotoUrl;
}

/**
 * Normalizes the SAP `stats_id` (BetRadar event id) carried by the Mobile
 * contract. Anything that is not a plain positive integer identifier is treated
 * as absent so no caller can smuggle a path, query or host into the URL.
 */
export function normalizeBetRadarId(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return betRadarIdPattern.test(trimmed) ? trimmed : null;
}

/**
 * Builds the Bilyoner Game Pulse URL centrally from a validated BetRadar id.
 * Returns null when the id is missing so the module can render an honest empty
 * state instead of loading an arbitrary page.
 */
export function buildGamePulseUrl(betRadarId: unknown): string | null {
  const normalized = normalizeBetRadarId(betRadarId);
  if (!normalized) {
    return null;
  }
  return (
    `${gamePulseOrigin}${gamePulsePath}` +
    `?channel=webView&renderType=gamePulse&betRadarId=${normalized}`
  );
}

/** Guards in-WebView navigation so Game Pulse cannot leave its trusted origin. */
export function isAllowedGamePulseUrl(candidate: string): boolean {
  if (candidate === "about:blank") {
    return true;
  }
  try {
    const url = new URL(candidate);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.origin === gamePulseOrigin
    );
  } catch {
    return false;
  }
}
