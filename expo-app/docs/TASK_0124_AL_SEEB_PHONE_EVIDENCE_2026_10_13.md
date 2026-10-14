# TASK-0124 Al Seeb phone evidence

The owner supplied five Al Seeb–AL Hussein Irbid phone screenshots on October 13.
Physical presentation of the corrective UX is now evidenced: 42′ goal/0–1 with
43′ graph capture/0–1, 82′ goal/0–3 with 82′ graph capture/0–3, the 42′–55′
three-event group, team names, separate group choices and the restored event
strip when an individual late goal is selected. A static image does not prove
continuous dragging, TalkBack acceptance or the installed APK checksum.

## Bounded source review

Match key `2026-10-13:3204313:19:00:00`. Actual public Mobile detail, live-context,
journey and Super DTO reads pass; the identity/current row lookup uses the
existing BFF direct OData transport, **not SAP MCP evidence**. The later read is
FINISHED 0–3. Its goals are 42′/0–1, 55′/0–2 and 82′/0–3. The journey retains
43′/0–1 and 82′/0–3, agreeing with the phone readouts. The pool reset at 46′
changes the reference from the first-half pool (227 matches) to the second-half
pool conditional on 0–1 (38 matches). The first pool has 38 rows for 0–1.

The saved 88′ `Ms35a`, one-star, `ODDS_CHANGED` decision retains selection rate
1.13 and later settles WON at 0–3. The 82′ `Kgvar` decision later settles LOST.
Current rates are null. BFF representative selection is deliberately retained
from non-void Super history, while current price comes from the current rate map.
This explains coexistence of a stored selection and missing current price; it
does not reconstruct whether a quote was available at 88′ or establish stale
odds influencing that historical calculation. No algorithm defect is proved.

The source row stores both xG fields as 0.00. The legacy numeric DTO has no
statistics-specific coverage flag and also defaults absent values to zero.
The existing Jinx evidence adapter explicitly treats two zero xG values as
unknown coverage. Therefore this screen does not establish measured zero chance
quality. Recorded follow-up: make xG availability clear without deriving its
coverage from the unrelated pressure-interval flag or guessing missing values.

Recent pressure is UNAVAILABLE/PRODUCER_NOT_ACCEPTED. The phone's empty pressure
lane is consistent with the disabled producer, not a measured quiet interval.

## Artifact and remaining acceptance

The corrective APK's authenticated Drive download now succeeds and its
54,417,913 bytes match SHA-256
`AEBA58B6062311446CADA4B53A2A0B05DBF16C875C35DF45E05F5A035184C80B` exactly.
This closes the earlier download-service limitation; no rebuild or reupload was
needed. File `14g3O89mGRv1W0YZ05lieg-v25DXJuKqB` and private permissions are
unchanged. Exact artifact: [phone follow-up](TASK_0124_PHONE_FOLLOWUP_2026_10_13.md).

App/BFF/model source is unchanged in this review. Reuse the passed 605+13 checks,
six synthetic Android interactions, signed build and frozen input receipts.
Phone interaction/TalkBack acceptance and producer/full-capture acceptance remain
separate open gates. Evidence: workspace
`.codex-artifacts/task0124-al-seeb-phone-2026-10-13/source-review.json` and
the updated preceding `drive-delivery.json`. Owner images remain preserved in
attachment folder `87b67b7c-8f0e-4fb0-a9ed-a0e315ab216e`.
