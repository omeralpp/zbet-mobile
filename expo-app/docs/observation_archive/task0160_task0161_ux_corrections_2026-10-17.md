# Closed observation rows — UX corrections (TASK-0160, TASK-0161), 2026-10-17

Moved verbatim from `OBSERVATION_LOG.md` when the rows closed; only the status cell changed.

- NXT-OBS-163/164 closed with TASK-0160: batch
  `client-bd430739b564b23195158005f711eff07c59878c-3C34A195F611-56FDFDA3F1CC` (web release
  `20261017T143340Z-bd43073`); both owner smokes passed on 2026-10-17. Receipt:
  `btb-codex/docs/evidence/client-release-bd43073-2026-10-17.json`.
- NXT-OBS-165..168 closed with TASK-0161: batch
  `client-524f2e77a839cd42e2ac520b375eef13d6765c48-CBAF69981D1D-62692B1F4613` (private Drive APK
  `CBAF6998…EA46B44`, installed by the owner; web release `20261017T184858Z-524f2e7`); both owner
  smokes passed on 2026-10-17, including the corrected web wheel. Receipt:
  `btb-codex/docs/evidence/client-release-524f2e7-2026-10-17.json`.

| ID | Tarih | Alan | Tespit / beklenen kanıt | Öncelik | Durum |
| --- | --- | --- | --- | --- | --- |
| NXT-OBS-163 | 2026-10-17 | Journey inspection / Android and web | Owner phone screenshots of the delivered 93e8330 candidate (R.Sociedad B–Almeria, 87′, 1–3) show that grouped event choices, event explanation, pool data and the duplicate score/star timeline make Maçın Yolu too long. Selecting the graph requires scrolling to find the explanation. Correct within the ongoing authorized UX release: open a compact selected-moment inspector from the graph, retain scroll position and collapse the duplicate full timeline. Retest touch/keyboard and both responsive surfaces. TASK-0160 stays incomplete; web publication does not proceed on this candidate. | HIGH | CLOSED 2026-10-17 |
| NXT-OBS-164 | 2026-10-17 | Jinx commentary / Android and web | Owner reports that Jinx did not meaningfully interpret the match. The current V3 policy gate suppresses all commentary and returns only a missing-policy sentence. Keep validated economic eligibility gated, but independently explain the displayed score/minute/selection, concrete change risk and grounded screen evidence in a short answer. Missing probability must not suppress factual football interpretation or become an invented edge. Same ongoing UX correction and paired release as NXT-OBS-163 / TASK-0160. | HIGH | CLOSED 2026-10-17 |
| NXT-OBS-165 | 2026-10-17 | Journey inspector / Android and web | TASK-0161 / a6e25fd: owner accepts installed Android interactions; published web arrows work, horizontal mouse scrolling fails. Browser reproduction: a 10px horizontal step leaves the event unchanged while 100px advances; the 44px threshold rejects small isolated steps. Local correction lowers the noise guard and tests units, Shift input, reversal, inertia and vertical reading. Preserve content scrolling, grouped/same-minute events, boundaries, focus and parent page position. Current batch remains incomplete; correction requires a new matched Android/web pair. | HIGH | CLOSED 2026-10-17 |
| NXT-OBS-166 | 2026-10-17 | Jinx clarity / both clients | Owner cannot interpret “Yeni oyun: Bekle”; screenshot also repeats the score-change condition. Explain that a missing validated value calculation gives no betting recommendation while factual match commentary remains available. Remove the repeated CHANGE sentence; preserve eligibility/provenance gates. TASK-0161. | HIGH | CLOSED 2026-10-17 |
| NXT-OBS-167 | 2026-10-17 | Refresh / web | Add a visible web refresh action that refetches current screen data while preserving navigation/filter state and never triggers manual Jinx generation. Android retains its pull-to-refresh equivalent. TASK-0161. | MEDIUM | CLOSED 2026-10-17 |
| NXT-OBS-168 | 2026-10-17 | Match search / both clients | Owner requests case-insensitive Turkish/diacritic tolerant search (o/ö, u/ü, I/İ/ı/i), matches anywhere in team/league names and close spellings. Shared matching for Android/web Live search and desktop command palette; every query word required, exact results before bounded typo matches. TASK-0161. | HIGH | CLOSED 2026-10-17 |
