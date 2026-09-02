import { z } from "zod";

const isoDateTime = z.string().min(1);
const finiteNumber = z.number().finite();

/**
 * `NOT_PLAYED` covers the SAP lifecycles that end a fixture without a played
 * regulation result: 08 postponed, 09 abandoned/interrupted, 10 cancelled and
 * 11 awarded/walkover. They are one member rather than four because this app
 * treats them identically - the match is listed, carries no live minute and
 * no score to trust. Splitting them would add four labels for one behaviour.
 */
export const matchStatusSchema = z.enum([
  "LIVE",
  "HALF_TIME",
  "NOT_STARTED",
  "FINISHED",
  "NOT_PLAYED"
]);

export const matchSummarySchema = z.strictObject({
  key: z.string().min(1),
  id: z.number().int().positive(),
  matchDate: z.string().min(1),
  matchTime: z.string().min(1),
  league: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  homeParticipantId: z.string().min(1).nullable().optional(),
  awayParticipantId: z.string().min(1).nullable().optional(),
  homeScore: z.number().int().nonnegative(),
  awayScore: z.number().int().nonnegative(),
  elapsed: z.number().int().nonnegative(),
  status: matchStatusSchema,
  selectedOdd: z.string(),
  rating: z.number().int().min(0).max(5),
  liveRate: finiteNumber.nullable(),
  currentRate: finiteNumber.nullable(),
  pressureDiff: finiteNumber.nullable(),
  totalPressure: finiteNumber.nullable(),
  pressureSource: z.literal("CURRENT_MATCH").nullable().default(null),
  pressureProvider: z.string().min(1).nullable().optional(),
  pressureSnapshotAt: isoDateTime.nullable().optional(),
  lastUpdatedAt: isoDateTime
});

export const scoreDistributionSchema = z.strictObject({
  score: z.string().min(1),
  probability: finiteNumber.min(0).max(1)
});

export const ratioResultSchema = z.strictObject({
  sort: z.number().int().nonnegative(),
  betType: z.string().min(1),
  kickOff: finiteNumber.min(0).max(100).nullable(),
  halfTime: finiteNumber.min(0).max(100).nullable(),
  live: finiteNumber.min(0).max(100).nullable()
});

export const matchMarketRateSchema = z.strictObject({
  sort: z.number().int().nonnegative(),
  betType: z.string().min(1),
  liveRate: finiteNumber.gt(1).nullable(),
  kickoffRate: finiteNumber.gt(1).nullable()
});

export const matchInsightSchema = z.strictObject({
  key: z.string().min(1),
  homeRedCards: z.number().int().nonnegative(),
  awayRedCards: z.number().int().nonnegative(),
  homeStandingPosition: z.number().int().positive().nullable(),
  awayStandingPosition: z.number().int().positive().nullable(),
  marketRates: z.array(matchMarketRateSchema).max(50)
});

export const matchLeagueContextSchema = z.strictObject({
  key: z.string().min(1),
  league: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  source: z.enum(["LATEST_SUPER_DECISION", "UNAVAILABLE"]),
  capturedAt: isoDateTime.nullable(),
  homeStandingPosition: z.number().int().positive().nullable(),
  awayStandingPosition: z.number().int().positive().nullable(),
  homeStandingPoints: z.number().int().nonnegative().nullable(),
  awayStandingPoints: z.number().int().nonnegative().nullable()
});

export const periodScoreContextSchema = z.strictObject({
  key: z.string().min(1),
  halfTimeScore: z
    .strictObject({
      homeScore: z.number().int().nonnegative(),
      awayScore: z.number().int().nonnegative()
    })
    .nullable()
});

// SAP `stats_id` (BetRadar event id) reaches Mobile only on match detail. It
// stays optional so a BFF that has not published the field yet still parses.
const betRadarId = z
  .string()
  .regex(/^[1-9][0-9]{0,17}$/)
  .nullable()
  .optional();

