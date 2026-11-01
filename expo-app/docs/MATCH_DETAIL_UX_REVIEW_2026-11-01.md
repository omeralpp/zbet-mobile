# Maç detayı UX review — 1 November 2026

Owner request: analyze every element of the Maç detayı page, score each section
and list improvements. This is a read-only review of the accepted `c8188ca`
client (source `19f0976`, app code unchanged since `c8188ca`). No source, BFF,
SAP, model, Git, build or publication change was made. NXT-OBS-241 tracks it.

## Method and evidence

Scores are expert heuristic judgements (clarity, state honesty, hierarchy and
density, consistency, responsive/accessibility), not user-study results.

- Fresh canonical edge web export of `19f0976` (`node scripts/web.mjs export`,
  secret scan clean), served by a copy of the loopback-only synthetic harness
  (`.codex-artifacts/match-detail-review-20261101/`). The copy adds one `rich`
  case (two provider goal events, league table) because the stock fixtures leave
  Maçın yolu and Lig nearly empty. No remote proxy, credentials or SAP reads.
- Headless Edge captures at 320/390/1440 px, dark and light, for `rich`,
  `empty`, `error`, `loading`, `finished-none`, `watching`, `long-names`,
  `result-win`, `market-closed`, `new-decision`, `red-unknown`, first run,
  sticky header, desktop split view and all-modules-open. Screenshots, page text
  and `capture-results.json` are under the harness `shots/` folder.
- Source read of `MatchDetailView` and every section component.

Page length (populated live RB1 match, default collapse): **6,160 px at 390 px**
(7.6 phone screens), 6,679 px at 320 px, 7,026 px with every module open;
desktop route 4,883 px. Approximate phone share: Maçın yolu 1,250, Oran
sonuçları 1,030, Karar özeti 1,020, Takım formu 830, Canlı saha dengesi 690,
Jinx 440, score card 350. The same published decision appears in five places:
hero, Jinx `Dayanaklar`, Maçın yolu ticket, Karar özeti ticket + evidence + list,
and the linked Super page.

## Section scores

| # | Section | Now /10 | Main problems | Target /10 (estimate) |
| --- | --- | ---: | --- | ---: |
| 1 | Header + sticky summary | 8.0 | Works; current quote unlabeled in the sticky line | 8.5 |
| 2 | Score card (teams, score, clock) | 7.5 | Logos sit at different heights when one name wraps; `İY 0-0` hyphen vs `1–1`; sparse on desktop | 8.5 |
| 3 | Verdict band (selection, quotes, state) | 6.0 | Confirmed state contradiction (D1); 320 px mid-word break (D2); visible `BEKLİYOR` without "sonuç"; `SEÇİM AKTİF` vs Jinx/list `GÜNCEL SEÇİM`; one star value drawn three ways; resolved states show "—" instead of the result | 8.5 |
| 4 | Jinx | 7.5 | Cap sentence repeated in both paragraphs; unchanged comparisons (`1–1 → 1–1`); `Dayanaklar` repeats the full Karar kanıtı shown below | 8.5 |
| 5 | Maçın yolu | 6.5 | Longest section; missing activity stated three times and missing pool once more; desktop pool box mislabeled (D3); finished-match copy in future tense (D4); score twice in the latest panel (D5); title louder than every other section; duplicate status pill | 8.0 |
| 6 | Maçın kanıtları navigator | 7.0 | Chip order ≠ page order (D7); three names per module; eyebrow on 3 of 6 headings; `Düzeni sıfırla` prominent and unconfirmed; chips jump to empty modules | 8.5 |
| 7 | Karar özeti | 7.0 | One record shown as ticket + evidence + list; `Sonuç revizyonu 1`, unitless vote values and an unevaluated formula; binding star cap not marked; selected row bleeds past card corners (D6); 1,140 px key–value rows on desktop | 8.5 |
| 8 | Takım formu | 8.0 | ~830 px on a phone; share bars for "lower is better" rows | 8.5 |
| 9 | Lig sıralaması | 7.5 | Closed module in third slot; leaves an empty desktop column beside Takım formu | 8.0 |
| 10 | Oran sonuçları | 6.5 | Decision market absent from the six-row overview (19 to find it); ~260 px per market; raw codes; unexplained `KO` | 8.5 |
| 11 | Canlı saha dengesi | 8.5 | Strong; placed fifth although the most live-relevant | 9.0 |
| 12 | Tarihsel skor dağılımı | 7.0 | Overview ordered by share, so unreachable scores lead (5 of 6 rows in the example) | 8.5 |
| 13 | Bilyoner'da aç | 7.0 | Only external action, ~6,000 px down | 7.5 |
| — | Whole page | **7.0** | Length, repetition, row-aligned desktop grid gaps, 1 Hz full re-render (hypothesis H1) | **8.5** |

