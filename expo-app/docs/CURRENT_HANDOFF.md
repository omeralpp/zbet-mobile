# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-11-23
Mod: `PAIRED_RELEASE_COMPLETE / OWNER_ONLY_DEV / BD49708`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
Earlier handoff history remains in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md)
and the dated release reports/receipts.

## Daily Coupon live scores and settlement (2026-11-22)

Android and desktop web use the same Daily Coupon score and result logic.
The active view refreshes live match states every 10 seconds. SAP's `RECENT`
job runs every two minutes to settle eligible results from the match source,
including fixtures without a Super decision. Final coupon outcomes use SAP
settlement.

- The owner-approved pair is `COMPLETE` at client commit
  `bd497081a404323f7a052c296821ff34d4f12680`. Batch
  `client-bd497081a404323f7a052c296821ff34d4f12680-E0A44008A713-FF2F95F85D2F`.
- Android artifact `btb-mobile-next-bd49708-live-coupons-arm64.apk` has SHA-256
  `E0A44008A713DEF0CE4032F83BAAFB303013D2602FB84D280FF793C1A24ABF38`.
  Private delivery and matching installation were verified before web publication.
  The installed app successfully called the coupon window and live score routes.
- Web publication `20261122T202551Z-bd49708` has export tree SHA-256
  `FF2F95F85D2FA022EDEF4A79BDDD79757E7C7E575E9C59084696B6E04C539ABE`.
  All 57 served assets matched. The owner confirmed the published browser smoke.
  [Günlük Kuponlar](https://app.surklase.com/super?view=COUPONS)
- Local evidence is under `expo-app/.codex-artifacts/daily-coupon-live-bd49708/`.
  `client-release.json` identifies the approved pair. `android-delivery.json`,
  `android-install-smoke.json`, `publish-receipt.json`, `owner-smoke.json` and
  `completed-batch.json` record delivery, publication, smoke and completion.
- The running BFF is `8ed72b70737a6354da5863c4c02c4d063c534a38`.
  All 981 BFF tests passed. The three active SAP DEV class implementations
  match `1ad46831f6621033cf7ffde004df26e1e8f93e73`
  under unreleased transport `A4HK900110`. The added kickoff regression case
  passed SAP syntax validation and remains in Git pending a separate SAP change.
- Previous pair `308748f138bd7a62d281cd81444c5fabab6a686a` used web publication
  `20261122T185116Z-308748f`, web tree SHA-256
  `C97483ED6D63DEADE86F87BA4BC1F548E0BB8627D21EB234A6418311F16B0F71`,
  and APK SHA-256 `522035A154E55177872B507D020241D6798F8453F4A79A9779911F3A5F6929C9`.
  Its web publication and receipts were retained. `apk-retention.json` records
  recycling the two superseded local installers after acceptance.
- Daily Coupons owns `TASK-0239` for the missing SAP result evidence for
  Östersunds–Varbergs (`3405261`) and Sønderjyske–Odense (`3405033`).
  Both legs were still pending at the 23 November 11:20 Istanbul BFF check.

## Released batch: Daily Coupons and Selection Lab in the flow (2026-11-17, COMPLETE)

Owner direction with two screenshots (NXT-OBS-259), then two follow-ups the
same day: compact filters, and Karar günlüğü regrouped into three views. Each
follow-up superseded the previous candidate before its web release, so only
`b95feec` was published. Branch `claude/daily-coupons-flow` in zbet-mobile
(from `master` `1c5c2f2`) and zbet-cap (BFF `6042bd7`, from `main` `d6a1a23`);
both `master`/`main` fast-forwarded after acceptance.

- **Client:**
  - Özet gains the `dailyCoupons` module (anchored after `metrics`). It shows
    today's Banko, Dengeli and Riskli tickets, each match with its live or
    final score and a tap to match detail. Phones get a sideways pager,
    desktop a row of three. The separate pill link is gone.
  - Karar günlüğü has three oval tabs with icons, like Canlı's switch:
    Şampiyon (trophy), Günlük kupon (ticket) and Lab (flask). Lab holds C1,
    C2 and C3 as a segmented rule filter. On a phone the views are swipeable
    pages; past the first or last one the swipe moves to the neighbouring app
    tab. Web has no swipe (platform exception: tabs are clicked). Route:
    `/super?view=COUPONS|LAB&rule=C1`; an old `view=C1` link opens Lab on C1.
  - Every log opens on Bugün. Günlük kupon has period, tier and result
    filters with counts, a summary at one unit per coupon, and the losing
    match marked with its score. Lab has the same period and result filters.
  - Compact filter language (`FilterControls.tsx`): 36-point controls with a
    44-point touch target (segmented control, select menu), also used by the
    champion's period and Tümü/★/Bekliyor chips.
  - Match detail shows a `Günlük kupon` card when the match is in a coupon:
    the pick, its own result and score, and the coupon's state.
  - `/daily-coupons` redirects to the log view.
- **BFF (zbet-cap):** new `daily-coupons.v2` (`/v1/btb/daily-coupons/v2`) and
  `daily-coupons-window.v2` (`/v1/btb/daily-coupons/v2/window/:through/:days`).
  The v1 route is unchanged, so the installed APK keeps working. Leg results
  come from the SAP settlement's `outcomes`; a result that contradicts its
  tier is withheld. 745 BFF tests pass.
- **SAP (done 17 November, owner approved):** `ZBET_C_DC_DOC` and
  `ZBET_C_DC_PART` now also return kind `F`, the frozen pre-wipe rows that
  carry final scores. zbet-abap `546ee3b` passed preflight and is deployed to
  DEV (`deployedCommit` = `headAfter` = `546ee3b`); no inactive objects.
  Getting there needed three Git-only repairs on zbet-abap `main` that change
  no SAP object: `bbd6dfc` (missing UTF-8 BOM on 16 Daily Coupons XML files),
  `b8e72fc` (SAP-native files for objects that were only in SAP) and
  `d1f1d14` (removed a table file restored by mistake). A local read with the
  new BFF code against DEV returned real results and scores, for example the
  16 November Dengeli and Riskli losses: İtalya U21–Belçika U21 2–2 and
  Sorrento–Monopoli 2–1. 15 November has no settlement yet (Daily Coupons
  thread). Evidence: workspace `.codex-artifacts/daily-coupons-sap-20261117/`.
- **BFF:** restarted on `6042bd7` (owner approved); the publisher replaced it
  again on the same build (PID 32892 to 6616). Health passes.
- **Checks:** `invoke-mobile-check.ps1 -BundleOnly` passed on `b95feec`; 845
  client unit tests. Browser review on a static mock export at 360/390/820/
  1440 px in both themes (`expo-app/.codex-artifacts/coupons-20261117`).
- **Coordinated release COMPLETE (2026-11-17):**
  - Batch `client-b95feec81e7034f0b4c49c54eb697c011f79c045-D976EA3990C7-78AAAF1EE4E8`.
  - APK `btb-mobile-next-b95feec-lab-tabs-arm64.apk`, 50,703,593 bytes,
    SHA-256 `D976EA3990C77307904D9C9D36444EDEFA22A2216FE1978C7F18F3C26A9CC141`,
    private Drive file `1qA0E82MUaFD2cUz0tYJpMHNxYlKeP38Y`, readback verified.
  - Web `20261117T175839Z-b95feec`: 57 served files, 0 mismatches, Access
    protected.
  - Owner smokes: "Installed, it works" and "Web works" (owner-attested, no
    device hash; the swipe was named in the Android check request).
  - Receipts: workspace `.codex-artifacts/lab-tabs-release-20261117/`.
  - Retention: the f6d3a8b APK and the superseded 37083e0 and 644b70d
    candidates went to the Recycle Bin; hashes in
    `superseded-local-apk-hashes.json`. b95feec is the sole local APK.

## Earlier batch: Selection Lab rules on Super (released 2026-11-15)

Owner direction 2026-11-14: show every Selection Lab rule beside the champion,
with each rule's hits and odds. C1 now runs inside SAP (job `ZBET_SEL_C1`) and
publishes through `ZBET_UI_SELECTION_SB` (TASK-0229/0230).

- **BFF** (zbet-cap, detached worktree off `b8ff007`, not merged):
  - New file `selection-decisions.js`; route
    `GET /v1/btb/selection/v1/rules/:rule/window/:through/:days`.
  - Contract `selection-decisions.v1`. C2/C3 return `RULE_NOT_PUBLISHED`
    without a SAP call.
  - Tests: 741/741. A live read-only smoke against DEV passed (7 days: 6
    decisions, 3 won, 3 lost, net −2.45).
- **Client** (this repo, uncommitted):
  - The Super screen gets the rule chips Şampiyon · C1 · C2/C3 hazırlanıyor.
  - New `SelectionRuleLog` with Bugün/7/30 gün, a coverage line, a
    hits/odds/ROI summary and CANLI/SONRADAN cards.
  - The champion log is unchanged. Mock mode shows labelled sample decisions.
  - Checks:
    - `npm run check` passes; tests are 838/838 plus 3 new contract tests.
    - The verified web export passes.
    - An Android JS bundle with the pilot profile, set per process, passes.
    - A browser mock review passed at 375 px, 800 px and 1440 px, dark and
      light, with no console errors.
- **Committed and live BFF:**
  - zbet-cap `03ef1a9` and zbet-mobile `90ea742` were pushed.
  - After Daily Coupons committed `adee815`, the supervised BFF was replaced
    once on `adee815` (PID 48412 to 53052).
  - The selection route answers 401 without a key and 200 with the pilot
    key, no-store, 6 decisions. Selection history, Daily Coupons, web asset
    bytes and the public callback all pass.
  - Receipt: `.codex-artifacts/selection-bff-20261115/BFF_RESTART.json`.
- **Coordinated release COMPLETE (2026-11-15):**
  - Batch `client-f6d3a8bf7e2a01fdeec96ca43a413ac9538c9c67-7E936CB3306A-79116CC31300`.
  - Source `f6d3a8b` (client code as `90ea742` plus this note).
  - APK `btb-mobile-next-f6d3a8b-selection-rules-arm64.apk`, SHA-256
    `7E936CB3306A97A4AC6D26C6B2EB081AF716C9DDDE48CE1FBE572361B3BD66BA`,
    delivered to the private Drive folder with readback verified.
  - Web `20261115T134011Z-f6d3a8b`: 57 served files, 0 mismatches, BFF
    54124 to 17600.
  - Owner smokes: "Kurdum, çalışıyor" and "Web çalışıyor" (owner-attested,
    no device hash).
  - Receipts are in `.codex-artifacts/selection-release-20261115/`.
  - The superseded local 7695422 APK was removed and its hash recorded.
  - Platform exception: the wide web layout uses a card grid; phones use a
    list.

## Son checkpoint

Günlük Kuponlar is complete on both owner-only clients from
`76954220b1f8c963070fe6586a8bc733fbf05281`. The owner installed the verified
private APK and confirmed the Banko, Dengeli and Riskli demo cards on the phone
and the published web client. Installation evidence is owner-attested.

- Android SHA-256 `E3F9BFC8BD7CA82AC8D1EADF1F89FA7F1A3C89995A027EE3CB3D9390B9A706E9`.
- Paired web tree `1868C889EB24A0A1D4EA84B0DDA71C1D9132DA0C3B0088B2B49CDB80BC7A63E2`.
- Web `20261114T185523Z-7695422` served 57 files with zero mismatches behind
  Cloudflare Access. BFF `b8ff00738c8f15c610ae43ea611182c4efb11c3d` returned
  three DEMO tiers over the authenticated Android route. The completion
  receipt is `.codex-artifacts/daily-coupon-preview-20261114/completed-batch.json`.
- The accepted `btb-mobile-next-7695422-daily-coupons-arm64.apk` is the sole APK
  in the local artifact directory. Hashes of removed superseded APKs are in
  `.codex-artifacts/daily-coupon-preview-20261114/superseded-local-apk-hashes.json`.
- TASK-0234 tracks the missing verified pre-match input. The 15 November 11:00
  Istanbul run requires the authorized timestamped bulletin. The SAP DEV
  bridge rollback passed. The restored source has no full bulletin endpoint.

### Previous accepted pair: BFF2359

Piyasa (NXT-OBS-258) is complete on Android and owner-only web from
`bff2359b867cff62c2201b8272ed543147af7054`. It shows match total 4.5 and home
and away 0.5, 1.5 and 2.5 under/over. The chart ranks by the latest measured
phase and keeps the BTB selection pinned. Browser checks used the actual
historical rows from Mozambique–Ethiopia and Qatar–Australia at desktop and
phone widths. The owner confirmed Android and published web sorting. APK
installation is owner-attested. No device-side hash was measured.

- Android SHA-256 `CE505FC632602817525BC068AB1102BBE36EB6CB73C9D42880550823091EF4DA`.
- Web tree `5CD3086E0C81556ACD539C9307BF827C0A727FAC8CF7044901A76806AD94DA02`.
- Web release `20261113T120512Z-bff2359` served 57 verified files with zero
  mismatches behind Cloudflare Access. BFF `87d5d60d7c283bcaf55509c5aa51fab21361614e`
  returned all 14 new outcomes after SAP DEV activated `66879371e03978c05a1e35e0d3fd9a0e38186886`.
- Completion and smoke receipts are in workspace `.codex-artifacts` under
  `piyasa-sort-*-bff2359.json`. The prior published `e351f64` batch exposed the
  markets and had the owner-reported sorting defect. `821dd74` was the prior
  fully accepted pair. Automatic approval review blocked the attempted removal
  of the two superseded local APKs. Private Drive copies and receipts are retained.
- TASK-0233 tracks the team-total candidate and expanded-market trial. TASK-0229
  tracks Selection Lab. The latest native discovery found a fresh cycle with no
  recorded kickoff binding. The producer remains unregistered.

### Previous accepted pair: 821DD74

The 11 November UX review batch (NXT-OBS-248..257) is delivered on Android and
desktop web from clean pushed source
**821dd749f460b670f0e5d8912c91bdb9fb2797b8**. Batch:
`client-821dd749f460b670f0e5d8912c91bdb9fb2797b8-7ED70F2D1CD7-FD96337B8C57`.
The owner installed the exact private APK and replied “Kurdum, çalışıyor”, then
accepted the published web with “Web çalışıyor”. Canonical paired completion
passed on 11 November. These are owner smoke attestations, without a
device-side hash measurement; which screens were exercised was not reported.

Delivered: Selection Lab folds while nothing is published and a failed read no
longer says `Yayın bekleniyor` (248); section shortcuts stay in the pinned bar
on match detail (250); `Sıkı liste görünümü` switch for the phone Canlı and
Super lists, default off (251); small type roles one point larger on web at
1200 px and wider (252); timeline count badge clears its label (253); web hint
wording (249); `sen` voice (255); light theme positive text at 4.63:1 and a
header back control without history (256); unearned stars at 3.2:1, Toto
filter, Super detail spacing, not-found wording and sign-in crest (257).
Detail, corrected review claims and what was left unchanged:
[cutover archive](observation_archive/cutover_2026-11-11.md).

Platform exceptions: the back control shows on Android at every width and on
web only below 768 px; the text step applies to desktop web only; hint wording
differs per surface. No BFF, SAP or model change: BFF source stays
**8f519232add09d3114682b1d833e700ec2726596**, and the publication replaced its
process once (PID 19168 to 31328). The publisher verified 57 served files with
zero mismatches; shell, deep link, API refusal and the public Cloudflare
Access redirect pass. Receipts in `btb-codex/docs/evidence/`:
`ux-review-*-2026-11-11.json`, committed there as `1612fe8`.

Web review before the APK was nine synthetic-data screenshots in chat, not a
live preview opened by the owner; the owner approved both deliveries on that
basis (APPROVAL receipt). Not verified: TalkBack, haptics and the pinned bar's
step on a phone; the sign-in crest is bundled but not rendered, because
sign-in is unreachable in pilot mode.

Working convention: keep unreleased work on a `claude/<topic>` branch that
tracks a remote. `btb status` fails on a local branch with no upstream
(`BtbAgent.Core.psm1`, ahead/behind check; owner: BTB Codex Tool).

### Previous pair: 49EE2E5 Selection Lab

Selection Lab is delivered on Android and desktop web from clean pushed source
**49ee2e5f864eb11d89c1b7ceb995e6f5febbd17f**. Batch:
`client-49ee2e5f864eb11d89c1b7ceb995e6f5febbd17f-40F6490FEA4A-CC6653A39FE6`.
The owner accepted the exact private APK with “APK sorunsuz calisti”, then the
published web with “Web works properly”. Canonical paired completion passed on
9 November. These are owner smoke attestations, without a device-side hash
measurement. No USB/ADB connection was required, as directed by the owner.

The shared panel and read-only BFF expose comparison and first-C1 history.
Historical quotes have `currentOffer=false`; live comparison retains its
15-second expiry. BFF **8f519232add09d3114682b1d833e700ec2726596** is published;
the final supervised replacement was PID14504 to41016. The publisher verified
57 served files, zero mismatches; shell/deep-link/API-refusal and public
Cloudflare Access checks pass. Receipts in `btb-codex/docs/evidence/`:
`selection-lab-*-2026-11-09.json`. COMPLETE and STATUS establish the final state;
preparation/delivery/publication receipts retain their original interim states.

Actual C1 registration and production remain **inactive** (TASK-0229; TASK-0230
retains that dependency). The10 November bounded probe at18:22:19Z returned
a9 November22:06:12.737Z cycle, about20h16m old; no complete frame/computation
was admitted. TASK-0229's next review is11 November. This is dated evidence,
not present SAP state or proof that all feeds stopped.
The owner requested activation/publication, but the source gate is not waived.
The bounded C1 runner is implemented and tested locally with a frozen watchlist
and cumulative budgets; no daemon, trial or collector is enabled. Its current
draft watchlist is empty. Client delivery does not activate it; fresh native
collection/computation and protocol/runtime approvals remain required.
C2/C3 remain unvalidated/unavailable. The10 November offline evaluation adds
paired diagnostics on388 of427 training fixtures;39 fail the unchanged team
sample guard and zero qualify as historical validation. Model coefficients and
client artifacts are unchanged. Its prospective protocol is a non-executable
draft; no forecast ledger or validated alternative is delivered. The populated component QA
was explicitly synthetic; screenshot capture failed and no populated real C1
decision was accepted. See [the implementation checkpoint](C1_HISTORY_AND_ADAPTER_2026-11-08.md)
and BTB Logs `selection_programme_20261108/activation_release_20261109/`.

### Previous pair: 5F26C70 Super report

Accepted source: **5f26c706e5ecadccc79da81bce02b4108ac0284a** (master
fast-forwarded from 26780bc). Batch:
`client-5f26c706e5ecadccc79da81bce02b4108ac0284a-DE08B3613F0D-06513353370C`.
Canonical paired completion passed on 8 November 2026.

NXT-OBS-246: the Super log keeps the last verified report, with a "Yenilenemedi"
note, when a refresh fails or answers UNAVAILABLE. It shipped with BFF d8d652f,
which reuses verified proofs between reports (each re-verified within 10-15
minutes), shares simultaneous identical reads and allows 12 s for v2 reports.
Real SAP, 40 decisions: about 1 s after a 9.6 s cold read, 0.38 MB instead of
10.12 MB. A restart empties the proof cache, so the next report is a cold read.
No platform exception. The owner replied "Installed, works" after installing the
exact APK and "Web works" after publication. Live-hour conflicts are not yet
measured. Receipts in `btb-codex/docs/evidence/`:
`super-report-{APPROVAL,PREPARED,DRIVE,ANDROID-INSTALLED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE,LOCAL-APK-RETENTION,STATUS}-2026-11-08.json`.

### Previous pair: 6A416A1 Expo patch

Accepted source: **6a416a1af9851ae2488f669049ceb1a4b731c852** (master
fast-forwarded from 5286655). Batch:
`client-6a416a1af9851ae2488f669049ceb1a4b731c852-7A512C0C9A9C-3850448F2B14`.
Canonical paired completion passed on 7 November 2026.

This dependency-only batch brings expo, expo-constants, expo-dev-client,
expo-notifications, expo-router, expo-splash-screen and expo-task-manager to
SDK 57's current patch versions, closing the Expo Doctor exception recorded for
ED30743. The lockfile moves 37 versions inside Expo's tree and tooling; app code
is unchanged; npm audit findings drop from 22 to 16. The expo-modules-core patch
keeps the headless task loader in R8-minified release builds (the app's
background notification task; minification is not configured here). The owner
replied “Looks good” after installing the exact APK and “Web looks good” after
publication. Receipts: `expo-patch-{APPROVAL,PREPARED,DRIVE,ANDROID-INSTALLED,POST-INSTALL-VERIFIED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE,LOCAL-APK-RETENTION,STATUS}-2026-11-07.json`.
Background-notification delivery while the app is closed was not measured
separately.

### Previous pair: ED30743 splash and Özet

The splash and Özet redesign was delivered and accepted on Android and desktop
web earlier the same day (source ed30743, master fast-forwarded from 183aed9).
Batch: `client-ed30743b5a3b5a45841aab2bd8d229839fc7ad0c-D303F543EC50-2B5A8F2E9D20`.

The launch keeps the owner's bounded brand hold (800 ms normal, 500 ms reduced
motion, lower-bound tests retained) with a code-drawn ball landing in the crest
on the night pitch in both themes. Özet gains the greeting header, Jinx's
opening line, a merged Jinx Bugün card, compact match cards, named quiet/empty
states, press feedback and the "Yenilendi" refresh confirmation. The five owner
decisions listed in the redesign doc shipped with it.
[Design, scores and validation](SPLASH_OZET_EXPERIENCE_2026-11-07.md).

