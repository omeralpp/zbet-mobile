# M11 — Mobile pilot scope and retention plan

**Historical scope — superseded 2026-09-06.** The owner does not plan external
users. Current M11 is [personal Mobile use](M11_PERSONAL_USE_PLAN.md), not a
real-user pilot. Cohort recruitment, retention and monetization steps below
are preserved as history and must not be resumed as current work.

Started: 2026-09-05. Owner: `btb-mobile`. Preparation task: `TASK-0057` — `DONE`.
Milestone: `ACTIVE / LOCAL_PREPARATION`; existing runtime: `OBSERVATION`.
External participant enrollment: **not started**. Retention results: **not measured**.

## Authorization and outcome

The owner said "Let's start task" after the proposal to define M11's pilot
scope, build readiness and retention measurement. That starts this local
preparation phase. M15 is closed and is M11's prerequisite under the owner's
2026-09-05 roadmap decision. M11 does not wait for M10.

M11's unchanged completion criterion is **real users on a distributed build,
with retention measured**. This plan, owner testing, synthetic events, and a
successful build do not satisfy that criterion. The existing owner-only pilot
boundary still applies until the owner explicitly authorizes a named external
cohort and distribution. Commit/push, external configuration, release signing
and distribution retain their separate project approval gates.

## Proposed first cohort and product scope

- Planning assumption, pending the owner's choice: 3–5 invited adult testers,
  Android first, with a 14-day observation window per activated participant.
  The owner is a separate rehearsal cohort and is excluded from user metrics.
- Start dates are assigned only after the distribution gate passes. No invites,
  accounts, notifications, payments or automatic follow-ups are created by this plan.
- Test the existing Dashboard, matches, Super decision history, Toto display
  and real Team Form. Record whether people return for these existing surfaces.
- Match Path and Jinx remain explicitly labeled synthetic examples. Real Jinx
  analysis belongs to BTB's `TASK-0011`; it is not a prerequisite for this pilot.
- While M14 remains open, model output must not be described as calibrated or
  as a reliable win probability. The roadmap records overconfidence above
  `base_prob` 70 as the reason. Review participant-facing wording before release.
- Monetization exploration is optional feedback about usefulness and willingness
  to pay. There is no billing implementation or revenue claim in this phase.

## Readiness assessment — preparation entry, 2026-09-05

The dependency rows below record the initial assessment, not current results.
`TASK-0058` is now `DONE`: compatible patches, explicit-profile Doctor (20/20),
Mobile checks and x86_64 Android build/emulator smoke pass. Audit is now
14 moderate / 0 high / 0 critical; remaining findings are `TASK-0060` and still
require resolution before external distribution. See the verified
[dependency baseline](M11_DEPENDENCY_BASELINE.md). The owner APK is unchanged.

These are local-source and local-tool observations. No live SAP inspection,
public runtime recheck or new physical-device test was performed.

| Area | Evidence | Consequence for the next phase |
| --- | --- | --- |
| Accepted owner build | Team Form and last-five results physically accepted on September 3; NXT-OBS-142/145/147 closed | Reuse as the owner baseline; acceptance does not cover external users |
| APK identity | Existing file rehashed: 54,259,061 bytes, SHA-256 below matches the handoff | Baseline artifact is present and unchanged; no new build/signing performed |
| Auth | `srv/mobile-bff/auth.js` gives every pilot request subject `btb-mobile-pilot`; the client says no personal account is created | Current API traffic cannot identify returning people, and the shared key is not individually revocable |
| Per-user access | Generic OAuth/PKCE client and BFF token validation exist locally; architecture records external setup/device validation as pending | Prepare the existing OAuth path for named testers; provider configuration and rollout need a separate decision |
| Usage measurement | No retention/app-open event instrumentation found in the targeted Mobile source/package and BFF review; installation IDs currently serve notification registration | Implement a separate opt-in measurement contract; notification registration/background polling is not evidence of an active person |
| Expo Doctor | Clean process-local preview settings: **19/20**, 16 package-version mismatches | Dependency readiness remains open; this is not a release pass |
| Dependency audit | `npm audit --json --ignore-scripts`: **21** affected package entries, **15 moderate / 6 high / 0 critical**, audit exit 1 | Triage actual paths and update compatible versions; counts include inherited dependency findings, not 21 distinct exploits |
| Historical quality | Handoff records 562 Mobile tests, passing BFF tests/build, and owner physical acceptance | Reuse only for unchanged source; rerun proportional gates after implementation |
| Runtime | Last verified CAP `91cbc25`, route `https://api.surklase.com` | Historical checkpoint only; recheck at the eventual release gate |
| Technical SAP user | Architecture records a temporary developer-user exception and a dedicated restricted communication user still pending | Confirm the current access boundary before external rollout; no SAP account change is authorized here |

