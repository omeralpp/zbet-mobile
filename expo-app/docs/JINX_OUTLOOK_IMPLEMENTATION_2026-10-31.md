# Jinx decision outlook — 31 October 2026

Owner: BTB Mobile Next - Aktif. NXT-OBS-235 (follow-ups NXT-OBS-236/237).
Status: LOCAL IMPLEMENTATION AND VALIDATION COMPLETE / NOT COMMITTED OR RELEASED.

The owner shared a web screenshot of the match-detail Jinx card with no
published decision and `RED_CARD_UNKNOWN`, asked for an analysis of its
function and decision point, and then approved all recommendations
(“I approve all your recommendation please implement it correctly”).
This batch implements the client-only group on the shared Android/web
component. The accepted `6fc5d05` Android/web pair stays installed/published;
this is a separate, uncommitted candidate based on `eff88f2`.

## Findings that drove the change

| Finding | Source evidence |
| --- | --- |
| The no-decision card said the same thing three times: hero label, Jinx pill and Jinx speech. | `MatchDetailView.tsx` hero eyebrow + `rebuildPresentation`; previous `RebuildJinxCard` used the same function for its pill and text. |
| “Kart verisi bekleniyor” promised data some providers never send. | `RED_CARD_UNKNOWN` = no red-card counter on either side (`BTB Logs/model_lab/reports/BTB_RB1_RED_UNKNOWN_178_LOCAL_2026-10-22.md`); 2,555 such cycles in the 30 October review. |
| The largest control was a manual refresh of a record that already refreshes every 10 s. | `rebuildMatchQuery` `refetchInterval: 10_000`; Android pull-to-refresh and the web shell refresh also cover `rebuildMatch` and `analysisContext`. |
| Dayanaklar listed up to 19 candidates with mostly the same reason and three disclaimers. | Previous candidate map in `RebuildJinxCard`. |
| No next step was offered. | — |

## Changes

| Item | Result | Surface coverage |
| --- | --- | --- |
| Outlook pill | The pill answers “act now, keep watching, or expect nothing more”: GÜNCEL SEÇİM, KARAR GELEBİLİR (amber while data is stale), KARAR BEKLENMİYOR, YENİLENEMEDİ, OKUNUYOR. A test rejects any pill contained in, or containing, the hero label for ten status/reason pairs. The post-decision reading title (NXT-OBS-231) moves into the speech bubble as a lead line, warning-coloured when the reading warns. | Shared Android/web. |
| Honest red-card copy | Jinx: “Sağlayıcı bu maç için kırmızı kart sayısını göndermiyor. Bu veri gelmezse BTB bu maçta öneri üretmez.” plus “Skor ve baskı izlenmeye devam ediyor.” Hero label KART VERİSİ YOK; candidate reason and post-decision reading use the same wording. | Shared; also changes the hero and the Super/Live card eyebrow wording. |
| Blocker counts | While watching with no record, Jinx lists up to three rejection reasons with market counts, then “Diğer nedenler” only when two or more remain. It names no market, so a rejected candidate never reads as a tip. A single reason equal to the main sentence is not repeated. | Shared. |
| Refresh demoted | Header “Yenile” removed. Footer shows the backend `asOf` time with “otomatik güncellenir”. “Yeniden dene” appears only after a failed read and refetches the record and match context. | Shared; manual refresh remains through Android pull-to-refresh and the web shell refresh. |
| Grouped Dayanaklar | Chosen and eligible markets stay individual with facts. Rejected markets are grouped by reason with an ELENDİ · N pill; facts are listed only for markets the evaluation measured, unmeasured ones as one name line. One disclaimer line replaces three. | Shared. |
| Compact card | When nothing more is expected and no record exists (red card unknown, finished, unplayed, model not enabled), the card becomes one compact row (sentence, detail, “HH:MM:SS · otomatik” and a “Canlı maçlar” link), moving Maçın yolu up. | Shared; `router.navigate("/live")` on both. |

Deliberate deviations from the review mockup, both to avoid the duplication
the review criticised:

- In the current-selection state the mockup showed “Kararı aç” in the Jinx
  footer. The hero directly above already offers “Karar kaydını aç” for that
  record, so Jinx keeps “Dayanakları gör”.
- The mockup's watching pill “İzleniyor · karar yok” became KARAR GELEBİLİR.
  Browser review showed the hero already says MAÇ İZLENİYOR for the same
  state, and the first “İZLENİYOR” pill echoed it.

No BFF, SAP, model, star, result, contract or notification behaviour changed.
The backend `jinx.summary` field stays unused, as before.

## Validation

