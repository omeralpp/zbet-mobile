import {
  matchSummarySchema,
  type Dashboard,
  type MatchDetail,
  type MatchInsight,
  type SuperLog,
  type SuperKpis,
  type TotoProgram
} from "./schemas";

const now = "2026-07-28T21:15:00+03:00";

export const mockMatches: MatchDetail[] = [
  {
    key: "2026-07-28:472910:20:45:00",
    id: 472910,
    matchDate: "2026-07-28",
    matchTime: "20:45",
    league: "Finland Veikkausliiga",
    homeTeam: "Inter Turku",
    awayTeam: "Gnistan",
    homeScore: 1,
    awayScore: 0,
    elapsed: 67,
    status: "LIVE",
    selectedOdd: "Ms1X",
    rating: 4,
    liveRate: 1.42,
    currentRate: 1.38,
    pressureDiff: 16.4,
    totalPressure: 68.2,
    lastUpdatedAt: now,
    decisionMinute: 61,
    decisionReason: "SCORE_CHANGED / HOME",
    decisionScore: 3.75,
    decisionConfidence: 0.72,
    homeBallPossession: 58,
    awayBallPossession: 42,
    homeTotalShots: 10,
    awayTotalShots: 6,
    homeShotsOnTarget: 6,
    awayShotsOnTarget: 2,
    homeXg: 1.41,
    awayXg: 0.84,
    homeCorners: 7,
    awayCorners: 3,
    homeYellowCards: 2,
    awayYellowCards: 4,
    homeRedCards: 0,
    awayRedCards: 0,
    scoreDistribution: [
      { score: "1-0", probability: 0.34 },
      { score: "2-0", probability: 0.23 },
      { score: "1-1", probability: 0.18 },
      { score: "2-1", probability: 0.12 }
    ],
    ratioPhase: "LIVE",
    ratioResults: [
      { sort: 1, betType: "Ms1X", kickOff: 61, halfTime: 78, live: 82 },
      { sort: 2, betType: "Kgvar", kickOff: 44, halfTime: 67, live: 71 }
    ]
  },
  {
    key: "2026-07-28:472924:21:00:00",
    id: 472924,
    matchDate: "2026-07-28",
    matchTime: "21:00",
    league: "Norway Eliteserien",
    homeTeam: "Molde",
    awayTeam: "Haugesund",
    homeScore: 0,
    awayScore: 0,
    elapsed: 52,
    status: "LIVE",
    selectedOdd: "Ms25a",
    rating: 3,
    liveRate: 1.86,
    currentRate: 1.81,
    pressureDiff: 8.1,
    totalPressure: 51.7,
    lastUpdatedAt: now,
    decisionMinute: 48,
    decisionReason: "ODDS_CHANGED / GOAL",
    decisionScore: 3.2,
    decisionConfidence: 0.64,
    homeBallPossession: 63,
    awayBallPossession: 37,
    homeTotalShots: 8,
    awayTotalShots: 4,
    homeShotsOnTarget: 4,
    awayShotsOnTarget: 1,
    homeXg: 1.12,
    awayXg: 0.42,
    homeCorners: 6,
    awayCorners: 1,
    homeYellowCards: 1,
    awayYellowCards: 3,
    homeRedCards: 0,
    awayRedCards: 0,
    scoreDistribution: [
      { score: "1-0", probability: 0.27 },
      { score: "2-0", probability: 0.21 },
      { score: "0-0", probability: 0.18 },
      { score: "1-1", probability: 0.16 }
    ],
    ratioPhase: "HALF_TIME",
    ratioResults: [
      { sort: 1, betType: "Ms25a", kickOff: 58, halfTime: 69, live: null },
      { sort: 2, betType: "Kgvar", kickOff: 47, halfTime: 62, live: null }
    ]
  },
  {
    key: "2026-07-28:472938:21:30:00",
    id: 472938,
    matchDate: "2026-07-28",
    matchTime: "21:30",
    league: "Poland Ekstraklasa",
    homeTeam: "Lech Poznan",
    awayTeam: "Gornik Zabrze",
    homeScore: 0,
    awayScore: 1,
    elapsed: 39,
    status: "LIVE",
    selectedOdd: "MsX2",
    rating: 2,
    liveRate: 1.64,
    currentRate: 1.71,
    pressureDiff: -5.8,
    totalPressure: 43.3,
    lastUpdatedAt: now,
    decisionMinute: 39,
    decisionReason: "MANUAL_RECHECK / AWAY",
    decisionScore: 2.4,
    decisionConfidence: 0.57,
    homeBallPossession: 48,
    awayBallPossession: 52,
    homeTotalShots: 5,
    awayTotalShots: 9,
    homeShotsOnTarget: 2,
    awayShotsOnTarget: 4,
    homeXg: 0.61,
    awayXg: 1.33,
    homeCorners: 2,
    awayCorners: 4,
    homeYellowCards: 2,
    awayYellowCards: 1,
    homeRedCards: 0,
    awayRedCards: 0,
    scoreDistribution: [
      { score: "0-1", probability: 0.31 },
      { score: "1-1", probability: 0.25 },
      { score: "0-2", probability: 0.17 },
      { score: "1-2", probability: 0.12 }
    ],
    ratioPhase: "KICK_OFF",
    ratioResults: [
      { sort: 1, betType: "MsX2", kickOff: 64, halfTime: null, live: null },
      { sort: 2, betType: "Kgyok", kickOff: 51, halfTime: null, live: null }
    ]
  },
  {
    key: "2026-07-28:472950:22:00:00",
    id: 472950,
    matchDate: "2026-07-28",
    matchTime: "22:00",
    league: "Sweden Allsvenskan",
    homeTeam: "Hammarby",
    awayTeam: "Sirius",
    homeScore: 0,
    awayScore: 0,
    elapsed: 0,
    status: "NOT_STARTED",
    selectedOdd: "",
    rating: 0,
    liveRate: null,
    currentRate: null,
    pressureDiff: 0,
    totalPressure: 0,
    lastUpdatedAt: now,
    decisionMinute: null,
    decisionReason: "",
    decisionScore: null,
    decisionConfidence: null,
    homeBallPossession: 0,
    awayBallPossession: 0,
    homeTotalShots: 0,
    awayTotalShots: 0,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homeXg: 0,
    awayXg: 0,
    homeCorners: 0,
    awayCorners: 0,
    homeYellowCards: 0,
    awayYellowCards: 0,
    homeRedCards: 0,
    awayRedCards: 0,
    scoreDistribution: [],
    ratioPhase: null,
    ratioResults: []
  }
];

