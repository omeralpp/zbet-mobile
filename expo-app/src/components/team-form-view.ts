import type {
  IntelligenceOrigin,
  TeamFormContext,
  TeamFormSide
} from "@/src/api/schemas";

/**
 * Presentation decisions for the team-form comparison (M15 / TASK-0040).
 *
 * Pure, so the rules can be tested without a renderer - the same shape as the
 * rest of this codebase's view models.
 *
 * Three rules this module exists to enforce:
 *
 *   1. A small sample is stated, never smoothed over. Two matches at three
 *      points per match is not "perfect form", and the card has to say which
 *      of those two claims it is making.
 *   2. A missing value is dropped, never printed as zero. "Conceded none" and
 *      "we were not told" look identical as a `0` and mean opposite things.
 *   3. Synthetic values are labelled as synthetic wherever they are shown.
 */

export type TeamFormState = "LOADING" | "UNAVAILABLE" | "EMPTY" | "READY";

/**
 * `EMPTY` means the payload arrived and neither side has a match in its
 * sample - a real answer about a fixture nobody has played into yet. It is
 * deliberately distinct from `UNAVAILABLE`, which means nothing arrived.
 */
export function resolveTeamFormState(
  context: TeamFormContext | undefined,
  isLoading?: boolean
): TeamFormState {
  if (isLoading) {
    return "LOADING";
  }
  if (!context || context.availability === "UNAVAILABLE") {
    return "UNAVAILABLE";
  }
  const sides = [context.home, context.away].filter(
    (side): side is TeamFormSide => side !== null
  );
  if (sides.length === 0) {
    return "UNAVAILABLE";
  }
  return sides.every((side) => side.matchesSampled === 0) ? "EMPTY" : "READY";
}

/**
 * Whether the summary rests on too little evidence to read as characteristic.
 *
 * Two independent grounds, either of which is enough: the payload said so, or
 * a side that is present sampled fewer matches than the payload's own declared
 * threshold. The second exists because the threshold travels with the data —
 * the app never hard-codes what "enough matches" means.
 */
export function isSmallSample(context: TeamFormContext | undefined): boolean {
  if (!context) {
    return false;
  }
  if (context.availability === "LOW_SAMPLE") {
    return true;
  }
  return [context.home, context.away].some(
    (side) =>
      side !== null &&
      side.matchesSampled > 0 &&
      side.matchesSampled < context.minimumReliableSample
  );
}

/** Compact W-D-L, in the Turkish shorthand the rest of the app uses. */
export function formRecord(side: TeamFormSide): string {
  return `${side.wins}G ${side.draws}B ${side.losses}M`;
}

export function sampleLabel(side: TeamFormSide): string {
  return side.matchesSampled === 1
    ? "son 1 maç"
    : `son ${side.matchesSampled} maç`;
}

/**
 * The sentence shown when the sample is thin.
 *
 * Names the actual counts rather than saying "limited data", because the
 * reader can only weigh the caveat if they know how thin "thin" is.
 */
export function smallSampleNotice(
  context: TeamFormContext | undefined
): string | null {
  if (!context || !isSmallSample(context)) {
    return null;
  }
  const counts = [context.home, context.away]
    .filter((side): side is TeamFormSide => side !== null)
    .map((side) => side.matchesSampled);
  const smallest = counts.length ? Math.min(...counts) : 0;
  return (
    `Küçük örneklem: ${smallest} maç. ` +
    `Karakteristik sayılması için ${context.minimumReliableSample} maç gerekir.`
  );
}

/**
 * The synthetic-data label.
 *
 * Returns null for LIVE so the badge cannot become decoration that a reader
 * learns to ignore — it appears only when it is making a real claim.
 */
export function originNotice(
  origin: IntelligenceOrigin | undefined
): string | null {
  return origin === "SYNTHETIC"
    ? "Örnek veri · gerçek maç bilgisi değil"
    : null;
}

export type TeamFormRowFormat = "RATE" | "PERCENT" | "COUNT";

