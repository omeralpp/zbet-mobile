# TASK-0102 goal-mode effect: local delivery checkpoint

The owner approved the bounded implementation on 2026-10-10. The BFF computes
the score transition's arithmetic effect on every tied leading scoreline in
one unchanged frozen phase pool. Mobile displays the supplied result at an
observed goal. No probability, calibration, pressure/scorer adjustment or SAP
source change is included. Red-card effect remains unmeasured under TASK-0101.

## Contract and compatibility

`GET /v1/btb/matches/{key}/match-journey` defaults to `match-journey.v3`.
The updated client requests `X-BTB-Match-Journey-Version: match-journey.v4`;
unsupported versions receive 400. Responses use `Vary` and `Cache-Control:
no-store`. The client accepts either V3 or V4, so deployment order is flexible.
V3 keeps its original point fields and ordinal levels. V1 period metrics are
unchanged. V4 adds nullable `eventEffect` to every point, non-null only on GOAL.

The diagnostic carries pre/post modes, compatible counts, blocked leader count
and denominator, exact sample/pool identities and observation interval.
`eventSurprise` is always null. Missing, ambiguous, duplicate-conflicting,
repeated corrected or invalid boundaries carry a reason and null arithmetic;
missing measurements never display as zero. Gaps, corrections, multiple goals
and reference/phase boundaries retain their existing non-goal classifications.
The interval bounds the observation, not the exact physical event time.

Authentic retained boundary `2026-10-10:3193938:14:00:00`, 2-1 to 3-1:
compatible counts 11 to 8, tied leaders 3-2 and 4-1 before and after, blocked
leader count 0 of 4. Thus the leader effect is measured zero while three
compatible outcomes are eliminated. Eleven is a thin diagnostic sample, with
no reliability or performance acceptance. The tracked fixture is an explicitly
labelled two-snapshot, nine-row conditional excerpt, not the full SAP body.

## Local verification

- Focused BFF suites: 61/61 passed, including authentic and declared synthetic
  ties, reversal, thin/empty/invalid pools, precision, gaps, corrections,
  repeat/conflicting IDs, version negotiation and provider read count.
- Full BFF tests and CAP production build passed.
- Mobile type checking, lint, unit/tooling tests and brand checks passed.
- Expo Doctor failed on the pre-existing 16-package version mismatch; package
  manifests were unchanged. This is recorded, not called a passing doctor.
- Both complete retained fixtures passed V4 runtime-schema parsing and exact
  V3 projection parity; 74/63 points, zero/one measured goal effects.
- Android production JavaScript bundle passed with explicit pilot authentication
  and all three intelligence modes set to live. Output is ignored under
  `.codex-artifacts/task0102-android-export`; it is not a signed/distributed APK.
  The first export refused an OAuth/pilot-key profile mismatch; the correctly
  selected pilot retry passed. No native dependency or native code changed, so
  no Gradle build is part of this local batch. Device smoke remains pending.

## Pilot delivery and rollback

The owner approved signed pilot APK preparation and the existing BFF update
with "Devam et o zaman" after those steps were explicitly identified. The BFF
was restarted once through `BTB Mobile BFF` on CAP `626ef1d`, PID 22656 to 20716.
Local and public health returned 200, anonymous protected requests 401 and
unsupported negotiated versions 400. Authenticated public V3/V4 both returned
63 points for the real fixture above. Both parsed in the Mobile schema, and
the V4 projection exactly matched V3. The goal effect was measured zero, with
both tied leaders retained and event probability null.

The arm64 pilot build uses Mobile `cd29701`. The first native build failed
when parallel JVM workers could not commit memory. Retry uses two workers,
parallel Gradle work disabled, a 2 GiB daemon heap / 768 MiB metaspace and two
native build slots, confined to that build process. No dependency/source or
persistent machine setting changed. Retry passed `assembleRelease` in 8m 37s.
Both temporary staging folders were removed after the build attempts.

Verified final artifact: `.codex-artifacts/btb-mobile-next-arm64-task0102.apk`,
54,355,121 bytes, SHA-256
`FD60A83A7B3249DD623BB50D131D3D12B4F6DC7F3156DFA45700881FE64886EE`.
APK Signature V2 passed with the same certificate as TASK-0109:
`fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
Package `com.btb.mobile.next`, versionCode 1 / versionName 0.1.0; arm64-v8a only.
The artifact itself contains the V4 negotiation/goal-effect consumer and matches
the pilot credential locally without exposing it. Public settings: API
`https://api.surklase.com`, pilot auth, mocks false, all intelligence modes LIVE.

No phone was connected over ADB. Install/update and real goal-detail acceptance
remain pending; the next read-only evidence review is 2026-10-12. On the phone,
select a retained goal and check all tied before/after leaders, blocked leader
count, and explicit unmeasured text where evidence is missing. Full event
probability and card measurement remain unmeasured. TASK-0101 review stays
2026-10-15. Existing dependency warnings remain: Expo Doctor's 16-package
mismatch and npm ci's 34 audit alerts under the unchanged lockfile.

Old clients continue using V3. Rolling the BFF back lets the new client receive
V3 and show the goal effect as unmeasured. Rolling back the client also uses
V3 against the new BFF. Keep public-cloud routes and SAP objects unchanged.
TASK-0102 remains IN_PROGRESS until delivery/acceptance is recorded; actual
event probability and the card population remain separate unfinished work.
