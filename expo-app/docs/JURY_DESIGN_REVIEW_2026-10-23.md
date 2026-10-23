# Design jury review — 23 October 2026

Owner: BTB Mobile Next - Aktif. Mode: assessment and observation only.
The owner is collecting findings for one later implementation batch. This
review approves no code change, Git action, backend/model change or release.

## Verdict and scope

Overall: **68/100**. Android: **69/100**. Desktop web: **67/100, provisional**.
The visual language is coherent and recognisable. Information hierarchy,
space allocation and explanation of unavailable data hold the experience back.
Refine the existing theme; there is no evidence here requiring a redesign.

Scores are this reviewer's heuristic judgment, not usability measurements.
Eight categories have equal weight; platform totals are rounded means, and
the overall score is the rounded mean of platform totals. A score around 70
means a coherent product with recurring usability friction; 90 would require
consistent polish and verified interaction/accessibility across states.

Direct Android evidence: owner screenshots 1000141552.jpg, 1000141553.jpg,
1000141554.jpg, supplied in this chat on 2026-10-23. They cover Decision Journal
and portions of Olympique Akbou–Constantine detail at 17–18 minutes, score 1–0.
Desktop evidence: saved images in
`C:/dev/btb-cdoex/.codex-artifacts/hero-selection-20261023/`, principally
`design-revised-recorded.jpg` and `web-review-overview.jpg`. Earlier
`web-review-layout.jpg` and `jinx-connected-phone.jpg` illustrate review-state
overlays only. Local phone-width web images are not native Android evidence.
The current published site redirected to Cloudflare Access in this browser;
no authenticated live desktop inspection occurred. Saved images include
recorded fixtures and earlier checkpoints. Do not treat previously repaired
historical names or removed last-publication cards as current defects.

Not evaluated: every Toto screen, light theme, keyboard/screen-reader operation,
measured contrast, actual touch target sizes, enlarged system fonts, loading
duration, animation performance, physical navigation or all responsive widths.
No accessibility conformance, current SAP state or model quality is certified.

## Scorecard

| Category | Android | Web | Main reasoning |
| --- | ---: | ---: | --- |
| Visual identity and consistency | 85 | 85 | Coherent dark navy/teal surfaces, green selection accents, recognisable brand/Jinx, consistent card shapes. |
| Information hierarchy | 65 | 60 | Repeated section labels/headings; recommendation, match state and explanation compete. Wide detail separates related values over too much horizontal distance. |
| Density and space use | 60 | 55 | Mobile spends substantial height on wrappers, headings and unavailable rows. Desktop detail expands a small amount of information into very wide cards. |
| Navigation and orientation | 75 | 80 | Five primary destinations remain visible; web sidebar and search aid orientation. Mobile detail truncates the matchup in its title and repeats it below. Interaction not tested. |
| Data-state communication | 60 | 60 | Honest unavailable messaging exists, but verified pressure versus available statistics is hard to understand. Current/frozen/finished distinctions demand considerable reading. |
| Analytics and chart explanation | 65 | 65 | Possession comparison and match-path timeline provide useful structure. Period context and sample/confirmation terms need stronger local explanation. |
| Visual legibility | 70 | 65 | Main headings and scores are clear. Secondary copy, dense metadata and muted labels require more effort; no measured contrast failure asserted. |
| Finishing and consistency of states | 70 | 65 | Shared visual language is established, but empty states, instructional overlays and sparse layouts need refinement. Desktop score depends on saved evidence. |

## What to preserve

- Dark navy/teal palette and restrained green active states.
- Large match scores and visible result labels; results already use words as
  well as colour.
- Five-destination navigation shared across surfaces, adapted as mobile tabs
  and desktop sidebar.
- Paired home/away statistics and the event-oriented match timeline.
- Explicit separation of recorded evidence from current observations. Stars
  mean evidence consistency/quality, never win probability. Missing data must
  stay missing rather than being replaced with fabricated continuity.

## Priority findings and acceptance direction

