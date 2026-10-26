# Combined client UX release — 2026-10-26

Scope: NXT-OBS-223 direct pilot entry, NXT-OBS-224 Summary UX, NXT-OBS-225 Live UX
and the web focused-resize repair. Owner: BTB Mobile Next - Aktif.
Status: LOCAL_VALIDATED / OWNER_APPROVED_RELEASE_PREPARATION.

The owner requested removal of the pilot welcome screen followed by publication
of all these changes. Android and web publication intent is explicit. This does
not create an installation receipt or complete the separate Git/signing gates.
The owner subsequently explicitly approved the presented combined preview,
scoped `zbet-mobile` and `btb-codex` commit/push, ARM64 APK build/signing and
private delivery on 26 October. The existing Android/web publication approval
remains in force. Actual APK installation and both smoke receipts remain due
only after the corresponding artifacts have been delivered.

## Reviewable candidate

Pilot bootstrap now opens the app directly after its existing launch animation.
The former entry button established no identity; the pilot API credential checks
are unchanged. Preview stays direct, web retains Cloudflare Access and direct
edge entry, and OAuth still requires its own session bootstrap. Existing OAuth
sign-in and error flows are retained. Both surfaces include the accepted Summary
improvements and the locally validated Live improvements.

Checks: type/lint, 669 client tests, 32 tooling tests and brand checks pass.
The pilot bootstrap regression test now expects direct entry while checking the
separate OAuth bootstrap. A temporary synthetic preview mounted the real
AuthProvider in pilot mode: Summary appeared, with zero pilot-entry buttons.
No pilot credential was used or copied for that preview. The test route is
removed. Android JS bundle and verified edge web export pass; web secret scan
passed for 4 scannable files. Prior Doctor 20/20 remains applicable to unchanged
dependencies/native configuration.

Candidate outputs (not release artifacts):
`expo-app/.codex-artifacts/combined-client-ux-20261026/android` and `web`.
They were built from uncommitted source. Native device is not connected, and no
new native installation, signature, private delivery or paired smoke is claimed.

![Direct pilot bootstrap, synthetic phone preview](evidence/COMBINED_CLIENT_UX_2026-10-26/direct-pilot-phone.jpg)

![Direct pilot bootstrap, synthetic desktop preview](evidence/COMBINED_CLIENT_UX_2026-10-26/direct-pilot-desktop.jpg)

See [Summary review](SUMMARY_UX_REVIEW_2026-10-26.md) and
[Live review, comparisons and resize proof](LIVE_UX_REVIEW_2026-10-26.md).

## Exact remaining sequence

1. Accept the combined preview and explicitly approve scoped commit/push in
   `zbet-mobile` (client, tests, documentation and retained preview evidence)
   and `btb-codex` (TASK-0180's scoped register record), plus final ARM64 APK
   build/signing and owner-only delivery. No `zbet-cap` change is required.
2. Recheck Git status/diff, commit only this batch, push, and freeze the clean
   client SHA. Rebuild and verify web from that SHA, then build/sign a uniquely
   named APK with `build-pilot-apk.ps1` from the same source. Verify the pair
   with `client-release.mjs` before either delivery.
3. Deliver to the existing private owner-only Drive folder and verify the
   downloaded bytes, signature and ABI. Obtain actual owner installation proof.
4. After installation, run the publisher dry run, publish the companion web
   under the owner's publication approval, and verify local/public gates.
5. Record actual Android and published-web smokes; only matching receipts can
   complete the coordinated batch. TASK-0180 stays open until that work closes.

The previous completed pair remains the recovery baseline: client source
`57e27c219530fa449dd66f769cdff613d94d7a2b`, APK `F0828E2B1948…`, web tree
`CED99092AA3B…`, web release `20261025T124608Z-57e27c2`. Exact prior receipts are
in the active handoff; prior artifacts and runtime have not been replaced.

Approval sources: workspace `AGENTS.md` Git Operations and Mobile hard rules;
`COORDINATED_CLIENT_RELEASE.md` requires accepted web preview before final APK
and actual installation before companion web publication. No production,
model, SAP, BFF restart or credential change is part of this candidate.
