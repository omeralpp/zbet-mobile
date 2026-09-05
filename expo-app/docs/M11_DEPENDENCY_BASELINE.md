# M11 — Dependency baseline, 2026-09-05

2026-09-06 scope update: this maintenance remains useful under the owner's
[personal-use M11 plan](M11_PERSONAL_USE_PLAN.md). Retention/external-pilot next
steps below are historical; no external users are currently planned.

Task: `TASK-0058` — `DONE` (local baseline). Scope: compatible SDK 57 maintenance and reproducible local
verification. M11 remains in preparation; existing runtime remains owner-only
`OBSERVATION`. No external rollout or replacement phone APK is included.

## Changes

Updated 16 direct packages to the SDK-compatible patch levels reported by Expo:

| Package | Before | After |
| --- | --- | --- |
| expo | 57.0.11 | 57.0.20 |
| expo-auth-session | 57.0.6 | 57.0.11 |
| expo-constants | 57.0.9 | 57.0.17 |
| expo-crypto | 57.0.1 | 57.0.2 |
| expo-dev-client | 57.0.10 | 57.0.18 |
| expo-font | 57.0.1 | 57.0.3 |
| expo-haptics | 57.0.1 | 57.0.2 |
| expo-linking | 57.0.5 | 57.0.9 |
| expo-notifications | 57.0.9 | 57.0.17 |
| expo-router | 57.0.11 | 57.0.19 |
| expo-secure-store | 57.0.1 | 57.0.3 |
| expo-splash-screen | 57.0.5 | 57.0.8 |
| expo-system-ui | 57.0.2 | 57.0.3 |
| expo-task-manager | 57.0.8 | 57.0.16 |
| react-native | 0.86.2 | 0.86.3 |
| eslint-config-expo | 57.0.1 | 57.0.2 |

The package manager regenerated the lockfile and updated compatible transitive
packages. A targeted `npm update js-yaml` resolved its remaining high advisory
within the existing parent ranges, installing 4.3.2. No forced audit fix,
dependency override, SDK major change or finding suppression was used.

`package-lock.json` SHA-256:
`797D071026B722A784662649661DF7E117FBDABB79532FB0DE8A6B3E52AE2473`.

## Reproducible Doctor

`npm run doctor` now invokes [check-expo-doctor.mjs](../scripts/check-expo-doctor.mjs)
with an explicit preview profile in a child process. The wrapper removes
inherited pilot/OAuth secrets from that preview environment and prevents dotenv
from reintroducing them. Caller environment and persistent settings are unchanged.

Before Doctor, it runs the installed Expo CLI's config evaluation and validates
the `exp.extra` fields in the full JSON envelope against the selected profile.
Raw config output is never printed because it can contain a pilot key. A config
failure or unexpected shape stops the gate. Doctor itself must exit zero and
report a complete nonzero check count matching the announced count, without a
failure diagnostic. A zero exit alone is insufficient.

`npm run doctor:configured` requires an explicit `pilot` or `oauth` process
environment, preserves it and validates that actual profile. Its diagnostic
output redacts sensitive environment values. The owner pilot configuration was
checked with real Team Form and synthetic Match Path/Jinx, without contacting
the BFF or changing the pilot service. OAuth deployment readiness was not tested.

Seven tooling regressions cover inherited-config isolation, explicit configured
mode, false-success exits, config secrecy, wrong config shape/profile, complete
Doctor output and diagnostic redaction. `npm run check` includes them.

The first real wrapper run exposed an incorrect assumption that `--full` returns
the app config directly. It actually wraps that config in `exp`; the validation
and test fixture were corrected before the successful full gate.

## Verification

| Check | Result |
| --- | --- |
| TypeScript, ESLint, unit tests and brand checks | PASS through the canonical Mobile gate |
| Doctor-wrapper regressions | 7/7 PASS; included in the canonical gate |
| Preview Doctor | PASS through the wrapper and canonical gate |
| Explicit owner-pilot Doctor | 20/20 PASS; no version mismatches |
| Android production JavaScript export | PASS in explicit preview mode |
| Clean staged `npm ci` | PASS from the updated lockfile |
| Android native project generation | PASS |
| x86_64 debug compile | PASS through the canonical Mobile gate |
| Android 15 / API 35 x86_64 emulator smoke | PASS for preview launch, Dashboard, Match Detail, Match Path, Super, Toto and More |
| Artifact and app-log secret review | No matches for the 12 sensitive environment values checked; no private-key markers in the APK |

