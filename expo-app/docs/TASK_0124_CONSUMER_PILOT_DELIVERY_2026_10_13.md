# TASK-0124 consumer pilot APK delivery

The owner approved BFF integration, Android validation, APK creation and private
Drive delivery on October 13. The Match Path UX is delivered in this pilot APK:
horizontal scrubbing, a persistent selected-minute readout, event icons and
individual choices within groups. A native-only gesture activation failure was
reproduced and fixed with UI worklets and RN state scheduling before the build.

The later owner screenshot corrections and latest APK are in
[phone follow-up](TASK_0124_PHONE_FOLLOWUP_2026_10_13.md). The artifact and matching
download checksum below refer to this first delivery, not the newer follow-up.

## Artifact and private delivery

- APK: `btb-mobile-next-arm64-task0124.apk`, **54,416,873 bytes**.
- SHA-256: `10E0266944A9DC981E99490BBA7B799FB84BF5AC27C81DB46C94EA0BBAAB6CBC`.
- ARM64 only; APK Signature Scheme V2 verified. Existing pilot certificate:
  `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
- Package remains `com.btb.mobile.next`; pilot auth, mocks off, API
  `https://api.surklase.com`, Match Journey/Team Form/Jinx all LIVE.
- Packaged Match Path UX and decision-context headers verified from APK bytes;
  expected pilot credential matches, server credentials and sensitive files absent.
- [Private owner download](https://drive.google.com/file/d/1i_8iAxgLzUi_Ks-Nt-qoqArhw7E67usS/view?usp=drivesdk).
  File ID `1i_8iAxgLzUi_Ks-Nt-qoqArhw7E67usS`, designated folder
  `18poabE-hnuRNKTEYSR3knALfU9t_otqE`. Metadata confirms owner-only permissions
  and exact size. Authenticated download SHA-256 matches the local APK exactly.

## Verification and runtime

Final TypeScript/lint, 603 Mobile tests, 13 tooling tests and brand checks pass;
fresh Doctor is 20/20. Eight synthetic Android API35/x86_64 interaction checks
pass, including scrub/release, separate mixed-event choices, event-origin drag
destination, latest return and vertical page scrolling. The final ARM64 release
build succeeds. A targeted build-tool patch removes the critical `shell-quote`
advisory; 11 moderate/19 high dependency findings remain recorded, so no clean
audit is claimed. Android UI changes introduce no new server or model inputs.

Mobile HEAD `935e576`; CAP HEAD `b2b5667`, both with recorded working-tree inputs.
No commit/push occurred. All 271 frozen app/build/asset inputs are recorded.
The BFF is active on PID 18920, loopback port 4004 behind the existing public
route. Full BFF tests/build and 13 local/13 public actual Mobile-schema reads
pass; older clients retain their earlier response shapes. Temporary BFF preflight
on port 4006 is stopped; build staging cleanup succeeds.

This is a **consumer-only pilot**. Producer/native/full-input capture acceptance
remains false, interval pressure explicitly unavailable and collection start
null. P4.5 weights/stars, M3/M10 status and economic promotion gates are unchanged.
No SAP write, Cloudflare publication or Firebase configuration change occurred.
TASK-0121 APK and archived `18709ae` runtime remain accepted rollback.

Owner phone installation/UX acceptance and TalkBack checks remain unmeasured.
TASK-0124 stays open for that feedback and producer/capture acceptance; APK
delivery does not close those gates. No additional API/field is requested.

Evidence: workspace `.codex-artifacts/task0124-delivery-2026-10-13/`, including
`native-smoke.json`, native screenshots, `frozen-build-inputs.json`,
`runtime-active.json`, local/public contract receipts, `apk-signature.txt`,
`apk-verification.json` and `drive-delivery.json`. APK bytes stay ignored under
Expo `.codex-artifacts/`; receipts contain no credential values or bearer URLs.
