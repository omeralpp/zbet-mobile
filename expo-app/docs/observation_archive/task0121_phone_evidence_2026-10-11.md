# TASK-0121 phone evidence — 2026-10-11

Owner supplied five phone screenshots for TSV Hartberg–Aus Lustenau, showing
Jinx V2 at 83′, 3–2, selection MsX2. All three reading blocks are visible and
readable; supporting venue form is separated from home-favouring overall form,
pressure and shots on target, coverage limits, and the one-away-goal score
condition. The limitation paragraph is long; screenshots alone do not establish
owner satisfaction with its writing quality. Explicit acceptance is requested.
This establishes physical V2 presentation, not a cryptographic readback of the
installed APK. No ADB device evidence is claimed.

Attachment folder:
`.codex-remote-attachments/01a126d5-242c-7f90-8294-7e069ab02cd8/8f5ab420-893d-48af-8ae0-a3d64c848640/`.
Files `4-1000139930.jpg` and `5-1000139931.jpg` show Jinx; files
`1-1000139935.jpg`, `2-1000139934.jpg`, `3-1000139933.jpg` show Match Path.

## Separate Match Path observation

The phone shows an 86′ goal event at 4–2 while the latest chart/state and Jinx
remain 83′, 3–2. The goal card correctly marks its pool/leader-score effect as
unmeasured; the earlier 11′ goal has a measured descriptive effect.

Authenticated existing BFF reads after the screenshots showed the current match
and journey catch up to 89′, 4–2. The provider timeline contains the 86′ home
goal at 4–2. The first retained 4–2 journey point is a GAP at 89′
(`CAPTURE_GAP`, captured 2026-10-11T14:15:57.816659Z), with no event effect.
Thus there is a real capture/feed timing difference, and no matched measured
capture for that event. This supports the unmeasured display; it does not prove
a goal-effect calculation bug or justify estimating a missing effect.

Evidence is existing authenticated BFF/direct transport plus local source
inspection, not SAP MCP object evidence. Separate reads are not atomic, and
response fetch time does not establish the source's own measurement time.
Ignored local packet: CAP `.codex-artifacts/task0121-hartberg-phone-readback.json`.
Fresh Jinx V2 also returned LIVE-origin 89′, 4–2 with the correct two-away-goal
X2 condition (`task0121-hartberg-jinx-readback.json`). The phone's one-goal
condition was appropriate for its displayed 83′, 3–2 snapshot.
No code, model, SAP or runtime change was made for this phone review.