The canonical Mobile quality gate passed on the final source: TypeScript,
ESLint, 747 client tests, 33 tooling tests and the brand check. Nine new
focused tests in `jinx-outlook.test.ts` cover the outlook for every state,
honest red-card wording, the hero-echo rule over ten status/reason pairs,
blocker counts that name no market, the single-reason and leftover-reason
rules, and grouped evidence with facts only where measured. Existing
reading/presentation tests were updated for the new wording. Expo Doctor was
not re-run; no dependency or native configuration changed.

Browser review on the actual exported screen caught three issues, all fixed
and re-checked before the final export:

- “Diğer nedenler · 1 pazar” hid a single leftover reason; it is now named.
- The first watching pill “İZLENİYOR” echoed the hero's MAÇ İZLENİYOR.
- “Canlı maçlar” as `role=link` did not activate with Enter on web (React
  Native Web needs an href for that); it now uses `role=button` like the
  other navigation actions in the file, and Enter opens `/live`.

| Exported-app scenario (synthetic) | Observed result |
| --- | --- |
| 9 states × 1440/320 px | Correct pill/first line in all 18; no horizontal overflow; no header Yenile; Yeniden dene only on error; Canlı maçlar only in compact states. |
| Red card unknown, 390 px dark/light | Compact card: KARAR BEKLENMİYOR, honest sentence, detail, “HH:MM:SS · otomatik” and Canlı maçlar on one row; Maçın yolu moves up. |
| Watching, 390 px dark/light | Hero MAÇ İZLENİYOR, Jinx KARAR GELEBİLİR; four named reasons with 9/6/3/1 market counts. |
| Dayanaklar | Rejected markets grouped by reason with ELENDİ · N; measured facts per market, unmeasured names on one line. |
| Read failure, 390 px light | YENİLENEMEDİ, “— · yenilenemedi”; Enter on Yeniden dene re-read the record and match context. |
| Keyboard Canlı maçlar | Focused 44 px target; Enter navigates to `/live`. |
| Network | 0 Jinx LLM/explainer requests. 400s are the harness's decision-context v3→v2 negotiation; 503s are the intended failure case. |

Screenshots and the sweep record are in `docs/evidence/JINX_OUTLOOK_2026-10-31/`.
The harness blocks external fetches and non-read methods and sends no real
SAP/BFF request. It renders the real exported client screen, not a mockup.

Final Android preview JS/Hermes export and canonical edge web export passed,
including secret scans (0 findings). There is no new signed APK.

| Local artifact | SHA-256 |
| --- | --- |
| Android preview Hermes bundle | `B2C95C14729D2065FC300BABF2A38D65EE85C1D5FD9B5414B500ADD0F2C3C810` |
| Verified edge web asset tree | `DEF8828B7309BE0E5488719497A028EE245AAA8701B20857642C12E6315BB034` |

These describe dirty local candidate source on `eff88f2`, not a clean pushed
release pair. They are superseded by the combined NXT-OBS-235 + NXT-OBS-238
candidate (owner asked to publish both together); its final hashes are in
[the Toto implementation record](TOTO_UX_IMPLEMENTATION_2026-10-31.md). The
combined build also adds an explicit web `aria-expanded` to the Jinx
Dayanaklar toggle. Tool logs, the harness and source hashes are retained under
`.codex-artifacts/jinx-outlook-20261031/`; the published `dist-web` was not
touched.

No connected Android device was available. TalkBack, font scaling and
representative-device performance are unobserved; phone-width browser checks
do not substitute for native acceptance. No UX score is claimed.

## Follow-ups that need other gates

| Observation | Why it is not in this batch |
| --- | --- |
| NXT-OBS-236 “Karar çıkınca haber ver” | Needs a BFF subscription endpoint, a producer event for a newly published decision and Firebase delivery (web needs a substitute). Blocked by NXT-OBS-074; each external change keeps its own approval. |
| NXT-OBS-237 thresholds / league red-card knowledge | The score threshold lives in the sealed RB1 policy and must come from SAP, not be hard-coded; league-level red-card knowledge is backend work. Both belong to BTB - Aktif first, then a Mobile contract change. |

Not done by recommendation: highlighting a “closest candidate” and LLM
commentary (withdrawn 27 October).

NXT-OBS-235 is locally implemented and validated; it is not marked delivered.
Stage/commit/push, signing/private APK delivery and companion web publication
remain separate approvals. Any later release must rebuild both surfaces from
one clean pushed commit, verify private APK installation before web
publication, retain the previous pair and obtain both owner smoke acceptances.
No recurring observation task was created.