export const matchDetailSchema = matchSummarySchema.extend({
  betRadarId,
  decisionMinute: z.number().int().nonnegative().nullable(),
  decisionReason: z.string(),
  decisionScore: finiteNumber.nullable(),
  decisionConfidence: finiteNumber.min(0).max(1).nullable(),
  homeBallPossession: finiteNumber.min(0).max(100),
  awayBallPossession: finiteNumber.min(0).max(100),
  homeTotalShots: z.number().int().nonnegative(),
  awayTotalShots: z.number().int().nonnegative(),
  homeShotsOnTarget: z.number().int().nonnegative(),
  awayShotsOnTarget: z.number().int().nonnegative(),
  homeXg: finiteNumber.nonnegative(),
  awayXg: finiteNumber.nonnegative(),
  homeCorners: z.number().int().nonnegative(),
  awayCorners: z.number().int().nonnegative(),
  homeYellowCards: z.number().int().nonnegative(),
  awayYellowCards: z.number().int().nonnegative(),
  homeRedCards: z.number().int().nonnegative(),
  awayRedCards: z.number().int().nonnegative(),
  scoreDistribution: z.array(scoreDistributionSchema),
  ratioPhase: z.enum(["KICK_OFF", "HALF_TIME", "LIVE"]).nullable(),
  ratioResults: z.array(ratioResultSchema).max(50)
});

export const superLogSchema = z.strictObject({
  key: z.string().min(1),
  matchKey: z.string().min(1),
  matchName: z.string().min(1),
  // Home and away arrive separately so each crest can be bound to its own team.
  // They stay optional for compatibility with a BFF that only sends matchName.
  homeTeam: z.string().min(1).nullable().optional(),
  awayTeam: z.string().min(1).nullable().optional(),
  homeParticipantId: z.string().min(1).nullable().optional(),
  awayParticipantId: z.string().min(1).nullable().optional(),
  createdAt: isoDateTime,
  elapsed: z.number().int().nonnegative(),
  selectedOdd: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  reason: z.string().min(1),
  liveRate: finiteNumber.nullable(),
  currentRate: finiteNumber.nullable(),
  result: z.enum(["OPEN", "WON", "LOST", "VOID"]),
  profit: finiteNumber.nullable(),
  finalScore: z.string(),
  pressureAdjustment: finiteNumber,
  stateAdjustment: finiteNumber
});

export const superLogDetailSchema = superLogSchema.extend({
  matchDate: z.string().min(1),
  matchTime: z.string(),
  matchId: z.number().int().positive(),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  league: z.string().min(1),
  marketGroup: z.string(),
  decisionHomeScore: z.number().int().nonnegative(),
  decisionAwayScore: z.number().int().nonnegative(),
  baseProbability: finiteNumber.min(0).max(1).nullable(),
  superProbability: finiteNumber.min(0).max(1).nullable(),
  modelScore: finiteNumber.nullable(),
  edgeScore: finiteNumber,
  compatibilityScore: finiteNumber,
  alignmentScore: finiteNumber,
  totalPressure: finiteNumber,
  pressureDiff: finiteNumber,
  homePressure: finiteNumber,
  awayPressure: finiteNumber,
  deviation: finiteNumber,
  initialPool: z.number().int().nonnegative(),
  halfTimePool: z.number().int().nonnegative(),
  postScorePool: z.number().int().nonnegative(),
  selectedOddPool: z.number().int().nonnegative(),
  homeStandingPosition: z.number().int().nonnegative(),
  awayStandingPosition: z.number().int().nonnegative(),
  homeStandingPoints: z.number().int().nonnegative(),
  awayStandingPoints: z.number().int().nonnegative(),
  standingPpgDiff: finiteNumber,
  homeVenuePpg: finiteNumber,
  awayVenuePpg: finiteNumber,
  venuePpgDiff: finiteNumber,
  aiComment: z.string()
});

export const superKpiBucketSchema = z.strictObject({
  won: z.number().int().nonnegative(),
  lost: z.number().int().nonnegative(),
  profit: finiteNumber
});