The owner installed the exact private APK and replied “Looks good”, then
accepted the published web: “Web looks good”. These are owner smoke
attestations, not device-side hash measurements or exhaustive
accessibility/performance tests (haptics, TalkBack and native-driver smoothness
were not measured separately).

Canonical receipts in `btb-codex/docs/evidence/`:
`splash-ozet-{APPROVAL,PREPARED,DRIVE,ANDROID-INSTALLED,POST-INSTALL-VERIFIED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE,LOCAL-APK-RETENTION,STATUS}-2026-11-07.json`.
Preparation and publication receipts preserve their original intermediate
states; COMPLETE and current STATUS establish final completion.

The previous accepted E549 pair (TASK-0222 pressure activity v2,
[evidence](PRESSURE_ACTIVITY_REPAIR_2026-11-04.md)) and the E3 pair
(NXT-OBS-242/243/244) keep their historical receipts:
`pressure-activity-v2-*-2026-11-04.json` and
`super-menu-release-e3ae5df-*-2026-11-03.json`.
Intermediate6141e2f and1fcf5cf batches remain incomplete/superseded, without
retrospective release credit. Their reports and receipts are preserved.

## Repo durumu

| Repository | Source checkpoint | Meaning |
| --- | --- | --- |
| zbet-mobile / master | 821dd749f460b670f0e5d8912c91bdb9fb2797b8 | Accepted artifact source (from branch `claude/ux-review-batch`); subsequent handoff-only commits do not rebuild/release the app |
| zbet-cap / main | 8f519232add09d3114682b1d833e700ec2726596 | Running BFF with Selection Lab/history and launcher paths; retains the report proof reuse; unchanged by the 821DD74 batch |
| zbet-abap / main | 5751cbfdaf705478d21459de533a62ca19c4a101 | Previously accepted reader repair, policy71AC/producerDE3C; unchanged by this Mobile batch |

