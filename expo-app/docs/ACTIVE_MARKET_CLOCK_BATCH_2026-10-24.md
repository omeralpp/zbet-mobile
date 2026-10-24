# Active last selections and numeric clocks — local batch

Subsequent delivery: COMPLETE on 24 October; see
[paired delivery and native activation](ACTIVE_MARKET_CLOCK_DELIVERY_2026-10-24.md).
The local validation checkpoint below is retained as originally reviewed.

Owner instruction, 24 October 2026: Overview's tracked live matches and Live's
star filter use the latest selection's published stars and current supplied
odds while its market remains open. Do not remove it after 15 seconds. Display
bare `45+` / `90+` as `45` / `90`.

## Result

- Shared Android/web `rebuildHero` uses pending publication + open market + a
  supplied price above one. Wall-clock age no longer hides that price or removes
  a published selection from cards, star counts or filters. Quote timestamps
  remain unchanged and future timestamps, failed reads, duplicate/wrong-fixture
  packets, closed/decided markets and resolved outcomes remain excluded.
- Overview's **Takipteki canlı maçlar** uses the same star threshold as Live,
  sorted by the frozen published stars, with up to three featured rows. An empty
  filtered set has an explicit empty state; it does not show unrelated matches
  as active selections. Its link preserves the selected threshold. Upcoming
  fixtures remain available when there are no live matches.
- BFF opt-in `X-BTB-Selection-Display: btb-selection-display.v2` supplies nullable
  native `marketOpen` on current-cycle quotes and detail candidates. The quote's
  open/current-response/context evidence and the native undecided-outcome flag
  establish this state independently of model admission. List quotes use
  `btb-market-quotes.v2`; v1/absent-header payload shapes are preserved. No
  evaluator, publication, star calculation, model expiry or learning rule changed.
- BFF and client render numeric clock labels: `45+ → 45`, `90+ → 90`,
  `45+2 → 47`, `90+4 → 94`. Unknown clocks remain unknown; extra time and
  penalty phase labels are retained.

## SAP source finding and bounded patch

Direct ADT/OData **fallback**, not SAP MCP object evidence: active runtime and
state sources matched the local baseline. OData metadata declares `elapsed`
`Edm.String`, length 5; local DDIC uses `ZBET_DE_ELAPSED` / `CHAR5`.
The active model parser rejects bare plus signs, and the runtime status
projection called that parser directly, leaving the displayed elapsed empty.
This confirms a source path capable of producing the dash; the exact original
payload behind the owner's historical screenshots is still unavailable.

Local `ZBET_CL_RB_RUNTIME=>status` now normalizes bare 45+/90+ for status display
and projects a numeric string. Explicit added minutes retain their sum. The
original provider JSON still goes unchanged to the model parser; a bare plus
does not become admissible model evidence. No DDIC/CDS or model parser changed.
The new ABAP unit case covers bare plus, spacing/prime, explicit added minutes,
malformed input and the unchanged model rejection.

Read-back SHA256 before local patch:

- Runtime main: `BE5A0229397D4981B94D6F364004651929253632065F4B79C896E29F6BDDEF88`
- State main: `5B2EA3F1AC375A5CC2A69B46426CF82487A9840F4F85C947F9FDF078D91AD532`

## Validation and limits

- Core Mobile gate passed: typecheck, lint, client/tooling tests, brand checks
  and Expo Doctor. Added contract test subsequently passed (7 in that file).
- BFF: **728 tests passed**; `cds build --production` passed.
- Changed ABAP main/test includes: abaplint zero issues; SAP name check passed.
  Candidate SAP syntax, native ABAP Unit and activation have **not** run.
- Final Android Hermes bundle and verified **edge** web export passed. These
  are dirty local validation artifacts, not a release pair.
- Synthetic browser harness rendered the actual Overview and Live screens:
  quote age over five minutes stays active; 3+ includes the three-star record;
  4+ excludes it; closing the market, removing odds or settlement excludes it;
  desktop and 390×844 phone-width views show numeric 45/90. Browser error log
  empty. This is not a physical Android or published-client smoke.
- Temporary design-lab route restored byte-for-byte (SHA256
  `C2AF77118CC9ACE6BE977850498BD975879DA6176C1763CF8CC28BF60133DC15`)
  before final client bundles. Synthetic harness is only in ignored local
  artifacts. No runtime restart, SAP mutation, stage/commit/push, signing,
  distribution or web publication occurred.

Evidence: [validation manifest](evidence/ACTIVE_MARKET_CLOCK_LOCAL_2026-10-24/validation.json),
[Overview](evidence/ACTIVE_MARKET_CLOCK_LOCAL_2026-10-24/overview-open-desktop.png),
[phone Live](evidence/ACTIVE_MARKET_CLOCK_LOCAL_2026-10-24/live-open-phone-90.png).

## Next authorized boundary

The accepted released client pair remains `26f491c`; BFF runtime remains
`35ed90c8`, and SAP runtime is unchanged. This batch also retains the earlier
uncommitted chart feedback work; neither batch is published.

For separately approved DEV activation, recheck active source identity, apply
the bounded runtime main/test includes as one class change, then require native
syntax and ABAP Unit on `ZBET_CL_RB_RUNTIME` plus the unchanged clock parser's
tests. No DDIC activation is needed. BFF v2 must be available before delivery of
the new client. Commit/push, runtime/SAP changes and the coordinated signed APK
and web release retain their explicit gates. Rebuild both clients from the same
clean pushed commit; verify/install the private APK before web publication and
obtain both smoke receipts. A new live 45+/90+ observation is still needed after
source activation.