export const superKpisSchema = z.strictObject({
  generatedAt: isoDateTime,
  metricDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  buckets: z.strictObject({
    STAR_1_PLUS: superKpiBucketSchema,
    STAR_2_PLUS: superKpiBucketSchema,
    STAR_3_PLUS: superKpiBucketSchema,
    STAR_4_PLUS: superKpiBucketSchema
  })
});

export const totoFixtureSchema = z.strictObject({
  matchNo: z.number().int().positive(),
  matchName: z.string().min(1),
  matchDate: z.string(),
  matchTime: z.string(),
  eventId: z.number().int().positive().nullable(),
  actualResult: z.enum(["1", "X", "2"]).nullable(),
  homeScore: z.number().int().nonnegative().nullable().default(null),
  awayScore: z.number().int().nonnegative().nullable().default(null)
});

export const totoPredictionSchema = totoFixtureSchema.extend({
  mainPick: z.enum(["1", "X", "2"]),
  coverage: z.string().min(1),
  confidence: finiteNumber.min(0).max(1),
  riskScore: finiteNumber.min(0),
  result: z.enum(["OPEN", "MAIN_HIT", "COVERED", "MISS"])
});

export const totoProgramSchema = z.strictObject({
  key: z.string().min(1),
  gcNo: z.number().int().positive(),
  version: z.number().int().positive(),
  weekText: z.string().min(1),
  status: z.enum(["ACTIVE", "WAITING_RESULT", "RESULTED", "ERROR"]),
  modelVersion: z.string(),
  columns: z.number().int().nonnegative(),
  cost: finiteNumber.nonnegative(),
  maxColumns: z.number().int().positive(),
  singleCount: z.number().int().nonnegative(),
  doubleCount: z.number().int().nonnegative(),
  tripleCount: z.number().int().nonnegative(),
  mainHits: z.number().int().nonnegative().nullable(),
  coverageHits: z.number().int().nonnegative().nullable(),
  theoreticalPrize: finiteNumber.positive().nullable().default(null),
  payoutDescription: z.string().min(1).nullable().default(null),
  fixtures: z.array(totoFixtureSchema),
  predictions: z.array(totoPredictionSchema),
  updatedAt: isoDateTime
});

export const dashboardSchema = z.strictObject({
  generatedAt: isoDateTime,
  liveMatchCount: z.number().int().nonnegative(),
  highStarLiveCount: z.number().int().nonnegative(),
  liveStarCounts: z.strictObject({
    ALL: z.number().int().nonnegative(),
    STAR_1: z.number().int().nonnegative(),
    STAR_2: z.number().int().nonnegative(),
    STAR_3: z.number().int().nonnegative(),
    STAR_4: z.number().int().nonnegative(),
    STAR_5: z.number().int().nonnegative(),
    STAR_3_PLUS: z.number().int().nonnegative()
  }),
  todaySuperWon: z.number().int().nonnegative(),
  todaySuperLost: z.number().int().nonnegative(),
  todaySuperProfit: finiteNumber,
  todayHighStarSuperWon: z.number().int().nonnegative(),
  todayHighStarSuperLost: z.number().int().nonnegative(),
  todayHighStarSuperProfit: finiteNumber,
  latestTotoProgram: totoProgramSchema.nullable(),
  featuredMatchMode: z.enum([
    "SELECTED_LIVE",
    "PRESSURE_LIVE",
    "UPCOMING",
    "EMPTY"
  ]),
  featuredMatches: z.array(matchSummarySchema).max(3),
  recentSuper: z.array(superLogSchema).max(5)
});

export const matchListSchema = z.array(matchSummarySchema);
export const matchInsightListSchema = z.array(matchInsightSchema);
export const superLogListSchema = z.array(superLogSchema);
export const totoProgramListSchema = z.array(totoProgramSchema);

