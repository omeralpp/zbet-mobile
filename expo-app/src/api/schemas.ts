import { z } from "zod";

const isoDateTime = z.string().min(1);
const finiteNumber = z.number().finite();

const decisionContextV2Schema = z.strictObject({
  contractVersion: z.literal("decision-context.v2"),
  recentPressure: z.strictObject({
    availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
    reason: z.string().nullable(),
    units: z.enum(["WEIGHTED_ACTIVITY_PER_MINUTE", "EST_SAMPLED_ACTIVITY_PER_MIN"]),
    policyId: z.enum(["MEASUREMENT_V1", "OBSERVED_PILOT_V1"]).default("MEASUREMENT_V1"),
    estimated: z.boolean().default(false),
    observedEpoch: z.string().min(1).nullable().default(null),
    home: finiteNumber.nonnegative().nullable(),
    away: finiteNumber.nonnegative().nullable(),
    total: finiteNumber.nonnegative().nullable(),
    difference: finiteNumber.nullable(),
    intervalSeconds: finiteNumber.positive().max(240).nullable(),
    observedAt: isoDateTime.nullable(),
    sourceTimingKnown: z.boolean(),
    xgCovered: z.boolean(),
    stateRevision: z.string().min(1).nullable()
  }).superRefine((value, context) => {
    const fields = [value.home, value.away, value.total, value.difference,
      value.intervalSeconds, value.observedAt];
    if (value.availability === "UNAVAILABLE") {
      if (!value.reason || [...fields, value.stateRevision, value.observedEpoch].some((field) => field !== null))
        context.addIssue({ code: "custom", message: "Unavailable pressure must carry no measurements." });
    } else if (value.reason !== null || fields.some((field) => field === null) ||
      Math.abs((value.home ?? 0) + (value.away ?? 0) - (value.total ?? 0)) > 1e-9 ||
      Math.abs((value.home ?? 0) - (value.away ?? 0) - (value.difference ?? 0)) > 1e-9) {
      context.addIssue({ code: "custom", message: "Incomplete interval pressure context." });
    }
    if (value.availability === "AVAILABLE" && (value.policyId === "OBSERVED_PILOT_V1"
      ? !value.estimated || value.sourceTimingKnown || value.stateRevision !== null || !value.observedEpoch || value.units !== "EST_SAMPLED_ACTIVITY_PER_MIN"
      : value.estimated || value.observedEpoch !== null || !value.stateRevision || value.units !== "WEIGHTED_ACTIVITY_PER_MINUTE")) {
      context.addIssue({ code: "custom", message: "Pressure policy and evidence identities conflict." });
    }
  }),
  decisionCoherence: z.strictObject({
    availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
    reason: z.string().nullable(),
    stateRevision: z.string().min(1).nullable(),
    quoteRevision: z.string().min(1).nullable()
  }).superRefine((value, context) => {
    if (value.availability === "AVAILABLE") {
      if (value.reason !== null || !value.stateRevision || !value.quoteRevision)
        context.addIssue({ code: "custom", message: "Available coherence requires both revisions." });
    } else if (!value.reason) {
      context.addIssue({ code: "custom", message: "Unavailable coherence requires a reason." });
    }
  })
});