`Baskı grafiği` renders only for non-RB1 matches and is not scored.

## Confirmed defects

- **D1 — hero claims a current selection it does not show.** While the RB1
  record is loading, and after its first read fails, the eyebrow reads
  `GÜNCEL SEÇİM` above `Şu anda seçim yok` (loading and error cases).
  `MatchDetailView.tsx:681` calls `rebuildPresentation` from the context
  summary without the record query's error/loading state, while the selection
  line needs the record. The record query starts only after the context
  (`queries.ts:9`, `retry: false`, 10 s refetch), so an uncached open has the
  window and a failed first read keeps it for at least 10 s.
- **D2 — 320 px selection break.** `Deplasman kazanır` renders as `Deplasm / an …`;
  the two quote cells keep 30 % each (`MatchDetailView.tsx:1004`).
- **D3 — desktop `REFERANS HAVUZU` box.** Without a pool line it repeats the
  generic timeline sentence under a pool label (`MatchPathCard.tsx:430`).
- **D4 — finished-match copy.** `İlk kayıt geldiğinde maçın hikâyesi burada
  başlayacak`, `Henüz doğrulanmış hareketlilik…` and `SON 5 DAKİKA` stay on a
  finished match (`MatchPathCard.tsx:457`, `MatchActivityTrack.tsx:36`).
- **D5 — latest-moment panel shows the score twice** (title is the rail subtitle,
  `MatchPathCard.tsx:122`).
- **D6 — selected decision row** background overflows the card's rounded
  corners; on web the separator after the quote loses its space (`1,58· 52′`)
  (`RebuildEvidencePanel.tsx:228`, `:460`).
- **D7 — chip order** follows a fixed list, not the rendered or user-reordered
  module order (`MatchDetailView.tsx:550`).
- Minor: `Son kayda dön` target is 36 px (`MatchPathCard.tsx:596`); seven unused
  styles remain in `MatchDetailView.tsx` (distribution/probability/emptyText).

**H1 (hypothesis, needs a device profile):** `useRebuildClock` re-renders the whole
view every second and `buildMatchPath` rebuilds the chart model each tick
(`MatchDetailView.tsx:216`, `:383`). A timer at the next validity boundary and a
memoized model would remove that work.

## Improvement backlog

P1 — correctness: D1–D7, the 36 px target and the dead styles.

P2 — clarity and density (presentation only):

1. Say each absence once per card; collapse empty chart bands; notice copy must
   not say "eski maçlar" on a live match (`match-path-model.ts:221`).
2. Hero: visible `SONUÇ BEKLİYOR`; one state vocabulary shared with Jinx and the
   live list; show result units in resolved states; one star encoding and name.
3. Jinx: keep the cap sentence only in `Karar anı`; hide comparisons whose
   before and after are equal.
4. Karar özeti: hide the list when it repeats the single ticket; show computed
   deductions; mark the binding cap (`jinxQualityLimit` already finds it);
   plain wording for revision and vote values.
5. Oran sonuçları: pin the decision market above the overview; spell out `KO`.
   **Owner decision** (NXT-OBS-230 preserved market order).