export type MatchStatus = z.infer<typeof matchStatusSchema>;
export type MatchSummary = z.infer<typeof matchSummarySchema>;
export type MatchDetail = z.infer<typeof matchDetailSchema>;
export type RatioResult = z.infer<typeof ratioResultSchema>;
export type MatchInsight = z.infer<typeof matchInsightSchema>;
export type MatchLeagueContext = z.infer<typeof matchLeagueContextSchema>;
export type MatchMarketRate = z.infer<typeof matchMarketRateSchema>;
export type PeriodScoreContext = z.infer<typeof periodScoreContextSchema>;
export type SuperLog = z.infer<typeof superLogSchema>;
export type SuperLogDetail = z.infer<typeof superLogDetailSchema>;
export type SuperKpis = z.infer<typeof superKpisSchema>;

// The BFF answers with a null body whenever the feature is off, the upstream
// failed, or the candidate did not pass validation there.
export const jinxQuipRequestSchema = z.strictObject({
  kind: z.enum(["POSITIVE", "NEGATIVE", "EVEN", "EMPTY"]),
  filter: z.enum([
    "STAR_1_PLUS",
    "STAR_2_PLUS",
    "STAR_3_PLUS",
    "STAR_4_PLUS"
  ]),
  metricDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  won: z.number().int().nonnegative(),
  lost: z.number().int().nonnegative(),
  profit: z.number()
});

export type JinxQuipRequest = z.infer<typeof jinxQuipRequestSchema>;

export const jinxQuipSchema = z.strictObject({
  enabled: z.boolean(),
  source: z.string(),
  body: z.string().nullable()
});

export type JinxQuipResponse = z.infer<typeof jinxQuipSchema>;
export type TotoProgram = z.infer<typeof totoProgramSchema>;
export type TotoFixture = z.infer<typeof totoFixtureSchema>;
export type TotoPrediction = z.infer<typeof totoPredictionSchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;

/* ------------------------------------------------------------------ *
 * Live Context
 *
 * Provider-neutral by contract. No field below names a provider, and the app
 * must never learn provider JSON vocabulary — the adapter terminates it at the
 * BFF. Enums stay open with `.catch(...)` so an upstream value this build has
 * not seen degrades to UNKNOWN instead of failing the whole screen.
 * ------------------------------------------------------------------ */

export const liveContextAvailabilitySchema = z
  .enum(["OK", "DEGRADED", "UNAVAILABLE", "FAILED"])
  .catch("FAILED");

export const liveMatchPeriodSchema = z
  .enum([
    "FIRST_HALF",
    "HALF_TIME",
    "SECOND_HALF",
    "FULL_TIME",
    "EXTRA_TIME",
    "PENALTIES",
    "UNKNOWN"
  ])
  .catch("UNKNOWN");

/**
 * Published event kinds.
 *
 * The contract carries goals and red cards only — BTB does not reproduce the
 * provider's commentary. `UNKNOWN` is kept purely as the landing value for a
 * kind this build has not seen; such a row is dropped rather than rendered,
 * because there is no honest way to draw an event whose type is unknown.
 */
export const liveEventKindSchema = z
  .enum(["GOAL", "RED_CARD", "UNKNOWN"])
  .catch("UNKNOWN");

/**
 * `UNKNOWN` means the source proved a dismissal without naming which kind — it
 * is never the landing value for a card the server could not classify. Those
 * are excluded server-side and never reach this contract as a red card.
 */
export const redCardTypeSchema = z
  .enum(["DIRECT_RED", "SECOND_YELLOW_RED", "UNKNOWN"])
  .catch("UNKNOWN");

// A person, never an identity. `comparisonForm` is a display/dedup aid and is
// deliberately not surfaced to navigation or any lookup.
export const livePersonSchema = z
  .object({
    rawName: z.string().min(1),
    comparisonForm: z.string().nullable().optional(),
    isIdentified: z.boolean().optional(),
    shirtNumber: z.number().int().nullable().optional()
  })
  .nullable();

