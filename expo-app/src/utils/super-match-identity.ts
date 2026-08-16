export type SuperMatchIdentity = {
  homeTeam: string;
  awayTeam: string;
};

type SuperMatchIdentitySource = {
  matchName: string;
  homeTeam?: string | null | undefined;
  awayTeam?: string | null | undefined;
};

// Super Log rows carry a single joined label for legacy surfaces, and SAP does
// not pad the separator consistently ("Osijek - L. Zagreb", "Fluminense
// -Palmeiras", "Osijek- L. Zagreb" all occur). A dash therefore only counts as
// a boundary when at least one side carries whitespace, so a hyphenated club
// name such as "Inter Turku-2" or "Saint-Étienne" is never split.
const separatorPattern = /\s[-–—]\s*|[-–—]\s|\svs\.?\s/gi;

function cleanTeamName(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function splitMatchName(matchName: string): SuperMatchIdentity | null {
  separatorPattern.lastIndex = 0;
  const boundaries: { index: number; length: number }[] = [];
  let match = separatorPattern.exec(matchName);
  while (match) {
    boundaries.push({ index: match.index, length: match[0].length });
    match = separatorPattern.exec(matchName);
  }
  // Ambiguous labels stay unsplit: guessing a boundary would attach a crest to
  // the wrong team, which is worse than the joined fallback presentation.
  if (boundaries.length !== 1) {
    return null;
  }
  const [boundary] = boundaries;
  if (!boundary) {
    return null;
  }
  const homeTeam = matchName.slice(0, boundary.index).trim();
  const awayTeam = matchName.slice(boundary.index + boundary.length).trim();
  if (!homeTeam || !awayTeam) {
    return null;
  }
  return { homeTeam, awayTeam };
}

/**
 * Resolves the home/away identity behind a Super decision so each crest can be
 * attached to the team it belongs to. Explicit contract fields win; the joined
 * label is only split when the boundary is unambiguous.
 */
export function superMatchIdentity(
  source: SuperMatchIdentitySource
): SuperMatchIdentity | null {
  const homeTeam = cleanTeamName(source.homeTeam);
  const awayTeam = cleanTeamName(source.awayTeam);
  if (homeTeam && awayTeam) {
    return { homeTeam, awayTeam };
  }
  return splitMatchName(cleanTeamName(source.matchName));
}
