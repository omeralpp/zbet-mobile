# M11 — Opt-in local retention rehearsal, 2026-09-05

**Superseded — implementation removed 2026-09-06.** The owner chose
[personal Mobile use](M11_PERSONAL_USE_PLAN.md). This tested rehearsal is not
required for the new M11; further retention/longitudinal collector work is not
due. The source was removed from the local candidate on 2026-09-06 under the
owner's explicit instruction, backed up first to
`.codex-artifacts/m11-retention-removed-2026-09-06/` because it had never been
committed. The report below remains historical evidence of the experiment; the
feature it describes is no longer present in the app.

Task: `TASK-0059` — `DONE`. Local implementation and verification only. M11 stays
`ACTIVE / LOCAL_PREPARATION`; the owner runtime stays `OBSERVATION`.
No external users were enrolled and no real retention result exists.

## Delivered behavior

Open **Daha Fazla → Yerel kullanım ölçümü**. Recording is off by default.
A separate consent dialog enables the local journal. The screen offers stop
and retain, show a selectable local JSON export, and confirmed deletion.
No automatic upload, share action, clipboard write or analytics SDK is added.
Ambient Jinx tips are hidden on this route so they cannot cover the disclosure.

Only consent timestamps, session starts and allowlisted successful real-data
surface views are eligible. Event IDs and a separate random measurement ID do
not reuse auth subjects, push tokens or hardware identifiers. A session changes
after at least 30 minutes away. A surface appears at most once per session.
Background work, hidden tabs, failures, empty lists and mock/synthetic data do
not qualify. Team Form also requires LIVE origin, a ready card and observed
viewport visibility; mounted/collapsed or off-screen cards are insufficient.
The other implemented surfaces are Dashboard, matches, Super and Toto.

Preview journals are explicitly `synthetic_test / LOCAL-SAMPLE`; non-mock
journals are `owner_rehearsal / OWNER-REHEARSAL`. The client provides no invited
pilot selector or personal-name field. App version is included; `buildSha` is
explicitly null for this uncommitted rehearsal, never fabricated. A later
distributed-user build needs approved identity/consent and exact-SHA metadata.

The strict `M11_RETENTION_V1` schema rejects additional fields. Match IDs,
selections, odds, money, personal identity, errors, credentials, push tokens
and screen text are not accepted event properties. The journal has its own
AsyncStorage key, a 500-event cap, 500-interval cap and 200,000-character limit.
The last event slot is reserved for withdrawal. Disk operations are serialized;
storage failure stops recording and disables export. Deletion failure is shown
and can be retried. Deletion never clears login, notification or preference keys.
Previously copied exports are not remotely revoked or deleted by this control.

## Conservative coverage — not a longitudinal pilot collector

The local clock is checked against monotonic elapsed time. Verified checkpoints
merge into explicit coverage intervals; the foreground checkpoint interval is
30 seconds. A gap over 90 seconds, a clock anomaly, overflow, failed persistence
or an interrupted process is not complete evidence. The report marks an affected
participant's evidence invalid instead of turning uncertainty into a non-return.

A fresh process never automatically resumes an active journal. It keeps the
last verified data, records `process_restart`, and stops the rehearsal. Inspect
or export the old record, then delete it before starting another. Deliberate stop
and retention survives restart. Export time advances to the actual export time,
but consent and recording coverage do not advance after stopping.

This intentionally cannot establish a complete D1/D7 window across ordinary
long mobile suspensions/restarts. Known complete windows are tested with declared
synthetic fixtures, not inferred from a few minutes on an emulator. Before any
real-user pilot, choose and validate longitudinal coverage/identity handling;
do not relabel these short owner journals as sufficient real-user evidence.

## Offline report

From `expo-app`, run the public synthetic fixture:

```powershell
npm run retention:report -- docs/fixtures/m11-retention-synthetic.json
```

For private input, pass one JSON file outside Git with `asOf`, `participants`
and `exports`. The fixture shows the full shape. The roster must include people
who did not export and map every measurement installation to one participant.
Each entry declares cohort kind, pseudonymous code, invitation time and known
installation IDs. Arrays/strings and input size are bounded. Reports go to
stdout as cohort totals only; errors withhold the input contents.