Android and desktop use `api.surklase.com`; local BFF origin127.0.0.1:4004.
Cloudflare Access protects `app.surklase.com`. This remains owner-only DEV.
The 821DD74 web publication replaced PID 19168 with 31328 through the
publisher. Local and public health passed. Published root:
`C:/Users/omera/AppData/Local/BTB Mobile Next/web/releases/20261111T180222Z-821dd74`.
The previous 49EE2E5 web root and earlier versioned releases remain preserved.

## Doğrulama

- 821DD74: the canonical gate (`invoke-mobile-check.ps1 -BundleOnly`) passed on
  the identical content before commit: TypeScript, ESLint, 830 unit tests, Expo
  Doctor, Android production JS bundle and verified edge web export. The web
  export and signed ARM64 APK were then built from the clean pushed commit and
  paired; the build log does not contain the pilot key. Browser smoke at
  390/820/1200/1440 px in both themes used synthetic data. Both owner smokes
  and canonical paired completion pass.

- 49EE2E5: the unchanged application inputs had passed the canonical Mobile
  checks/Doctor, Android bundle and BFF tests/build. The final edge web export
  and signed ARM64 APK were built and paired from the clean pushed commit.
  The two-line BFF launcher correction passed syntax,19 BFF tests and21 process
  checks under each of PowerShell7 and Windows PowerShell5.1. Both owner smokes
  and canonical paired completion pass. Real C1 source/decision acceptance is
  still unmet; synthetic DOM checks do not supply it.