The existing Mobile quality adapter now accepts `-Architecture x86_64` for an
emulator build. Its default remains `arm64-v8a` and retains the existing ARM64
artifact name. No other gate is skipped. This verification uses one ABI and a
separate debug artifact; the owner phone APK is preserved.

The canonical command is `btb-codex/scripts/invoke-mobile-check.ps1 -BundleOnly
-NativeBuild -Architecture x86_64`. Its calling process explicitly selects mock
preview auth and synthetic intelligence, clears the pilot key and disables
dotenv loading. Process-local JVM settings limit processor/Gradle concurrency
to two for this Windows build; no persistent Gradle settings are changed.

### Native artifact and smoke scope

Internal artifact: `.codex-artifacts/btb-mobile-next-x86_64-debug.apk`,
95,104,736 bytes, SHA-256
`B392A247F2D32F75D161EFC398F6E5DDC17F45EF5506A84D780537D4C7FF6BC5`.
APK signature verification passes v2. The APK contains only the x86_64 ABI;
its packaged config has preview auth, `useMocks=true` and no pilot key.
The scan covered 1,336 nonempty APK entries and 12 sensitive environment values,
with zero matches and zero private-key-marker entries.

The debug build installed successfully in a temporary read-only
`BTB_Mobile_API_35` emulator (`emulator-5560`, Android 15). The app displayed
sample Dashboard and Match Detail data, the labeled synthetic Match Path chart,
Super history, Toto programs and the More screen's preview-mode message.
The app remained running; its process log contained no fatal exception or
JavaScript error matches and no matches for the 12 sensitive values checked.
Screenshots are retained in `.codex-artifacts/m11-dependencies-2026-09-05/`
(`dashboard.png`, `match-detail.png`, `super.png`, `toto.png`, `more.png`).

Initial development-server connection failed because Node resolved localhost
to IPv6 while Android's reverse mapping used IPv4. Restarting only the temporary
preview server with `node --dns-result-order=ipv4first`, restoring the device
mapping and connecting through the development launcher's UI resolved it;
the bundle loaded 2,413 modules. No application change was needed for this setup
issue. The external GamePulse widget showed a provider error for the old sample
fixture: this smoke does not assert live-feed availability. Physical-phone,
live-authentication, notification-delivery and real Team Form acceptance were
not repeated with the new dependencies.

