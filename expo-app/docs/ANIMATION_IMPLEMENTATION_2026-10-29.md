# Approved Android and web motion improvements

Date: 2026-10-29. Owner: BTB Mobile Next - Aktif. NXT-OBS-234.
Status: COMPLETE / OWNER_ACCEPTED_BOTH (paired release 6fc5d05). Owner approved
all recommended local improvements after the animation review, including Jinx
and launch.

## Result

- Launch uses static branding until the motion preference is known and under
  reduced motion or preference-read failure. Normal motion gets one landing of
  at most 640 ms inside the first 800 ms after mount, even when initialization
  is already ready; late starts shorten or skip it. Launch completes at
  auth/fonts readiness plus the first layout, but not before a bounded brand
  hold from mount: 800 ms normal, 500 ms reduced motion, at most 900 ms while
  the preference is unknown. Slower initialization adds nothing, and the old
  1.57 s floor is gone (owner decision after the Android smoke, below).
- Loading text is indeterminate and contains no fabricated percentage. Readiness
  no longer shows 100% against an incomplete bar. Web's once-per-tab completion
  and native auth/font/splash layout ordering remain intact.
- A shared readiness-aware preference observer starts conservatively static,
  subscribes before reading, gives newer preference events priority and ignores
  results after cleanup. The existing boolean hook remains available to all
  existing callers.
- Jinx menu ownership synchronously suspends breathing, blinking, spark and idle
  movement. Closing starts fresh quiet timers. Explicit drag/guide scenes retain
  their behavior, subordinate to background, sleep, reduced motion and OFF.
  Decorative overlay springs stop on suspension and guide travel has cleanup.
- Jinx keeps its character/assets and CALM/OFF behavior. LIVE idle movement is
  quieter, with 6–11 s gaps; idle spark and a duplicate idle bob are removed.
  Goal/celebration and performance-mood prototype behavior was not activated.
- Native module reordering snaps decorative lift, neighbor and drop movement
  under reduced motion. Direct finger tracking, autoscroll and accessible move
  controls remain functional. Switching preference during drop commits exactly
  once, resets offsets, and ignores late callbacks; unmount cancels settlement.
- Web module/toolbar opacity transitions become `none` under reduced motion.

## Validation

- Canonical Mobile core gate: TypeScript, ESLint, client and tooling tests, and
  brand checks passed. **18 new regression tests** cover launch/preference
  timing/races, reorder completion/cancellation and actual Jinx renderer effects.
- Independent narrow source review found no introduced lifecycle/parity defect.
- Expo Doctor **20/20** passed after the owner explicitly approved metadata
  requests to Expo and React Native Directory. The initial sandbox attempt was
  18/20 due to network resolution; automatic review initially rejected network
  escalation for metadata-transmission scope. No alternate route was used.
- Android production-mode preview JS/Hermes export and secret scan passed.
  This is bundle validation, not a signed APK or device acceptance.
- Canonical `node scripts/web.mjs export --out .../web-edge` passed with verified
  edge configuration and secret scan. A separate verified mock export was used
  for browser checks; it is not a publication artifact.
- **15 rendered synthetic checks passed** in isolated headless Edge at 1440 px
  and 390 px: normal/reduced launch, truthful loading, static menu/idle, live
  preference switching, reduced module transitions, repeat-tab launch and fast
  initialization. Zero page errors. Fast initialization launch visibility was
  93/97/108 ms in these runs; these are local samples, not a startup SLA or FPS.
- The preview blocked 20 remote logo requests to `content.bilyoner.com`; zero
  remote requests were sent by the test. Logo/provider/live-data integration
  is not covered by these synthetic checks.
- Whitespace and scoped secret/log review passed. No dependencies, native
  resources, BFF/API contract, SAP, model, Access policy or runtime changed.