- 5F26C70: the full canonical gate passed, Expo Doctor included, on the identical
  content before commit; the web export was rebuilt and verified from the
  committed source. BFF d8d652f: 721 tests. Publisher verified all served files,
  zero mismatches.
- 6A416A1: the full canonical gate (`invoke-mobile-check.ps1 -BundleOnly`)
  passed, Expo Doctor included: type check, lint, unit tests, tooling, brand,
  Doctor, Android bundle and verified edge web export (secret scan clean). The
  web export was rebuilt and verified from the committed source.
- ED30743 (historical): the same gate passed except Expo Doctor, which failed
  only on the upstream patch drift that 6A416A1 resolves; the owner chose to
  build and the bundle/web steps were run separately and passed.
- Signed ARM64 pilot APK built from the clean commit; embedded settings match
  E549 (pilot, `api.surklase.com`, mocks off, Match Journey/Team Form/Jinx LIVE).
- Drive delivery: pilot certificate, ARM64-only, owner-only, SHA-256 readback.
- Publisher verified57 served files (56 expected assets plus receipt verification),
  zero mismatches. Shell/deep-link/API-refusal probes passed; public Access
  redirect remains protected.
- The redesign's own headless-browser checks (320–1440 px, both themes) are in
  its doc. Owner accepted both final client smokes.

