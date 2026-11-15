import { z } from "zod";

// selection-decisions.v1: Selection Lab rule decisions produced in SAP
// (ZBET_CL_SEL_C1) and read through the BFF. Hypothetical only, one unit at the
// first quote per fixture; the champion report stays the separate source.
const text = z.string().max(200).regex(/^[^\x00-\x1f]*$/);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timestamp = z.string().datetime();
const count = z.number().int().nonnegative();
const decimal = z.string().regex(/^-?\d+\.\d{2}$/);
const fraction = z.string().regex(/^-?\d+\.\d{4}$/);
const market = z.enum(["Ms05a", "Ms05u", "Ms15a", "Ms15u", "Ms25a", "Ms25u", "Ms35a", "Ms35u", "Ms45a", "Ms45u",
  "Ms1", "MsX", "Ms2", "Ms1X", "MsX2", "H1", "H2", "Kgvar", "Kgyok"]);
export const selectionRules = ["C1", "C2", "C3"] as const;
export type SelectionRule = (typeof selectionRules)[number];

const record = z.strictObject({
  decisionId: z.string().regex(/^[0-9A-F]{32}$/),
  fixtureKey: z.string().regex(/^\d{4}-\d{2}-\d{2}:\d+$/),
  homeTeam: text, awayTeam: text, league: text, market,
  quote: decimal, stars: z.number().int().min(1).max(5), minute: count.max(130), period: z.enum(["1H", "2H"]),
  homeScore: count, awayScore: count, live: z.boolean(), decidedAt: timestamp, evaluatedAt: timestamp,
  result: z.strictObject({
    state: z.enum(["WIN", "LOSS", "PENDING", "UNRESOLVED"]), net: decimal.nullable(),
    finalHome: count.nullable(), finalAway: count.nullable()
  })
}).superRefine((value, ctx) => {
  const settled = value.result.state === "WIN" || value.result.state === "LOSS";
  if (settled !== (value.result.net !== null) || settled !== (value.result.finalHome !== null))
    ctx.addIssue({ code: "custom", message: "Selection decision result is inconsistent" });
});

const summary = z.strictObject({
  decisions: count, live: count, settled: count, wins: count, losses: count, pending: count, unresolved: count,
  hitRate: fraction.nullable(), averageQuote: decimal.nullable(), net: decimal, roi: fraction.nullable()
});

export const selectionDecisionsSchema = z.strictObject({
  contractVersion: z.literal("selection-decisions.v1"),
  rule: z.enum(selectionRules), ruleLabel: text, asOf: timestamp,
  window: z.strictObject({ days: z.union([z.literal(1), z.literal(7), z.literal(30)]), from: day, through: day }),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE"]), reason: text.nullable(),
  accounting: z.literal("ONE_HYPOTHETICAL_UNIT_AT_FIRST_QUOTE"), hypotheticalOnly: z.literal(true),
  coverage: z.strictObject({ fixtures: count, tracking: count, decided: count, notEnrolled: count, stopped: count }).nullable(),
  summary: summary.nullable(),
  records: z.array(record).max(2000)
}).superRefine((value, ctx) => {
  const available = value.availability === "AVAILABLE";
  if (available !== Boolean(value.summary && value.coverage) || (!available && value.records.length))
    ctx.addIssue({ code: "custom", message: "Selection decisions availability disagrees with its content" });
  if (value.summary && value.summary.decisions !== value.records.length)
    ctx.addIssue({ code: "custom", message: "Selection decisions summary does not match its records" });
});
export type SelectionDecisions = z.infer<typeof selectionDecisionsSchema>;
export type SelectionDecisionRecord = SelectionDecisions["records"][number];

export function unpublishedSelectionDecisions(rule: SelectionRule, through: string, days: 1 | 7 | 30): SelectionDecisions {
  const from = new Date(Date.parse(`${through}T00:00:00Z`) - (days - 1) * 86400000).toISOString().slice(0, 10);
  return { contractVersion: "selection-decisions.v1", rule, ruleLabel: rule, asOf: new Date().toISOString(),
    window: { days, from, through }, availability: "UNAVAILABLE", reason: "RULE_NOT_PUBLISHED",
    accounting: "ONE_HYPOTHETICAL_UNIT_AT_FIRST_QUOTE", hypotheticalOnly: true, coverage: null, summary: null, records: [] };
}
