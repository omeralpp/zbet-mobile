# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-11-01
Mod: `PAIRED_RELEASE_COMPLETE / ACCEPTED_PAIR_BA88590`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
Only the sections below describe current work. Earlier handoff history is
preserved in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md).

## Son checkpoint

The accepted Android/web pair is **ba88590**, released and completed on
1 November 2026 (batch
`client-ba885905674a3e2030bf740b6f41e7a15492e0bd-A838F9B23381-BD3B2A2A0308`).
The owner accepted exact APK installation and Android smoke ("ıt ınstalled and
works properly"), then the published web smoke ("web also works properly").
Canonical paired completion passed.

The pair delivers NXT-OBS-241, the Maç detayı review batch
([review and implementation](MATCH_DETAIL_UX_REVIEW_2026-11-01.md)): seven
confirmed defects fixed (hero `GÜNCEL SEÇİM` above "no selection" while the RB1
record loads or fails, 320 px mid-word break, desktop pool box, finished-match
copy, doubled latest score, row highlight past card corners, shortcut order),
every review improvement and the owner decisions (pinned published market,
reachable-first score distribution, live-first default module order, Bilyoner
action in the hero while playable). Page heuristic 7.0 → 8.5; idle main-thread
work 279 → 15 ms/s (phone profile) and 121 → 8 ms/s (desktop).

Canonical receipts in `btb-codex/docs/evidence/`:
`match-detail-release-ba88590-{PREPARED,DELIVERY,ANDROID-INSTALLED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE}-2026-11-01.json`.
The previous accepted pair `c8188ca` and its receipts (`jinx-moment-release-c8188ca-*`)
remain historical.

## Repo durumu

| Repository | HEAD | Meaning |
| --- | --- | --- |
| zbet-mobile / master | ba885905674a3e2030bf740b6f41e7a15492e0bd | Accepted client release source; later handoff-only commits do not change the app |
| zbet-cap / main | 6374e77f5a918e59a181698f71d9c8778dd1c081 | Unchanged; the running pilot BFF serves this commit |
| zbet-abap / main | cd63dcafde974096e81ee675958c072f3b6b127c | Unchanged; no SAP object changed in this release |

Active route: Android pilot API and desktop `app.surklase.com` use the Mobile
BFF at `api.surklase.com`; the origin listens locally on 127.0.0.1:4004.
Desktop remains protected by Cloudflare Access. The pilot is owner-only DEV.
The ba88590 web publication replaced the BFF process (23444 → 28772) and the
publisher verified it.

## Doğrulama

Release source passed Mobile type/lint/brand, 770 client tests and 33 tooling
tests (`npm run check`). The edge web export from the clean pushed source and
the Android preview bundle were secret-scanned (0 findings). The ba88590 pair
verified source, clean tree, APK bytes/hash, ARM64 and web asset hashes; the
web publication read back 57 served files with 0 mismatches, local probes passed
(shell, deep link, API refused without Access) and the public hostname still
redirects to Cloudflare Access. Synthetic 320/390/1440 px dark/light checks of 13
states preceded the release. Owner smokes are basic acceptance, not device-side
hashes or exhaustive TalkBack/gesture or performance measurements; the idle-work
figures are synthetic browser measurements.

## Final yerel pilot APK

- Accepted APK: `btb-mobile-next-arm64-match-detail-ba88590.apk`
- Source: `ba885905674a3e2030bf740b6f41e7a15492e0bd`
- SHA-256: `A838F9B23381C6F9E50B875EC0FFF69EAB8DEDE42A0640C496506287608A7F77`
- Size/ABI: 50,562,341 bytes, ARM64; certificate `FAC61745…B9C` (unchanged)
- Matching web tree: `BD3B2A2A0308E52FBC2334983442286527353A1FD59224286A86A5F65BF77A80`
- Web publication: `20261101T180457Z-ba88590`
- Drive: owner-only file `1AMlD39WW7QcIRkQvtWiuuPU10s7-0Kqf`
- Pair status: `COMPLETE`, both owner smokes accepted

Under the owner's 29 October retention rule, the superseded local APK
(`c8188ca`, SHA-256 `8A793C74…A01E`) was moved to the Recycle Bin after this
acceptance; its receipts, hashes and Drive copy remain. Previous web releases
stay in the versioned release folder for rollback.

## Açık observation / blokajlar

There is no open local candidate; NXT-OBS-241 is delivered in ba88590 and
NXT-OBS-235/238/239/240 in c8188ca. Besides
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

The ba88590 pair is complete; no client release is being prepared. During
normal use, watch the Maç detayı batch on real live matches (hero state while the
RB1 record loads or after a failed read, pinned BTB market, live-first module
order, reachable-first score distribution, desktop module packing), the Jinx
decision-moment display and the Toto SAP facts (coupon close, TRY cost,
full-system best column, prize tiers), and record any concrete mismatch as a new
observation.
Every future Android/web release still requires one clean pushed source,
verified pair, private APK delivery/installation before matching web
publication, and both owner smokes under separate release approval.

## Documents

[Architecture](ARCHITECTURE.md), [next cutover procedure](NEXT_CUTOVER_PROCEDURE.md),
[coordinated release](COORDINATED_CLIENT_RELEASE.md),
`contracts/mobile-api.openapi.yaml`, the rebuild schemas and historical
handoff retain their contract/evidence roles. Mobile and BFF expose BTB/Toto
read-only DTOs; model and learning decisions stay with their owners.