Exports are cumulative snapshots. Repeated event IDs are deduplicated, while
contradictory IDs, truncated later snapshots, impossible times, unregistered
devices and extra fields cannot silently become valid evidence. Reinstalls and
multiple devices map to one person. Every known device must cover an evaluable
window; coverage is not borrowed from a different device. Unknown/missing
exports, pending windows, withdrawal and invalid evidence remain explicit.
An invited-pilot export with unknown build SHA is not accepted as valid evidence.

D1 is `[activation + 24h, activation + 48h)`; D7 is
`[activation + 168h, activation + 192h)`. Only mature fully covered windows enter
return/non-return denominators. Observed returns with missing coverage are shown
separately, not silently counted in the complete-window rate. Feature reach
reports raw surface counts plus its adequate-coverage denominator. Empty
denominators produce null, not 0%. The report always separates all three cohorts.

### Fixed rehearsal evidence

The checked-in fixture is deliberately fictional, including its dates:

| Measure | Expected and observed synthetic result |
| --- | --- |
| Roster / installed | 3 / 3 |
| Activated / missing export | 2 / 1 |
| D1 evaluable / returned / non-returned | 2 / 1 / 1 |
| D7 evaluable / returned / non-returned | 2 / 1 / 1 |
| Owner / invited-pilot participants | 0 / 0; return rates null |

The 19 new automated tests additionally cover no-consent/background-only
activity, failed/mock/hidden views, short and 30-minute resumes, clock shifts,
duplicate exports, device/reinstall mapping, immature windows, missing coverage,
withdrawal, bounds, persistence failure, corrupt data, deletion isolation and
queued start/delete races. These counts are software-test evidence, not pilot
retention performance.

## Validation checkpoint

Canonical Mobile type/lint/tests/brand, Doctor and Android production JavaScript
export pass for the implementation. The existing x86_64 debug build from
TASK-0058 is reused with a fresh Metro bundle; no Gradle or new phone APK is
needed for these JavaScript-only changes. Native shell hash:
`B392A247F2D32F75D161EFC398F6E5DDC17F45EF5506A84D780537D4C7FF6BC5`.

Final canonical gate: **581/581 Mobile tests**, including 19 new retention
tests; **7/7 Doctor-wrapper tests**; type/lint/brand, preview Doctor and Android
production JS export all passed. The export-time fix correctly refuses an
export when the clock is behind recorded evidence; the regression expectation
was updated to that stricter behavior before the successful final gate.

Android 15 / API 35 x86_64 emulator checks passed:

- Initial state off, zero events; canceling consent leaves zero events.
- Confirming consent creates exactly consent/session-start events.
- Visiting sample Super and returning does not add a feature event.
- Stop immediately disables recording; exactly three lifecycle events remain.
- The selectable local export is tagged synthetic, has no extra schema fields,
  and does not send anything. Its actual export time is later than consent end,
  while coverage stays bounded by consent end.
- A stopped record survives process restart. Restarting an active record stops
  measurement with two preserved events and explicitly incomplete evidence.
- Confirmed deletion returns to off/zero with export disabled and start enabled.
  Only the temporary emulator's synthetic measurement journals were deleted;
  screenshots of the tested states remain as local QA evidence.
- The app stayed running with zero fatal/JavaScript error matches, zero matches
  for 12 sensitive environment values and zero private-key markers in its log.

Screenshots: `.codex-artifacts/m11-retention-2026-09-05/consent-on.png`,
`stopped.png`, `local-export.png`, `restart-stopped.png`, `deleted.png`.
The consent/export screens were visually checked after suppressing ambient tips.
The temporary Metro server and read-only emulator were stopped after testing;
no port-8083 listener remained. No owner-pilot service was restarted.

Physical-phone, live BFF/auth, real Team Form viewport and push delivery are
not asserted by the preview smoke. CAP/SAP/Cloudflare/Firebase were not changed.
The owner APK remains SHA-256
`53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
TASK-0060's 14 moderate dependency findings remain a pre-distribution gate;
the dependency graph was not changed again in this task.

Source: [contract](../src/retention/contract.ts),
[local recorder](../src/retention/recorder.ts),
[report](../src/retention/report.ts), [pilot plan](M11_PILOT_PLAN.md).
