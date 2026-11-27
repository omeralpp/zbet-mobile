# Maçın yolu gaps, stale balance, 1H pool, goal effect (2026-11-27)

Thread: BTB Mobile Next - Aktif. One local implementation and validation batch
for four owner screenshots (SK Artis Brno – 1.FC Slovacko, Feirense –
Portimonense, 27 Nov). Both surfaces, same `expo-app` code. Committed and pushed 2026-11-27 with owner approval (zbet-cap `3dc553e`);
BFF restarted on `3dc553e`; released as pair `4d6d757` (APK `57EC805B…`, web
`20261127T195220Z-4d6d757`), COMPLETE after both owner smokes. No model,
engine or producer change.

Evidence: read-only PostgreSQL (`prod.zbet_t_rb_cap`) through the BFF's own
modules (scratch scripts, not kept). Producer identity of the captures
`27940DCE…`; BFF policy from the User environment.

## 1. Timeline gaps (NXT-OBS-260)

Capture cadence is not the cause: on 27 Nov, 1,923 of 1,978 OBS intervals
were under 75 s (the ≥ 15 min ones are half time).

| Gap | Cause | Class |
| --- | --- | --- |
| No activity bars before ~41′ in 1H (Brno) | Bilyoner omits a statistic code until its first event (shots 7′, corners 8′, on target 37′). Activity v2 rejected any observation without all six counters. | Confirmed (display assembly) |
| Missing bars in quiet stretches | Without provider time (never set on PostgreSQL) a window with no shots/corners was `ACTIVITY_QUIET_UNPROVEN`. | Confirmed |
| Pool line break ~21′ | That minute's OBS is `STATUS_CONTEXT_ONLY` (stats bracket torn, no display path); the next point does not connect. | Confirmed (engine records it this way, sealed) |
| No points after 90′ / around 45′ | Bilyoner sends a bare `90+`/`45+`; `core/rb/input.js` rejects it, every cycle is `RUNTIME_SOURCE_UNAVAILABLE` (Brno: 7 minutes). | Confirmed, sealed engine rule |
| Line break 45′–47′ | New 2H pool (HT score). | By design |

Fixes:
- BFF `rebuild-pressure-activity.js` (v2 only; v1 unchanged): an omitted
  counter stays `null`, the window restarts whenever the set of present
  counters changes, and an omitted counter contributes "no observed change"
  only between documents that both omit it. A quiet window counts as measured
  when the provider document changed inside it (possession etc.); a frozen
  feed stays unproven. Brno: 22 → 42 measured minutes.
- Client `match-path-model.ts` / `MatchPathCard.tsx`: two points of the same
  pool that do not connect get a dashed bridge; no level is drawn inside it.
  The legend says so.

## 2. "Canlı saha dengesi" hidden (NXT-OBS-261)

Cause (confirmed): RB1 observes nothing at a bare `45+`/`90+` clock or at half
time, so the newest observation passes the 120-second rule. The cycle capture
still records the provider documents RB1 read (hash-verified
`RB1_INPUT_FAILURE_V1`).

Fix (display only, opt-in so the installed `02859c1` APK keeps the strict v1
shape): `GET …/statistics` with `X-BTB-Statistics-Fallback:
recorded-provider.v1` returns `source: RB1_RECORDED_PROVIDER_DOCUMENT` (no
pressure, no xG scope, `clockText` "90+"/"İY", `modelReason`) when RB1 has no
current observation and the recorded document is at most 120 s old. Never for
an identity, policy or read-consistency failure. The panel says "Sağlayıcı
ölçümü · RB1 gözlemi değil" and why.

Owner decision, not done: admit a bare 45+/90+ as model clock (base minute).
That is `core/rb` = MODEL_LOGIC: new producer identity, new cohort, owner model
approval. Owner: BTB - Aktif.

## 3. 1H pool vs Tarihsel skor dağılımı (NXT-OBS-262)

Verified, no change. `core/rb/archive.js` READ_PATH: 1H display pool = `ref_prod.zbet_t_main`
records in the same 11 pre-match odds bands (± deviation) with first-half
score ≥ current; the records are first-half results. 2H = the HT-score pool.
`scoreDistribution` uses the same latest capture's records, so the shown
pool and distribution always match. The HT step ("İY 1–1 · yeni havuz") sits
at the first 2H point; a goal at 45+ is first seen there (see 1).

## 4. Goal pool effect (NXT-OBS-263)

The RB1 path always printed "Bu olaya ait havuz etkisi ölçülmedi". Now
`goalPoolEffect` uses two consecutive verified points of the same pool whose
scores differ by exactly that goal, nearest to the event minute (Feirense 43′:
42′ 172/441 → 43′ 79/441, 93 eliminated). HT-boundary goals, two goals inside
one gap and score corrections stay unmeasured; red cards say the share depends
on the score only.

## Checks

- zbet-cap `npm test`: 1076/1076 (new: activity omitted/quiet tests,
  statistics fallback + header negotiation).
- expo-app: `npm test` 880/880, `tsc`, `eslint` clean.
- Web export `node scripts/web.mjs export` (edge): clean.
- Android bundle `expo export --platform android` (mock profile): clean.
- Browser smoke (desktop + 375 px) on `.codex-artifacts/match-path-gaps-20261127`
  case `recorded`: real Brno pool path/activity from the new BFF code and the
  real 90+ recorded document (only its age rebased). Bars from ~12′, dashed
  bridge at 21′, 33′/65′ goal effects, 48′ HT goal unmeasured, balance panel
  "Sağlayıcı ölçümü · 90+′".
- Owner smokes: Android and app.surklase.com, "Both work" (2026-11-27).

## Release notes

Backward compatible both ways: old APK + new BFF gets the strict v1 statistics
(no header) and more activity points in the unchanged v2 shape; new client +
old BFF ignores the unknown header and works as today. The pool bridge and goal
effect are client-only.
