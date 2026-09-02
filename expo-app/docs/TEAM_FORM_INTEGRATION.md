# Team Form — local adapter and rollout gate

Status (2026-09-02, after the identity fix): the adapter now produces **real,
populated Team Form** end to end - 5 of 6 sampled current matches populated on
both sides, the sixth failing only on the pre-existing MATCH_NOT_FOUND from the
match route. The switch is still off and nothing is rolled out; what remains is
an operational decision, not an engineering blocker.

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

The current adapter requires a consistent exact team-ID join against the SAP
participant ID, which is the part the investigation above supersedes. It does not
invoke the deployed ABAP helper. It mirrors the read-only FORM_CTX_V1 reference
rules: exclude friendlies, same-day/future/invalid dates and ambiguous overtime
scores; use the newest five general results and an independent five-match venue
window. It also rejects identity mismatches, conflicting duplicates and
ambiguous same-day chronology. These presentation summaries never feed Super,
rating, Toto or model learning.

The DTO alone is cached in bounded process memory for five minutes; concurrent
requests share a fetch. Failure cooldown prevents repeated upstream calls, with
a 15-minute floor for access denial/rate limits. Expired data is not relabelled
as fresh. Raw history, participant IDs, credentials and provider errors are not
exposed in the DTO or persisted by this adapter.

## Switches — keep disabled until mapping is verified

- BFF: `BTB_MOBILE_TEAM_FORM_ENABLED` defaults off. Off returns authenticated
  `503 TEAM_FORM_NOT_CONFIGURED`; incomplete enabled configuration fails fast.
- Mobile: `EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE` independently accepts `off`,
  `synthetic`, or `live`; absent inherits `EXPO_PUBLIC_MOBILE_INTELLIGENCE`.
  A live Team Form build requires `EXPO_PUBLIC_USE_MOCKS=false`.
- Later, verified Team Form may be live while Match Path/Jinx stay explicitly
  synthetic or off. A Team Form error never substitutes synthetic data.

No persistent environment setting was changed. The owner's existing APK
remains synthetic. Commit/push, pilot runtime restart/configuration, final APK
and distribution remain separate approval gates.

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
