# TASK-0124 mobile clarity delivery

Checkpoint: October 14 local time; artifact built on October 13 UTC.
The owner approved continued development, pilot APK creation and private Drive
delivery. The prior corrective APK and accepted TASK-0121 rollback are preserved.

## Delivered changes

- Both reported xG values equal to zero now display `—`, with an explicit
  coverage explanation. This DTO cannot prove measured zero. Nonzero reported
  xG remains visible with its source-coverage/time limitation.
- A retained selection without a current quote reads `KAYITLI BTB SEÇİMİ`
  (`KAYITLI SEÇİM` in the list), with `oran yok`. Missing price alone does not
  establish that the market is closed.
- The timeline marks the decision selected on screen as `SEÇİLİ`.
- The previous Match Path drag, grouped-event, icon, score-provenance and
  48dp-target improvements remain packaged.

## Exact delivery

[Private ARM64 APK](https://drive.google.com/file/d/19u7Kmk4kM53tIqeuy-5gCq1KfCSWt4Rh/view?usp=drivesdk)

- File: `btb-mobile-next-arm64-task0124-closeout.apk` · 54,418,649 bytes.
- SHA-256: `7D2096325F7E386F358903CE37B20052CD59ACD8905ED58752282244323605B6`.
- ABI `arm64-v8a`; signature V2; existing pilot certificate
  `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
- API `https://api.surklase.com`; pilot authentication; mocks false;
  Match Journey, Team Form and Jinx LIVE.
- Drive metadata confirms the private owner-only folder/file and exact size.
  Authenticated byte download matches the local SHA-256.

## Verification and remaining acceptance

605 Mobile and 13 tooling checks pass. The 271 build inputs stayed frozen;
five differ from the prior phone fix. Android previews verify reported and
unknown xG, and the recorded-selection wording. The zero-xG preview used a
temporary synthetic data override, restored byte-for-byte before the build.
The gesture implementation and dependencies did not change: prior native
gesture checks and Doctor 20/20 remain applicable. Signature, ABI, packaged UX
markers, contract/config and source/log/server-secret checks pass.

Evidence: `.codex-artifacts/plan-closeout-2026-10-13/`, including
`frozen-build-inputs.json`, `input-and-secret-review.json`, `apk-verification.json`,
`apk-signature.txt`, Android images and `drive-delivery.json`.
The BFF's 13 validated source hashes are unchanged; PID 18920 remains active.
No BFF restart, capture-policy enablement, model promotion or Git publication
was performed by this delivery.

Physical installation of this exact APK, continuous finger-drag and TalkBack
acceptance remain unverified. Earlier Al Seeb photographs establish presentation
only. Producer/full-capture acceptance still gates available interval pressure;
the economic model gates are unchanged. No additional owner-supplied API is needed.