export interface TeamFormRow {
  key: string;
  label: string;
  home: number | null;
  away: number | null;
  format: TeamFormRowFormat;
  /** True where a lower number is the better one, e.g. goals conceded. */
  lowerIsBetter: boolean;
}

const rowDefinitions: {
  key: string;
  label: string;
  field: keyof TeamFormSide;
  format: TeamFormRowFormat;
  lowerIsBetter?: boolean;
}[] = [
  { key: "formPpg", label: "Form puanı", field: "formPpg", format: "RATE" },
  { key: "venuePpg", label: "Saha puanı", field: "venuePpg", format: "RATE" },
  {
    key: "goalsFor",
    label: "Attığı gol",
    field: "goalsForPerMatch",
    format: "RATE"
  },
  {
    key: "goalsAgainst",
    label: "Yediği gol",
    field: "goalsAgainstPerMatch",
    format: "RATE",
    lowerIsBetter: true
  },
  { key: "btts", label: "KG Var", field: "bttsPercent", format: "PERCENT" },
  { key: "over25", label: "2.5 Üst", field: "over25Percent", format: "PERCENT" },
  { key: "restDays", label: "Dinlenme", field: "restDays", format: "COUNT" }
];

function numeric(side: TeamFormSide | null, field: keyof TeamFormSide) {
  if (!side) {
    return null;
  }
  const value = side[field];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * The rows the card can honestly draw.
 *
 * A row where neither side has a value is omitted entirely rather than
 * rendered as a pair of dashes: an empty row implies the comparison was made
 * and came out even.
 */
export function teamFormRows(
  context: TeamFormContext | undefined
): TeamFormRow[] {
  if (!context) {
    return [];
  }
  return rowDefinitions
    .map((definition) => ({
      key: definition.key,
      label: definition.label,
      home: numeric(context.home, definition.field),
      away: numeric(context.away, definition.field),
      format: definition.format,
      lowerIsBetter: definition.lowerIsBetter ?? false
    }))
    .filter((row) => row.home !== null || row.away !== null);
}

export interface ComparisonWidths {
  home: number;
  away: number;
}

/**
 * Relative share of one row's dual bar, as percentages.
 *
 * Mirrors the Match Detail statistics bars so form and live stats read as one
 * language. A side without a value contributes nothing and gets no bar at all,
 * which is what keeps a one-sided row visibly one-sided instead of looking
 * like a clean sweep.
 */
export function comparisonWidths(row: TeamFormRow): ComparisonWidths {
  const home = row.home ?? 0;
  const away = row.away ?? 0;
  const total = home + away;
  if (total <= 0) {
    return { home: row.home === null ? 0 : 4, away: row.away === null ? 0 : 4 };
  }
  return {
    home: row.home === null ? 0 : Math.max(4, (home / total) * 100),
    away: row.away === null ? 0 : Math.max(4, (away / total) * 100)
  };
}

export function formatRowValue(
  value: number | null,
  format: TeamFormRowFormat
): string {
  if (value === null) {
    return "—";
  }
  if (format === "PERCENT") {
    return `%${Math.round(value)}`;
  }
  if (format === "COUNT") {
    return `${Math.round(value)} gün`;
  }
  return value.toFixed(2);
}

/** Spoken summary for one side, used only as the accessibility label. */
export function describeSideForAccessibility(
  side: TeamFormSide | null,
  teamName: string | null | undefined
): string {
  if (!side) {
    return `${teamName ?? "Takım"}, form bilgisi yok`;
  }
  return [
    teamName ?? (side.side === "HOME" ? "Ev sahibi" : "Deplasman"),
    `${sampleLabel(side)}`,
    `${side.wins} galibiyet, ${side.draws} beraberlik, ${side.losses} mağlubiyet`,
    side.formPpg === null ? null : `maç başına ${side.formPpg.toFixed(2)} puan`
  ]
    .filter(Boolean)
    .join(", ");
}
