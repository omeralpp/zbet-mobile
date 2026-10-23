import { z } from "zod";

/**
 * RB1 statistics and pressure history (zbet-cap docs
 * mobile-bff-statistics-v1.md and mobile-bff-pressure-history-v1.md). Both
 * contracts fail closed like the other RB1 DTOs: an unknown version or shape is
 * an error, never a partial panel. Every measurement is nullable; the client
 * shows null as "—" and never fills it from the legacy zero-default columns.
 */
const decimal = z.string().regex(/^\d+(?:\.\d+)?$/);
const timestamp = z.string().datetime();
const count = z.number().int().nonnegative();
const exactTime = z.string().min(1);
const sha = z.string().regex(/^[A-F0-9]{64}$/);
const pressureMethod = z.enum(["RB1_APPROVED_BASE_10A", "RB1_OPT_STATS_74A_V1"]);
const phase = z.enum(["1H", "2H"]);
const optionalMetric = z.enum(["box", "blocked", "saves"]);
const measured = z.number().nonnegative().nullable();

const statisticsValues = z.strictObject({
  homeTotalShots: measured, awayTotalShots: measured,
  homeShotsOnTarget: measured, awayShotsOnTarget: measured,
  homeCorners: measured, awayCorners: measured,
  homeXg: measured, awayXg: measured,
  homeBallPossession: measured, awayBallPossession: measured,
  homeYellowCards: measured, awayYellowCards: measured,
  homeRedCards: measured, awayRedCards: measured,
  homeBoxTouches: measured, awayBoxTouches: measured,
  homeBlockedShots: measured, awayBlockedShots: measured,
  homeGoalkeeperSaves: measured, awayGoalkeeperSaves: measured
});

const currentPressure = z.strictObject({
  source: z.literal("BACKEND_INTERVAL"), method: pressureMethod, captureId: z.string().min(1),
  startsAt: timestamp, endsAt: timestamp, home: decimal, away: decimal, total: decimal, estimated: z.boolean(),
  components: z.strictObject({
    baseHome: decimal, baseAway: decimal, cappedExtraHome: decimal, cappedExtraAway: decimal,
    optional: z.array(z.strictObject({
      metric: optionalMetric, used: z.boolean(), reason: z.string(),
      homeDelta: count.nullable(), awayDelta: count.nullable(),
      homeContribution: decimal.nullable(), awayContribution: decimal.nullable()
    }))
  }).nullable()
});

export const rebuildStatisticsSchema = z.strictObject({
  contractVersion: z.literal("btb-match-statistics.v1"), modelRegime: z.literal("BTB_RB1_20261018"),
  matchKey: z.string(), asOf: timestamp,
  availability: z.enum(["AVAILABLE", "PARTIAL", "NOT_STARTED", "UNAVAILABLE"]), reason: z.string(),
  observedAt: timestamp.nullable(), source: z.literal("VERIFIED_RB1_OBSERVATION"), captureId: z.string().nullable(),
  pressurePolicy: pressureMethod.nullable(), phase: z.string().nullable(), elapsed: count.nullable(),
  homeScore: count.nullable(), awayScore: count.nullable(), xgScopeVerified: z.boolean(),
  statistics: statisticsValues,
  coverage: z.array(z.strictObject({ metric: z.string(), homePresent: z.boolean(), awayPresent: z.boolean(), reason: z.string() })),
  pressure: currentPressure.nullable()
});

const historySample = z.strictObject({
  captureId: z.string().min(1), stateId: z.string().min(1), pressureSequence: count, policySha: sha, producerSha: sha,
  method: pressureMethod, startsAt: timestamp, endsAt: timestamp, startsAtExact: exactTime, endsAtExact: exactTime,
  startMinute: count, endMinute: count, phase, homeScore: count, awayScore: count,
  home: decimal, away: decimal, total: decimal, estimated: z.boolean(), connects: z.boolean(),
  components: z.strictObject({
    baseHome: decimal, baseAway: decimal, cappedExtraHome: decimal, cappedExtraAway: decimal,
    optional: z.array(z.strictObject({ metric: optionalMetric, used: z.boolean(), reason: z.string().nullable() }))
  }).nullable()
}).refine((sample) => sample.endMinute >= sample.startMinute, { message: "Interval ends before it starts" });

const historyObservation = z.strictObject({
  captureId: z.string().min(1), stateId: z.string().min(1), pressureSequence: count,
  observedAt: timestamp, observedAtExact: exactTime, policySha: sha, producerSha: sha,
  minute: count, phase, homeScore: count, awayScore: count, homeRedCards: count, awayRedCards: count, method: pressureMethod
});