The initial unqualified `npm run doctor` failed while reading Expo config:
"Pilot access keys are forbidden outside the explicit pilot profile." Its npm
wrapper returned exit 0 despite that error, so it was not counted as a pass.
The retry used temporary child-process settings (`useMocks=true`, auth `preview`,
empty pilot key, synthetic intelligence); it completed the checks and exited 1.
Persistent environment files and the running pilot were untouched.

The 16 mismatches cover Expo and its auth-session, constants, crypto, dev-client,
font, haptics, linking, notifications, router, secure-store, splash-screen,
system-ui and task-manager packages, plus React Native and eslint-config-expo.
Some npm audit suggestions downgrade Expo 57 to 46 or Expo Router 57 to 5.
Those suggestions were not applied. Compatible updates and residual findings
were subsequently addressed and triaged in the dependency baseline linked above.

## Retention measurement contract — local rehearsal implemented

`TASK-0059` implements the bounded local rehearsal described in
[M11_RETENTION_REHEARSAL.md](M11_RETENTION_REHEARSAL.md). It includes consent,
stop/export/delete controls, strict event fields and offline reporting. It is
not a longitudinal real-user collector: process restarts stop the rehearsal,
long gaps invalidate coverage, client cohorts remain owner/sample only and
build SHA stays explicitly unknown. These restrictions must be resolved at the
external-pilot review before claiming complete real-user measurement windows.

Use an opt-in local measurement rehearsal first. No analytics provider or remote
collector is selected. A later external pilot may use participant-initiated
exports, provided every participant's full measurement window is accounted for.

Identity: an owner-assigned pseudonymous participant code in the private cohort
roster, plus a random measurement installation ID. Neither the shared pilot
subject, push token nor hardware identifier is a participant ID. The roster
records install replacement/extra-device mappings so a reinstall is not silently
counted as a new person. Real identities and measurement exports stay outside Git.

Minimal export envelope: schema version `M11_RETENTION_V1`, cohort kind
(`owner_rehearsal`, `synthetic_test`, `invited_pilot`), participant code,
measurement installation ID, app version/build SHA, consent start/end, recording
coverage start/end and export time, all timestamps in UTC. Unknown coverage and
clock anomalies must remain explicit.

Minimal event: unique event ID, timestamp, session ID, event name and, only for a
feature event, an allowlisted surface (`dashboard`, `matches`, `super`, `toto`,
`team_form`). The contract has four events:

| Event | Trigger |
| --- | --- |
| `consent_started` | Participant enables local measurement after seeing what is recorded |
| `session_started` | User foreground entry; resume after at least 30 minutes away creates a new session |
| `feature_viewed` | An allowlisted real-data surface renders successfully while foregrounded; once per surface/session |
| `consent_stopped` | Measurement stops immediately; participant chooses export or deletion of local history |

No match IDs, selections, odds, financial amounts, names, email, raw errors,
credentials, push tokens or screen text enter this dataset. Background sync,
notification delivery, app health probes, errors and synthetic cards do not emit
qualified feature events. Measurement failure must never block app use. The
local store is bounded, and overflow or missing intervals invalidate coverage
instead of silently dropping evidence. Deletion removes local measurement data;
previously shared exports require a separate owner deletion record.

