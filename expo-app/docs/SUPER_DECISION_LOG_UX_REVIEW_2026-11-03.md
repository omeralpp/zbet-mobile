# Super · Karar günlüğü UX review — 3 November 2026

Owner request (3 November, with screenshots of the desktop Super page on real
3 Kas data, the Canlı match detail and Toto program 365): the same scored
review as Maç detayı for the Super page, with prioritized improvements, at a
level that makes the page excellent, backend gaps included ("mükemmel hale
getirecek seviyede ... backend de eksiklik varsa onlarıda ekleyebiliriz").
Separately, harmonize the Bilyoner buttons, whose sizes differ across the app
(implemented locally, see the last section). NXT-OBS-242 tracks the review,
NXT-OBS-243 the Bilyoner buttons.

Scope: the Super tab (`RebuildDecisionLog`) of the accepted `ba88590` client.
The record page `/super/[key]` was reworked in NXT-OBS-241 and is not re-scored.
No Super source, BFF, SAP, model, Git, build or publication change was made.

## Method and evidence

Scores are expert heuristic judgements (clarity, state honesty, hierarchy and
density, consistency, responsive/accessibility), not user-study results.

- The owner's desktop screenshot (app.surklase.com/super, 3 Kas).
- The canonical edge web export of `ba88590`, served by a copy of the
  loopback-only synthetic harness (`.codex-artifacts/super-review-20261103/`)
  with a `super` case modelled on that screenshot: six decisions on 3 Kas,
  cohort `77A · havuz yolu`, two rows named `Ev sahibi – Deplasman`. Headless
  Edge captures at 320/390/1440 px, both themes, report details open. The
  harness did not route its empty/error/loading cases to Super, so those states
  are scored from source.
- Source: `RebuildDecisionLog.tsx`, `RebuildReportDetails` in
  `RebuildEvidencePanel.tsx`, `rebuild-log.ts`, `rebuild-schemas.ts`,
  `http-mobile-api.ts`; BFF `router.js`, `rebuild-provider.js`,
  `rebuild-match-names.js`.
- Root cause of the generic team names: bounded GET-only direct OData reads of
  the nine decisions published since 2 Nov 20:00 UTC, mirroring the BFF's name
  check (`inspect_decision_names.py`, `decision-names-inspection.json`). This is
  direct OData evidence (`DIRECT_ODATA_GET_NOT_MCP`), not MCP evidence; no SAP
  write.

Size: the phone page with six decisions is 1,886 px at 390 px (2.2 screens,
about 210 px per card) and 2,668 px with every report detail open. On desktop
the tiles and table fit one screen; open report details end near 1,560 px. No
document overflow at 320/390/1440 px and no page target below 44 px.

Strengths to keep: frozen decision quotes labelled as such, honest one-unit
hypothetical accounting, pending kept apart from results, counted filter chips,
a sortable desktop table, and an empty state that offers the other day.

## Section scores

| # | Section | Now /10 | Main problems | Target /10 (estimate) |
| --- | --- | ---: | --- | ---: |
| 1 | Header (`BTB SUPER · Karar günlüğü`, Yenile) | 7.5 | No "last updated" although the report carries `asOf` and refreshes every 30 s (the shell's Yenile already shows `Yenileniyor…`/`Yenilendi`; corrected after the first draft) | 8.5 |
| 2 | Filters (Tümü · star floor · Bekliyor) | 7.5 | Phone sorting hides inside the star menu; `★★★+ 3` mixes floor and count; Bekliyor narrows the list but not the summary, so a note has to explain it | 8.5 |
| 3 | Scope and period | 6.0 | Only Bugün / Dün: no 7- or 30-day view and no day stepping; the scope line repeats the karar tile | 8.5 with B3 |
| 4 | Summary (desktop tiles, phone card) | 6.5 | Count and pending repeat the chips; ROI and hit rate, which judge the day, sit two disclosures down; the phone eyebrow repeats `Bugün` and `Tümü` | 8.5 |
| 5 | Decision table (desktop) | 7.0 | Two rows read `Ev sahibi – Deplasman` (B1); cohort and date repeat on every row; evidence wraps and its first half is identical in every row; market wraps while Maç has room; no final score; row role (C2) | 8.5 |
| 6 | Decision cards (phone) | 7.0 | Same names (B1) with `ES`/`DE` crests; `Sürüm 77A · havuz yolu` and the day on every card; no final score | 8.5 |
| 7 | Rapor ayrıntısı | 6.5 | Two nested disclosures; empty and pending-only groups read `0 sonuç · 0,00` (C1); per-group ROI/hit rate delivered but unused; `Toplam risk / Sonuçlanan risk` jargon; unexplained `keşif aralığı`; `0 çözülemedi · 0 iptal`; 1,140 px rows on desktop | 8.5 |
| 8 | Loading / empty / unavailable | 8.0 | Loading hides filters and scope, so the page jumps when data arrives; otherwise honest copy, retry and a cross-day action | 8.5 |
| 9 | Data completeness (backend) | 5.5 | B1 names; settled score not exposed (B2); no verified league or kickoff after the match (B4); logos deferred (NXT-OBS-073) | 8.0, 8.5 with B4 |
| — | Whole page | **6.8** | Repetition, hidden performance figures, missing match facts | **8.5** |

## Confirmed defects

- **B1 — finished decisions lose their team names (BFF).** After a match ends
  `ZBET_C_RB_OPP` no longer joins names (its current `zbet_t_matches` row is
  gone), so the BFF reads the names frozen in the decision capsule
  (`rebuild-match-names.js`). It requires the quote and statistics documents to
  agree and compares case-insensitively but with whitespace significant (`:42`),
  although its own comment says incidental whitespace is harmless. Gil Vicente –
  V. Guimaraes (match 3262213, MsX2 and Ms05u, 2 Nov 21:39 and 21:44 UTC): the
  quote body says `V. Guimaraes`, the statistics `V.Guimaraes`, the check fails
  and the BFF falls back to `Ev sahibi` / `Deplasman`
  (`rebuild-provider.js:129`). Of the eight finished decisions inspected six
  pass and these two fail only on that space; the ninth was live and used the
  SAP join. The fallback reads like real names and gets `ES`/`DE` crests.
- **C1 — report groups without results look like flat results.**
  `BreakdownTable` prints settled count and net only, so a star or market whose
  only decision is pending (1★, `Toplam gol 3,5 altı`) and stars with no
  decision at all (4★, 5★) all read `0 sonuç · 0,00`
  (`RebuildEvidencePanel.tsx:533`, `:589`), against the component's own rule of
  a dash where nothing is resolved.
- **C2 — desktop rows announce a row, not a link.** Each row sets both
  `accessibilityRole="link"` and `role="row"`; react-native-web uses `role`
  first (`propsToAriaRole`), so the link the hint describes is never announced
  (`RebuildDecisionLog.tsx:201`, `:204`). Mouse and Enter still work. Web only;
  low severity, screen-reader check pending.

## Improvement backlog

P1 — correctness and missing facts:

1. **B1 fix (BFF, Mobile-owned).** Compare names with all whitespace removed,
   still exact otherwise (no fuzzy aliasing), display the quote document's
   spelling, and add the `V. Guimaraes` regression test. When names stay
   unavailable, say so (`Takım adları doğrulanamadı`, neutral crest) instead of
   names that look real; that flag needs the opt-in contract of item 4.
2. **C1:** groups with nothing settled show `1 bekliyor` and a dash; stars
   without decisions are hidden; each group shows its hit rate and ROI from the
   aggregates the BFF already sends.
3. **C2:** one role per row (a row with a real link in the Maç cell).
4. **B2 settled score (BFF opt-in field).** The settlement already verifies
   `used_home_s` / `used_away_s` against the frozen revision
   (`rebuild-provider.js:122`) but does not emit them. Installed clients parse
   records with strict schemas, so the score goes behind a new opt-in header
   (for example `X-BTB-Report-Settlement: score.v1`), labelled by its
   `score_scope` (`MS 2–1`, `İY 1–0`) next to the result pill.

P2 — clarity and density (client only):

5. Summary leads with net units, ROI, hit rate and `kazandı · kaybetti ·
   bekliyor` from the period aggregate the page already has; drop the tiles and
   eyebrow text that repeat chips and scope.
6. Cohort once: when the period has a single cohort, name it in the scope line
   and tag rows only when cohorts mix. Single-day periods drop the day from rows
   and cards.
7. Evidence column `2/2 · 12/22` under a `Baskı · Havuz` header, no wrap; counts
   stay counts, never a winning probability.
8. Desktop columns: narrower Maç, wider Market so `Beraberlik / deplasman`
   stays on one line; time only in the Karar column.
9. Rapor ayrıntısı: one disclosure, plain wording (`6 karar · 5 sonuçlandı`),
   the interval explained as the match-level ROI range with its sample size,
   zero `çözülemedi / iptal` hidden, desktop groups in two columns.
10. Header: `Güncellendi 14:52` from `asOf`; Yenile shows its progress.
11. Loading keeps filters and scope in place with skeleton rows.
12. Phone sorting gets its own control (or the star menu is named `Filtre ve
    sıralama`).

P3 — backend scope:

13. **B3 periods (BFF, Mobile-owned).** `recent-days.v1` returns only today and
    yesterday; 7/30-day aggregates exist only in the default contract, which
    the daily request replaced for speed (NXT-OBS-232). Add `7 gün`, `30 gün`
    and a single-day parameter for ‹ 2 Kas › stepping as a new opt-in period
    value, within a measured latency budget.
14. **B4 league and kickoff.** First assessed as needing a SAP producer change.
    Corrected during implementation: every RB1 settlement proof
    (`RB1_RESULT_V1`) already freezes SAP's whole `zbet_t_matches` row as
    `source` (`zbet_cl_rb_result`), so kickoff, league and the settled score
    are verified BFF reads with no SAP change (see below).
15. Team logos stay deferred (NXT-OBS-073).

## Data and scope integrity

Client items are presentation only: no selection, star, quote, threshold,
settlement or total changes; every figure comes from the backend period
aggregates, a null stays unknown and a measured zero stays zero. BFF items
(1, 4, 13) need commit/push and BTP deploy approvals plus a BFF restart; B4 is
routed to `BTB - Aktif`. Android and web share the cards and summary; the
desktop table is the existing platform exception with the phone cards as
substitute. Any implementation is one coordinated Android/web batch under its
own approvals.

## Limits

Synthetic fixture modelled on the owner's screenshot; real data only for the B1
root cause. Empty/error/loading scored from source. No TalkBack or device
check. Targets are estimates, not measured outcomes.

## Bilyoner buttons — local implementation (NXT-OBS-243)

Measured at 390 px on the same harness, `ba88590` against the change:

| Place | Before | After |
| --- | --- | --- |
| Maç detayı hero (playable selection) | 109×44 text link, `Bilyoner'da aç` | 167×48 outlined pill |
| Maç detayı page end | 158×48 outlined pill, `Bilyoner'da aç` | 167×48 outlined pill |
| Toto active program | 342×50 full-width green pill, no icon | 238.8×48 green pill |
| Toto waiting / error program | 342×50 full-width outlined pill, no icon | 238.8×48 outlined pill |
| Toto coupon row (opened) | 99×44 text link, `Bilyoner'de aç ↗` | 167×48 outlined pill |

`BilyonerButton` is now the only Bilyoner action: 48 px pill, content-sized,
one label style and `open-in-new` icon, announced as a link, hover and pressed
states. The green form remains only where opening Bilyoner is the screen's next
step (an active Toto program); a transparent border keeps it exactly as large
as the outline. The suffix follows Turkish vowel harmony everywhere:
`Bilyoner'de aç`, while `Spor Toto'da aç` keeps `da` because it attaches to
Toto. Placement is unchanged (NXT-OBS-241). Whole-row links (desktop Toto
coupon grid, fixture cards before predictions) stay rows, and the `Bilyoner`
row in Daha Fazla is a setting, not an action.

Validation: `npm run check` passes (typecheck, lint, brand, 773 client tests
including 3 new Bilyoner regression tests, 33 tooling tests); the Android
preview JS/Hermes export passed with 0 secret findings (bundle validation only,
no APK or device smoke); the edge web export is clean; the final web build
measures both Toto forms at 238.8×48. Not committed or published: release needs
commit/push approval and the coordinated Android/web release gates.

## Local implementation — 3 November 2026

The owner chose "İstemci + BFF" for the Super list and to ship the Bilyoner
buttons in the same package. One local Android/web + Mobile BFF batch; no Git,
BFF restart, build signing, distribution, publication or SAP change.

Evidence for the new facts: bounded GET-only direct OData reads of the nine
decisions published since 2 Nov 20:00 UTC (`inspect_settlement_source.py`,
`settlement-source-inspection.json`; `DIRECT_ODATA_GET_NOT_MCP`). All nine
settlement capsules verify and carry the frozen match row with kickoff, league,
names and final score; scope `REGULATION`/`PROVEN` on every settled one; each
final score equals the settlement's `used_home_s`/`used_away_s`. League names
are SAP `CHAR20`, so `İngiltere Premier Li` is stored cut.

BFF (`zbet-cap`, Mobile-owned):

- **B1:** name agreement ignores whitespace, still exact otherwise. Names now
  come from frozen evidence first (decision documents, then the settlement's
  frozen row), then the live fixture join, and only then the generic pair;
  always a whole pair.
- **B2/B4:** `rebuild-match-facts.js` reads the latest verified settlement's
  frozen row; a row naming another match or disagreeing with the settled score
  is ignored as a whole. Opt-in `X-BTB-Report-Facts: match-facts.v1` adds
  `match: { names, league, kickoff, finalScore }` per report record; the
  score only for a proven regulation-time WIN/LOSS. Half-time is not exposed
  (an unrecorded half reads 0–0 in that row). Default responses, the single
  match read, totals and periods are unchanged.
- **B3:** `GET /v1/btb/rebuild/v2/report/window/:through/:days` (1, 7 or 30
  Istanbul days ending on a real day within the last year, never future);
  discovery reads only that window's publications like the daily request;
  learning stays null.
- Tests: 700/700 (8 new: window bounds, keyless period, discovery filter,
  settled facts, pending/live facts, rejected rows, routes/headers/auth; name
  whitespace regression).

Client (Android + web):

- Period control: Bugün, Dün, Son 7 gün, Son 30 gün and ‹ › single-day steps
  up to a year back; today and yesterday reuse the shared daily report, other
  views read the window (60 s refresh when it includes today, none for past
  days).
- Summary: desktop tiles are units, ROI, hit rate (with settled count) and
  won · lost (+ pending); the phone card adds `ROI · isabet`; repeated count
  and pending tiles and the phone eyebrow are gone; `güncellendi HH:MM` from
  the report's `asOf`.
- Records: league · kickoff line, `MS 2–1` beside the result, cohort named
  once in the scope line when shared (tagged per row only when mixed), the day
  only in multi-day views, `Takım adları doğrulanamadı` with no initials when
  names are unproven, compact `Baskı · havuz` column, wider market column, the
  decision score under the minute.
- C2: desktop rows are table rows out of the tab order; the match name is the
  link (one navigation per click, verified).
- Rapor ayrıntısı: one disclosure, plain `6 karar · 6 maç · 5 sonuçlandı`,
  zero extras hidden, the ROI interval explained, star/market groups with
  `isabet` and a dash plus `bekliyor` when nothing resolved (C1), empty stars
  hidden, two columns on desktop.
- Loading keeps filters and the period control in place.

Not changed, deliberately: phone sorting stays in the star menu (an
owner-designed interaction; changing it is not provably better); the Bekliyor
filter still narrows only the list, with a shorter note; Özet's "Son Super
kararları" keeps its own names (now real in the observed cases after B1).

Release order: BFF first (the window route answers 404 on the current BFF; the
facts header is ignored there and the client tolerates its absence), then the
coordinated Android/web pair including NXT-OBS-243. Codex's parallel xG
reseal package changes BFF identity env values; one restart must cover both
under explicit approval (`BTB Logs/.../BFF_COORDINATION_RESPONSE.md`).