Technical delivery is not proof of calibrated probability, profitability,
complete live-feed availability or universal defect absence.

## Final yerel pilot APK

- Accepted APK: `btb-mobile-next-arm64-ux-review-821dd74.apk`
- Source: `821dd749f460b670f0e5d8912c91bdb9fb2797b8`
- SHA-256: `7ED70F2D1CD72BEC3C42F528E22112349A72BE88504C6A798C8F54FD983FB633`
- Size/ABI: 50,639,689 bytes, ARM64; certificate `FAC61745…3B9C` unchanged
- Matching web tree: `FD96337B8C57873E51E4108E863917562E43BCB39276FF6A51EC582B72E8F4E9`
- Web release: `20261111T180222Z-821dd74`
- Private Drive file: `1ziPy6-QCo_3JULP3p-wbkeH9Pi7W-8y7`
- Pair: `COMPLETE`, both owner smokes accepted

Delivery used `scripts/deliver-apk-drive.ps1` (rclone remote `btbdrive`, private
`BTB APK` folder): signature and ABI check, owner-only permission, authenticated
download and exact size/SHA-256 readback. No sharing link, policy or
authentication configuration change was created.

After each acceptance and COMPLETE, the superseded local APK was removed under
the owner's29 October retention rule: E549 (`FDBF2981…367C`) for ED30743, then
ED30743 (`D303F543…D003`,50,608,225 bytes) for 6A416A1, then 6A416A1 (`7A512C0C…02D8`,50,608,417 bytes) for 5F26C70, then5F26C70
(`DE08B361…8CA3`,50,609,985 bytes) for49EE2E5, then 49EE2E5
(`40F6490F…F7CA`, 50,630,161 bytes, moved to the Recycle Bin) for 821DD74.
821DD74 is the sole permanent local APK in the artifact directory. Config/hash/delivery/acceptance
receipts, source, cloud copies (6A416A1 Drive file `1cJgY9SbY5mfjpasomEHWEJijAT82Wwva`, ED30743 Drive file `1QPScFiQbZZyOjvtbRRLDA_vKTMGg8GIP`,
E549 `1woDYD2ZCPgDf0nhEjRbe4viQF3ERQQMe`,5F26C70 `1pZtL3jqQ9pb99DFJSzSUu1ElOW9U5hbc`, 49EE2E5 `19o_O6UnlyiEAsksj-sW5xaCdjCkOLkmr`) and versioned web releases remain preserved.