6. Tarihsel skor dağılımı: reachable scores first, unreachable ones summarized,
   counts and totals unchanged. **Owner decision.**
7. Empty modules as one-line states; chips mark or skip empty sections.
8. Maçın yolu title at section scale; drop its duplicate status pill.

P3 — layout and engineering:

9. Desktop: column-flow (masonry) evidence grid; cap Karar kanıtı rows near
   640 px; align the hero footer with the centered verdict row.
10. Score card: top-align team blocks; `İY 0–0`.
11. `Düzeni sıfırla` at the end of the list with confirmation or undo.
12. Status-aware default order for live matches (Saha and Piyasa earlier).
    **Owner decision;** saved orders stay authoritative.
13. H1 profiling and fix.
14. Bilyoner action placement. **Owner decision** (kept secondary in NXT-OBS-230).

## Data and scope integrity

Every proposal is presentation-only: no DTO, adapter, selection, threshold,
star, quote, result accounting or historical count changes. Frozen decision
facts stay frozen, a null stays unknown, a measured zero stays zero, and
historical shares are never renormalized or presented as winning probability.
Android and web share these components; desktop layout items have the existing
single-column Android substitute. Any implementation is one coordinated
Android/web batch under its own approvals.

## Limits

Synthetic data only: no real live match, no activity history (the harness has
none), no TalkBack/device, font-scale or performance measurement. Browser
captures stand in for Android layout; native rendering can differ slightly.
Targets are estimates, not measured outcomes.

## Local implementation — 1 November 2026

The owner asked to apply every edit ("tüm düzenlemeleri eksiksiz uygula"),
including the four owner-decision items, then to score again. One local
Android/web batch; no Git, build signing, distribution, publication, BFF, SAP
or model change. Source base `19f0976` (app code of accepted `c8188ca`).

Implemented:

- **D1** `rebuildHeroFallback`: while the record loads the hero reads `KARAR
  KAYDI OKUNUYOR`, after a failed first read `VERİ ALINAMADI`, and a summary
  selection without its record `KAYIT DOĞRULANIYOR`; never `GÜNCEL SEÇİM`
  above "no selection". **D2** narrow verdict rows (<300 px) stack the market
  above its quotes. **D3** the desktop pool box shows only with a pool line.
  **D4** finished-match rhythm and rail copy. **D5** latest-moment title no
  longer repeats the score. **D6** unpadded cards clip rows to their corners;
  web separators use non-breaking spaces. **D7** shortcuts follow the rendered
  (also user) module order. `Son kayda dön` is 44 px; dead styles removed.
- Hero: `GÜNCEL SEÇİM` when current and playable (shared with Jinx/list;
  `SEÇİM AKTİF` stays for playable-but-not-current, NXT-OBS-210); `SONUÇ
  BEKLİYOR`; stars named `Kanıt kalitesi` (also on the Super decision hero,
  replacing the signal meter, so one record keeps one encoding); settled
  records show hypothetical units; level crests, `İY 0–0`, desktop column
  alignment; labelled quote in the sticky line; `Bilyoner'da aç` beside
  `Karar kaydını aç` while the selection is playable (bottom button kept).
- Jinx: quality limit only in `Karar anı`; score comparison only when the
  score changed; `Dayanaklar` links to Karar özeti instead of repeating it.
- Maçın yolu: one absence statement (rhythm summary), no notice boxes, empty
  activity and pool bands collapsed with a `havuz kaydı yok` caption,
  section-scale title, no duplicate status pill, live pill not doubled by the
  cursor, memoized model and card.
- Karar özeti: no list for a single record, computed deductions with formula
  provenance, the limiting star cap marked, plain vote and pending-result
  wording, compact empty state, two columns from 900 px.
- Oran sonuçları: the published market leads with a `BTB SEÇİMİ` tag (owner
  decision), `maç önü oranı` instead of `KO`, two-line market header, one-line
  empty state. Tarihsel skor dağılımı: reachable scores first, unreachable
  ones folded into one total (owner decision). Takım formu: label and unit on
  one line, compact empty/unavailable state.
