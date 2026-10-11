# TASK-0121 grounded Jinx reading — local implementation checkpoint

Owner approval: start TASK-0121 and continue through APK creation. This covers
the bounded comparative reading, coordinated BFF/Mobile changes, validation and
existing-certificate pilot APK preparation. Owner subsequently explicitly
approved scoped commit/push in CAP, Mobile and Codex and the existing pilot BFF
update; that runtime update is now verified. Standing private Drive delivery applies
after artifact verification. The ARM64 APK is built and privately delivered,
with matching authenticated download readback. Physical phone acceptance remains
pending; TASK-0121 stays IN_PROGRESS.

## What changed

The updated client requests `X-BTB-Jinx-Version: jinx-match-outlook.v2`.
The BFF defaults to V1 for existing clients, rejects unknown versions and varies
by the negotiation header. The client accepts both versions. V2 uses a situation
line and ordered `SUPPORTING`, `LIMITING`, `WATCH` sections; unavailable readings
have no sections. Existing provider, BTB selection, scoring and SAP sources are
unchanged. The separately proposed V4 journey extension is not included.

The BFF builds source-bound Turkish sentences from paired shots, timestamped
pressure, overall form, venue form, the historical score list, contrary scores,
decision-pool sample and the existing score-condition calculation. Each internal
fact names fields, time role and population. The provider can order fact IDs
only; it cannot create statistics, change their attribution, drop counterevidence
or rewrite the factual sentences. Invalid plans retain a complete deterministic
reading. This is deliberate editorial grounding, not free-form LLM reasoning.

Unknown live-stat age is distinguished from a proven stale measurement; pressure
keeps its existing 240-second age budget. Old/missing pressure and form are
excluded with an explanation. xG without proven coverage is not called measured
zero. Venue sample size is not borrowed from last-five form. Historical
frequencies and decision-pool counts retain distinct populations and are never
presented as calibrated match-outcome probabilities.

## Validation

- Full BFF tests and CAP production build passed; eight new focused cases cover
  the reported scenario, equal shots, contrary venue form, stale sources,
  double-chance draw semantics, plan rejection, fallback and HTTP negotiation.
- Mobile type checking, lint, unit/tooling and brand checks passed. The focused
  Jinx consumer suite passed 37 tests, including V2 complete-section validation
  and V1 compatibility. Final UI static checks passed after layout changes.
- OpenAPI YAML parsed, with V1/V2 schemas and the explicit version header.
- Authentic existing BFF reader packet for Vendsyssel–HB Koege at 65′, 0–2 was
  retained locally. The reported 47′ phone case is a separately labelled
  screenshot-derived fixture, not an authentic atomic packet.
- One real provider call on the fresh packet returned V2 with all three
  sections, HTTP 200 and provider time about 4.6 s within the unchanged budget.
  A second read of the retained packet confirmed spaced score strings are
  preserved in the historical score explanation. Final canonical text was
  rebuilt from that same packet; it is not a new cohort or fresh observation.
- Final authentic V2 output passed the actual Mobile schema and paragraph guards.
- Scoped source and all 1,321 packaged-entry secret-value scans found zero
  registered server-secret matches. No ADB phone is connected;
  physical layout/installation acceptance remains pending.
- Expo Doctor still fails on the pre-existing 16-package version mismatch.
  Dependency manifests are unchanged. Native staging reports the existing
  lockfile audit alerts; neither is presented as a passing check.

## Approved runtime activation

CAP `18709ae3fad43efe100b21a6464252ae450b3981` is pushed. The existing
scheduled pilot BFF was restarted once from the clean CAP checkout, PID
20716 → 30048. Local and public health passed. Authenticated public matches
returned 97 rows and passed the actual Mobile schema.

The same Vendsyssel–HB Koege fixture at 89′, 0–2 returned LIVE-origin V2 with
all three sections; availability DEGRADED correctly retains source coverage
limits. The omitted version header returned LIVE-origin V1. Both provider calls
succeeded (HTTP 200), with no fallback, validation rejection or timeout.
Invalid version returned 400; unauthenticated matches returned 401. V2 has
`Cache-Control: no-store` and `Vary: X-BTB-Jinx-Version`. Both Jinx responses and
all V2 paragraphs passed the actual Mobile schemas/display guards.
Evidence receipt: CAP `.codex-artifacts/task0121-runtime-activation-receipt.json`.

## Sources and delivery boundary

APK: `btb-mobile-next-arm64-task0121.apk`, 54,356,433 bytes, ARM64 only;
SHA-256 `2CF051C696A08DD5794B46C8D24E944D0A093F83DD5B4D0C2D2C2184A855F4B2`.
Native release build passed in 13m49s; signature V2 verified with the existing
pilot certificate `fac61745…033b9c`, package `com.btb.mobile.next`, versionCode 1
and versionName 0.1.0. Embedded V2 Jinx consumer/header verified. Effective
settings are API `https://api.surklase.com`, pilot auth, mocks off, Journey,
Team Form and Jinx LIVE. No release signing or credential changes occurred.

[Private owner APK download](https://drive.google.com/file/d/1UFEvhszZLgfZgyz3jcBiNsMqBu1fLLDS/view?usp=drivesdk)
is in the existing private BTB Mobile Next APK folder. Connector metadata
confirmed the expected size, folder and owner-only permissions (`shared=false`).
Authenticated full-file download matched the SHA-256 above. No sharing changed.

Baseline commits: CAP `626ef1d`, Mobile `3f41b47`. CAP implementation is pushed
as `18709ae`; Mobile implementation and delivery notes are recorded together in
this checkpoint's commit. Per-file SHA-256 manifests and validation receipts are ignored
under `zbet-cap/.codex-artifacts/task0121-*`. Retained football source packets are
local evidence and contain no request credentials. These are existing BFF
reader/direct transport evidence, not SAP MCP object evidence, and seven source
reads are not an atomic SAP snapshot.

The matching pilot BFF is active and serves V2 to the TASK-0121 APK while
preserving V1 for installed older clients. Owner phone installation and acceptance
of richer V2 remain pending; no connected ADB device was available.
Keep TASK-0102 APK as the current rollback; no older artifact was deleted.
