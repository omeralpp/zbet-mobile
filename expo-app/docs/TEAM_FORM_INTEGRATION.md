# Team Form — local adapter and rollout gate

Physical acceptance (2026-09-03): after the pilot update and refresh instructions,
the owner confirmed "I checked it works fine." NXT-OBS-142/145/147 are CLOSED for
the tested real Team Form and ordered-results display. No new APK or restart is
needed. Match Path/Jinx remain synthetic; this does not accept their real engines.

Latest follow-up (2026-09-02, NXT-OBS-147): owner phone/source comparison exposed
a score-scope selection bug after the identity fix. The bounded BFF correction is
committed/pushed at CAP `91cbc25` under the owner's separate approval: differing
secondary scores are accepted only
when valid main scores, displayed score and the own-team result agree. Motherwell
now yields B M M M G / PPG 0.80 / GA 2.20 instead of B M M G B / 1.00 / 2.00;
Dundee and venue PPG are unchanged. All 51 Team Form tests, full BFF tests/build,
and real SAP-backed local HTTP -> actual Mobile schema checks pass. At 23:55 TRT,
the owner separately approved the canonical pilot restart at that exact clean,
pushed SHA (PID 6552 -> 3092). Local/public health and Team Form now pass with the
corrected values through the actual Mobile schema; dashboard/matches/Super Log
also pass, and unauthenticated Team Form returns 401. No new APK is needed;
owner physical acceptance was subsequently confirmed on 2026-09-03. Pull-to-refresh on Match Detail
explicitly refetches Team Form. No Mobile, ABAP or model code changed.

### Earlier APK/runtime checkpoint

Status (2026-09-02 23:02 TRT): the identity fix is committed at CAP `86bf79e`
and the existing pilot service now serves **real, populated Team Form**. The
persistent `BTB_MOBILE_TEAM_FORM_ENABLED` flag is true. Public HTTP 200,
`origin=LIVE`, `availability=OK`, both sides and ordered five-match results passed
the actual Mobile schema and mixed-origin wrapper checks on three current matches.
The earlier five-of-six service check remains historical evidence; its sixth
failure was the pre-existing match-route MATCH_NOT_FOUND, not Team Form.