export const mockMatchSummaries = mockMatches.map((match) =>
  matchSummarySchema.strip().parse(match)
);

export const mockMatchInsights: MatchInsight[] = mockMatches.map(
  (match, matchIndex) => ({
    key: match.key,
    homeRedCards: matchIndex === 0 ? 1 : match.homeRedCards,
    awayRedCards: match.awayRedCards,
    homeStandingPosition: matchIndex === 0 ? 2 : null,
    awayStandingPosition: matchIndex === 0 ? 7 : null,
    marketRates: match.ratioResults.map((row, rowIndex) => ({
      sort: row.sort,
      betType: row.betType,
      liveRate: rowIndex === 0 ? 1.38 : null
    }))
  })
);

export const mockSuperLogs: SuperLog[] = [
  {
    key: "super-472910-67",
    matchKey: mockMatches[0]!.key,
    matchName: "Inter Turku - Gnistan",
    createdAt: "2026-07-28T21:12:00+03:00",
    elapsed: 67,
    selectedOdd: "Ms1X",
    rating: 4,
    reason: "SCORE_CHANGED / HOME",
    liveRate: 1.42,
    currentRate: 1.38,
    result: "OPEN",
    profit: null,
    finalScore: "",
    pressureAdjustment: 0.4,
    stateAdjustment: 0.25
  },
  {
    key: "super-472780-82",
    matchKey: "2026-07-28:472780:18:30:00",
    matchName: "VPS - Ilves",
    createdAt: "2026-07-28T20:04:00+03:00",
    elapsed: 82,
    selectedOdd: "Ms25a",
    rating: 3,
    reason: "NOGO / ODDS_CHANGED",
    liveRate: 2.14,
    currentRate: 1.94,
    result: "WON",
    profit: 1.14,
    finalScore: "2-1",
    pressureAdjustment: -0.2,
    stateAdjustment: 0.1
  },
  {
    key: "super-472744-73",
    matchKey: "2026-07-28:472744:17:45:00",
    matchName: "Oulu - SJK",
    createdAt: "2026-07-28T19:13:00+03:00",
    elapsed: 73,
    selectedOdd: "Ms1X",
    rating: 2,
    reason: "SCORE_CHANGED / HOME",
    liveRate: 1.55,
    currentRate: 1.51,
    result: "LOST",
    profit: -1,
    finalScore: "1-2",
    pressureAdjustment: 0.1,
    stateAdjustment: -0.4
  }
];

