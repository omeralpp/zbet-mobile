const bilyonerMatchBase =
  "https://www.bilyoner.com/mac-karti/futbol";

export function buildBilyonerMatchUrl(eventId: number): string {
  if (!Number.isSafeInteger(eventId) || eventId <= 0) {
    throw new TypeError("Geçerli bir Bilyoner etkinlik kimliği gerekir.");
  }
  return `${bilyonerMatchBase}/${eventId}/oranlar`;
}
