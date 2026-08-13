import { z } from "zod";

const isoDateTime = z.string().min(1);
const finiteNumber = z.number().finite();

export const matchStatusSchema = z.enum([
  "LIVE",
  "HALF_TIME",
  "NOT_STARTED",
  "FINISHED"
]);

export const matchSummarySchema = z.strictObject({
  key: z.string().min(1),
  id: z.number().int().positive(),
  matchDate: z.string().min(1),
  matchTime: z.string().min(1),
  league: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
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
  liveRate: finiteNumber.gt(1).nullable()
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

export const matchDetailSchema = matchSummarySchema.extend({
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
export type TotoProgram = z.infer<typeof totoProgramSchema>;
export type TotoFixture = z.infer<typeof totoFixtureSchema>;
export type TotoPrediction = z.infer<typeof totoPredictionSchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;
