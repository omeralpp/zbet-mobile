# Approved Android and web motion improvements

Date: 2026-10-29. Owner: BTB Mobile Next - Aktif. NXT-OBS-234.
Status: LOCAL_VALIDATED / RELEASE_APPROVED / NOT_RELEASED. Owner approved all recommended local
improvements after the animation review, including Jinx and launch.

## Result

- Launch uses static branding until the motion preference is known and under
  reduced motion or preference-read failure. Normal motion gets one landing of
  at most 640 ms during the first 800 ms of initialization; late starts shorten
  or skip it. Auth/fonts readiness plus the first layout immediately completes
  launch, independently of decoration. There is no required animation wait.
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
Committed copies of the browser/Android receipts and screenshots, the
re-run validation receipt and the release approval are under
`docs/evidence/ANIMATION_IMPLEMENTATION_2026-10-29/`.

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
29 October after the re-run quality gate (737 client and 33 tooling tests) and
the labelled local mock web preview. Accepted paired release e4def59 and its
previous pair remain retained until this batch completes. A release requires a clean pushed source and coordinated
Android/web artifact verification and acceptance under the existing procedure.

[Baseline assessment](ANIMATION_REVIEW_2026-10-29.md)
