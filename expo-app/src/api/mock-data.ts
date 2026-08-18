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
    homeParticipantId: "100021",
    awayParticipantId: "100022",
    betRadarId: "70000001",
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
    pressureSource: "CURRENT_MATCH",
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
    pressureSource: "CURRENT_MATCH",
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
    pressureSource: "CURRENT_MATCH",
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
    pressureSource: "CURRENT_MATCH",
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
  },
  // Layout stress fixture. Long Turkish club names, a scoreline in double
  // figures on one side, late-match elapsed and no participant ids, so the card
  // has to survive wrapping, a wide score, a wide minute pill and the crest
  // fallback all at once. Kept in the fixtures rather than checked by hand: this
  // is the combination that breaks a match card, and it should stay checkable.
  {
    key: "2026-07-28:472961:19:15:00",
    id: 472961,
    matchDate: "2026-07-28",
    matchTime: "19:15",
    league: "Türkiye Trendyol Süper Lig",
    homeTeam: "Yukatel Adana Demirspor",
    awayTeam: "Fatih Karagümrük Spor Kulübü",
    betRadarId: "70000009",
    homeScore: 4,
    awayScore: 3,
    elapsed: 90,
    status: "LIVE",
    selectedOdd: "Ms2/AltÜst25",
    rating: 5,
    liveRate: 12.75,
    currentRate: 14.5,
    pressureDiff: -24.8,
    totalPressure: 91.4,
    pressureSource: "CURRENT_MATCH",
    lastUpdatedAt: now,
    decisionMinute: 88,
    decisionReason: "ODDS_CHANGED / AWAY",
    decisionScore: 4.9,
    decisionConfidence: 0.55,
    homeBallPossession: 47,
    awayBallPossession: 53,
    homeTotalShots: 18,
    awayTotalShots: 16,
    homeShotsOnTarget: 9,
    awayShotsOnTarget: 8,
    homeXg: 3.62,
    awayXg: 2.98,
    homeCorners: 11,
    awayCorners: 9,
    homeYellowCards: 5,
    awayYellowCards: 6,
    homeRedCards: 1,
    awayRedCards: 2,
    scoreDistribution: [{ score: "4-3", probability: 0.41 }],
    ratioPhase: "LIVE",
    ratioResults: [
      { sort: 1, betType: "AltUst25", kickOff: 71, halfTime: 80, live: 88 }
    ]
  },
  // Finished match: the minute pill must fall back to a neutral "MS" and drop
  // the live signature entirely.
  {
    key: "2026-07-28:472962:16:00:00",
    id: 472962,
    matchDate: "2026-07-28",
    matchTime: "16:00",
    league: "Denmark Superliga",
    homeTeam: "Brondby",
    awayTeam: "Midtjylland",
    betRadarId: "70000010",
    homeScore: 2,
    awayScore: 2,
    elapsed: 90,
    status: "FINISHED",
    selectedOdd: "Ms12",
    rating: 3,
    liveRate: 1.62,
    currentRate: null,
    pressureDiff: 2.1,
    totalPressure: 44.0,
    pressureSource: "CURRENT_MATCH",
    lastUpdatedAt: now,
    decisionMinute: 70,
    decisionReason: "SCORE_CHANGED / AWAY",
    decisionScore: 2.4,
    decisionConfidence: 0.61,
    homeBallPossession: 51,
    awayBallPossession: 49,
    homeTotalShots: 12,
    awayTotalShots: 11,
    homeShotsOnTarget: 5,
    awayShotsOnTarget: 4,
    homeXg: 1.72,
    awayXg: 1.65,
    homeCorners: 6,
    awayCorners: 5,
    homeYellowCards: 2,
    awayYellowCards: 3,
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
    homeTeam: "Inter Turku",
    awayTeam: "Gnistan",
    homeParticipantId: "100021",
    awayParticipantId: "100022",
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
    homeTeam: "VPS",
    awayTeam: "Ilves",
    homeParticipantId: "100031",
    awayParticipantId: "100032",
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
    theoreticalPrize: 125000.5,
    payoutDescription: "15 bilen kolonlar için teorik toplam",
    updatedAt: now,
    fixtures: [
      {
        matchNo: 1,
        matchName: "Galatasaray - Kasımpaşa",
        matchDate: "2026-08-01",
        matchTime: "18:00",
        eventId: 991001,
        actualResult: "1",
        homeScore: 2,
        awayScore: 1
      },
      {
        matchNo: 2,
        matchName: "Fenerbahçe - Göztepe",
        matchDate: "2026-08-01",
        matchTime: "20:45",
        eventId: 991002,
        actualResult: "X",
        homeScore: 1,
        awayScore: 1
      },
      {
        matchNo: 3,
        matchName: "Samsunspor - Trabzonspor",
        matchDate: "2026-08-02",
        matchTime: "21:00",
        eventId: 991003,
        actualResult: "2",
        homeScore: 0,
        awayScore: 2
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
        homeScore: 2,
        awayScore: 1,
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
        homeScore: 1,
        awayScore: 1,
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
        homeScore: 0,
        awayScore: 2,
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

/* ------------------------------------------------------------------ *
 * Live context preview fixtures
 *
 * Preview/mock builds only. Each mock match maps to one live-context state so
 * a single preview session can show populated, empty, unavailable and stale
 * without reconfiguring the app.
 * ------------------------------------------------------------------ */

export type MockLiveContextState =
  | "POPULATED"
  | "EMPTY"
  | "UNAVAILABLE"
  | "STALE";

export function mockLiveContextState(key: string): MockLiveContextState {
  if (key.includes("472910")) return "POPULATED";
  if (key.includes("472924")) return "EMPTY";
  if (key.includes("472938")) return "STALE";
  return "UNAVAILABLE";
}

function person(rawName: string, shirtNumber?: number) {
  return { rawName, comparisonForm: null, isIdentified: false, shirtNumber: shirtNumber ?? null };
}

const previewTimeline = [
  {
    eventKey: "GOAL|FIRST_HALF|18|HOME|calafiori",
    kind: "GOAL",
    minute: 18,
    minuteLabel: "18'",
    side: "HOME",
    period: { normalized: "FIRST_HALF" },
    goalKind: "GOAL",
    scorer: person("Calafiori, Riccardo"),
    scoreAfter: { home: 1, away: 0 }
  },
  {
    eventKey: "GOAL|FIRST_HALF|30|HOME|havertz",
    kind: "GOAL",
    minute: 30,
    minuteLabel: "30'",
    side: "HOME",
    period: { normalized: "FIRST_HALF" },
    goalKind: "GOAL",
    scorer: person("Havertz, Kai"),
    scoreAfter: { home: 2, away: 0 }
  },
  {
    eventKey: "GOAL|SECOND_HALF|58|AWAY|marmoush",
    kind: "GOAL",
    minute: 58,
    minuteLabel: "58'",
    side: "AWAY",
    period: { normalized: "SECOND_HALF" },
    goalKind: "GOAL",
    scorer: person("Marmoush, Omar"),
    scoreAfter: { home: 2, away: 1 }
  },
  {
    eventKey: "RED_CARD|SECOND_HALF|72|HOME|rice",
    kind: "RED_CARD",
    minute: 72,
    minuteLabel: "72'",
    side: "HOME",
    period: { normalized: "SECOND_HALF" },
    redCardType: "DIRECT_RED",
    player: person("Rice, Declan")
  },
  {
    eventKey: "RED_CARD|SECOND_HALF|88|AWAY|foden",
    kind: "RED_CARD",
    minute: 88,
    minuteLabel: "88'",
    side: "AWAY",
    period: { normalized: "SECOND_HALF" },
    redCardType: "SECOND_YELLOW_RED",
    player: person("Foden, Phil")
  }
];

const previewEventSummary = {
  goalCount: 3,
  redCardCount: 2,
  latestGoalMinute: 58,
  latestRedCardMinute: 88
};

export function mockLiveContext(key: string, state: MockLiveContextState) {
  if (state === "POPULATED") {
    return {
      matchKey: key,
      availability: "OK",
      period: { normalized: "SECOND_HALF", displayText: "2. Yarı" },
      timeline: previewTimeline,
      eventSummary: previewEventSummary,
      freshness: { ageSeconds: 12, stale: false, refreshFailed: false }
    };
  }
  if (state === "EMPTY") {
    // Retrieved successfully, and the match genuinely has no events yet.
    return {
      matchKey: key,
      availability: "OK",
      timeline: [],
      eventSummary: { goalCount: 0, redCardCount: 0 },
      freshness: { ageSeconds: 8, stale: false, refreshFailed: false }
    };
  }
  if (state === "STALE") {
    return {
      matchKey: key,
      availability: "DEGRADED",
      timeline: previewTimeline.slice(0, 3),
      eventSummary: previewEventSummary,
      freshness: { ageSeconds: 420, stale: true, refreshFailed: true }
    };
  }
  // Not retrieved. null, never [].
  return {
    matchKey: key,
    availability: "UNAVAILABLE",
    timeline: null,
    eventSummary: null,
    freshness: { stale: true, refreshFailed: true }
  };
}