Evidence under `.codex-artifacts/animation-review-20261029/`:
`doctor.txt`, `android-checks.json`, `android-export.txt`, `web-edge-export.txt`,
`web-edge/web-build-receipt.json`, `web-mock/web-build-receipt.json`,
`browser-checks.json`, `render-checks.mjs` and desktop/narrow screenshots.
Launch-fix evidence is under `.codex-artifacts/launch-fix-20261029/`.
Committed copies of the browser/Android receipts and screenshots, the
re-run validation receipt, the release approval and the launch-fix receipt
are under `docs/evidence/ANIMATION_IMPLEMENTATION_2026-10-29/`.

## Android smoke finding and launch fix

The first release candidate, source `ee84fc2`, was built and verified as a
pair. Its signed APK `8A368FC359A8…59AA` was privately delivered and installed.
The owner's Android smoke then failed: “açılış ekranı yani splash screen hiç
gelmiyor”. Cause: pilot auth resolves on the first render and Android fonts
are bundled, so readiness is immediate. Readiness-only completion therefore
ended launch after about one frame, and the native splash drawable is
transparent. The synthetic fast-start check had accepted 93 ms visibility
because it asserted only an upper bound.

The owner selected a short branded intro (normal one landing, reduced motion
static, under 1 s). The fix adds the bounded brand hold described above and
lets the landing play regardless of readiness. Validation: core gate with
**738 client and 33 tooling tests**, including regressions for instant
readiness and the bounded hold. Android preview Hermes export/secret scan
pass. The tightened browser check requires 650–1,100 ms normal and
400–1,100 ms reduced fast-start visibility. It fails on the old build (93 ms)
and passes on the fix: 843 ms with the landing, and 556/564 ms static. All
15 checks pass with zero page errors. Expo Doctor 20/20 is reused because no
dependencies or configuration changed. The owner accepted the labelled local
web preview. The ee84fc2 candidate is superseded, and its web build was never
published. Its APK, APK config and Drive delivery receipt are retained. Its
unpublished `dist-web` export was overwritten by the next release build; its
tree hash `A820A602…3EC9` stays recorded in the prepared-batch receipt.

## Remaining scope and delivery

ADB discovery found **zero connected devices**. Physical Android gestures,
TalkBack and representative-device frame/battery performance remain unobserved.
Headless checks and mocked renderer boundaries do not establish those claims.
Retain observation for actual-device performance; present evidence justifies no
renderer rewrite or additional animation assets. Scores in the baseline review
remain provisional and are not automatically raised after code changes.

Both surfaces advanced in the same source batch. Web opacity transitions and
native reorder springs are platform-specific implementations of the same reduced
motion behavior; direct manipulation remains available on each surface.

Owner approved scoped Git and the coordinated pilot Android/web release on
29 October, after the re-run quality gate (737 client and 33 tooling tests)
and the labelled local mock web preview.

**Release result.** Both artifacts were built from clean pushed source
`6fc5d05453cd5cb093cc45a5d109d682a77d1251`. The first APK build hit a Gradle
Metaspace OOM; its orphaned daemons were stopped, and an identical retry
passed. The pair was verified as batch
`client-6fc5d05453cd5cb093cc45a5d109d682a77d1251-01374056E7DE-7FA6B7507218`.

The signed ARM64 APK
`01374056E7DE72FD197231C1B1DD28093A17E1B61A73B2B5C97F8B4F15CF8A64`
(50,522,265 bytes, same signing certificate) was privately delivered with a
full readback. The owner confirmed installation and the basic Android smoke:
“Kuruldu, sorun yok”.

Web tree `7FA6B7507218574118C35CC241F26A84607BC9005AF21C6780CE21A04C11975F`
was then published as `20261029T124743Z-6fc5d05`. The publisher replaced the
BFF automatically. Results: 57/57 served requests match, an independent
readback matches 56/56, and shell/CSP/deep-link/API401/Access302 pass. The
owner confirmed the published web: “Web çalışıyor, sorun yok”.

Canonical `client-release.mjs complete` passed. Receipts are
`btb-codex/docs/evidence/motion-release-6fc5d05-*-2026-10-29.json` (the
superseded candidate's are `motion-release-ee84fc2-*`). The previous accepted
pair e4def59 is retained.

[Baseline assessment](ANIMATION_REVIEW_2026-10-29.md)