These are design recommendations for the later batch, not owner-confirmed
technical defects. New rows NXT-OBS-204..209 track them. Existing owner
requests NXT-OBS-200..203 remain separate and take precedence.

1. **HIGH — Read the match in a clear sequence (204).** In the Android
   screenshots, labels such as BASKI/Baskı grafiği and KARAR/Karar özeti repeat
   hierarchy. Desktop detail uses a full-width score hero followed by another
   large explanatory card. Keep match/period/score first, then the relevant
   selection and its current or recorded status, followed by supporting
   evidence. Reduce repeated labels without removing semantic distinctions.
   Acceptance: at representative phone and desktop widths, the current state,
   selection status and next useful action are identifiable without expanding
   evidence; no lost original price, timestamp or recorded/current distinction.

2. **HIGH — Explain partial data beside the affected section (205).** Owner
   screenshots show shots and possession while pressure says observations
   exist but no verified interval exists. The cause remains uninvestigated
   (202). Explain what is available, what is missing and its scope only when
   the source supports that explanation. Do not assert a collection delay or
   promise the next update without evidence. Keep available possession distinct
   from verified pressure. Acceptance: available, unavailable, stale and
   unverified are distinguishable; missing data never appears as a measured zero.

3. **MEDIUM — Use compact analytical rows (206).** Several unavailable
   statistics occupy full rows, and large section gaps delay the next useful
   evidence. Retain access to every field but make unavailable secondary
   statistics compact or expandable. Group pressure and possession per 203
   without merging their meanings. Acceptance: more useful evidence fits in
   the phone viewport while full labels and available values stay readable;
   desktop uses an intentional compact row/grid treatment.

4. **MEDIUM — Improve desktop detail composition (207).** The latest saved
   recorded detail spreads score, selection odds and status across a very wide
   hero; its Jinx card has long lines and sparse content. Consider bounded
   reading widths and grouped related metrics, retaining the established
   two/three-column breakpoints and full-width timeline where useful. Empty
   space below a short dashboard alone is not a defect and should not be filled
   with invented content. Acceptance: compare at matching 1280, 1600 and 1920
   widths, with populated and sparse states; no unnecessarily distant label/value
   pairs or oversized wrappers. Android receives the same information ordering
   in a stacked layout; the desktop grid itself is a platform exception.

5. **MEDIUM — Make metadata understandable without dominating (208).** A
   Decision Journal row mixes date, pressure confirmation, pool counts and a
   code such as 77A. Keep the short decision/result summary prominent and put
   specialist detail in a consistently labelled evidence area. Explain stars
   and pool support nearby; neither is probability. Improve presentation of the
   full matchup in detail without unnecessary repeated headers. Acceptance:
   an unfamiliar owner can distinguish score, selection odds, evidence quality,
   sample support and result; long names remain accessible on both surfaces.

6. **MEDIUM — Check overlay obstruction and readable secondary text (209).**
   A saved phone-width web review shows a Jinx bubble covering the page title
   and filters; desktop guide overlays cover content in an earlier review
   state. This is an observed preview risk, not a reproduced current APK bug.
   Verify current placement/dismissal on both surfaces. Inspect secondary copy,
   chart labels, focus, screen-reader names, text scaling and touch targets;
   these are pending checks, not proven conformance failures. Acceptance:
   overlays preserve access to primary controls and readable context at small
   widths and enlarged text; accessibility claims require actual measurements.

## Existing owner items and suggested batch order

- 200: Today in the Decision Journal period menu; scope list/counts/summary
  consistently and define day/timezone boundaries during implementation.
- 201: first-half historical outcomes while the first half is in progress;
  display an explicit period label without changing the model.
- 202: investigate first-half pressure absence through the source chain before
  deciding whether the problem is data, mapping, verification or presentation.
- 203: possession in the pressure section, with honest partial-data states.

Start with state clarity and 200..203; then hierarchy/compactness; then desktop
composition, metadata and overlay/accessibility verification. Changes advance
on Android and web together. Validate first/second half, half-time, finished,
no selection, frozen selection and partial-data states. Build/release and
external changes retain their explicit gates. No implementation started here.