**Phone acceptance is not complete; the new APK is built.** After the owner's
"Let's continue" response to the pilot warning gate, Codex recovered the resource-
limited build with process-local worker/CPU caps. The final candidate is
`btb-mobile-next-arm64-team-form-live-b75b4cd.apk`, SHA-256
`53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
Its packaged Team Form switch is LIVE; Match Path and Jinx remain SYNTHETIC.
Package, ARM64 ABI, unchanged pilot certificate, embedded config/UI assets and
server-secret scan passed. The previous all-synthetic APK is recoverable from
the Recycle Bin. No claim is made that the owner installed the new candidate.

Doctor remains 19/20 (16 patch mismatches), accepted only as an owner-pilot caveat;
npm-ci additionally reported 21 audit findings (15 moderate/6 high), not resolved
here. Production remains blocked. Metro was denied by execution policy. Both the
new and previous ARM64 APKs install but fail the x86 emulator's SoLoader library
lookup; the emulator was returned to its existing x86 debug client. This is not
new physical acceptance or a live UI smoke pass. See CURRENT_HANDOFF for details.

The sections below retain the investigation history. Any "switch off", "not
deployed", or participant-join UNAVAILABLE statements describe earlier stages,
not the current pilot service.

## Verified evidence and missing prerequisite

The existing SAP bridge already accepts the fixed `resource=statistics` read.
Direct read-only HTTP/OData checks (not SAP MCP source evidence) confirmed:

- Event `3190638`, match key `2026-09-02:3190638:22:00:00`: SAP participant
  IDs `216` / `349`; provider form groups Burnley / M'brough use history team
  IDs `187` / `273`. These are different namespaces, not missing history.
- Both provider groups contain 15 rows. Joining them to SAP participant IDs
  would either erase the history or accidentally select an opponent.
- The local HTTP route now returns `origin=LIVE`, `availability=UNAVAILABLE`,
  null sides and null capture time for this mismatch. The actual Mobile schema
  accepts that response. No fixture fallback occurs.

## Identity: solved, and no crosswalk is required

The payload answers both questions it is being asked, so SAP participant IDs
are not needed for either.

1. **Which side is this history for?** The response is pre-split into
   `homeTeamForms` and `awayTeamForms`. The provider has already said so; the
   side is structural, not something to be joined.
2. **Which statistics-namespace ID is "this team"?** It is the single ID
   present in every row of that team's own group - a team plays in all of its
   own matches while its opponents vary, so intersecting `{homeTeamId,
   awayTeamId}` across the group leaves exactly one ID. Venue per row follows
   from that derived ID.

Verified read-only on both sides of two events: `3190638` derives `187`
(Burnley) and `273` (M'brough) - precisely the IDs previously recorded as
blocking - and `3089897` derives `126` (Samsunspor) and `2` (Fenerbahçe). The
intersection was unique in every group, the two sides differed, and the row
team names corroborated the result. Names were read only as a cross-check and
were never used to derive; no ID is hard-coded.

## What was actually wrong, and two corrections to the record

The original diagnosis was right and two later ones were not. Recorded in full
because each wrong turn came from a different mistake worth not repeating.

**The real defect (Codex, correct).** `deriveSide` required the SAP event
participant id to appear in the history rows. Those rows use statistics team
ids, so the join failed on every real payload and every match reported
`UNAVAILABLE`.

**Wrong turn 1 - "upstream coverage".** A read-only sweep called the bridge
with `stats_id` and found 15 of 15 current events empty, concluding the
provider publishes no history for the current id family. That sweep used an
identifier the adapter never uses: `team-form.js` already calls
`fetchMatchStatistics(identity.id)`, the SAP `id` from the match key. The
emptiness was an artefact of the probe, not a property of the provider.

**Wrong turn 2 - "the adapter sends the wrong key".** Correcting the first
error over-corrected into claiming the adapter itself passed `stats_id`. It
does not, and never did. The `id` versus `stats_id` contrast is real - 8/8
populated via `id`, 0/8 via `stats_id` - but it describes the probe, not the
product.

**The fix.** The participant-id join is unnecessary, because the payload
answers both questions itself: it is pre-split into `homeTeamForms` and
`awayTeamForms`, so the side is structural, and the team is the single id
present in every row of its own group - a team plays all of its own matches
while its opponents vary. Intersecting `{homeTeamId, awayTeamId}` across the
group leaves exactly that team, and the venue of each row follows from it.

Verified against live data: unique intersection in every group across eight
matches, the two sides always distinct, row names corroborating. Names are read
only as a cross-check and never derive anything; no id is hard-coded.

## Known limitation of the derivation

A group holding exactly one row cannot identify itself: one row names two teams
and nothing distinguishes them. Such a group fails closed to null rather than
guessing, because picking the wrong id would invert every venue in the window.
A group the provider returns as explicitly empty keeps its zero-sample meaning
and does not collapse into "unavailable".

## Superseded probe data: the stats_id sweep

Every one of the 35 rows in the current fixture list carries an 8-digit
`stats_id` (34 beginning `7`, one beginning `6`). Of 15 sampled current
8-digit events, **15 returned empty `homeTeamForms` and `awayTeamForms`**. The
only events carrying history are the 7-digit legacy family, which the current
fixture list does not contain at all.

That reasoning was wrong, and is kept only so the mistake is legible: those
8-digit values were never in this endpoint's identity space, so their emptiness
said nothing about coverage. There is no provider coverage problem and nothing
here belongs to `BTB - Aktif`.
Any SAP object change belongs to BTB - Aktif and needs its own explicit scope
and write/activation approval. No SAP or model object changed in this batch.

## Local read path

`Mobile getMatchTeamForm` -> authenticated fixed BFF
`GET /v1/btb/matches/{key}/team-form` -> existing SAP-backed `getMatch` ->
existing bridge `resource=statistics` -> provider-neutral `team-form.v1`.

The adapter derives a unique statistics-team ID from each side's own group;
there is no SAP-participant-ID join. It does not invoke the deployed ABAP helper.
It retains FORM_CTX_V1 window/date/venue rules: exclude friendlies and same-day,
future or invalid dates; use the newest five eligible general results and an
independent five-match venue window. Identity ambiguity, conflicting duplicates
and ambiguous same-day chronology remain rejected.

For this Mobile display, results and goal averages use valid provider main scores,
not inferred regulation-only scores. NXT-OBS-147 removes the blanket exclusion for
different secondary Ot scores only when two fields corroborate the main pair:
the displayed `score` and the own-team `markedTeamResult`. Missing, malformed or
contradictory corroboration still rejects such a row; malformed main/secondary
scores remain invalid. Absent/equal secondary-score behavior is unchanged. This
does not define the provider's undocumented Ot semantics or change how other
invalid rows are excluded. These presentation summaries never feed Super, rating,
Toto or model learning, and ABAP's rules are unchanged.

The DTO alone is cached in bounded process memory for five minutes; concurrent
requests share a fetch. Failure cooldown prevents repeated upstream calls, with
a 15-minute floor for access denial/rate limits. Expired data is not relabelled
as fresh. Raw history, participant IDs, credentials and provider errors are not
exposed in the DTO or persisted by this adapter.

## Switches and rollout gates

- BFF: `BTB_MOBILE_TEAM_FORM_ENABLED` defaults off. Off returns authenticated
  `503 TEAM_FORM_NOT_CONFIGURED`; incomplete enabled configuration fails fast.
- Mobile: `EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE` independently accepts `off`,
  `synthetic`, or `live`; absent inherits `EXPO_PUBLIC_MOBILE_INTELLIGENCE`.
  A live Team Form build requires `EXPO_PUBLIC_USE_MOCKS=false`.
- Verified Team Form may be live while Match Path/Jinx stay explicitly
  synthetic or off. A Team Form error never substitutes synthetic data.

Current pilot: the BFF flag is already enabled and the retained phone candidate
packages Team Form LIVE while Match Path/Jinx stay SYNTHETIC. The NXT-OBS-147 local
correction changes neither setting and needs no new APK. Commit/push and the
subsequent pilot runtime restart were separately approved; CAP `91cbc25` is
pushed and last verified running as PID 3092, with corrected public read-back
verified. Owner phone confirmation on 2026-09-03 closes this acceptance gate.
Future runtime changes still need
their own approval; editing or committing a file alone does not update the process.

## Ordered results and Jinx identity

`TeamFormSide.recentResults` is an optional nullable array of at most five
`W/D/L` values, newest first. Older v1 payloads remain accepted. Missing or
inconsistent chronology hides the strip; totals are never used to invent order.
Thin samples show only their actual results. Each side's card header uses
G/B/M letters, semantic green/yellow/red and a newest-to-oldest caption; its
accessibility label describes the sequence. The owner confirmed this palette on
2026-09-02: win `semantic.positive`, draw `semantic.warning`, loss
`semantic.negative`. Loss red is deliberate and consistent - red already means
a lost Super decision in this app, so the same colour keeps the same meaning
across surfaces. No colour change is outstanding before an APK.

Jinx uses the existing static 32 dp artwork beside the module title. It is
decorative, adds no new interaction or ambient mascot, and leaves collapse
controls and on-demand reading behavior intact.
