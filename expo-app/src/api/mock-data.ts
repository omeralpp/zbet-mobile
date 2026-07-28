import {
  matchSummarySchema,
  type Dashboard,
  type MatchDetail,
  type SuperLog,
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
    homeBallPossession: 58,
    awayBallPossession: 42,
    homeShotsOnTarget: 6,
    awayShotsOnTarget: 2,
    homeDangerousAttacks: 41,
    awayDangerousAttacks: 24,
    homeCorners: 7,
    awayCorners: 3,
    homeRedCards: 0,
    awayRedCards: 0,
    scoreDistribution: [
      { score: "1-0", probability: 0.34 },
      { score: "2-0", probability: 0.23 },
      { score: "1-1", probability: 0.18 },
      { score: "2-1", probability: 0.12 }
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
    homeBallPossession: 63,
    awayBallPossession: 37,
    homeShotsOnTarget: 4,
    awayShotsOnTarget: 1,
    homeDangerousAttacks: 35,
    awayDangerousAttacks: 18,
    homeCorners: 6,
    awayCorners: 1,
    homeRedCards: 0,
    awayRedCards: 0,
    scoreDistribution: [
      { score: "1-0", probability: 0.27 },
      { score: "2-0", probability: 0.21 },
      { score: "0-0", probability: 0.18 },
      { score: "1-1", probability: 0.16 }
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
    homeBallPossession: 48,
    awayBallPossession: 52,
    homeShotsOnTarget: 2,
    awayShotsOnTarget: 4,
    homeDangerousAttacks: 20,
    awayDangerousAttacks: 29,
    homeCorners: 2,
    awayCorners: 4,
    homeRedCards: 0,
    awayRedCards: 0,
    scoreDistribution: [
      { score: "0-1", probability: 0.31 },
      { score: "1-1", probability: 0.25 },
      { score: "0-2", probability: 0.17 },
      { score: "1-2", probability: 0.12 }
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
    homeBallPossession: 0,
    awayBallPossession: 0,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homeDangerousAttacks: 0,
    awayDangerousAttacks: 0,
    homeCorners: 0,
    awayCorners: 0,
    homeRedCards: 0,
    awayRedCards: 0,
    scoreDistribution: []
  }
];

export const mockMatchSummaries = mockMatches.map((match) =>
  matchSummarySchema.strip().parse(match)
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
    status: "WAITING_RESULT",
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
    predictions: [
      {
        matchNo: 1,
        matchName: "Galatasaray - Kasımpaşa",
        mainPick: "1",
        coverage: "1",
        confidence: 0.72,
        riskScore: 0.2,
        result: "HIT"
      },
      {
        matchNo: 2,
        matchName: "Fenerbahçe - Göztepe",
        mainPick: "1",
        coverage: "1X",
        confidence: 0.61,
        riskScore: 0.34,
        result: "HIT"
      },
      {
        matchNo: 3,
        matchName: "Samsunspor - Trabzonspor",
        mainPick: "X",
        coverage: "1X2",
        confidence: 0.42,
        riskScore: 0.66,
        result: "MISS"
      }
    ]
  }
];

export const mockDashboard: Dashboard = {
  generatedAt: now,
  liveMatchCount: mockMatches.filter((match) => match.status === "LIVE").length,
  highStarLiveCount: mockMatches.filter(
    (match) => match.status === "LIVE" && match.rating >= 3
  ).length,
  todaySuperWon: 1,
  todaySuperLost: 1,
  todaySuperProfit: 0.14,
  latestTotoProgram: mockTotoPrograms[0]!,
  featuredMatches: mockMatchSummaries
    .filter((match) => match.status === "LIVE")
    .slice(0, 3),
  recentSuper: mockSuperLogs.slice(0, 3)
};