export const liveMatchEventSchema = z.object({
  eventKey: z.string().min(1),
  kind: liveEventKindSchema,
  minute: z.number().int().nullable().optional(),
  minuteLabel: z.string().nullable().optional(),
  side: z.enum(["HOME", "AWAY"]).nullable().optional(),
  period: z
    .object({ normalized: liveMatchPeriodSchema })
    .partial()
    .optional(),
  goalKind: z.enum(["GOAL", "OWN_GOAL", "PENALTY", "UNKNOWN"]).nullable().optional(),
  scorer: livePersonSchema.optional(),
  scoreAfter: z
    .object({ home: z.number().int(), away: z.number().int() })
    .nullable()
    .optional(),
  redCardType: redCardTypeSchema.nullable().optional(),
  player: livePersonSchema.optional()
});

/**
 * Derived goal and red-card context.
 *
 * Published for research continuity and read here only so the contract stays
 * one shape end to end. Nothing in the app renders it, and it is not a model
 * input on either side of the wire.
 */
export const liveEventSummarySchema = z
  .object({
    goalCount: z.number().int(),
    redCardCount: z.number().int(),
    latestGoalMinute: z.number().int().nullable().optional(),
    latestRedCardMinute: z.number().int().nullable().optional()
  })
  .partial()
  .nullable();

export const liveContextSchema = z.object({
  matchKey: z.string().nullable().optional(),
  availability: liveContextAvailabilitySchema,
  status: z
    .object({ normalized: z.string(), displayText: z.string().nullable().optional() })
    .partial()
    .optional(),
  period: z
    .object({
      normalized: liveMatchPeriodSchema,
      displayText: z.string().nullable().optional()
    })
    .partial()
    .optional(),
  tournament: z.object({ name: z.string() }).nullable().optional(),
  venue: z
    .object({
      name: z.string().nullable(),
      neutral: z.boolean().nullable()
    })
    .nullable()
    .optional(),
  // null = not retrieved. [] = retrieved and the match genuinely has no goal or
  // red card. Never conflated.
  timeline: z.array(liveMatchEventSchema).nullable(),
  eventSummary: liveEventSummarySchema.optional(),
  freshness: z
    .object({
      providerFetchedAt: isoDateTime.nullable().optional(),
      ageSeconds: z.number().nullable().optional(),
      stale: z.boolean().optional(),
      refreshFailed: z.boolean().optional()
    })
    .partial()
    .optional()
});

export type LiveContext = z.infer<typeof liveContextSchema>;
export type LiveMatchEvent = z.infer<typeof liveMatchEventSchema>;
export type LiveRedCardType = z.infer<typeof redCardTypeSchema>;
export type LiveContextAvailability = z.infer<typeof liveContextAvailabilitySchema>;

/* ------------------------------------------------------------------ *
 * Mobile Intelligence Foundation (M15)
 *
 * Three provider-neutral, read-only contracts that let Mobile build its
 * intelligence surfaces before the engines behind them exist. Real similar-
 * match computation stays TASK-0044 under M9 and real centralized Jinx match
 * analysis stays TASK-0011 under M11; nothing below reads a model, a Super
 * decision, a rating or a threshold, and nothing below is a model input.
 *
 * `origin` is the load-bearing field. It is what stops a synthetic fixture from
 * ever being read as real match knowledge, so every one of these contracts
 * carries it and every surface that renders one has to say so. Its `.catch`
 * lands on SYNTHETIC rather than LIVE deliberately: an unparseable origin is an
 * unknown origin, and the only safe thing an unknown origin may claim is that
 * it is not evidence.
 * ------------------------------------------------------------------ */

/**
 * Where the values in one of these payloads came from.
 *
 * Never inferred from the transport. A payload served by the real BFF is only
 * LIVE because it said so, which keeps the synthetic lane and the eventual real
 * lane distinguishable at the point of rendering rather than by deployment
 * folklore.
 */
