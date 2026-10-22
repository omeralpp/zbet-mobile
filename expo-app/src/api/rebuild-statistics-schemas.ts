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

export const rebuildPressureHistorySchema = z.strictObject({
  contractVersion: z.literal("btb-pressure-history.v1"), modelRegime: z.literal("BTB_RB1_20261018"),
  matchKey: z.string(), asOf: timestamp,
  availability: z.enum(["AVAILABLE", "PARTIAL", "UNAVAILABLE", "NOT_STARTED"]), reason: z.string(),
  source: z.literal("VERIFIED_RB1_HISTORY"), historical: z.literal(true),
  coverage: z.literal("PERSISTED_VERIFIED_INTERVALS_ONLY"), fullMatchCoverageProven: z.boolean(),
  samples: z.array(historySample), observations: z.array(historyObservation),
  poolPath: z.strictObject({ availability: z.enum(["AVAILABLE", "UNAVAILABLE"]), reason: z.string() })
});

export type RebuildStatistics = z.infer<typeof rebuildStatisticsSchema>;
export type RebuildCurrentPressure = NonNullable<RebuildStatistics["pressure"]>;
export type RebuildPressureHistory = z.infer<typeof rebuildPressureHistorySchema>;
export type RebuildPressureSample = RebuildPressureHistory["samples"][number];
export type RebuildObservation = RebuildPressureHistory["observations"][number];
