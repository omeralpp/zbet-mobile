# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-31
Mod: `PAIRED_RELEASE_COMPLETE / ACCEPTED_PAIR_C8188CA`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
Only the sections below describe current work. Earlier handoff history is
preserved in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md).

## Son checkpoint

The accepted Android/web pair is **c8188ca**, released and completed on
31 October 2026 (batch
`client-c8188ca0d14fa990e5b9c634ebc2fd359ecf49db-8A793C74C55D-D7F46B390F8C`).
The owner accepted exact APK installation and Android smoke ("Kuruldu, sorun
yok"), then the published web smoke ("Web sorunsuz"). Canonical paired
completion passed.

The pair delivers, on one shared Android/web client:

- NXT-OBS-235 Jinx decision outlook ([record](JINX_OUTLOOK_IMPLEMENTATION_2026-10-31.md)).
- NXT-OBS-238 Toto Programlar + Toto programı UX ([record](TOTO_UX_IMPLEMENTATION_2026-10-31.md)).
- NXT-OBS-239 SAP Toto display facts through the BFF opt-in
  `X-BTB-Toto-Display: btb-toto-display.v1` (contract
  `zbet-cap/docs/TOTO_DISPLAY_V1_2026-10-31.md`).
- NXT-OBS-240 Jinx keeps the decision-moment comment above the refreshing
  current check (owner web-smoke finding on the first release attempt).

The first attempt, `658e461` (APK `8C932F67…AD1962`, web
`20261031T161031Z-658e461`), passed Android smoke but failed web smoke on
NXT-OBS-240. It is recorded INCOMPLETE/SUPERSEDED without success credit and
was replaced by `c8188ca`.

Canonical receipts in `btb-codex/docs/evidence/`:
`jinx-moment-release-c8188ca-{PREPARED,DELIVERY,ANDROID-INSTALLED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE}-2026-10-31.json`,
`jinx-toto-release-658e461-*` (superseded attempt) and
`jinx-toto-bff-restart-6374e77-2026-10-31.json`.

## Repo durumu

| Repository | HEAD | Meaning |
| --- | --- | --- |
| zbet-mobile / master | c8188ca0d14fa990e5b9c634ebc2fd359ecf49db | Accepted client release source; later handoff-only commits do not change the app |
| zbet-cap / main | 6374e77f5a918e59a181698f71d9c8778dd1c081 | Toto display contract; the running pilot BFF serves this commit |
| zbet-abap / main | cd63dcafde974096e81ee675958c072f3b6b127c | Unchanged; no SAP object changed in this release |

Active route: Android pilot API and desktop `app.surklase.com` use the Mobile
BFF at `api.surklase.com`; the origin listens locally on 127.0.0.1:4004.
Desktop remains protected by Cloudflare Access. The pilot is owner-only DEV.
The BFF was restarted from pushed `6374e77` and replaced again by each web
publication (current process verified by the publisher).

## Doğrulama

Release source passed Mobile type/lint/brand, 759 client tests and 33 tooling
tests; 688 BFF tests passed. Android preview bundle and edge web export were
secret-scanned (0 findings). The c8188ca pair verified source, clean tree, APK
bytes/hash, ARM64 and web asset hashes; the web publication read back 57 served
files with 0 mismatches and kept Cloudflare Access protection. Owner smokes are
basic acceptance, not device-side hashes or exhaustive TalkBack/gesture or
performance measurements. SAP facts for NXT-OBS-239 came from read-only ARC-1
source reads (sap-adt offline, data preview disabled); a real-data BFF read-back
was not run because the runtime stores only the pilot-key hash.

Build note: the first two c8188ca APK builds failed on host resources (Gradle
Metaspace, then a full C: drive / page file). After the owner emptied the
Recycle Bin (regenerable emulator state moved there with permission), the
third build passed with `GRADLE_OPTS=-Dorg.gradle.workers.max=2`.

## Final yerel pilot APK

- Accepted APK: `btb-mobile-next-arm64-jinx-moment-c8188ca.apk`
- Source: `c8188ca0d14fa990e5b9c634ebc2fd359ecf49db`
- SHA-256: `8A793C74C55DCA43C71A34DABEB3A2A58382AE4B8F766B562E0A9AD8C625A01E`
- Size/ABI: 50,550,065 bytes, ARM64
- Matching web tree: `D7F46B390F8C62CD134BBEA677B856A01157368D05C9576ACB91115B3D6726D1`
- Web publication: `20261031T173905Z-c8188ca`
- Drive: owner-only file `1wgvWiulC6Xhp40Lr-8vUHwoTIhVbcQza`
- Pair status: `COMPLETE`, both owner smokes accepted

Under the owner's 29 October retention rule, the superseded local APKs
(`6fc5d05`, `658e461`) were moved to the Recycle Bin after this acceptance;
their receipts, hashes and Drive copies remain. Previous web releases stay in
the versioned release folder for rollback.

## Açık observation / blokajlar

There is no open local candidate; NXT-OBS-235/238/239/240 are delivered in c8188ca. Besides
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

The c8188ca pair is complete; no client release is being prepared. Watch the
Jinx decision-moment display and the Toto SAP facts (coupon close, TRY cost,
full-system best column, prize tiers) with real programs during normal use, and
record any concrete mismatch as a new observation.
Every future Android/web release still requires one clean pushed source,
verified pair, private APK delivery/installation before matching web
publication, and both owner smokes under separate release approval.

## Documents

[Architecture](ARCHITECTURE.md), [next cutover procedure](NEXT_CUTOVER_PROCEDURE.md),
[coordinated release](COORDINATED_CLIENT_RELEASE.md),
`contracts/mobile-api.openapi.yaml`, the rebuild schemas and historical
handoff retain their contract/evidence roles. Mobile and BFF expose BTB/Toto
read-only DTOs; model and learning decisions stay with their owners.