export const mockTotoPrograms: TotoProgram[] = [
  {
    key: "350:1",
    gcNo: 350,
    version: 1,
    weekText: "2026 / 31. Hafta",
    status: "RESULTED",
    modelVersion: "TOTO_V1",
    columns: 384,
    cost: 384,
    maxColumns: 512,
    singleCount: 8,
    doubleCount: 4,
    tripleCount: 3,
    mainHits: 8,
    coverageHits: 10,
    updatedAt: now,
    fixtures: [
      {
        matchNo: 1,
        matchName: "Galatasaray - Kasımpaşa",
        matchDate: "2026-08-01",
        matchTime: "18:00",
        eventId: 991001,
        actualResult: "1"
      },
      {
        matchNo: 2,
        matchName: "Fenerbahçe - Göztepe",
        matchDate: "2026-08-01",
        matchTime: "20:45",
        eventId: 991002,
        actualResult: "X"
      },
      {
        matchNo: 3,
        matchName: "Samsunspor - Trabzonspor",
        matchDate: "2026-08-02",
        matchTime: "21:00",
        eventId: 991003,
        actualResult: "2"
      }
    ],
    predictions: [
      {
        matchNo: 1,
        matchName: "Galatasaray - Kasımpaşa",
        matchDate: "2026-08-01",
        matchTime: "18:00",
        eventId: 991001,
        actualResult: "1",
        mainPick: "1",
        coverage: "1",
        confidence: 0.72,
        riskScore: 0.2,
        result: "MAIN_HIT"
      },
      {
        matchNo: 2,
        matchName: "Fenerbahçe - Göztepe",
        matchDate: "2026-08-01",
        matchTime: "20:45",
        eventId: 991002,
        actualResult: "X",
        mainPick: "1",
        coverage: "1X",
        confidence: 0.61,
        riskScore: 0.34,
        result: "COVERED"
      },
      {
        matchNo: 3,
        matchName: "Samsunspor - Trabzonspor",
        matchDate: "2026-08-02",
        matchTime: "21:00",
        eventId: 991003,
        actualResult: "2",
        mainPick: "X",
        coverage: "1X2",
        confidence: 0.42,
        riskScore: 0.66,
        result: "COVERED"
      }
    ]
  }
];

const mockSelectedLiveMatches = mockMatches.filter(
  (match) =>
    match.status === "LIVE" && Boolean(match.selectedOdd) && match.rating >= 1
);

export const mockDashboard: Dashboard = {
  generatedAt: now,
  liveMatchCount: mockMatches.filter((match) => match.status === "LIVE").length,
  highStarLiveCount: mockSelectedLiveMatches.filter(
    (match) => match.rating >= 3
  ).length,
  liveStarCounts: {
    ALL: mockSelectedLiveMatches.length,
    STAR_1: mockSelectedLiveMatches.filter((match) => match.rating === 1).length,
    STAR_2: mockSelectedLiveMatches.filter((match) => match.rating === 2).length,
    STAR_3: mockSelectedLiveMatches.filter((match) => match.rating === 3).length,
    STAR_4: mockSelectedLiveMatches.filter((match) => match.rating === 4).length,
    STAR_5: mockSelectedLiveMatches.filter((match) => match.rating === 5).length,
    STAR_3_PLUS: mockSelectedLiveMatches.filter((match) => match.rating >= 3).length
  },
  todaySuperWon: 1,
  todaySuperLost: 1,
  todaySuperProfit: 0.14,
  todayHighStarSuperWon: 1,
  todayHighStarSuperLost: 1,
  todayHighStarSuperProfit: 0.14,
  latestTotoProgram: mockTotoPrograms[0]!,
  featuredMatchMode: "SELECTED_LIVE",
  featuredMatches: mockMatchSummaries
    .filter((match) => match.status === "LIVE")
    .slice(0, 3),
  recentSuper: mockSuperLogs.slice(0, 3)
};

export const mockSuperKpis: SuperKpis = {
  generatedAt: now,
  metricDate: "2026-07-28",
  buckets: {
    STAR_1_PLUS: { won: 1, lost: 1, profit: 0.14 },
    STAR_2_PLUS: { won: 1, lost: 1, profit: 0.14 },
    STAR_3_PLUS: { won: 1, lost: 1, profit: 0.14 },
    STAR_4_PLUS: { won: 1, lost: 0, profit: 1.14 }
  }
};