export const intelligenceOriginSchema = z
  .enum(["LIVE", "SYNTHETIC"])
  .catch("SYNTHETIC");

export type IntelligenceOrigin = z.infer<typeof intelligenceOriginSchema>;

/**
 * `LOW_SAMPLE` is a separate answer from `OK` and from `UNAVAILABLE`.
 *
 * It means the values are real and computable but rest on too little evidence
 * to be read as characteristic. Collapsing it into OK would present a two-match
 * sample as a form judgement; collapsing it into UNAVAILABLE would throw away
 * information the user can legitimately weigh for themselves.
 */
export const intelligenceAvailabilitySchema = z
  .enum(["OK", "LOW_SAMPLE", "UNAVAILABLE"])
  .catch("UNAVAILABLE");

export type IntelligenceAvailability = z.infer<
  typeof intelligenceAvailabilitySchema
>;

/* ---------------------------- Team form ---------------------------- */

/**
 * One side's recent form, already derived.
 *
 * Every field is a summary a reader can act on directly. No provider row, no
 * fixture list, no opponent identity and no technical id reaches this contract:
 * the adapter terminates all of that server-side, exactly as the live-context
 * contract does. A value the source could not establish is `null` rather than
 * zero, because "no goals conceded" and "we do not know" are different claims.
 */
export const teamFormSideSchema = z.object({
  side: z.enum(["HOME", "AWAY"]),
  wins: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  /** Matches the record above was computed over. */
  matchesSampled: z.number().int().nonnegative(),
  /** Points per match across the whole sample. */
  formPpg: finiteNumber.min(0).max(3).nullable(),
  /** Points per match at this venue only - home form for the home side. */
  venuePpg: finiteNumber.min(0).max(3).nullable(),
  goalsForPerMatch: finiteNumber.nonnegative().nullable(),
  goalsAgainstPerMatch: finiteNumber.nonnegative().nullable(),
  bttsPercent: finiteNumber.min(0).max(100).nullable(),
  over25Percent: finiteNumber.min(0).max(100).nullable(),
  /** Days since this side last played. Fatigue context, never a prediction. */
  restDays: z.number().int().nonnegative().nullable()
});

export const teamFormContextSchema = z.object({
  matchKey: z.string().nullable().optional(),
  contractVersion: z.literal("team-form.v1"),
  origin: intelligenceOriginSchema,
  availability: intelligenceAvailabilitySchema,
  /**
   * The sample size at or above which this payload considers the summary
   * characteristic. Published rather than hard-coded in the app so the
   * threshold and the values it judges can never drift apart.
   */
  minimumReliableSample: z.number().int().positive(),
  home: teamFormSideSchema.nullable(),
  away: teamFormSideSchema.nullable(),
  capturedAt: isoDateTime.nullable().optional()
});

export type TeamFormSide = z.infer<typeof teamFormSideSchema>;
export type TeamFormContext = z.infer<typeof teamFormContextSchema>;

/* --------------------------- Match path ---------------------------- */

/**
 * What narrowed the cohort at this point.
 *
 * `STATE` covers a point taken without a discrete event - a periodic sample of
 * where the match currently sits. `UNKNOWN` is the landing value for a kind
 * this build has not seen; such a point still carries honest numbers, so it is
 * drawn with a neutral marker rather than dropped.
 */
export const matchPathPointKindSchema = z
  .enum([
    "KICK_OFF",
    "GOAL",
    "RED_CARD",
    "HALF_TIME",
    "STATE",
    "FULL_TIME",
    "UNKNOWN"
  ])
  .catch("UNKNOWN");

/**
 * One step along the match's path through its similar-match cohort.
 *
 * The two signals are deliberately separate and neither is derived from
 * `cohortSize`. A cohort shrinking is what always happens as a match acquires
 * events - reading that shrinkage as surprise would label every goal in every
 * match surprising. `eventSurprise` answers "was this event unusual for this
 * cohort"; `stateNormality` answers "is where the match now sits an ordinary
 * place to be". A point may carry one, both or neither.
 */