const nullableSha = z.string().regex(/^[0-9A-F]{64}$/).nullable();
export const decisionModelSchema = z.strictObject({
  kind: z.enum(["UNKNOWN", "LEGACY", "PRESSURE_PATH_PILOT"]),
  regimeId: z.string().regex(/^BTB_PPV1_\d{8}$/).nullable(),
  cutoverId: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  arm: z.union([z.literal(0), z.literal(3)]).nullable(),
  scorerSha: nullableSha,
  baseParameterSha: nullableSha,
  decisionRecordSha: nullableSha,
  pressureUnits: z.literal("EST_SAMPLED_ACTIVITY_PER_MIN").nullable(),
  recommendation: z.enum(["CURRENT", "RECORDED", "NONE"])
}).superRefine((value, context) => {
  const identity = [value.regimeId, value.cutoverId, value.arm, value.scorerSha,
    value.baseParameterSha, value.decisionRecordSha, value.pressureUnits];
  if (value.kind === "PRESSURE_PATH_PILOT" ? identity.some(field => field === null) || value.arm !== 3 ||
      value.cutoverId?.replaceAll("-", "") !== value.regimeId?.slice(-8)
    : identity.some(field => field !== null) || value.recommendation === "CURRENT") {
    context.addIssue({ code: "custom", message: "Model identity and recommendation conflict." });
  }
});
export const expectedScorePressureSchema = z.strictObject({
  state: z.enum(["TOWARD", "AGAINST", "PRESERVATION", "MIXED", "UNAVAILABLE"]),
  reason: z.string().nullable(),
  alignment: finiteNumber.min(-1).max(1).nullable(),
  leaders: z.array(z.strictObject({ score: z.string().regex(/^\d+-\d+$/),
    homeRemaining: z.number().int().nonnegative(), awayRemaining: z.number().int().nonnegative() }))
}).superRefine((value, context) => {
  if (value.state === "UNAVAILABLE" ? value.alignment !== null || !value.reason || value.leaders.length !== 0
    : value.state === "MIXED" ? value.alignment !== null || value.leaders.length < 2
    : value.alignment === null || value.leaders.length === 0 ||
      (value.state === "TOWARD" ? value.alignment <= 0 : value.alignment > 0)) {
    context.addIssue({ code: "custom", message: "Score path and pressure direction conflict." });
  }
});
const decisionContextV3Schema = decisionContextV2Schema.extend({
  contractVersion: z.literal("decision-context.v3"),
  model: decisionModelSchema,
  expectedScorePressure: expectedScorePressureSchema
}).superRefine((value, context) => {
  if (value.model.recommendation === "CURRENT" && (value.recentPressure.availability !== "AVAILABLE" ||
      value.recentPressure.policyId !== "OBSERVED_PILOT_V1"))
    context.addIssue({ code: "custom", message: "Current pilot recommendation requires recent estimated pressure." });
});
export const decisionContextSchema = z.union([decisionContextV2Schema, decisionContextV3Schema]);

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
  decisionContext: decisionContextSchema.optional(),
  lastUpdatedAt: isoDateTime
});

