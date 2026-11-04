// Constructed integration evidence only. No match/provider data or SAP calls.
// Run from expo-app in the shared workspace to freeze a BFF builder response for the
// independent Android/web validator. Normal client tests need no sibling repo.
const { createHash } = require("node:crypto");
const { writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const app = resolve(".");
const { buildPressureActivityV2 } = require(resolve(app, "../../zbet-cap/srv/mobile-bff/rebuild-pressure-activity.js"));
const expected = { date: "2026-10-20", id: 17, key: "2026-10-20:17:13:00:00" };
const caps = Array.from({ length: 8 }, (_, n) => {
  const at = new Date(Date.parse("2026-10-20T11:00:00Z") + n * 120000).toISOString();
  const home = [2*n, n, n], away = [n, 0, 0];
  const statistics = ["TOPLAM_SUT", "ISABETLI_SUT", "KORNER"].map((statisticscode,i) => ({ statisticscode, hometeamvalue: String(home[i]), awayteamvalue: String(away[i]) }));
  const raw = JSON.stringify({ version: "RB1_RAW_INPUT_V1", datum: expected.date, id: expected.id,
    stats: { kind: "STATS", match_id: expected.id, received_at: at,
      body: JSON.stringify({ eventid: expected.id, liveperiodstatistics: [{ periodcode: "GENEL", statistics }] }) } });
  const side = values => ({ shots: values[0], on_target: values[1], corners: values[2], shots_present: true, target_present: true, corners_present: true });
  return { header: { kind: "OBS", cap_id: (n+100).toString(16).toUpperCase().padStart(32,"0"), created_at: at, policy_sha: "D".repeat(64), producer_sha: "E".repeat(64) },
    payload: { raw_source: raw, observation: { datum: expected.date, id: expected.id, context_complete: true,
      clock_known: true, elapsed: n*2, phase: "1H", home_score: 0, away_score: 0,
      request_started_at: at, acquired_at: at, source_sha: createHash("sha256").update(raw).digest("hex").toUpperCase(),
      provider_time_proven: false, provider_at: at, provider_measurement: `constructed-${n}`, home: side(home), away: side(away) } } };
});
const packet = { contractVersion: "btb-pressure-history.v1", modelRegime: "BTB_RB1_20261018", matchKey: expected.key,
  asOf: caps.at(-1).header.created_at, availability: "PARTIAL", reason: "NO_VALID_INTERVALS", source: "VERIFIED_RB1_HISTORY",
  historical: true, coverage: "PERSISTED_VERIFIED_INTERVALS_ONLY", fullMatchCoverageProven: false, samples: [],
  observations: caps.map(cap => ({ captureId: cap.header.cap_id, stateId: "F".repeat(32), pressureSequence: 1,
    observedAt: cap.header.created_at, observedAtExact: cap.header.created_at, policySha: cap.header.policy_sha,
    producerSha: cap.header.producer_sha, minute: cap.payload.observation.elapsed, phase: "1H", homeScore: 0, awayScore: 0,
    homeRedCards: 0, awayRedCards: 0, method: "RB1_OPT_STATS_74A_V1" })),
  poolPath: { availability: "UNAVAILABLE", reason: "RB1_POOL_PATH_NOT_EXPOSED" },
  activity: buildPressureActivityV2(caps, expected) };
writeFileSync(resolve(app, "src/api/fixtures/btb-pressure-history-v2.json"), JSON.stringify(packet, null, 2)+"\n");