## Açık observation / blokajlar

The splash/Özet and Expo patch batches have no remaining release step; the
Expo Doctor exception is resolved in 6A416A1. TASK-0222 is DONE in E549.
NXT-OBS-242/243/244 remain delivered inE3, NXT-OBS-241 inba88590 and
NXT-OBS-235/238/239/240 inc8188ca. Existing deferred observations retain their gates:

| Observation | Remaining scope |
| --- | --- |
| NXT-OBS-032 | Genuine SAP freshness timestamp; request time must not masquerade as upstream freshness |
| NXT-OBS-068 | Future corporate login; not a prerequisite for this owner-only pilot |
| NXT-OBS-073 | Trusted participant identity/logo chain and separately approved backend contract |
| NXT-OBS-074 | Notification producer continuity; unresolved source-side cause |
| NXT-OBS-086 | Toto producer event identity/idempotency; Toto ownership retained |
| NXT-OBS-089 | Owner design decision about intentional result/decision presentation |
| NXT-OBS-236 | Per-match decision notification; blocked byNXT-OBS-074 |
| NXT-OBS-237 | No single RB1 threshold; frozen model; BTB - Aktif first |

Historical TASK-0177/0169/0168/0171 closures and archived dispositions remain
unchanged. Actual A5 learning and prospective promotion gates stay separate.
Probability work TASK-0150/0153/0190 remains retired without success credit.
No unrelated deferred item was implemented or closed.