An activation is a participant's first qualified feature event after consent.
A qualified return is another such foreground event in the specified window.
Merge duplicate exports by event ID, merge known devices by participant code,
and count each person at most once in each metric.

| Metric | Fixed definition |
| --- | --- |
| Activation | Invited participants with an activation / all invited participants; also report installed count separately |
| D1 return | Activated participants with a qualified event in `[activation + 24h, activation + 48h)` / participants with a fully elapsed, validly observed D1 window |
| D7 return | Same calculation for `[activation + 168h, activation + 192h)` |
| Feature reach | Distinct activated participants with a qualified event on each surface / activated participants with adequate coverage |
| Data completeness | Mature participant windows that can be evaluated / all mature participant windows |

The report must also show raw invited, installed, activated, pending-window,
evaluable, returned, not-returned, withdrawn and missing/invalid-evidence counts.
An elapsed window with no export is **unknown**, not a proven non-return.
No events counts as non-return only when recording coverage for the whole
window is verified. With a small cohort, report counts alongside percentages
and missingness; do not generalize to a larger user population. Owner and
synthetic data are reported separately and never enter M11's real-user totals.

Rehearsal cases: a known D1/D7 return, complete non-return, immature D7 window,
missing export, duplicate export, multi-device/reinstall, clock shift,
consent withdrawal and background-only activity. The expected counts must be
known before running the report. No real retention percentage exists today.

## Work sequence and completion evidence

1. **Preparation (this checkpoint):** scope, source-backed readiness assessment,
   measurement definitions and durable roadmap/task updates.
2. **Local dependency baseline — TASK-0058 / DONE:** explicit-profile Doctor,
   compatible package alignment, audit triage, Mobile quality and x86_64 Android
   build/emulator checks completed. Residual advisories remain tracked separately
   in **TASK-0060 / OPEN**; this completion is not external-release approval.
3. **Local measurement rehearsal — TASK-0059 / DONE:** opt-in journal and offline
   report implemented; known-case tests and Android preview controls are covered
   in the rehearsal checkpoint linked above. No remote analytics or automatic
   export is used. This does not fulfill M11's real-user completion criterion.
4. **External pilot release review:** specify the cohort, per-user auth/revoke
   behavior, deployment target, technical-user scope, consent/export handling,
   participant-facing calibration/synthetic wording, device coverage and exact
   candidate artifact. Existing owner-only exceptions do not silently extend.
   Resolve the remaining URL-parser/tooling findings under `TASK-0060` and
   verify the actual target-device artifact; the preview emulator is not that gate.
   Take exact commit/push, external-system and distribution approvals at their
   respective gates, after the reviewable evidence is ready.
5. **Observed pilot:** owner-authorized enrollment and distribution; collect
   the declared windows and completeness evidence. Any D1/D7 review dates are
   calculated from actual activations, not today's planning date.
6. **M11 decision:** report measured real-user retention, coverage, failure and
   feedback counts; record continue/rework/stop. M11 closes only after its
   real-user/distributed-build criterion is evidenced. No arbitrary retention
   target or income multiple is introduced by this plan.

## Reproducible checkpoint

At entry, all four repositories were clean and matched their local upstream
references; no fetch was performed:

- Mobile `76caf6fd754970e714e04eb89f702638345b5353`.
- CAP `91cbc259a2ae5d72f0c6a6f1203060560ac71f1e`.
- Tooling `a060a3f15155905755b997d4495322f38791341a`.
- Logs `f1a2201a6d79b68954281959274a10c91afb0fd7`.

Owner APK: `.codex-artifacts/btb-mobile-next-arm64-team-form-live-b75b4cd.apk`.
SHA-256: `53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
This is the existing owner artifact, not an approved external-pilot release.

Source pointers: [current handoff](CURRENT_HANDOFF.md),
[auth architecture](ARCHITECTURE.md), [Mobile package](../package.json),
[client auth entry](../src/auth/entry-policy.ts),
[BFF pilot auth](../../../zbet-cap/srv/mobile-bff/auth.js),
[roadmap authority](../../../btb-codex/config/agent-roadmap.config.json).
