# Design jury re-audit — 23 October 2026

**Verdict: 87/100 overall; the 90+ target has not been reached.**
Mobile responsive layout: **86/100, provisional**. Desktop web: **88/100**.
Native Android is not scored as verified: the new candidate has no physical
device smoke, system-font scaling or TalkBack receipt. Phone-width web is a
useful shared-layout proxy, not evidence of native behaviour.

This is a design assessment of the local candidate before publication. No
application source, model, backend, Git history or delivered client was changed
during this assessment. The temporary browser theme/viewport were restored.
The earlier 68/100 review is historical; current evidence is broader, so the
score difference is a heuristic judgment rather than a controlled measurement.

## Method and scope

Eight equally weighted categories, the same categories as the initial review.
Platform scores are category means; overall is their mean. These are expert
judgments, not task-completion measurements or accessibility certification.

Inspected the current local export at `http://127.0.0.1:4186`: Overview,
Live list/split detail/expanded detail, Decision Journal, Toto program list and
program detail, Settings. Dark and light themes; phone widths 320 and 390,
tablet 768, desktop 1280/1440/1920. These were representative combinations,
not every screen at every width/theme. Live data changed during the audit.

Interaction checks: search filtering, automatic selection of its remaining
match, desktop detail expansion and Escape restore, period-menu Enter/Escape,
Today scope, pressure/activity switching, evidence shortcuts, navigation and
theme switching. Current source showed live, half-time, extra-time, historical
pending/win/loss, unavailable/loading and partial-data states. The new active
selection and goal-marker cases also have the previous batch's clearly
labelled fixture evidence; that is not fresh native or live-goal acceptance.

Evidence directory:
`C:/dev/btb-cdoex/.codex-artifacts/jury-reaudit-20261023/`.
The preceding `jury-refinement-20261023/validation.json` identifies the
unchanged tested bundle: 693 client tests, 32 tooling, BFF tests/build,
Android Hermes export and verified edge web export. Those checks support
implementation integrity; they do not award visual-design points.

## Scorecard

| Category | Mobile layout | Desktop | Judgment |
| --- | ---: | ---: | --- |
| Visual identity and consistency | 92 | 92 | Strong navy/teal and warm light theme; coherent cards, typography and semantic accents. |
| Information hierarchy | 88 | 90 | Score, published decision and current quote are distinguishable; status/explanation repeats across hero and Jinx. |
| Density and space use | 84 | 87 | Journal is much more scannable; mobile detail remains tall and very wide heroes spread related facts apart. |
| Navigation and orientation | 90 | 92 | Named tabs/rail, effective search, selected detail and keyboard controls. Resize offset remains a finishing defect. |
| Data-state communication | 82 | 83 | Missing versus zero is generally clearer; report loading and publication availability still create misleading empty-state transitions. |
| Analytics and explanation | 85 | 86 | Separate five-minute/native modes, honest gaps and contextual possession; old-window dominance needs clearer recency framing. |
| Visual legibility | 86 | 89 | Primary values are strong and sampled colours contrast well; important status/time metadata still uses 11 px. |
| Finishing across states | 81 | 85 | Two reproducible responsive defects, plus loading/retained-record presentation, prevent a 90+ verdict. |
| **Mean** | **86** | **88** | **Overall 87/100** |

## Findings in priority order

### JURY-R01 — High: Toto program title collapses at 320 px

On a cold 320 px layout, the Program 363 card's icon, title/date and
non-shrinking status pill compete in one row. The title becomes fragments
such as `Pr / og / ra / m / 36 / 3`; its date also breaks into narrow pieces.
This is a reproduced initial-layout defect, not a screenshot taken mid-resize.
The corresponding desktop card and program-detail screen are readable.

Evidence: `toto-phone-320.png`; compare `toto-light-desktop-1280.png` and
`toto-detail-phone-320.png`. Relevant source: `TotoProgramCard.tsx` header,
headerCopy and statusStack. A horizontal header and non-shrinking badge are
confirmed; the complete repair has not been implemented or validated here.

Acceptance: at 320/360/390 px, title/date retain meaningful words, the status
remains visible, metrics align and no content is clipped. Moving the badge to
another row at narrow widths is a reasonable approach. Check native large text.

### JURY-R02 — High: an open journal is offset after desktop-to-phone resize

Resizing the open journal from desktop through 390 to 320 px left its page
strip shifted horizontally. The title's left edge measured **-22 px**, with a
272 px title width in a 320 px viewport; part of the neighbouring Toto page
appeared at the right. Counts and metadata were also cut at the left.
The condition persisted across subsequent observations. Reload at the same
320 px restored the title to **24 px** and removed the adjacent-page peek.

Evidence: `journal-today-phone-320.png`, `journal-phone-metrics.json`;
compare `journal-cold-phone-320.png`. This is confirmed in responsive web;
Android rotation and native pager behaviour are untested. Root cause is not
confirmed, so it is not assigned to the local journal pager from appearance alone.

Acceptance: repeated 1440→390→320→768→1440 transitions preserve the selected
destination, proper page origin and focus, without reload or adjacent-page
content. Repeat on native orientation changes before closing Android acceptance.

### JURY-R03 — Medium: loading/unavailable states can look like zero or no decision

The journal showed `Tümü 0`, star 0 and `Bekliyor 0` alongside a waiting/report
message, then recovered to 14 records. Those zeroes read as results before the
report is available. The cold-phone screenshot records that waiting state.
Overview already uses a dash for unavailable star/report metrics, which is a
better convention to extend consistently.

