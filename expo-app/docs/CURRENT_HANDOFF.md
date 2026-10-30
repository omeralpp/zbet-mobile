# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-30
Mod: `PAIRED_RELEASE_COMPLETE / ACCEPTED_PAIR_6FC5D05 / PREVIOUS_PAIR_RETAINED`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
The owner approved this reconciliation in Turkish pop-up 1/6. Only the
sections below describe current work. The complete preceding handoff is
preserved verbatim in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md),
beside this file so its original relative links retain their context. Its
pending October 21–22 batches and earlier identities are historical.

## Son checkpoint

The accepted Android/web pair is **6fc5d05**, released on 29 October 2026.
The owner accepted exact APK installation and basic Android smoke, then the
published web smoke. Canonical paired completion passed; TASK-0203 is DONE.
Both clients share the same release source and BFF contract. The completed
batch has no remaining installation or web-smoke gate.

Owner choice in Turkish pop-up 2/6 on 30 October: the agent keeps this completed
pair IDLE while there are no actionable OBSERVED rows. Its explanation states
that delivery is complete; new actionable observations can still make it READY.

This pair includes the short reduced-motion-aware branded intro, quieter
Jinx/menu behavior and accessible reorder motion. The previous ee84fc2
candidate failed Android launch acceptance and its web build was never
published; it remains superseded without success credit.

[Implementation and scoped exceptions](ANIMATION_IMPLEMENTATION_2026-10-29.md).
Canonical receipts are under `btb-codex/docs/evidence/` in the workspace:
`motion-release-6fc5d05-{PREPARED,ANDROID-INSTALLED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE}-2026-10-29.json`.

## Repo durumu

At this reconciliation's baseline:

| Repository | HEAD | Meaning |
| --- | --- | --- |
| zbet-mobile / master | 9fd7cc956a2c4a8186fddc821cfada403a512789 | Handoff-only checkpoint after the accepted release source |
| zbet-cap / main | 306c7df35c529b9a7a4e6711c1ce0062d5ae11f7 | Server code unchanged from functional source 6a49ee7405e1ff38885bec8fe05f23fd7db897dd; later publisher/documentation work has separate receipts |
| zbet-abap / main | cd63dcafde974096e81ee675958c072f3b6b127c | Local backend checkpoint; not by itself proof of active SAP state |

Accepted client artifact source is fixed at
`6fc5d05453cd5cb093cc45a5d109d682a77d1251`. Subsequent Mobile commits changed
only three documentation files; they do not change the installed/exported
application. This consistency batch edits documentation and shared agent
reporting locally, with no commit/push or client release approval inferred.

Active route: Android pilot API and desktop `app.surklase.com` use the Mobile
BFF at `api.surklase.com`; the origin listens locally on 127.0.0.1:4004.
Desktop remains protected by Cloudflare Access. The pilot is owner-only DEV.
RB1 uses `BTB_RB1_20261018`, policy `8B85557A…815F9F3` and producer
`621AB090…043BC`; the 30 October audit read those constants through ARC-1.
No whole-backend source parity or new model acceptance is implied.

## Doğrulama

The 30 October read-only audit passed Mobile type/lint/brand, 738 client tests
and 33 tooling tests; 683 BFF tests also passed. Existing `client-release.mjs`
completion and web-verification functions validated the accepted pair's source,
installation/publication/owner receipts and web tree. All 56 local served web
files matched accepted bytes. Local/public BFF health returned 200; public
desktop Access returned 302.

The 29 October release evidence retains the Android bundle/native build,
verified web export, signature/ARM64 and authenticated delivery readback.
This documentation batch performs no new Android build, export, installation
or publication. Owner basic smokes are not device-side hashes, exhaustive
TalkBack/gesture coverage or representative-device performance measurements.
The audit ran on Node 26.1.0; that is outside zbet-cap's declared 20/22/24
engine range and does not establish its supported runtime matrix.

## Final yerel pilot APK

- Accepted APK: `btb-mobile-next-arm64-motion-6fc5d05.apk`
- Source: `6fc5d05453cd5cb093cc45a5d109d682a77d1251`
- SHA-256: `01374056E7DE72FD197231C1B1DD28093A17E1B61A73B2B5C97F8B4F15CF8A64`
- Size/ABI: 50,522,265 bytes, ARM64
- Matching web tree: `7FA6B7507218574118C35CC241F26A84607BC9005AF21C6780CE21A04C11975F`
- Web publication: `20261029T124743Z-6fc5d05`
- Pair status: `COMPLETE`, both actual owner basic smokes accepted

Prior accepted source/hashes/receipts and cloud recovery evidence remain
historical. The owner's 29 October rule keeps only the latest accepted
working APK permanently on local disk; the retained-pair mode label does
not require retaining older local APK binaries. This batch deletes no APK
or cloud copy and changes no active publication.

## Açık observation / blokajlar

There are no OBSERVED rows eligible for a new implementation batch. Six
DEFERRED items remain in [OBSERVATION_LOG.md](OBSERVATION_LOG.md):

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

All six owner-approved consistency fixes and their scoped checks are complete.
The owner separately approved scoped commit/push on 30 October; the completion
record is `btb-codex/docs/CONSISTENCY_FIXES_2026-10-30.md` in the workspace.
No new client source or contract changes are part of this batch, so no
companion client release is being prepared.
Every future Android/web release still requires one clean pushed source,
verified pair, private APK delivery/installation before matching web
publication, and both owner smokes under separate release approval.

## Documents

[Architecture](ARCHITECTURE.md), [next cutover procedure](NEXT_CUTOVER_PROCEDURE.md),
[coordinated release](COORDINATED_CLIENT_RELEASE.md),
`contracts/mobile-api.openapi.yaml`, the rebuild schemas and historical
handoff retain their contract/evidence roles. Mobile and BFF expose BTB/Toto
read-only DTOs; model and learning decisions stay with their owners.
