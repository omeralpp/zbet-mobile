# TASK-0124 phone screenshot follow-up

The owner supplied seven Giugliano–Inter Milano U23 and East Bengal–Al Shorta
phone screenshots, then requested continuation of the approved pilot delivery.
This is the same TASK-0124 Mobile presentation batch. The screenshots establish
visible presentation and selected-event states; they do not establish continuous
finger dragging, TalkBack acceptance or the installed artifact checksum.

## Findings and changes

Opposing goals in one marker previously inherited the first goal's color.
Groups now retain distinct home/away goal symbols; unknown-side goals are neutral.
Each expanded choice includes the known team name. Group captions show the
source minute range instead of implying that every member happened at one point.
Opening the choices hides the duplicate horizontal event strip.

The selected goal readout includes its event score. A separate line identifies
the linked graph capture's minute and score, or explicitly says no matching graph
capture exists. This uses existing exact associations; no score, timestamp,
pressure or source join is invented. The current match header keeps its own score.

The Giugliano screenshots show 0–2 in one frame and a 0–3 goal in another. A
later bounded actual read returns final 0–4 with goals 76′/0–1, 84′/0–2 and two
90+ goals/0–3 and 0–4. It does not reconstruct the earlier atomic frame or prove
the cause of that apparent mismatch. East Bengal later finished 2–3; its source
goals and historical selected scores remain separate from that final score.
These reads used the existing BFF and a bounded direct OData lookup, not SAP MCP.

The Jinx screenshot displays the existing factual fallback after commentary was
unavailable. It does not establish a scoring or fallback defect. Producer capture
is still disabled, so unavailable interval pressure remains expected.

## Verification and delivery status

Final TypeScript/lint, 605 Mobile tests, 13 tooling tests and brand checks pass.
Doctor 20/20 is reused because package/lock and native inputs are unchanged.
The actual chart renders recorded DTOs at 390 and 320 pixels without horizontal
overflow: opposing team colors, independent choices, event/capture readout and
the absent duplicate strip are verified. Late Giugliano goals retain all four
source scores and explicitly lack a linked capture when the DTO has none.

Android API35/x86_64 uses the existing debug binary with Expo reload. Horizontal
scrubbing/release persistence, mixed-event minute range, individual neutral-goal
capture/readout, duplicate-strip removal, return to latest and vertical chart
scrolling all pass. These are six synthetic Android checks, not physical release
installation or TalkBack acceptance.

## Corrective APK and private delivery

- APK: `btb-mobile-next-arm64-task0124-phonefix.apk`, **54,417,913 bytes**.
- Local SHA-256: `AEBA58B6062311446CADA4B53A2A0B05DBF16C875C35DF45E05F5A035184C80B`.
- ARM64 release build succeeds in 6m27s; APK Signature V2 uses the existing pilot
  certificate `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
- Package `com.btb.mobile.next`; pilot auth, mocks off, API
  `https://api.surklase.com`, Match Journey/Team Form/Jinx all LIVE. Embedded
  configuration, expected pilot credential and new UX strings are verified.
  Server credentials and sensitive files are absent from the APK; 273 frozen
  source/log files pass the separate secret review, including decoded credentials.
- [Private owner download](https://drive.google.com/file/d/14g3O89mGRv1W0YZ05lieg-v25DXJuKqB/view?usp=drivesdk),
  file ID `14g3O89mGRv1W0YZ05lieg-v25DXJuKqB`, in the existing designated folder
  `18poabE-hnuRNKTEYSR3knALfU9t_otqE`. Drive readback confirms owner-only
  permissions and exact size. Earlier raw-download attempts failed; a later
  authenticated retry succeeds and its bytes/SHA-256 match the local APK exactly.
  The service limitation is resolved; no rebuild or reupload was needed.

The 271 frozen inputs match after the build, and the dependency/native inputs
are unchanged. All 13 recorded BFF source hashes match the validated running
runtime; its 568 tests/build and 13 local/13 public schema checks are reused.
Temporary Metro/browser servers and the owned emulator are stopped; the preview
tab is closed and viewport reset. Build staging cleanup succeeds.

Evidence: workspace `.codex-artifacts/task0124-phone-review-2026-10-13/`, including
bounded source reviews, native screenshots and 271 frozen app/build/asset inputs.
Only four chart/helper/test files differ from the first delivered TASK-0124 APK.
Mobile HEAD `935e576` and CAP HEAD `b2b5667` remain unchanged with dirty working
tree inputs. Exact receipts include `apk-verification.json`, `apk-signature.txt`,
`input-and-secret-review.json`, `ui-verification.json`, `native-smoke.json` and
`drive-delivery.json`. APK bytes remain ignored and no bearer URL is recorded.
No BFF restart, SAP write, model change, commit/push or producer acceptance occurs.
TASK-0121 remains the owner-accepted rollback; the first TASK-0124 APK is retained.

Five later Al Seeb owner screenshots establish physical presentation of the
corrective readout/group UI. Continued dragging and TalkBack remain unmeasured.
Exact source review, xG coverage limitation and successful Drive checksum retry:
[Al Seeb phone evidence](TASK_0124_AL_SEEB_PHONE_EVIDENCE_2026_10_13.md).
