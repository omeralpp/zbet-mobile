import { z } from "zod";
const decimal = z.string().regex(/^-?\d+(?:\.\d+)?$/);
const timestamp = z.string().datetime();
const count = z.number().int().nonnegative();
const uuid = z.string().regex(/^[A-F0-9]{32}$/);
const current = z.strictObject({ decisionId: z.string().regex(/^[A-F0-9]{32}$/), market: z.string(), quote: decimal,
  stars: z.number().int().min(1).max(5), consistencyScore: decimal, validUntil: timestamp });
export const rebuildSummarySchema = z.strictObject({ contractVersion: z.literal("btb-rebuild.v1"), modelRegime: z.literal("BTB_RB1_20261018"),
  matchKey: z.string(), asOf: timestamp, availability: z.enum(["ACTIVE", "WAITING_DATA", "UNAVAILABLE", "NOT_STARTED"]), reason: z.string(), current: current.nullable()
}).superRefine((v, ctx) => {
  if ((v.availability === "ACTIVE") !== (v.current !== null)) ctx.addIssue({ code: "custom", message: "Current decision and availability disagree" });
});
const vote = z.strictObject({ startsAt: timestamp, endsAt: timestamp, supports: z.boolean(), estimated: z.boolean(), home: decimal, away: decimal, total: decimal });
const candidate = z.strictObject({ market: z.string(), admitted: z.boolean(), selected: z.boolean(), reason: z.string(), quote: decimal.nullable(), quoteAt: timestamp.nullable(),
  marketOpen: z.boolean().nullable().optional(),
  consistencyScore: decimal.nullable(), stars: z.number().int().min(0).max(5), poolWins: count, poolTotal: count, votesSupport: count, votesUsed: count,
  directionConflict: z.boolean(), dissent: z.boolean(), votes: z.array(vote).max(3),
  caps: z.strictObject({ sample: count, direction: count, timing: count, xg: count, time_goals: count }) });
export const rebuildQuotesSchema = z.strictObject({ contractVersion: z.enum(["btb-market-quotes.v1", "btb-market-quotes.v2"]), matchKey: z.string(), asOf: timestamp,
  candidates: z.array(candidate.pick({market:true,admitted:true,reason:true,quote:true,quoteAt:true,marketOpen:true})).max(19) }).superRefine((value, ctx) => {
  if (new Set(value.candidates.map(item=>item.market)).size !== value.candidates.length)
    ctx.addIssue({code:"custom",message:"Duplicate market quote"});
  if (value.contractVersion === "btb-market-quotes.v2" && value.candidates.some(item=>item.marketOpen === undefined))
    ctx.addIssue({code:"custom",message:"Market state is required for display v2"});
});
export const rebuildRecommendationSchema = candidate.extend({ decisionId: uuid, previousDecisionId: uuid.nullable(), episodeId: uuid, stars: z.number().int().min(1).max(5),
  matchKey: z.string(), homeTeam: z.string(), awayTeam: z.string(),
  publishedAt: timestamp, minute: count, homeScore: count, awayScore: count, leaders: z.array(z.strictObject({ home: count, away: count })),
  countUnit: z.string(), physicalUniqueness: z.string(), result: z.strictObject({ state: z.enum(["WIN", "LOSS", "VOID", "PENDING", "UNRESOLVED"]), revision: z.number().int().positive(), net: decimal.nullable() })
}).superRefine((value, ctx) => {
  if (!value.admitted || !value.selected || value.poolTotal < 1 || value.poolWins > value.poolTotal || value.votesSupport > value.votesUsed
    || (["PENDING", "UNRESOLVED"].includes(value.result.state) ? value.result.net !== null : value.result.net === null))
    ctx.addIssue({ code: "custom", message: "Published recommendation evidence/result is inconsistent" });
});
export const rebuildMatchSchema = rebuildSummarySchema.safeExtend({ history: z.array(rebuildRecommendationSchema), candidates: z.array(candidate).max(19),
  jinx: z.strictObject({ source: z.literal("BACKEND"), decisionId: z.string().nullable(), reason: z.string(), summary: z.string() })
}).superRefine((value, ctx) => {
  if (value.current && (!value.history.some(h => h.decisionId === value.current?.decisionId && h.market === value.current.market)
    || !value.candidates.some(c => c.selected && c.admitted && c.market === value.current?.market)))
    ctx.addIssue({ code: "custom", message: "Current selection lacks its frozen decision/candidate" });
  if (new Set(value.history.map(h => h.decisionId)).size !== value.history.length)
    ctx.addIssue({ code: "custom", message: "Duplicate recommendation identity" });
});
const matchRisk = z.strictObject({ matchKey: z.string(), recommendations: count, totalRisk: count, settled: count, net: decimal });
const aggregate = z.strictObject({ recommendations: count, matches: count, settled: count, wins: count, losses: count, voids: count, pending: count, unresolved: count,
  net: decimal, risk: count, totalRisk: count, roi: z.number().finite().nullable(), hitRate: z.number().min(0).max(1).nullable(), evidenceNote: z.literal("PILOT_MATCH_CLUSTERED"),
  uncertainty: z.strictObject({ method: z.literal("MATCH_CLUSTER_BOOTSTRAP"), lower: z.number().finite(), upper: z.number().finite(), samples: count }).nullable(), byMatch: z.array(matchRisk) });