The Live/Overview Altach card also temporarily used `Şu anda seçim yok` while
the publication report was unavailable, then restored the frozen 51′ decision.
This audit did not determine the source of report availability changes.
`RebuildDecisionLog.tsx` derives empty records/counts when unavailable;
`MatchCard.tsx` can fall through to no-selection wording when no publication
hero can be formed. These are presentation concerns, not permission to extend
quote freshness or restore an unverified active selection.

Evidence: `journal-cold-phone-320.png`, `overview-light-phone-390.png`,
`live-recorded-desktop.png`, `detail-light-phone-390.png`. Some screenshots are
different receipt times; they are not a claim of simultaneous inconsistent values.

Acceptance: use explicit loading/unavailable count placeholders; distinguish
history unavailable from a verified absence of decisions. A retained last
verified publication may remain visibly historical while current playability
stays unverified. Test initial load, refresh error, unavailable payload and recovery.

### JURY-R04 — Medium: the strongest chart headline can describe a much older window

At match minute 76–77, the activity view led with `Austria Wien daha hareketli ·
%100`, while its latest available window was **25–30′**. The small range label
was present, so this is not an assertion that the data itself is fabricated.
The native-pressure view described Altach at 70–72′ instead. The difference in
window recency deserves prominence alongside the mode difference.

Evidence: `pressure-dark-desktop.png`, `pressure-native-desktop.png` and the
recorded AX observations. Keep unknown gaps. Prefer a headline such as
`Son kayıtlı pencerede ... (25–30′)` with a clear lack-of-current-window state;
avoid making that old dominance read as the current match situation.

Acceptance: an unfamiliar user can distinguish current match time, selected
mode and latest available window at first glance. No interpolation, model
weight, possession weight or freshness-limit change is implied.

### JURY-R05 — Medium: repeated status and evidence copy still consumes attention

Hero, Jinx badge, Jinx explanation, quote status and decision module repeat
parts of the same state. At 390 px the score/selection hero and Jinx consume
almost the first viewport before the timeline or pressure graph is visible.
At 1920 px the hero's result badge, decision and price remain far apart.

Evidence: `detail-light-phone-390.png`, `live-recorded-desktop.png`,
`detail-light-desktop-1920.png`. Keep one primary status, a short interpretation
and expandable recorded evidence, while preserving first/current price and
frozen/current distinctions. Bound wide-screen reading groups more tightly.

Acceptance: score, published selection, result and current market state are
clear without reading the same explanation twice. Evidence remains accessible
with full names and a consistently named expansion control.

### JURY-R06 — Follow-up: legibility and native accessibility acceptance

DOM samples show 11 px league/time/status metadata and 12 px supporting text.
This is a readability refinement, not a proved contrast failure. The sampled
solid token pairs on soft surfaces have contrast ratios of **5.60–12.72:1**
across both themes (`palette-contrast.json`). This does not measure every
gradient, chart glyph, disabled state or native rendering.

Current visible desktop Overview controls measured 40 px for the two sidebar
utility actions; no under-44 px primary journal action was found in the scoped
phone sample. Native touch areas, TalkBack, 130/150/200% system text scaling,
focus order across all modules and animation/scroll performance remain open.
No blanket accessibility-conformance claim is made.

## What is already improved and should be retained

- Today filter, period-specific historical outcome labels and separate
  five-minute/native pressure modes.
- Correct 45+/90+ source notation and 105′ UZATMA/penalty distinctions.
- Original selection facts separated from fresh verified current prices;
  playable last-selection filters with frozen stars.
- Compact statistics with measured zero distinct from missing, and possession
  clearly presented as supporting context.
- Desktop master-detail expansion, named compact navigation, journal rows,
  predictable themes, clear focus outlines and unobstructed main filters in
  the reviewed states. Active Jinx onboarding was not restarted in this audit.

## Publication recommendation

Keep the design target open. Address R01/R02 and the R03 state ambiguity first;
then refine R04/R05 and obtain physical Android/accessibility receipts. Re-score
the same categories and repeat the responsive transition matrix. A 90+ outcome
is plausible after those checks, not guaranteed by the existing test count.

No publication, signing/distribution, SAP write, commit or push was performed.

## Owner decision and quick polish follow-up

The owner accepted 87 as sufficient, then requested the quick recommendations
before publication. The original score above remains the dated jury assessment;
no new 90+ or native acceptance claim follows from implementation alone.

- R01: 320 px real-data Toto header now wraps its status onto another row;
  program number and date remain readable. Desktop keeps the row when it fits.
- R02: root web tab pager disables page animation/swiping; Android retains its
  pager. Journal transition 1440 -> 390 -> 320 -> 768 -> 1440 stays aligned
  (320 px heading left 24/right 296). Live search survives the same transitions.
  Web tabs/rail provide the platform substitute; no navigator remount is used.
- R03: unavailable report counts are explicitly unknown. A shared memory-only
  last-verified publication snapshot retains first price/stars on cards during
  report outages. Unavailable verification still removes active eligibility and
  counts. Labelled fixture AVAILABLE -> UNAVAILABLE -> AVAILABLE passed; no
  stale quote is promoted. Cold unavailable cards name the missing verification.
- R04: headline begins with the actual recorded interval; the adjacent caption
  names current match minute for live matches. Values, gaps and weights unchanged.
- R05: removed the repeated evidence paragraph above the decision ticket; full
  evidence remains in the ticket/details. Broader hero/Jinx composition is follow-up.
- R06/native text scale, TalkBack and physical-phone smoke remain open.

Client type/lint/brand, 694 tests + 32 tooling, Android Hermes and verified edge
web export pass. BFF tests/build and Doctor 20/20 are reused for unchanged inputs.
Evidence: `.codex-artifacts/quick-polish-20261023/` and quick-* validation logs.
Release preparation: `JURY_REFINEMENT_DELIVERY_2026-10-23.md`.
