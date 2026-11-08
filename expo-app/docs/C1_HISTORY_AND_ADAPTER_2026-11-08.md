# C1 history — local Android/web continuation

TASK-0230 owns the shared client/BFF presentation; TASK-0229 owns the producer
and protocol. The existing accepted5f26c70 pair and recorded d8d652f BFF were not
changed or published by this work. The owner explicitly approved this new batch's
four-repository stage/commit/push through popup
`call_3405b9e31f434f29bd3c13e51155047b`. Registration, new data collection,
producer/runtime activation, APK distribution and web publication are excluded.

`GET /v1/btb/matches/{key}/selection-history` is authenticated, query-rejecting
and no-store. It reads a private registered C1 ledger, immutable intent and commit
receipt, without SAP or model work. Missing publication receipts are pending;
corrupt/inconsistent data is withheld. Original C1 market/price/decision state
and the same-time C0 reference survive quote expiry and trial end. Result status
is explicitly unassessed, with no probability or ROI invention.

One shared `SelectionLab` panel renders this as “Geçmiş · varsayımsal” and
“Maçın ilk C1 kararı”, using “Karar anındaki oran”. It explicitly states that the
record is not a current offer and executes no bet. Current comparisons retain
the existing15-second expiry and changed-state/quote suppression. Mock mode
never fabricates a historical C1 decision. No platform exception.

Local validation passed: canonical type/lint/unit/tooling/brand/Doctor checks,
Android JS bundle and `node scripts/web.mjs export` with edge/secret verification.
BFF:732 tests and production build. New client contract tests consume the
actual BFF synthetic history fixture and reject current-offer/result/probability
inventions. The BTB end-to-end tests process a retained real fixture using
synthetic local transport/registration in temporary folders, then read its
original1.23 decision through the BFF. Those are not live registration/acceptance.

Browser smoke of the actual shared component:390/1365px dark and light,
320px light, no horizontal overflow, empty-history disclosure and exposure
control. Populated history browser and real Android-device/live-publication
smokes are still unmeasured. ADB reports0 connected devices. Evidence, four
screenshots and the current source-sealed draft are under BTB Logs active
cutover `observations/selection_programme_20261108/c1_live_delivery_20261108/`.

Runtime is disabled by default. Historical reads need both
`BTB_SELECTION_C1_REGISTRATION_PATH` and `BTB_SELECTION_C1_LEDGER_DIRECTORY`.
Current comparisons still use `BTB_SELECTION_PUBLICATION_DIRECTORY`.
These are private server paths; no secret enters the client. Configuration,
actual source collection, protocol registration and execution require their
applicable explicit approvals. The owner-invoked producer lives in BTB Model
Lab and is never triggered by a Mobile request. There is no automatic scheduler.

Before release, verify live source completeness/latency, approve the current
technical protocol/runtime, complete both client smokes and obtain coordinated
build/sign/distribution/web approvals. Use one clean pushed Mobile commit;
verify the APK/web pair, privately deliver/install the APK before web publication
and close only when both smokes pass. No production authorization is inferred.