## Exact next steps

The paired UX review release (821DD74) is complete; every UX review row
NXT-OBS-248..257 is delivered or dispositioned in the dated archive. Actual
challenger delivery remains
dependent on BTB-owned TASK-0229 source/latency acceptance and real C1
registration/execution; TASK-0230 retains that dependency. C2/C3 require their
separate scientific/identity gates. Do not recreate owner smoke-wait tasks or
infer model success from this UI release.

Continue normal owner observation. Record concrete client findings in
OBSERVATION_LOG.md; reopen the original task on evidence of recurrence.
No extra daily/weekly signature-wait task is needed for these batches or TASK-0222.
When Expo publishes further SDK 57 patches, Doctor will flag them again; the
2026-11-07 update (`npx expo install --check` / `--fix` in the preview-only
environment, full gate, coordinated pair) is the procedure to repeat.

Future releases still require one clean pushed source, verified pair, private
APK installation before matching web publication, and both owner smokes under
explicit release approval. Deferred work retains its evidence/approval conditions.

## Documents

[Architecture](ARCHITECTURE.md), [next cutover procedure](NEXT_CUTOVER_PROCEDURE.md),
[coordinated release](COORDINATED_CLIENT_RELEASE.md), OpenAPI, rebuild schemas
and historical handoffs retain their roles. Mobile/BFF expose read-only DTOs;
BTB/Toto model and learning decisions stay with their owners.
