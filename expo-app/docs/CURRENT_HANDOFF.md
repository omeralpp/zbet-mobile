# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-11-03
Mod: `PAIRED_RELEASE_COMPLETE / ACCEPTED_PAIR_E3AE5DF`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
Only the sections below describe current work. Earlier handoff history is
preserved in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md).

## Son checkpoint

The accepted Android/web pair is **e3ae5df**, released and completed on
3 November 2026 (batch
`client-e3ae5dffdde6d1d6dbc682c0e9d90e1304fa14e4-17989A70DDC7-8516EA40C1CE`).
The owner accepted exact APK installation and Android smoke ("Iy works properly
right now"), then the published web smoke ("Sorunsuz çalışıyor"). Canonical
paired completion passed.

The pair delivers the Super · Karar günlüğü batch
([review, implementation and releases](SUPER_DECISION_LOG_UX_REVIEW_2026-11-03.md)):
NXT-OBS-242 (frozen names fixed, league/kickoff/settled score from the BFF's
opt-in `X-BTB-Report-Facts`, ROI/hit-rate summary, one-level report details,
C1/C2 fixes), NXT-OBS-243 (one Bilyoner button: Toto green, 56 pt, centred,
full width) and NXT-OBS-244 (7/30-day views composed from single verified days,
newest first, three at a time, with progress, partial totals and per-day
retry; phone period menu anchored on screen).

Two intermediate batches stay **INCOMPLETE** and are not releases: `6141e2f`
(APK delivered and owner-accepted, web held for the BTB xG cutover, then
superseded) and `1fcf5cf` (APK delivered, Android smoke found the off-screen
period menu; web not published).

Canonical receipts in `btb-codex/docs/evidence/`:
`super-menu-release-e3ae5df-{PREPARED,DELIVERY,ANDROID-INSTALLED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE}-2026-11-03.json`,
`super-log-bff-restart-e822bc2-2026-11-03.json`,
`super-log-release-6141e2f-{PREPARED,DELIVERY,ANDROID-INSTALLED,SUPERSEDED}-2026-11-03.json` and
`super-days-release-1fcf5cf-{PREPARED,DELIVERY,ANDROID-SMOKE-DEFECT}-2026-11-03.json`.
The previous accepted pair `ba88590` and its receipts remain historical.

## Repo durumu

| Repository | HEAD | Meaning |
| --- | --- | --- |
| zbet-mobile / master | e3ae5dffdde6d1d6dbc682c0e9d90e1304fa14e4 | Accepted client release source; later handoff-only commits do not change the app |
| zbet-cap / main | a057953ba1d0a0330f7619613d86ae9797467a25 | Mobile BFF `e822bc2` (name fix, frozen facts, day windows, repair cohort label) plus the BTB thread's repair-cohort test; the running BFF serves it |
| zbet-abap / main | f25e29dd4a7d8ae8247a19e8d5ba0925e293d0d7 | BTB thread's xG repair reseal; no Mobile SAP change |

Active route: Android pilot API and desktop `app.surklase.com` use the Mobile
BFF at `api.surklase.com`; the origin listens locally on 127.0.0.1:4004.
Desktop remains protected by Cloudflare Access. The pilot is owner-only DEV.
BFF process history today: Mobile restart on `e822bc2` (24444 → 8972), the BTB
thread's identity switch to policy `71AC156E…` (→ 25384), and the e3ae5df web
publication (25384 → 7516, identity unchanged). Identity values belong to the
BTB thread (`BTB Logs/cutover_2026-10-20/observations/implementation_xg_reseal_20261103/`).

## Doğrulama

Release source passed Mobile type/lint/brand, 787 client tests and 33 tooling
tests (`npm run check`); the BFF passed 701/701 tests and the quality gate with
production build on Node 24. The edge web export from the clean pushed source
and the Android preview bundle were secret-scanned (0 findings). The e3ae5df
pair verified source, clean tree, APK bytes/hash, ARM64 and web asset hashes;
the web publication read back 57 served files with 0 mismatches, local probes
passed (shell, deep link, API refused without Access) and the public hostname
still redirects to Cloudflare Access. The frozen-facts and name-fix evidence
are bounded direct OData GET reads (not MCP). Synthetic 320/390/1280/1440 px
checks covered the day-by-day loading with a failing day, retry, cache reuse,
the period menu and every Bilyoner placement. Owner smokes are basic
acceptance, not device-side hashes or exhaustive TalkBack/gesture or
performance measurements.

## Final yerel pilot APK

- Accepted APK: `btb-mobile-next-arm64-super-menu-e3ae5df.apk`
- Source: `e3ae5dffdde6d1d6dbc682c0e9d90e1304fa14e4`
- SHA-256: `17989A70DDC72F9294BD4300C934738B595E4F18901191C6299B7A9A8A72AEEE`
- Size/ABI: 50,579,109 bytes, ARM64; certificate `FAC61745…B9C` (unchanged)
- Matching web tree: `8516EA40C1CEEB63749A8300F6E12BCD87EE8E8FFF17DC7A40BFEFDE0D0B4839`
- Web publication: `20261103T172821Z-e3ae5df`
- Drive: owner-only file `1anfUsJeiyEie55oAxFKZyDFv0-Xvh2kI`
- Pair status: `COMPLETE`, both owner smokes accepted

Under the owner's 29 October retention rule, the superseded local APKs
(`ba88590` `A838F9B2…7F77`, `6141e2f` `427D9DE6…BAA2A`, `1fcf5cf`
`1DB0D20A…5068`) were moved to the Recycle Bin after this acceptance; their
receipts, hashes and Drive copies remain. Previous web releases stay in the
versioned release folder for rollback.

## Açık observation / blokajlar

There is no open local candidate; NXT-OBS-242/243/244 are delivered in
e3ae5df, NXT-OBS-241 in ba88590 and NXT-OBS-235/238/239/240 in c8188ca. Besides
the two new deferred follow-ups NXT-OBS-236 (per-match decision notification,
blocked by NXT-OBS-074) and NXT-OBS-237 (no single RB1 threshold; frozen model;
BTB - Aktif first), six older DEFERRED items remain in
[OBSERVATION_LOG.md](OBSERVATION_LOG.md):

| Observation | Remaining scope |
| --- | --- |
| NXT-OBS-032 | Genuine SAP source freshness timestamp; request time must not masquerade as upstream freshness |
| NXT-OBS-068 | Future corporate login; not a prerequisite for the accepted owner-only pilot |
| NXT-OBS-073 | Trusted participant identity/logo chain and its separately approved backend contract |
| NXT-OBS-074 | Notification producer continuity; unresolved source-side cause retained |
| NXT-OBS-086 | Toto producer event identity/idempotency; Toto ownership retained |
| NXT-OBS-089 | Owner design decision about intentional result/decision presentation |

The owner approved archiving NXT-OBS-143/144/117 as SUPERSEDED without
old-scope success credit, and closing NXT-OBS-100 with its natural-event
scenario explicitly unobserved. Their exact original rows and dispositions
are in [the dated archive](observation_archive/legacy_observation_dispositions_2026-10-30.md).
No other deferred work was closed or implemented.

TASK-0177, TASK-0169 and standing TASK-0168/0171 observation closures remain
accepted historical facts; none is a pending Mobile release gate. Real A5
learning, unobserved scenarios and recurring defects belong to normal BTB
cutover or a concrete owner report. Probability work TASK-0150/0153/0190
remains retired without implementation/success credit.

## Exact next steps

Continue normal owner observation of the accepted pair. Record concrete new
client findings in OBSERVATION_LOG.md; reopen an original finding on a real
recurrence. Do not repeat old release smokes or create signature-wait tasks.
The remaining six DEFERRED items retain their owners and approval/evidence
conditions; their presence does not authorize implementation.

The e3ae5df pair is complete; no client release is being prepared. During
normal use, watch the Super log on real data (7/30-day day-by-day loading on a
slow or failing day, frozen names after a match ends, league/kickoff and MS
score on settled decisions, the new `RB1 · teknik onarım` cohort once it
publishes), the Bilyoner buttons and the earlier Maç detayı batch, and record
any concrete mismatch as a new observation.
Every future Android/web release still requires one clean pushed source,
verified pair, private APK delivery/installation before matching web
publication, and both owner smokes under separate release approval.

## Documents

[Architecture](ARCHITECTURE.md), [next cutover procedure](NEXT_CUTOVER_PROCEDURE.md),
[coordinated release](COORDINATED_CLIENT_RELEASE.md),
`contracts/mobile-api.openapi.yaml`, the rebuild schemas and historical
handoff retain their contract/evidence roles. Mobile and BFF expose BTB/Toto
read-only DTOs; model and learning decisions stay with their owners.