The temporary preview server and read-only emulator were stopped after the
smoke; no port-8083 listener or emulator device remained. Canonical build staging
was cleaned by the adapter. The accepted owner-phone APK was preserved:
54,259,061 bytes, SHA-256
`53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
No owner-pilot service restart, persistent emulator change, release signing,
distribution, external configuration, commit or push was performed.

## Audit disposition

Fresh `npm audit --json --ignore-scripts` now reports **14 moderate / 0 high /
0 critical**, down from **15 moderate / 6 high**. Audit still exits **1**.
The 14 affected package entries inherit **two root advisories**:

| Root advisory | Local dependency path and disposition |
| --- | --- |
| `uuid` buffer bounds, GHSA-w5hq-g745-h8pq | Expo config tooling → xcode 3.0.1 → uuid 7.0.3. The inspected Xcode project writer calls `uuid.v4()` without an output buffer; the advisory concerns v3/v5/v6 buffer APIs. This bounds the inspected use, not every possible use of the dependency. It remains in the audit. |
| `decode-uri-component` malformed-input CPU exhaustion, GHSA-vcc3-ghjq-m6fr | Expo Router → query-string 7.1.3 → decode-uri-component 0.2.2. The inspected Expo Router fork parses URL searchParams, while bundled React Navigation core still calls `query-string.parse`. End-to-end exposure to external links has not been ruled out. Resolve compatibility/reachability before external distribution. |

Patched root versions fall outside the current parent dependency ranges; npm's
suggested automatic resolution includes large Expo/Router downgrades. No such
resolution or audit waiver is accepted here. `TASK-0060` records the remaining
compatibility/reachability review and remediation as Mobile-owned M11 work.
This baseline permits further local preparation; it is not an all-clear for
external-user distribution. `TASK-0059` remains the next local retention rehearsal.

Primary references: [Expo's version-alignment workflow](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/),
[npm audit semantics](https://docs.npmjs.com/cli/v11/commands/npm-audit/),
[uuid maintainer advisory](https://github.com/uuidjs/uuid/security/advisories/GHSA-w5hq-g745-h8pq),
[URL decoder advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr).
Installed package source and the lockfile establish the project-specific paths;
the advisory severity alone does not prove application exploitability.

## TASK-0060 disposition — accepted with rationale, 2026-09-06

Owner instruction on 2026-09-06: record an accept with rationale. Scope is the
owner-only personal-use M11 defined in `M11_PERSONAL_USE_PLAN.md`. Audit state is
unchanged from the baseline: **14 moderate, 0 high, 0 critical**, and all 14 rows
resolve to the same two root advisories analysed above.

This accept is a recorded, bounded decision with residual risk stated. It is not
an audit waiver, and audience size is not used as the argument.

### New evidence: reachability measured against the shipped bundle

The baseline left one question open — *"end-to-end exposure to external links has
not been ruled out."* It is now answered by inspecting the exported Android
production Hermes bundle directly, not by reasoning about package roles:

Artifact: `.codex-artifacts/android-export/_expo/static/js/android/index-4502028d88b7beb78455bcaa089f1a9c.hbc`, 5,793,061 bytes, produced by the
2026-09-06 `invoke-mobile-check.ps1 -BundleOnly` run.

| Probe | Result | Meaning |
| --- | --- | --- |
| `decode-uri-component`'s `%[a-f0-9]{2}` matcher literal | present | Ships to the device. Runtime-reachable. |
| `xcode` / `pbxproj` / `PBXFileReference` literals | absent | Xcode/uuid tooling never reaches the device. |

The measurement confirms the baseline's concern rather than dismissing it, and it
separates the two advisories into genuinely different classes.

### Per-advisory disposition

**`uuid` buffer bounds, GHSA-w5hq-g745-h8pq — accepted, not shipped.**
Path: `expo-splash-screen 57.0.8 → @expo/config-plugins 57.0.9 → xcode 3.0.1 →
uuid 7.0.3`. `xcode` writes iOS `.pbxproj` files during prebuild. This app targets
Android, and the bundle probe shows none of that tooling reaches the device. The
advisory concerns the v3/v5/v6 `buf` APIs; the inspected writer calls `uuid.v4()`
with no output buffer. Build-time only, with no device-side exposure to accept.

**`decode-uri-component` malformed-input CPU exhaustion, GHSA-vcc3-ghjq-m6fr —
accepted with residual risk.**
Path: `expo-router 57.0.19 → query-string 7.1.3 → decode-uri-component 0.2.2`.
It is in the shipped bundle and is reachable: React Navigation core's
`getStateFromPath` / `getPathFromState` call `query-string.parse` when resolving a
URL into navigation state. The vulnerable `decodeComponents` recursion runs only in
the `catch` branch, i.e. only after `decodeURIComponent` throws on malformed
percent-encoding, which the app's own navigation never generates.

What is accepted, stated plainly: impact is denial of service (CWE-400) — CPU
burn and an unresponsive app until restart. It is not code execution, privilege
escalation or data disclosure. Triggering it requires the owner to open a
deliberately malformed deep link on their own phone; the failure is local to that
device and reaches no server, no data and no other person.

### Why no remediation is applied

There is no forward fix. Every `decode-uri-component` release in the pinned `0.x`
line is inside the advisory range `<=0.4.2`, and `query-string 7.1.3` pins it.
npm's automatic resolutions are **downgrades, not upgrades**: it proposes
`expo-router@5.1.11` against the installed `57.0.19`, and `expo@46.0.21` against
the installed `57.0.20`. Running `npm audit fix --force` would therefore replace
two moderate DoS advisories with a catastrophic multi-major SDK regression. That
is a worse outcome than the risk being accepted, so no such resolution is taken.

### Re-check conditions — this accept expires, it does not stand forever

Reopen and re-evaluate when any of these becomes true:

1. Expo Router ships a `query-string` that resolves `decode-uri-component` above
   `0.4.2` (`query-string` 9+ drops the dependency), or a patched `0.x` appears.
2. Either advisory is re-rated above moderate, or a new advisory appears on these
   paths.
3. **Before any distribution beyond the owner's own device.** This accept is
   scoped to owner-only personal use and carries no authority past it.
4. At the next dependency baseline refresh, whichever comes first.

### What this does not authorize

No release, signing, distribution or deployment. No dependency change, lockfile
change or `npm audit fix` of any form. No waiver of the remaining moderate rows,
which stay tracked and visible in `npm audit`. Verification reused here is the
2026-09-06 gate run: 562/562 tests, Doctor PASS, Android production JS bundle PASS.
