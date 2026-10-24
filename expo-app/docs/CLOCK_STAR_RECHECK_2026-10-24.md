# Clock and Live star-filter recheck — 2026-10-24

Read-only follow-up to NXT-OBS-210/212/213. No client, BFF or SAP change,
commit, deployment or release in this check.

- Owner's supplied Casertana–Bari screenshots show a dash while the provider
  shows 90+. The screenshot does not contain the original BFF clock payload.
- Client and BFF tests preserve `45+`, `90+`, `45+2` and `90+4`. A supplied
  clock with a null label displays `—`; valid added-time text does not.
- Current local BFF HTTP 200 acknowledged `match-clock.v1`. At
  `2026-10-24T09:06:01.791Z` (12:06 Istanbul), saved responses contained 159
  matches, one live (Melbourne V.–Mel. City, clock `24`, period `1H`), no
  published selection for that live match, and zero matches at every star
  threshold using the actual `matchLiveTab` function.
- The report retained yesterday's Ipswich publication with three stars.
  Yesterday's fixtures were absent from the current match response. A bounded
  direct OData read for Ipswich ID 3329053 / Casertana returned zero rows.
  This is direct-OData fallback evidence, **not SAP MCP object evidence**;
  no claim about their historical raw elapsed value is possible.
- Live's STAR view, card and counter use the shared publication records and
  playability rule. Thresholds are inclusive: three published stars enter
  1+/2+/3+, not 4+. Native current-star changes do not rewrite published stars.
  A pending selection requires a fresh usable quote (age at most 15 seconds).
  Closed, settled, unavailable or expired quotes exclude it; a fresh quote
  can restore it. Ordinary LIVE does not apply the star threshold.
- List and detail have separate quote queries. This and quote expiry can
  explain different active/pending labels, but the supplied historical
  screenshots alone do not establish which happened. The source-cadence
  concern under NXT-OBS-210 remains open.

Validation: 34 client clock/card/hero/tab tests and four BFF elapsed/clock tests
passed. Positive active-selection inclusion was tested with controlled fixtures;
the current live response offered no positive case for a real-device or
published-browser acceptance claim. Android and web share these client rules.

Local diagnostic responses and computed summary are under workspace
`.codex-artifacts/mobile-clock-star-check-20261024/`. Next evidence for the
dash is the same match's BFF clock payload captured while the provider shows
45+/90+, together with raw source elapsed/status. Existing formatting delivery
does not close this unconfirmed source/runtime observation.