const threshold = z.strictObject({ settled: count, matches: count, days: count, requiredSettled: count, requiredMatches: count, requiredDays: z.literal(2), reviewAvailable: z.boolean() });
const reportPeriod = aggregate.extend({ days: z.union([z.literal(1), z.literal(7), z.literal(30)]), from: z.string(), through: z.string(),
  byStar: z.array(aggregate.extend({ stars: count })), byMarket: z.array(aggregate.extend({ market: z.string() })) });
const reportLearning = z.strictObject({ analysisOnly: z.literal(true), autoPromotion: z.literal(false), overall: threshold, byMarket: z.array(threshold.extend({ market: z.string() })),
  prospective: z.strictObject({ state: z.literal("FROZEN_CANDIDATE_REGISTRATION_REQUIRED"), requiredSettled: z.literal(50), requiredMatches: z.literal(20), requiredDays: z.literal(2) }), note: z.string() }).nullable();
const reportHead = { modelRegime: z.literal("BTB_RB1_20261018"), asOf: timestamp, timeZone: z.literal("Europe/Istanbul"),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE"]), reason: z.string(), accounting: z.literal("ONE_HYPOTHETICAL_UNIT_AT_FIRST_QUOTE"), actualBetsAssumed: z.literal(false) };
export const rebuildReportSchema = z.strictObject({ contractVersion: z.literal("btb-rebuild-report.v1"), ...reportHead,
  periods: z.array(reportPeriod), recommendations: z.array(rebuildRecommendationSchema), learning: reportLearning });
/**
 * v2: one log of every accepted policy cohort's decisions, each tagged with
 * its cohort. Top-level periods and learning summarize all of them (owner
 * decision 2026-10-22); each cohort keeps its own figures too.
 */
const cohortId = z.string().regex(/^[A-F0-9]{64}$/);
export const rebuildCohortsReportSchema = z.strictObject({ contractVersion: z.literal("btb-rebuild-report.v2"), ...reportHead,
  periods: z.array(reportPeriod), learning: reportLearning,
  cohorts: z.array(z.strictObject({ id: cohortId, label: z.string().min(1), current: z.boolean(), firstDecisionAt: timestamp.nullable(),
    periods: z.array(reportPeriod), learning: reportLearning })),
  recommendations: z.array(rebuildRecommendationSchema.extend({ cohortId })) }).superRefine((value, ctx) => {
  const ids = new Set(value.cohorts.map((c) => c.id));
  if (ids.size !== value.cohorts.length) ctx.addIssue({ code: "custom", message: "Duplicate report cohort" });
  if (value.cohorts.filter((c) => c.current).length > 1) ctx.addIssue({ code: "custom", message: "More than one current cohort" });
  if (value.recommendations.some((r) => !ids.has(r.cohortId))) ctx.addIssue({ code: "custom", message: "Recommendation outside a reported cohort" });
  if (new Set(value.recommendations.map((r) => r.decisionId)).size !== value.recommendations.length)
    ctx.addIssue({ code: "custom", message: "Duplicate recommendation identity" });
});
export type RebuildMatch = z.infer<typeof rebuildMatchSchema>;
export type RebuildSummary = z.infer<typeof rebuildSummarySchema>;
export type RebuildRecommendation = z.infer<typeof rebuildRecommendationSchema>;
export type RebuildCohortsReport = z.infer<typeof rebuildCohortsReportSchema>;
export type RebuildCohort = RebuildCohortsReport["cohorts"][number];
export type RebuildReport = z.infer<typeof rebuildReportSchema>;
