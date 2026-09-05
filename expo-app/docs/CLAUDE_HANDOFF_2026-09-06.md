# Claude handoff — Mobile M11, 2026-09-06

The owner is ending the Codex task because of remaining usage and will continue
in Claude. This is a checkpoint, not a milestone closure or source-cleanup approval.

## Start here

- Workspace: `C:\dev\btb-cdoex`; profile: `btb-mobile`; active work belongs to
  **BTB Mobile Next - Aktif**. The closing Codex task becomes passive.
- Follow root `AGENTS.md` / `CLAUDE.md` and the canonical BTB optimizer through
  `.claude/skills/btb-thread-optimizer`. Boot with `btb` via the existing agent
  entrypoint; do not reimplement its routing or policy.
- Read this file, the newest entries of `CURRENT_HANDOFF.md`, then
  [M11_PERSONAL_USE_PLAN.md](M11_PERSONAL_USE_PLAN.md). The full handoff contains
  extensive superseded history; the context audit currently selects too much.
  Do not reload old pilot/cutover history merely to continue this checkpoint.

## Current objective and owner decision

M11 is now **Personal Mobile Reliability / Daily Workflow**, `ACTIVE` with
closed M15 as prerequisite. Owner explicitly does not plan external users.
No recruitment, retention target, monetization or longitudinal collector is due.
Authority/mirror are updated; decision is
`btb-codex/ROADMAP_AMENDMENT_2026-09-06.md`. Roadmap reports zero blocking
deviations; other milestones were checked unchanged.

- TASK-0057 DONE: historical planning, only partly reusable.
- TASK-0058 DONE: useful compatible dependency/Doctor/native-validation work;
  KEEP these changes.
- TASK-0059 DONE: tested local retention rehearsal, now unnecessary for the
  personal-use goal. Further retention development is stopped. Removal was
  reviewed, **not performed**; its code remains uncommitted and off by default.
- TASK-0060 OPEN: owner-only dependency advisory review; 14 moderate findings,
  zero high/critical at the last audit. Audience size is not an audit waiver.

Next: review the exact retention cleanup list in M11_PERSONAL_USE_PLAN.md with
the owner, then perform the agreed targeted cleanup while preserving useful
maintenance and unrelated work. Never revert entire integration/package files.
Rerun proportional Mobile/Android JS checks after source changes; only rebuild
native code when inputs require it. Then address TASK-0060 and the owner-phone
workflow/notification acceptance checklist. M11 itself is not complete.

## Repositories and preserved local changes

All four HEADs match their existing local upstream refs (0 ahead / 0 behind;
no fetch). **Uncommitted and untracked changes are still on disk, not pushed.**

| Repo / branch | HEAD | Working tree |
| --- | --- | --- |
| zbet-mobile / master | 76caf6fd754970e714e04eb89f702638345b5353 | M11 changes below |
| btb-codex / main | a060a3f15155905755b997d4495322f38791341a | M11 authority/register, Mobile adapter, decision record |
| BTB Logs / main | f1a2201a6d79b68954281959274a10c91afb0fd7 | BTB_ROADMAP.md only |
| zbet-cap / main | 91cbc259a2ae5d72f0c6a6f1203060560ac71f1e | Clean, untouched |

Mobile changes under `expo-app/`:
- KEEP: package updates/lockfile; `scripts/check-expo-doctor.mjs` and its
  `.test.mjs`; associated package/README checks; M11 dependency evidence.
- Retention candidates: `src/retention/`, `app/retention.tsx`,
  `scripts/retention-report.ts`, `docs/fixtures/m11-retention-synthetic.json`,
  `retention:report` script; retention-only hooks in `app/(tabs)/index.tsx`,
  `live.tsx`, `super.tsx`, `toto.tsx`, More entry, `app/_layout.tsx`,
  `src/providers/AppProviders.tsx`, `src/components/TeamFormCard.tsx`.
- Docs: README, CURRENT_HANDOFF, this handoff, M11 dependency/personal/pilot/
  retention documents. Pilot/retention reports are explicitly historical.
Tooling: `config/agent-roadmap.config.json`, `state/task-registry.json`,
`scripts/invoke-mobile-check.ps1` (KEEP x86_64 option/default ARM64),
`ROADMAP_AMENDMENT_2026-09-06.md`. Update tasks only through the canonical writer.

## Evidence and runtime

- Final pre-cleanup check: 581/581 Mobile tests (19 retention), 7/7 tooling,
  type/lint/brand, Doctor and Android production JS export passed through
  `btb-codex/scripts/invoke-mobile-check.ps1 -BundleOnly` with explicit mock
  preview settings. Configured owner-pilot Doctor passed 20/20 in TASK-0058.
- TASK-0058 additionally passed clean staged install, Android generation and
  x86_64 debug compile. TASK-0059 reused that native shell with fresh Metro JS;
  consent/cancel, sample exclusion, stop/export/delete and restart passed on
  Android 15 / API 35. Synthetic report fixtures produced expected D1/D7 counts;
  they are NOT real-user results. No BTB/Toto/Super data/log intake occurred.
- App log: zero fatal/JS errors and zero matches for 12 sensitive environment
  values. Details/screenshots: `.codex-artifacts/m11-retention-2026-09-05/` and
  `.codex-artifacts/m11-dependencies-2026-09-05/`. Synthetic test journals deleted.
- Temporary Metro and read-only emulator stopped; closure check found no
  port-8083 listener or emulator processes. No automation was created here.
- Runtime stays owner-only OBSERVATION, no open cutover. Last verified CAP
  `91cbc25`, route `https://api.surklase.com`; not freshly rechecked at closure.
- Accepted owner APK unchanged: `btb-mobile-next-arm64-team-form-live-b75b4cd.apk`,
  SHA-256 `53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
- Separate internal x86_64 debug APK SHA-256:
  `B392A247F2D32F75D161EFC398F6E5DDC17F45EF5506A84D780537D4C7FF6BC5`.
  New M11 code/dependency changes are NOT installed on the owner's phone.

## Gates

No source deleted or staged, no commit/push, external configuration, SAP write,
deployment, release signing/distribution or owner-pilot restart is authorized by
this closing request. Keep existing gates. Model/Super/Toto changes remain out
of scope; TASK-0011 stays BTB-owned/M10-gated. Secrets must never enter handoffs,
reports, source or logs. Recheck the dirty tree before editing; preserve all work.