export const scoreDistributionSchema = z.strictObject({
  score: z.string().min(1),
  probability: finiteNumber.min(0).max(1),
  /** Original SAP SORT; hidden rows can leave gaps. Never re-rank the slice. */
  rank: z.number().int().positive().optional()
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
  decisionContext: decisionContextSchema.optional(),
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
  /**
   * ISO 4217 unit of theoreticalPrize, from SAP Programs.currency_code
   * (TASK-0109). Accepted before any BFF sends it, because this object is
   * strict: a client must tolerate the field before the server may emit it.
   * Absent means an older BFF, which only ever served TRY.
   */
  theoreticalPrizeCurrency: z.string().regex(/^[A-Z]{3}$/).nullable().default(null),
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
  /** Newest first; null/absent means the source did not publish the order. */
  recentResults: z.array(z.enum(["W", "D", "L"])).max(5).nullable().optional(),
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

/** TASK-0044: retained job observations. Level is an ordinal display index,
 * never a prediction probability; event elimination has its own denominator. */
const modeCountSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const goalModeEffectSchema = z.object({
  measurementStatus: z.enum(["MEASURED", "UNMEASURED"]),
  missingReason: z.enum(["CAPTURE_ORDER_UNPROVEN", "REFERENCE_CHANGED", "NON_GOAL_BOUNDARY",
    "INVALID_POOL", "EMPTY_PRE_EVENT_POOL", "EMPTY_POST_EVENT_POOL", "CONFLICTING_SAMPLE",
    "REPEATED_SCORE_TRANSITION"]).nullable(),
  beforeSampleKey: z.string().min(1), afterSampleKey: z.string().min(1),
  observedFrom: isoDateTime.nullable(), observedTo: isoDateTime.nullable(),
  poolKey: z.string().nullable(), phase: z.union([z.literal(1), z.literal(2)]).nullable(),
  beforeScore: z.string().regex(/^\d+-\d+$/), afterScore: z.string().regex(/^\d+-\d+$/),
  preModes: z.array(z.string().regex(/^\d+-\d+$/)).max(5000),
  postModes: z.array(z.string().regex(/^\d+-\d+$/)).max(5000),
  beforeCount: modeCountSchema.nullable(), afterCount: modeCountSchema.nullable(),
  blockedModeCount: modeCountSchema.nullable(), preModeCount: modeCountSchema.nullable(),
  blockedModeShare: finiteNumber.min(0).max(1).nullable(), eventSurprise: z.null(),
  scale: z.literal("MODAL_DISRUPTION_UNCALIBRATED")
}).superRefine((effect, ctx) => {
  const fail = () => ctx.addIssue({ code: "custom", message: "Invalid goal mode-effect measurement" });
  if (effect.measurementStatus === "UNMEASURED") {
    if (effect.missingReason === null || effect.preModes.length || effect.postModes.length ||
      [effect.beforeCount, effect.afterCount, effect.blockedModeCount, effect.preModeCount,
        effect.blockedModeShare].some(value => value !== null)) fail();
    return;
  }
  if (effect.missingReason !== null || !effect.poolKey || !effect.phase ||
    !effect.observedFrom || !effect.observedTo || effect.observedFrom >= effect.observedTo ||
    !effect.preModes.length || !effect.postModes.length ||
    effect.beforeCount === null || effect.afterCount === null || effect.blockedModeCount === null ||
    effect.preModeCount === null || effect.blockedModeShare === null || effect.preModeCount <= 0 ||
    effect.afterCount <= 0 || effect.afterCount > effect.beforeCount ||
    effect.preModeCount > effect.beforeCount || effect.blockedModeCount > effect.preModeCount ||
    Math.abs(effect.blockedModeShare - effect.blockedModeCount / effect.preModeCount) > 1e-9 ||
    new Set(effect.preModes).size !== effect.preModes.length ||
    new Set(effect.postModes).size !== effect.postModes.length) fail();
});
export type GoalModeEffect = z.infer<typeof goalModeEffectSchema>;

export const matchJourneyPointSchema = z.object({
  key: z.string().min(1), capturedAt: isoDateTime.nullable(),
  minute: z.number().int().min(0).max(150).nullable(),
  plotMinute: finiteNumber.min(0).max(150).nullable(), elapsed: z.string(),
  phase: z.union([z.literal(1), z.literal(2)]).nullable(), status: z.string(),
  home: z.number().int().nonnegative().nullable(), away: z.number().int().nonnegative().nullable(),
  kind: z.enum(["STATE", "GAP", "KICK_OFF", "GOAL", "HALF_TIME", "FULL_TIME", "CORRECTION", "POOL_CHANGE"]),
  reason: z.string(), level: finiteNumber.min(0).max(1).nullable(),
  connects: z.boolean(), referenceChange: z.boolean(), poolKey: z.string().nullable(),
  compatibleCount: z.number().int().nonnegative().nullable(),
  beforeCount: z.number().int().nonnegative().nullable(),
  eliminatedCount: z.number().int().nonnegative().nullable(),
  eliminatedRatio: finiteNumber.min(0).max(1).nullable(),
  pressureAlignment: finiteNumber.min(-1).max(1).nullable(),
  decisionContext: decisionContextSchema.optional(),
  eventEffect: goalModeEffectSchema.nullable().optional()
});
export const matchJourneySchema = z.object({
  matchKey: z.string(), contractVersion: z.enum(["match-journey.v3", "match-journey.v4"]),
  origin: intelligenceOriginSchema, availability: z.enum(["OK", "UNAVAILABLE"]),
  capturedAt: isoDateTime.nullable(), missingReason: z.string().nullable(),
  scale: z.literal("ORDINAL_UNCALIBRATED"),
  points: z.array(matchJourneyPointSchema).max(5000),
  pools: z.array(z.object({
    key: z.string(), phase: z.union([z.literal(1), z.literal(2)]),
    capturedAt: isoDateTime, halfTimeScore: z.string().nullable(),
    count: z.number().int().positive(), modes: z.array(z.string()).min(1),
    rows: z.array(z.object({score: z.string(), count: z.number().int().positive()})).min(1).max(5000)
  })).max(5000)
}).superRefine((journey, ctx) => {
  journey.points.forEach((point, index) => {
    const fail = () => ctx.addIssue({ code: "custom", path: ["points", index, "eventEffect"],
      message: "Goal effect does not match the retained capture contract" });
    if (journey.contractVersion === "match-journey.v3") {
      if (point.eventEffect !== undefined) fail();
      return;
    }
    if (point.eventEffect === undefined || (point.kind === "GOAL") !== (point.eventEffect !== null)) {
      fail(); return;
    }
    const effect = point.eventEffect;
    if (!effect) return;
    const before = journey.points[index - 1];
    if (!before || effect.beforeSampleKey !== before.key || effect.afterSampleKey !== point.key ||
      effect.observedFrom !== before.capturedAt || effect.observedTo !== point.capturedAt ||
      effect.poolKey !== point.poolKey || effect.phase !== point.phase ||
      effect.beforeScore !== `${before.home}-${before.away}` || effect.afterScore !== `${point.home}-${point.away}` ||
      (effect.measurementStatus === "MEASURED" && (!point.connects || before.poolKey !== point.poolKey ||
        before.phase !== point.phase || point.home === null || point.away === null ||
        before.home === null || before.away === null || point.home < before.home || point.away < before.away ||
        point.home - before.home + point.away - before.away !== 1))) fail();
  });
});
export type MatchJourneyPoint = z.infer<typeof matchJourneyPointSchema>;
export type MatchJourney = z.infer<typeof matchJourneySchema>;

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
const jinxMatchOutlookBaseSchema = z.object({
  matchKey: z.string().nullable().optional(),
  contractVersion: z.literal("jinx-match-outlook.v1"),
  reasonCode: z.enum(["MATCH_NOT_LIVE", "LIVE_NOT_VERIFIED", "NO_SELECTION"]).optional(),
  selectionKey: z.string().optional(),
  origin: z.enum(["LIVE", "SYNTHETIC", "DETERMINISTIC"]),
  fallbackReason: z.string().optional(),
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

export const jinxMatchOutlookSchema = z.union([
  jinxMatchOutlookBaseSchema,
  jinxMatchOutlookBaseSchema.extend({
    contractVersion: z.literal("jinx-match-outlook.v2"),
    body: z.null(),
    sections: z.array(z.strictObject({
      kind: z.enum(["SUPPORTING", "LIMITING", "WATCH"]),
      body: z.string().min(1).max(2500)
    })).max(3)
  }).superRefine((outlook, ctx) => {
    const expected = outlook.availability === "UNAVAILABLE" ? [] : ["SUPPORTING", "LIMITING", "WATCH"];
    if (outlook.sections.length !== expected.length || outlook.sections.some((section, index) => section.kind !== expected[index])) {
      ctx.addIssue({ code: "custom", path: ["sections"], message: "Invalid grounded reading sections" });
    }
  })
]);

export type JinxOutlookSignal = z.infer<typeof jinxOutlookSignalSchema>;
export type JinxMatchOutlook = z.infer<typeof jinxMatchOutlookSchema>;

/* Shared screen context and policy-backed Jinx assessment. Legacy readers
 * deliberately retain their original schemas and wording guards. */
export const analysisContextSchema = z.object({
  contractVersion: z.literal("btb-analysis-context.v1"),
  matchKey: z.string().min(1), snapshotId: z.string().min(1),
  evidenceRevision: z.string().min(1), selectionKey: z.string(),
  acquiredAt: z.string().datetime({ offset: true }), expiresAt: z.string().datetime({ offset: true }),
  sourceAvailability: z.record(z.string(), z.string()),
  // Value evidence is server-owned; the client never calculates eligibility.
  valueEvidence: z.unknown().nullable(),
  sources: z.object({
    matchDetail: matchDetailSchema.extend({ currentMatchRecord: z.boolean() }),
    insight: matchInsightSchema.nullable().catch(null),
    periodScore: periodScoreContextSchema.nullable().catch(null),
    leagueContext: matchLeagueContextSchema.nullable().catch(null),
    superLogs: superLogListSchema.nullable().catch(null),
    liveContext: liveContextSchema.nullable().catch(null),
    teamForm: teamFormContextSchema.nullable().catch(null),
    matchPath: matchPathContextSchema.nullable().catch(null),
    matchJourney: matchJourneySchema.nullable().catch(null)
  })
});
export type AnalysisContext = z.infer<typeof analysisContextSchema>;

export const jinxAssessmentSchema = z.strictObject({
  contractVersion: z.literal("jinx-match-outlook.v3"),
  matchKey: z.string().min(1), snapshotId: z.string().min(1),
  evidenceRevision: z.string().min(1), selectionKey: z.string(),
  evaluatedAt: z.string().datetime({ offset: true }), expiresAt: z.string().datetime({ offset: true }),
  verdict: z.enum(["FAVORABLE", "UNFAVORABLE", "WAIT"]),
  reasonCode: z.enum(["MATCH_NOT_LIVE", "LIVE_NOT_VERIFIED", "NO_SELECTION", "CONTEXT_CONFLICT", "POLICY_UNAVAILABLE",
    "VALUE_UNAVAILABLE", "MARKET_UNAVAILABLE", "STATE_MISMATCH", "EVIDENCE_STALE", "VALUE_POSITIVE", "VALUE_NEGATIVE"]),
  shortReason: z.string().min(1).max(240),
  riskNote: z.string().max(120).nullable(),
  evidence: z.array(z.strictObject({ id: z.string(), source: z.string(), text: z.string().max(2500) })).max(2),
  sourceAvailability: z.record(z.string(), z.string()),
  explanationOrigin: z.enum(["LIVE", "DETERMINISTIC"]),
  value: z.strictObject({ probability: finiteNumber.gt(0).lt(1), odds: finiteNumber.gt(1),
    fairPrice: finiteNumber.gt(1), expectedValue: finiteNumber, minimumExpectedValue: finiteNumber.min(0),
    policyId: z.string().min(1), modelVersion: z.string().min(1), validationRef: z.string().min(1),
    quoteMeasuredAt: z.string().datetime({ offset: true }), probabilityMeasuredAt: z.string().datetime({ offset: true }) }).nullable()
}).superRefine((dto, ctx) => {
  const valid = dto.verdict === "WAIT" ? dto.value === null && !["VALUE_POSITIVE", "VALUE_NEGATIVE"].includes(dto.reasonCode)
    : dto.value !== null && (dto.verdict === "FAVORABLE"
      ? dto.reasonCode === "VALUE_POSITIVE" && dto.value.expectedValue > dto.value.minimumExpectedValue
      : dto.reasonCode === "VALUE_NEGATIVE" && dto.value.expectedValue <= dto.value.minimumExpectedValue);
  const consistent = !dto.value || (Math.abs(dto.value.expectedValue - (dto.value.probability * dto.value.odds - 1)) < 1e-9
    && Math.abs(dto.value.fairPrice - 1 / dto.value.probability) < 1e-9);
  if (!valid || !consistent) ctx.addIssue({ code: "custom", path: ["verdict"], message: "Unverified value assessment" });
});
export type JinxAssessment = z.infer<typeof jinxAssessmentSchema>;