export const matchPathPointSchema = z.object({
  pointKey: z.string().min(1),
  /** Reader-facing description of the step. Never a provider string. */
  label: z.string().min(1),
  kind: matchPathPointKindSchema,
  minute: z.number().int().nullable(),
  /** Similar matches still matching the path at this point. */
  cohortSize: z.number().int().nonnegative(),
  /** How unusual the event itself was. `null` where it was not computed. */
  eventSurprise: finiteNumber.min(0).max(1).nullable(),
  /** How ordinary the resulting match state is. `null` where not computed. */
  stateNormality: finiteNumber.min(0).max(1).nullable(),
  /** Confidence in this point's own two signals, not in the match. */
  confidence: finiteNumber.min(0).max(1).nullable()
});

export const matchPathContextSchema = z.object({
  matchKey: z.string().nullable().optional(),
  contractVersion: z.literal("match-path.v1"),
  origin: intelligenceOriginSchema,
  availability: intelligenceAvailabilitySchema,
  /** Cohort size at or above which a point's signals are characteristic. */
  minimumReliableCohort: z.number().int().positive(),
  /** Cohort size before any event narrowed it. */
  initialCohortSize: z.number().int().nonnegative(),
  /**
   * `null` = not retrieved. `[]` = retrieved, and the match genuinely has no
   * path yet. Never conflated, for the same reason the live timeline is not.
   */
  points: z.array(matchPathPointSchema).max(40).nullable(),
  capturedAt: isoDateTime.nullable().optional()
});

export type MatchPathPoint = z.infer<typeof matchPathPointSchema>;
export type MatchPathPointKind = z.infer<typeof matchPathPointKindSchema>;
export type MatchPathContext = z.infer<typeof matchPathContextSchema>;

/* ------------------------- Jinx match outlook ---------------------- */

/**
 * One named reason the outlook leans the way it does.
 *
 * `direction` is relative to the outlook's own reading, not to a bet, a market
 * or a Super selection. A signal is a statement about the match, and the app
 * has no vocabulary here for what anyone should do about it.
 */
export const jinxOutlookSignalSchema = z.object({
  signalKey: z.string().min(1),
  label: z.string().min(1),
  direction: z.enum(["SUPPORTING", "OPPOSING", "NEUTRAL"]).catch("NEUTRAL"),
  strength: z.enum(["WEAK", "MODERATE", "STRONG"]).catch("WEAK")
});

/**
 * An informative reading of one match, in the Jinx voice.
 *
 * Jinx is presentation. This contract carries no recommendation, no forecast
 * and no decision, and the client re-checks the wording for both before it
 * reaches a bubble. `DEGRADED` means an outlook was produced from partial
 * material and says so, which is a different statement from having none.
 */
export const jinxMatchOutlookSchema = z.object({
  matchKey: z.string().nullable().optional(),
  contractVersion: z.literal("jinx-match-outlook.v1"),
  origin: intelligenceOriginSchema,
  availability: z.enum(["OK", "DEGRADED", "UNAVAILABLE"]).catch("UNAVAILABLE"),
  /** One-line reading. `null` when there is nothing honest to say. */
  headline: z.string().nullable(),
  /** Supporting paragraph. Optional even when a headline exists. */
  body: z.string().nullable(),
  confidence: finiteNumber.min(0).max(1).nullable(),
  /** What this reading cannot see. Rendered, never summarised away. */
  uncertaintyNote: z.string().nullable(),
  signals: z.array(jinxOutlookSignalSchema).max(8).nullable(),
  freshness: z
    .object({
      capturedAt: isoDateTime.nullable().optional(),
      ageSeconds: z.number().nullable().optional(),
      stale: z.boolean().optional()
    })
    .partial()
    .optional()
});

export type JinxOutlookSignal = z.infer<typeof jinxOutlookSignalSchema>;
export type JinxMatchOutlook = z.infer<typeof jinxMatchOutlookSchema>;
