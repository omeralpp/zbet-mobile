# Latest-selection and historical-name delivery — 23 October 2026

Status: READY_FOR_OWNER_DELIVERY_APPROVAL. The owner accepted the local web
appearance and recovered historical names and asked for this package. No Git
stage/commit/push, running BFF restart, final APK creation/signing/distribution
or public web publication has been performed for this batch.

## Reviewed behavior

- Match hero and Overview/Live cards retain the last published selection and
  first minute/price/stars; only verified fresh same-market prices appear as
  current. Current eligibility, terminal state and waiting reasons stay explicit.
- Match Jinx explains frozen decision evidence. Active counters/filters expire
  with cards; old notification/decision links retain their immutable identity.
- Overview, Jinx, recent decisions, command palette and Android widget use the
  same all-cohort v2 display totals as Super. Learning cohorts remain separate.
- The compatible opt-in BFF contract adds verified quote/expiry projections.
  Historical participant names are recovered from already verified frozen
  provider evidence; all seven examined older decisions recovered their names.
  No SAP schema, write, backfill, model identity or rule change is needed.
- The accepted theme/assets remain; the stale crest failure state is fixed.

Details: [local batch](HERO_SELECTION_BATCH_2026-10-23.md),
[design comparison](DESIGN_PARITY_REVIEW_2026-10-23.md), and
`zbet-cap/docs/RB1_HISTORICAL_NAMES_2026-10-23.md`.

## Source and evidence boundary

| Repository | Reviewed baseline | Branch | Indexed files |
| --- | --- | --- | --- |
| zbet-mobile | e9e8052c7eda515f1b6f0872a0a61860fd8767b0 | master | 33 |
| zbet-cap | 12899644d8d37677a7a644ae886d0540410d0eb0 | main | 10 |

The exact 43-file SHA256 index and owner-preview acceptance receipt are in
`C:/dev/btb-cdoex/.codex-artifacts/hero-selection-20261023/delivery-package.json`.
Only these files and bounded delivery/handoff receipts in these two repositories
are proposed for commit/push. Source drift or unrelated dirty files stop the
freeze for review; no blanket staging. Final source SHAs and artifact hashes
will be measured after approved commits/builds, never invented in advance.

Passed checks for the indexed implementation: 670 client tests, 32 tooling
tests, 706 BFF tests, typecheck, lint, Doctor 20/20, Android Metro/Hermes bundle,
verified edge web export with secret scan, desktop/390 px browser checks and
context routing audit. The Android bundle is not a final APK/device smoke.
The accepted preview export is a dirty development build and cannot be published
as a clean release. The latest read-only report comparison had eight decisions
and -1.04 units on both paths, with no unresolved participant names; those are
dated observations, not fixed expectations for future live data.

## Proposed approved execution sequence

1. Recheck indexed source hashes, status and diff whitespace. Commit/push only
   reviewed files to the two existing branches; confirm remote SHAs. Freeze the
   clean pushed client commit for both release artifacts.
2. Refresh BFF Process environment from the existing User configuration without
   logging secrets. Preserve policy/producer/history identities, pilot auth,
   current web root, notifications and disabled legacy A3 collector. Stop only
   the verified existing port-4004 BFF process and start the accepted source via
   `zbet-cap/scripts/ensure-mobile-bff.ps1`. Verify health, legacy compatibility,
   opt-in quotes/expiry, frozen names and consistent v2 totals. No model reseal.
3. Export and verify final edge web from the clean pushed client commit using
   `node scripts/web.mjs export`. Then build/sign the owner-phone ARM64 APK via
   `scripts/build-pilot-apk.ps1` with a unique artifact name. The owner has
   accepted web first; final APK work comes after that acceptance.
4. Verify same-source APK/web hashes using `scripts/client-release.mjs verify`.
   Rehearse the existing `scripts/deliver-apk-drive.ps1`, then privately deliver
   to the existing owner-only BTB APK folder. Verify signature, ABI and downloaded
   remote bytes/hash; retain the receipt and give the owner the exact APK link.
5. Wait for the owner's actual installation confirmation for that exact APK.
   This is evidence, not a second delivery permission. No fabricated receipt.
6. Rehearse then publish only that companion web via
   `zbet-cap/scripts/publish-web-client.ps1` with APK/delivery receipts and
   `-Confirm PUBLISH-WEB`. Keep existing Cloudflare Access/routing configuration;
   verify the served JS belongs to the new release, plus API/detail/report.
7. Obtain and record both real Android/web smoke results; run
   `scripts/client-release.mjs complete`. Update only bounded handoff/observation
   and delivery receipts, and commit/push that completion evidence under the
   same approval. Incomplete smokes keep the batch incomplete.

## Retention and failure behavior

Keep accepted pair `43d2e7d` and public release
`20261022T195402Z-43d2e7d`, its exact APK/delivery receipts and prior BFF commit
`12899644d8d37677a7a644ae886d0540410d0eb0`. No historical data is deleted.
On a failed check, stop before the next gate and retain the previous served
pair. Any publication rollback or source change outside this index requires
its own owner decision; this package does not grant destructive Git permission.

Excluded: SAP writes/activation, algorithm/pressure/star/learning changes,
automatic model promotion, transport release, production, data deletion,
new notification channels and unrelated theme work.

Approval basis: AGENTS.md separate Git/runtime/signing/distribution/publication
gates and [coordinated release procedure](COORDINATED_CLIENT_RELEASE.md).
Local web acceptance grants none of those external actions by itself.
