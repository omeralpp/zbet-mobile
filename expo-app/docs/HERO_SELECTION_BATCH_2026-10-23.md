# Latest selection in the match hero — local batch, 23 October 2026

Final status: DELIVERED / BOTH CLIENT SMOKES PASSED (2026-10-23), source
`b501352`. See [completion evidence](evidence/HERO_SELECTION_RELEASE_2026-10-23.json).
The local-development and approval-wait descriptions below are historical.

Owner approved local implementation and Android/web tests through the popup
“Son seçimi ve iki oranı üst alanda birleştir”. This replaces the previously
approved separate last-publication card. No commit, push or release is approved.
The subsequent popup approved the connected Jinx/Overview/Live/filter/refresh
batch, including local BFF work. The owner then explicitly added the previously
deferred seven-day totals correction with “bunuda tamamla”.

The hero retains the latest verified published recommendation: market, decision
minute, first price and first stars. Result badge and decision link remain in
the hero. The separate last-recommendation card is removed. New publications
replace this summary; the complete history and stored decisions are unchanged.

Current price comes only from that market in the verified current candidate
response, after quote checks, within the existing 15-second quote lifetime.
Losing eligibility does not erase the original recommendation or imply its
market is closed. Closed, expired, missing, unproven, future or wrong-market
prices are not displayed as current. Failed refreshes preserve frozen facts
without presenting the selection as active. Finished/unplayed matches retain
the recommendation/result and explicitly show their terminal status.

The shared MatchDetailView covers Android, desktop web and embedded Live detail.
Unknown historical kickoff times remain compatible with SAP date + fixture ID.
Match Jinx explains the last publication's frozen evidence and separately shows
current state, first/current quotes and concrete waiting reasons. An explicit
historical decision link keeps that decision as Jinx/decision-panel evidence;
otherwise the decision panel defaults to the latest publication. Result and
notification identities remain unchanged. Current candidates are still labelled
as the last evaluation, separate from the frozen publication.

Overview/Live compact, horizontal and full cards share publication display.
Their star filters/counts and feature priority continue to use only active
selections. A shared parent clock expires cards, counts and filters in the same
render. Global refresh now includes v2 reports and pool paths.
When a new active identity is absent from the shared publication cache, cards
request one deduplicated refresh per identity rather than waiting for the normal
report poll. Live STAR_* route filters are never treated as decision IDs, and
an explicit panel selection is scoped to its match.

Jinx daily/bubble, Overview seven-day totals and recent recommendations, command
palette and Android performance widget use the same v2 report as Super. The
regression case is seven decisions, four wins/three losses and -1.11 hypothetical
units; the current cohort alone is +0.28. Cohort records/learning remain separate
and no model promotion, scoring or economic claim is introduced.

Local BFF extension: `X-BTB-Selection-Display: btb-selection-display.v1` with the
RB1 header opts dashboard/list responses into `rebuildQuotes` and dashboard
`liveStarSelections` expiry metadata. Old clients receive neither field. Quote
snapshots verify the current capsule, identity/hash/parts, stable context and
no prepared uncertain transaction; they retain original quote timestamps. They
do not load full publication/result history per card: publications share one
v2 report/cache. Runtime schema and OpenAPI/JSON Schema are included. There are
no SAP, model, pressure, learning, weight, threshold or freshness-rule changes.

Validation: typecheck, lint, 670 client tests, 32 tooling tests, 688 BFF tests,
Doctor 20/20, Android Metro bundle and verified edge web export with secret scan.
The original hero check used real Braga–KAA Gent data. Connected card/Jinx
browser checks use an explicitly labelled local rendering fixture with verified
frozen history and the real all-cohort report; that fixture is not a live match,
algorithm observation or learning sample. Both desktop and 390 px phone width
are checked. Browser phone width is not a physical Android acceptance.
The seven-day totals are also checked against the real read-only report.
Preview screenshots and build/test evidence:
`.codex-artifacts/hero-selection-20261023/` in the workspace.

The accepted 43d2e7d pair remains the deployed baseline. A new clean pushed
commit and explicit BFF update/restart plus coordinated APK/web delivery approval
are still required to publish this change. Deploy the compatible BFF before the
new client pair. SAP activation is unnecessary. No running BFF was restarted.

Owner requested web review before final APK work on 23 October. The verified
export is served locally at `http://127.0.0.1:4183` against the existing read-only
BFF. The labelled recorded-match review at port 4184 uses the owner's Braga
history and names recovered from its verified frozen evidence, without synthetic
form/provider events; it is not a live match or a SAP data restoration. The old
BFF has not loaded the new optional quote extension, so its deployment remains
a separate pending step. APK creation waits for the owner's web acceptance.
The owner requested design comparison before accepting the preview. See
[design parity review](DESIGN_PARITY_REVIEW_2026-10-23.md): responsive width and
data-driven differences are separated from the approved UI changes, the reused
crest failure state is fixed. The follow-up historical-name BFF decoder recovered
all seven examined decisions from existing capsules; 706 BFF tests pass. No SAP
change is required. The owner accepted the web and recovered names on 23 October
and requested the delivery package. Runtime deployment, Git and final paired
release remain pending explicit approval; see
[delivery package](HERO_SELECTION_DELIVERY_2026-10-23.md).
