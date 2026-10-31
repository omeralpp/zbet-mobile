# Toto Programlar and Toto programı — 31 October 2026

Owner: BTB Mobile Next - Aktif. NXT-OBS-238 (follow-up NXT-OBS-239).
Status: LOCAL IMPLEMENTATION AND VALIDATION COMPLETE / NOT COMMITTED OR RELEASED.

The owner asked for an expert review of both Toto pages with scores before and
after, then approved every recommendation (“I approve do it all”) and asked to
publish it together with the Jinx outlook batch (NXT-OBS-235). Both batches
form one uncommitted local candidate on top of `eff88f2`; the accepted
`6fc5d05` Android/web pair stays installed/published.

## Scores

Heuristic design judgements, not usability-study or betting-performance
evidence. The 26 October review scored both pages 8.5 on one mock program
with three matches; this review used realistic synthetic programs (fifteen
matches, every lifecycle state), which exposed the problems below.

| Page | Before | After | Main benefit |
| --- | --- | --- | --- |
| Programlar | 7.0 | 8.8 | Each card answers its lifecycle's question; history is compact; more list space on phones |
| Toto programı | 7.0 (phone 6.5, desktop 8) | 9.0 | Phone coupon at a glance; overview shaped by lifecycle; one vocabulary |

## Findings that drove the change

| Finding | Evidence |
| --- | --- |
| Waiting cards showed running hits as if final. | BFF counts `mainHits`/`coverageHits` from settled predictions only (`sap-mappers.js`), while the card showed no settled/total. |
| Layouts ignored lifecycle. | Unplanned card: 0 kolon, 0 maliyet, “—” and an empty capacity bar; active detail: “—” hits, an all-zero results card and four useless filters; resulted detail kept “Bekliyor 0”. |
| No time information. | No first kickoff on active programs, no dates on resulted ones, hits without /15. |
| History as heavy as live programs. | Resulted cards ~250 px each. |
| Phone detail too long. | 3,325 px at 390 px; first match at 743 px; 156 px per match card; desktop already had a coupon grid. |
| Four names for coverage; uncaveated confidence. | “kapsama”, “kapsama isabet”, “Kuponda”, “Kapsamada”; “Güven %” on every row (KB-MODEL-002 found confidence weakly informative in one comparison). |
| Play action at the bottom in every state. | Bilyoner action at 3,227 px, also after a program had resulted. |

## Changes

| Item | Result | Surface coverage |
| --- | --- | --- |
| L1 lifecycle cards | Unplanned: “Tahmin hazırlanıyor · ilk maç … · 2 gün sonra”. Active: kolon, maliyet, coupon structure, first kickoff and capacity. Waiting: settled x/15, running coverage and main hits, coverage ceiling x/15, outcome bar, next or in-play match, plan line. Resulted: coverage and main x/15, kolon, maliyet, date span and theoretical prize. | Shared Android/web; Summary's Toto card uses the same component. |
| L2 compact history | Resulted programs listed under “Geçmiş” as ~64–76 px rows (program, date span, prize when present, coverage x/15, main x/15) with the coverage of the last three resulted programs, newest first. | Shared; two columns on wide web. |
| L3 list space | Subtitle and caveat scroll with the list; status chips sit in one horizontal row. The fixed phone header ends at ~175 px instead of ~250 px. | Shared. |
| L4 action labels | Kuponu incele, Fikstürü incele (no plan yet), Sonuç takibini aç, Sonuçları incele, Programı incele. | Shared. |
| D1 phone coupon | `TotoCouponList`: one 48 px row per match with the desktop grid's encoding (main filled, coverage outlined, actual ringed) and a result stripe; a row opens details, the model-confidence caveat and the Bilyoner link. | Android and narrow web; wide web keeps `TotoCouponGrid` (platform exception unchanged). |
| D2 lifecycle overview | Active: kolon, maliyet, first kickoff and structure, with the Bilyoner action directly below. Waiting: settled, coverage, main hits and ceiling once, bar with colour key, next match. Resulted: final x/15, kolon, maliyet, prize; no play action. Error: previous generic overview. The separate results card was folded into the overview so each count appears once. | Shared; desktop summary column. |
| D3 one vocabulary | Kapsama (metric), Kapsamada (covered row), Kapsam dışı (miss), Ana isabet (main hit). Status labels ANA İSABET / KAPSAMADA / KAPSAM DIŞI / BEKLİYOR. | Shared, both coupon layouts. |
| D4 model confidence | “Model güveni … kazanma olasılığı değildir” in phone row details; desktop column “Model güveni” with the same caveat line. No model value changed. | Both. |
| D5 filters | No result filters before any match settles; chips with zero count hidden unless selected. | Shared. |

A count larger than the match total (an inconsistent payload, seen only in the
mock dashboard program 350) is shown bare instead of as a false fraction.
Real BFF counts come from the same predictions, so the fraction holds there.

