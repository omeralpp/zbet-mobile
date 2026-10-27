# Match evidence UX review — 27 October 2026

Owner request: review and score every Maçın Kanıtları subsection and implement
useful improvements. This explicitly authorizes one local Android/web batch;
the standing observation-only restriction is lifted for this bounded request.
It grants no Git operation, release/signing/distribution, web publication,
BFF/SAP/model change or production permission. NXT-OBS-230 tracks the batch.

## Screenshot assessment

These are expert heuristic scores, not user-study results. Screenshot baseline
**5.8/10**; locally implemented candidate **8.3/10** after synthetic browser checks.

| Subsection | Before /10 | Local /10 | Main problem | Implemented response |
| --- | ---: | ---: | --- | --- |
| Karar özeti | 4 | 8 | Unexplained zero; failed/loading reads look empty; no recovery | Distinct loading/error/unavailable/verified-empty states, backend-reason explanation, retry and snapshot context; unknown counts remain unknown |
| Takım formu | 6.5 | 8.5 | Implicit side identity, abbreviations/units and confusing mirrored bars | Explicit home/away, chronology and G/B/M legend, rate units, Turkish decimals, venue scope and consistent relative bars |
| Oran sonuçları | 5 | 8 | Raw codes, repeated phase labels, long market list and weak reference/live distinction | Readable market names, compact six-market overview, explicit expand, per-phase context and neutral historical quotes |
| Canlı saha dengesi | 6.5 | 8.5 | Dense status, unclear measurement coverage and missing-vs-zero interpretation | Separate quality/time/coverage, named sides, measured-zero legend, missing details and retry |
| Tarihsel skor dağılımı | 7 | 8.5 | Sample counts are hidden and provenance dominates the reading flow | Total sample, visible count/total per score and optional methodology while retaining the essential scope caveat |

The five chips were anchors styled as if the first were a selected tab. All
are now neutral, explicitly labelled section shortcuts. The desktop evidence
grid is capped at two reading columns; the decision module spans a row to avoid
the screenshot's empty left column. Saved ordering remains authoritative and
the embedded pane stays one column. Android keeps one reading column. The
external Bilyoner action is secondary and content-sized on both clients.

## Confirmed functional accessibility defect

In the actual exported screen, Enter on a subsection heading did not toggle it.
The shared pointer gesture guard required a captured pointer start, which a
keyboard/assistive press can lack. Coordinate-free activation now toggles the
panel; real pointer movement and the reorder hold still use the original guard.
Explicit `aria-expanded` reflects subsection and changed detail disclosure state
on web, alongside native accessibility state. Regression tests cover unavailable
pointer coordinates, drag and long-press preservation.

## Data and scope integrity

No DTO, adapter, model, result accounting, market order, threshold, source
selection or historical fraction changed. Original decision quote/star facts
remain frozen. Statistics still use one verified observation, never legacy
fallback zeros. A null remains unknown; a measured zero remains zero. Historical
shares are not winning probabilities; source totals/fractions and retained
references are preserved, including unreachable/unknown outcomes. Distinct SAP
reference records still do not prove physically independent matches.

The shared implementation covers Android and desktop web in the same batch.
The two-column geometry is web-specific; its Android substitute is the existing
single-column ordered/long-press surface. This is a layout exception only,
with no exception to the companion-release requirement.

## Local verification

Passed on the stabilized implementation:

- Typecheck, lint, brand checks; **677 client tests +32 tooling tests**.
- Android preview JS/Hermes export, 2,306 modules; scoped secret scan clean.
  This is a bundle validation, not an APK build/signing or native device smoke.
- Canonical `node scripts/web.mjs export` in edge mode, 1,778 modules; runtime
  verification and secret scan clean. Dependency/native configuration unchanged;
  the previous accepted Doctor20/20 result is reused rather than repeated.
- Actual exported MatchDetailView on synthetic fixtures: populated, partial,
  empty, failed-read/retry, loading and long-name cases; 320/390/1440 px with
  no document horizontal overflow. Measured zeros and unknown values stay
  distinct. Keyboard Enter/Space toggles headers and detail disclosures.
- Market overview expands six→19; historical overview expands six→12 while
  preserving 81/212 and %38,21. Counts are never renormalized to visible rows.
- Final historical status-label polish is visually checked on one line;
  scoped source diff/secret review and `git diff --check` pass.

Isolated fixture harness:
`.codex-artifacts/evidence-ux-20261027/preview.ts`, with populated, partial, empty,
error, loading and long-name scenarios. Its schema-validated synthetic values
populate the actual application through a loopback-only HTTP adapter. It has
no remote proxy, credentials, SAP reads or write methods; preview labels remain
visible. This is UI evidence, not native-device acceptance or live model evidence.

Local preview: `http://127.0.0.1:8096/__preview`. Controls select scenarios and
inner viewport sizes. Evidence lives under the same ignored batch directory:
`browser-checks.json`, `preview-health.json`, `validation-receipt.json`, exports,
logs and labelled screenshots. No current or previous release artifact is removed.

![Desktop form and markets](../.codex-artifacts/evidence-ux-20261027/desktop-form-market.jpg)

![Desktop statistics and historical counts](../.codex-artifacts/evidence-ux-20261027/desktop-statistics-history.jpg)

[Phone partial/zero/missing preview](../.codex-artifacts/evidence-ux-20261027/phone-partial.jpg).

Limits at local preview: no TalkBack/physical Android interaction, exhaustive font-scale
or light-theme acceptance, production data accuracy or user-study claim. Dense
populated decision evidence and multi-phase market rows are still expert views;
these limits prevent an unqualified 9–10/10 assessment.

## Subsequent owner delivery approval

On 27 October the owner accepted this preview and explicitly selected **Commit,
push, and release both Android and web**. That is approval for this bounded Git
batch, final signed owner-only pilot APK preparation/private delivery and the
matching web publication after installation. This supersedes the initial local
permission boundary; it grants no SAP/model/BFF source or production change.

Freeze the tested source into one clean pushed commit, verify the paired hashes,
privately deliver the exact APK, obtain actual installation evidence, then publish
the matching web and obtain both owner smokes. The accepted 67b72ac pair and its
predecessor remain retained. Actual release receipts are tracked separately in
`btb-codex/docs/evidence/match-evidence-release-*2026-10-27*`; preparation or
approval alone is never completion.

## Completed paired delivery

Source `9d87b2ea4a86ec3bdcf454237d1751c9174a58cd` was clean and pushed before
both final artifacts. Signed ARM64 APK SHA-256
`FBBED21D5CB2CC4CCAEA3CDE6C4EB17CE25FB392467618235B57C5B958F499F2`
(50,495,625 bytes) passed signature/ABI and private Drive full authenticated
readback. Owner confirmed exact installation and basic Android operation.
Matching web tree `D9CF6D6B12628E70081FC322E748DAFE35F305AC8B2F9AD9ADE1B646E5252E04`
was published as `20261027T112835Z-9d87b2e`; all 56 runtime-served assets match,
shell/deep-link/CSP/API401 and public Access302 checks pass. Owner confirmed
“Web checked and working”. Canonical `client-release.mjs complete` passed;
TASK-0197 is closed with no known remaining defect. Previous 67b72ac pair is
retained. Completion and actual owner-smoke receipts are in
`btb-codex/docs/evidence/match-evidence-release-9d87b2e-*2026-10-27.json`.
Basic owner acceptance now supersedes the earlier unobserved phone/web state;
TalkBack, exhaustive font scaling and light-theme acceptance remain unclaimed.
Later documentation commits do not alter the released source.