- Navigator: every heading shows its eyebrow, which is its shortcut name
  (`LİG` replaces `PUAN DURUMU`); empty modules get no shortcut; `Düzeni
  sıfırla` sits after the list, appears only when the layout differs and can
  be undone for 8 s. Live matches open in a live-first default order unless the
  user saved one (owner decision); desktop modules pack in columns.
- Performance (H1): the clock tick no longer rebuilds the path model or the
  heavy modules (memoized), and the web live dot breathes in CSS instead of a
  JS-driven loop (native keeps its native-driver loop).

Not changed, deliberately: Takım formu share bars stay proportional to their
values (the label states "düşük daha iyi"); module data, market order beyond
the pinned row, counts, shares, thresholds and model facts.

### Measured after the change

Same synthetic harness and machine, back to back.

| Measure | Before | After |
| --- | ---: | ---: |
| Phone page, 390 px populated live | 6,160 px | 5,499 px |
| Phone page, 320 px | 6,679 px | 6,018 px |
| Desktop page, 1440 px | 4,883 px | 3,830 px |
| Desktop, every module open | 5,530 px | 4,418 px |
| Empty state, 390 px | 3,079 px | 2,336 px |
| Idle main-thread work, phone (4× CPU slow-down) | 279 ms/s | 15 ms/s |
| Idle main-thread work, desktop | 121 ms/s | 8 ms/s |
| Idle style recalculations | ~100/s | 0 |

With reduced motion (no animation), per-tick script fell from 24.6 to 7.9
ms/s on the throttled phone profile: the memoization's own share. No document
horizontal overflow at 320/390/1440 px in either theme.

### Scores after implementation

Heuristic, same method as above; synthetic data.

| # | Section | Before | After |
| --- | --- | ---: | ---: |
| 1 | Header + sticky summary | 8.0 | 8.5 |
| 2 | Score card | 7.5 | 8.5 |
| 3 | Verdict band | 6.0 | 8.5 |
| 4 | Jinx | 7.5 | 8.5 |
| 5 | Maçın yolu | 6.5 | 8.0 |
| 6 | Maçın kanıtları navigator | 7.0 | 8.5 |
| 7 | Karar özeti | 7.0 | 8.5 |
| 8 | Takım formu | 8.0 | 8.5 |
| 9 | Lig sıralaması | 7.5 | 8.0 |
| 10 | Oran sonuçları | 6.5 | 8.5 |
| 11 | Canlı saha dengesi | 8.5 | 9.0 |
| 12 | Tarihsel skor dağılımı | 7.0 | 8.5 |
| 13 | Bilyoner'da aç | 7.0 | 8.0 |
| — | Whole page | **7.0** | **8.5** |

What keeps it below 9: the phone page is still ~5,500 px because no data was
removed; the desktop selected-moment panel is mostly empty; no real live match,
TalkBack or device measurement.

### Validation

- `npm run check`: typecheck, lint, brand, **770 client tests** (759 + 11 new
  regression tests) and **33 tooling tests** pass.
- Edge web export (`node scripts/web.mjs export`) clean, secret scan clean;
  Android preview JS/Hermes export passed with 0 secret findings (bundle
  validation only, no APK/signing/device smoke). `git diff --check` clean.
- Synthetic harness `.codex-artifacts/match-detail-review-20261101/`: 18
  after-captures (`shots-after/`), 13 states, 320/390/1440 px, both themes,
  desktop split view and all-open grid. Headless captures taken in
  beyond-viewport mode showed a phantom header icon on desktop; it is absent
  from the DOM, from a real Chromium after narrow/wide resizing and from normal
  captures, so desktop evidence uses normal captures.

Release needs the coordinated Android/web gates: clean pushed commit, verified
pair, private APK delivery and installation before web publication, both owner
smokes, each under its own approval.
