# Mobile request intake — 24 October 2026

Mode: COMPLETE / OWNER_ACCEPTED. Intake closed by the owner's "bu kadar bu iki
talebi yapalım" on 24 October. Both requests are implemented as TASK-0188;
local validation is recorded in `UNIFIED_MATCH_TIMELINE_BATCH_2026-10-24.md`.
Owner later accepted the design and approved paired delivery/publication,
bounded Mobile/CAP/tooling commit/push and BFF DEV rollout for this batch.
Owner: `btb-mobile`; every applicable change covers Android and desktop web.

## 1. Remove the match breakdown — NXT-OBS-221

Owner screenshot shows the report-details section headed "MAÇA GÖRE", listing
each match's recommendation/risk/result count and net. Owner considers it
unnecessary and is concerned about data growth as match counts increase.

Requested batch scope: remove this match breakdown on both clients. Inspect
whether its dedicated payload/computation can also be removed where unused.
Removing a visible section alone does not establish fewer SAP reads. Preserve
aggregate accounting, evidence verification, required statistical inputs and
decision history; this request authorises no deletion of stored SAP evidence.

Status: DELIVERED / OWNER_ACCEPTED (3f53834 paired release). The UI omits the section;
the client's versioned opt-in omits all nested `byMatch` arrays from the wire.
Internal match-cluster statistics and verified decision history remain intact.

## 2. One pressure chart integrated into the match journey — NXT-OBS-222

Owner finds the two pressure modes confusing and requests one well-designed
chart combined with "Maçın yolu", on Android and desktop web. The screenshots
show "5 dk hareketlilik", "Doğrulanmış baskı" and the separate journey panel.

Requested batch scope: design one coherent match timeline/primary chart
experience incorporating pressure and the existing journey context/events,
instead of two competing pressure views and a separate disconnected chart.
Keep the selected time window and measurement meaning clear on both screen
sizes. The implementation retains the previously owner-selected rolling activity
as the single primary series, on the journey's time axis with pool share and
events. Native decision pressure remains evidence in the recorded decision.

Preserve the meaning of native pressure, rolling activity, recorded gaps,
goals/cards/half-time, frozen decisions and period-specific pool context.
Visual integration must not silently blend different measurement windows or
change backend pressure calculations, selection rules or stars. Any such
business-model change would require its own explicit scope/approval.

Status: DELIVERED / OWNER_ACCEPTED. Exact APK installation and both owner smokes
passed; paired completion is in `UNIFIED_MATCH_TIMELINE_DELIVERY_2026-10-24.md`.