const activityPoint = z.strictObject({
  captureId: z.string().min(1), minute: count.max(150), phase,
  observedAt: timestamp, baselineCaptureId: z.string().nullable(), startsAt: timestamp.nullable(), endsAt: timestamp.nullable(),
  home: z.number().finite().nonnegative().nullable(), away: z.number().finite().nonnegative().nullable(),
  reason: z.string(), connects: z.boolean()
}).superRefine((point, ctx) => {
  const available = point.reason === "AVAILABLE";
  if (available ? point.home === null || point.away === null || !point.baselineCaptureId || !point.startsAt || !point.endsAt ||
    point.endsAt !== point.observedAt || Date.parse(point.endsAt) - Date.parse(point.startsAt) < 270_000 ||
    Date.parse(point.endsAt) - Date.parse(point.startsAt) > 330_000
    : point.home !== null || point.away !== null || point.startsAt !== null || point.endsAt !== null || point.baselineCaptureId !== null || point.connects)
    ctx.addIssue({code:"custom",message:"Activity value and source window disagree"});
});
export const rebuildPressureActivitySchema = z.strictObject({
  contractVersion: z.literal("btb-pressure-activity.v1"), method: z.literal("OBSERVED_ROLLING_5M_BASE_V1"),
  windowMinutes: z.literal(5), units: z.literal("WEIGHTED_ACTIVITY_PER_MINUTE"),
  displayOnly: z.literal(true), affectsSelection: z.literal(false), estimated: z.literal(true),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE"]), reason: z.string(), points: z.array(activityPoint).max(600)
}).superRefine((value,ctx) => {
  if ((value.availability === "AVAILABLE") !== value.points.some(p=>p.reason === "AVAILABLE") ||
    new Set(value.points.map(p=>p.captureId)).size !== value.points.length)
    ctx.addIssue({code:"custom",message:"Activity availability or identities disagree"});
});

export const rebuildPressureHistorySchema = z.strictObject({
  contractVersion: z.literal("btb-pressure-history.v1"), modelRegime: z.literal("BTB_RB1_20261018"),
  matchKey: z.string(), asOf: timestamp,
  availability: z.enum(["AVAILABLE", "PARTIAL", "UNAVAILABLE", "NOT_STARTED"]), reason: z.string(),
  source: z.literal("VERIFIED_RB1_HISTORY"), historical: z.literal(true),
  coverage: z.literal("PERSISTED_VERIFIED_INTERVALS_ONLY"), fullMatchCoverageProven: z.boolean(),
  samples: z.array(historySample), observations: z.array(historyObservation),
  poolPath: z.strictObject({ availability: z.enum(["AVAILABLE", "UNAVAILABLE"]), reason: z.string() }),
  activity: rebuildPressureActivitySchema.nullable().optional()
}).superRefine((history,ctx)=>{
  if (!history.activity) return;
  const observations = new Map(history.observations.map(o=>[o.captureId,o]));
  if (history.activity.points.some(point=>{
    const endpoint=observations.get(point.captureId),baseline=point.baselineCaptureId ? observations.get(point.baselineCaptureId) : null;
    return !endpoint || endpoint.minute !== point.minute || endpoint.phase !== point.phase || endpoint.observedAt !== point.observedAt ||
      (point.reason === "AVAILABLE" && (!baseline || baseline.phase !== point.phase || baseline.observedAt !== point.startsAt));
  })) ctx.addIssue({code:"custom",message:"Activity is not linked to the recorded observations"});
});

export type RebuildStatistics = z.infer<typeof rebuildStatisticsSchema>;
export type RebuildCurrentPressure = NonNullable<RebuildStatistics["pressure"]>;
export type RebuildPressureHistory = z.infer<typeof rebuildPressureHistorySchema>;
export type RebuildPressureSample = RebuildPressureHistory["samples"][number];
export type RebuildObservation = RebuildPressureHistory["observations"][number];

/** Display-only fixed-half reference survival, never a win probability. */
export const rebuildPoolPathSchema = z.strictObject({
  contractVersion: z.literal("btb-pool-path.v1"), modelRegime: z.literal("BTB_RB1_20261018"),
  matchKey: z.string(), asOf: timestamp, availability: z.enum(["AVAILABLE", "UNAVAILABLE"]), reason: z.string(),
  source: z.literal("VERIFIED_RB1_OBSERVATION_POOLS"), label: z.literal("Havuzda kalan pay"),
  unit: z.literal("SURVIVING_REFERENCE_SHARE"), winningProbability: z.literal(false), historical: z.literal(true),
  fullMatchCoverageProven: z.literal(false),
  scoreDistribution: z.strictObject({
    period: z.enum(["1H", "2H"]), captureId: z.string().min(1), observedAt: timestamp, minute: count,
    homeScore: count, awayScore: count, total: count.positive().max(5000), winningProbability: z.literal(false),
    rows: z.array(z.strictObject({ score: z.string().min(1), count: count.positive(), share: z.number().positive().max(1) }))
  }).superRefine((value, ctx) => {
    if (value.rows.reduce((sum, row) => sum + row.count, 0) !== value.total ||
      value.rows.some(row => Math.abs(row.share - row.count / value.total) > 1e-10) ||
      new Set(value.rows.map(row => row.score)).size !== value.rows.length)
      ctx.addIssue({ code: "custom", message: "Score distribution counts and shares disagree" });
  }).nullable().optional(),
  points: z.array(z.strictObject({
    captureId: z.string().min(1), baselineCaptureId: z.string().min(1), baselineAt: timestamp,
    observedAt: timestamp, observedAtExact: exactTime, minute: count, phase, policySha: sha, producerSha: sha,
    sourceSha: sha, homeScore: count, awayScore: count, baselineCount: count.positive().max(5000), remainingCount: count,
    level: z.number().min(0).max(1), connects: z.boolean()
  }).refine(point => point.remainingCount <= point.baselineCount && Math.abs(point.level - point.remainingCount / point.baselineCount) < 1e-10,
    { message: "Pool survival counts and share disagree" }))
});
export type RebuildPoolPath = z.infer<typeof rebuildPoolPathSchema>;
