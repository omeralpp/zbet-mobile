# M11 — Personal Mobile reliability and daily workflow

Owner decision: 2026-09-06. Status: `ACTIVE / OWNER_ONLY_PREPARATION`.
This replaces the external-user pilot/retention objective; it does not close M11.
Decision: [roadmap amendment](../../../btb-codex/ROADMAP_AMENDMENT_2026-09-06.md).

## Purpose

Make the existing app dependable and convenient for the owner's own match,
Super, Toto and Team Form workflow. No external users, growth measurement,
monetization or billing are planned. Avoid adding features merely to fill a
milestone: verify what exists, then fix demonstrated personal-use friction.

## What remains useful

- Keep TASK-0058's 16 compatible package updates, lockfile and targeted
  transitive fix. Last verified audit: 0 high/critical, 14 moderate; no waiver.
- Keep explicit-profile Doctor and its seven regressions, the canonical
  quality gate and the optional x86_64 emulator build path.
- Reuse the recorded checks, accepted phone baseline and unchanged runtime
  evidence within their actual scope. Nothing new is on the owner's phone yet.
- Retain historical planning/rehearsal reports for traceability, not as new
  mandatory personal-use functionality or proof of real-user retention.

TASK-0057 was partly useful planning; its cohort/retention assumptions are
superseded. TASK-0059 is a verified implementation with low immediate value for
this owner. Some of that work was avoidable; the purpose should have been
confirmed earlier. Test counts are verification effort, not a measure of value.

## Retention cleanup — applied 2026-09-06

The optional retention feature was removed from the local candidate on
2026-09-06 under the owner's explicit instruction, after the review recorded
above. The work was backed up before removal, because it had never been
committed and no git history stood behind it:
`.codex-artifacts/m11-retention-removed-2026-09-06/` holds the full pre-cleanup
tracked diff and a tarball of the nine untracked files. That directory is
gitignored and local only.

Removed outright:

- `src/retention/` (contract, recorder, report, provider, hooks and 19 tests),
  `app/retention.tsx`.
- `scripts/retention-report.ts`, the `retention:report` package script and
  `docs/fixtures/m11-retention-synthetic.json`.

Removed surgically, leaving the rest of each file untouched:

- The retention import and `useRetentionFeature` call in the Dashboard, matches,
  Super and Toto tab screens.
- More's local-measurement `SettingsRow` entry.
- The root retention `Stack.Screen`, its mascot-overlay exception and the now
  unused `usePathname` binding in `app/_layout.tsx`.
- AppProviders' `RetentionProvider` wrapper and TeamFormCard's
  `RetentionVisibleFeature` wrapper.
- README wording that presented retention as an active feature.

Preserved in full, as required: every TASK-0058 package update and the lockfile,
`scripts/check-expo-doctor.mjs` and its tests, the `test:tooling` and
`doctor:configured` scripts, the quality adapter and all prior owner fixes. No
whole integration file was reverted. `M11_RETENTION_REHEARSAL.md` and
`M11_PILOT_PLAN.md` are retained as historical evidence, marked superseded.

Verification after removal, through `btb-codex/scripts/invoke-mobile-check.ps1
-BundleOnly` with explicit mock preview settings: TypeScript, ESLint and unit
tests PASS at 562/562, Doctor PASS, Android production JS bundle PASS. The count
is the prior 581 minus exactly the 19 retention tests, and the 581-test result
is not reused. `app/(tabs)/index.tsx`, `live.tsx`, `super.tsx` and
`TeamFormCard.tsx` returned to their exact committed content, which is the
independent check that the removal was surgical.

Nothing was staged, committed, pushed, deployed or installed by this cleanup.
The accepted owner-phone APK is unchanged and still carries none of this work.
## Owner acceptance checklist

| Area | Current evidence | Still needed for M11 closure |
| --- | --- | --- |
| Scope and optional features | Owner-only direction approved; retention cleanup applied 2026-09-06 and verified at 562/562 | Record any actual personal-use issues found on the phone |
| Core journeys | Prior owner acceptance includes corrected Team Form/last-five results; preview navigation passed | Intended owner-phone candidate: Dashboard, match details, Super, Toto and real Team Form; verify freshness, navigation and unavailable states |
| Notifications and return to app | Existing behavior, not revalidated by retention tests | On intended phone: owner preferences, foreground/background/restart and tap-through; record device restrictions and observed failures |
| Maintenance/security | TASK-0058 baseline passed; TASK-0060 disposition recorded 2026-09-06 — 14 moderate accepted with rationale, 0 high/critical, reachability measured against the shipped bundle | Re-check on any Expo Router/query-string fix, any severity change, and mandatorily before distribution beyond the owner device |
| Final owner acceptance | Accepted phone APK unchanged | Exact chosen artifact/hash plus owner confirmation, under separate build/signing/distribution approvals where applicable |

The checklist does not invent a new notification feature, a known failure, a
required model change, or a mandatory external account. Reuse acceptance for
unchanged behavior; validate touched inputs before declaring them ready.

Next bounded action: the owner-phone workflow and notification acceptance checks
on the intended candidate. The retention cleanup and the TASK-0060 advisory
disposition are both complete. No new retention implementation, user
recruitment or longitudinal analytics work is due.

## Boundaries and checkpoint

Owner runtime stays `OBSERVATION`, with no open cutover. Last verified CAP
`91cbc25`, route `https://api.surklase.com`. Accepted APK:
`btb-mobile-next-arm64-team-form-live-b75b4cd.apk`, SHA-256
`53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
No runtime/device read or new build was needed for this documentation decision.

Mobile, Tooling and Logs contain local uncommitted M11 work; CAP is untouched.
No source was deleted, and no commit/push, external configuration, deployment
or distribution occurred. Model quality, Super/Toto behavior and BTB-owned
TASK-0011 keep their existing ownership and approval gates. No closure credit
is earned merely by replacing the old criterion with a new one.