No BFF, SAP, Toto model, prediction, coupon, KURA, result or contract
behaviour changed. Hits are not shown as winnings, no best-column or prize
tier is inferred, and no cost currency is assumed.

## Validation

The canonical Mobile quality gate passed on the final combined source:
TypeScript, ESLint, 752 client tests, 33 tooling tests and the brand check.
Five new focused tests in `toto-lifecycle.test.ts` cover Istanbul kickoff
parsing, the non-breaking countdown, waiting progress with the coverage
ceiling and earliest open match, the unplanned fixture-only path, structure,
date span, trend, action labels and the false-fraction guard. Expo Doctor was
not re-run; no dependency or native configuration changed.

Browser review on the actual exported screens caught and fixed: the
horizontal chip row collapsing to half height on web, “Kuponu incele” on a
program without a coupon, a countdown splitting across lines, a five-line
caveat, the mock “10/3” fraction, and React Native Web dropping the
expanded state (explicit `aria-expanded` now on coupon rows and on the Jinx
Dayanaklar toggle).

| Exported-app scenario (synthetic, 15-match programs) | Observed result |
| --- | --- |
| Programlar, 390/1440 px, dark/light | Unplanned, active, waiting and resulted cards show their lifecycle facts; three resulted programs as compact rows with trend 12 · 10 · 12. |
| Active detail, 390 px | 1,422 px (was 3,325); first match row at 633 px; no filters; Bilyoner action under the overview. |
| Waiting detail | 9/15 sonuçlandı, 7 kapsama, 5 ana isabet, 13/15 en fazla kapsama; “Sonuç bekleniyor: …”; chips 15/6/7/2; secondary play action at the bottom. |
| Resulted detail | 12/15 kapsama, 9/15 ana isabet, prize row; chips Tümü/Kapsamada/Kapsam dışı only; no play action. |
| Overflow, 320/390 px | Document width equals the viewport on the list and all four details; only the intentional chip scroller extends past the edge. |
| Keyboard | Focused coupon row opens with Enter; `aria-expanded` true; 44 px Bilyoner link inside. |
| Desktop detail | Summary column plus coupon grid with “Model güveni” and unified status labels. |

Screenshots and the sweep record are in `docs/evidence/TOTO_UX_2026-10-31/`.
Some pane captures at phone width came out zoomed; those were discarded and
geometry was verified from the DOM instead.

Final Android preview JS/Hermes export and canonical edge web export of the
combined candidate passed, including secret scans (0 findings).

| Local artifact (combined NXT-OBS-235 + 238 candidate) | SHA-256 |
| --- | --- |
| Android preview Hermes bundle | `6A9AB7F2CA2277DAF834166E7D03C20E61DB0310517909A27A85F7CB26E711A3` |
| Verified edge web asset tree | `79AE50BFA671AB02B15F46A67DCAEB79468017C793F9875BF053DBB6EC3578FA` |

These final hashes include the NXT-OBS-239 display facts below (757 client and
33 tooling tests). The earlier pre-backend combined build (`1FDF557C…ACB3C6` /
`B0F7A19F…42A392`) is superseded.

These describe dirty local source on `eff88f2`, not a clean pushed release
pair. No connected Android device was available; TalkBack, native touch and
representative-device performance are unobserved.

## SAP display facts (NXT-OBS-239, added the same day)

The owner then asked to continue with the backend items. Read-only ARC-1
scoping showed four of them already computed in SAP and served by the live
`ZBET_UI_TOTO` service, so they were exposed through the Mobile BFF behind the
opt-in `X-BTB-Toto-Display: btb-toto-display.v1` header (contract:
`zbet-cap/docs/TOTO_DISPLAY_V1_2026-10-31.md`). No SAP object changed.

| Fact | On screen |
| --- | --- |
| Coupon close (`payin_end_at`) | “Kupon kapanışı … · 1 gün sonra” replaces the first-kickoff stand-in on active cards and details. |
| Cost unit (`currency_code`) | Cost shows as ₺21.870; the “maliyet birimi belirtilmiyor” caveat disappears when the unit is known. |
| Best column (`max_hit_count`) | “Kupon tam sistem: en iyi kolon 12/15 doğru.” only when the BFF verified the full system. |
| Prize tiers (`Payouts`) | Resulted detail lists 15–12 bilen with winners, prize per column and the coupon's winning columns, paying tiers in gold, with a theoretical caveat. |

The client accepts the fields before any BFF sends them (schema defaults to
null) and sends the header on both Toto reads; browser checks confirmed the
header and every rendering above. Champion vs challenger display stays
deferred: challenger coupons are not in SAP.

NXT-OBS-238 is locally implemented and validated; it is not marked delivered.
Commit/push, signing/private APK delivery and companion web publication remain
separate approvals for the combined candidate. No recurring task was created.
