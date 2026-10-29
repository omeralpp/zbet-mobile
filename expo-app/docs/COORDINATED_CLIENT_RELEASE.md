# Coordinated Android and web releases

Owner rule, 2026-10-16. BTB Mobile Next releases Android and desktop web together.
Every release, including a platform-only change, uses one clean pushed
`zbet-mobile` commit and one batch identity. Platform exceptions describe the
intended UX difference; they never excuse omitting the companion artifact.
Shared client behavior and the Mobile BFF contract must remain compatible.

## Web review first (owner decision, 2026-10-23)

Prepare and show the web preview before spending time on the final APK build.
Wait for the owner's web acceptance before building/signing the APK; APK work
is the final artifact preparation step. Reuse the accepted client source for
both artifacts; a later functional change requires renewed web review.

A local development preview may use uncommitted source and must be labelled as
such. It is not a published release, paired verification or Android acceptance.
Commit/push, BFF restart, signing/distribution and Cloudflare publication retain
their explicit approvals. Final release verification and both smoke receipts
remain required. The existing publication tool still requires the verified APK
and installation receipt; web preview acceptance does not fabricate either.

## Preparation and authorization

1. Implement and test the change on both surfaces. Run the proportional core,
   Android bundle/device and verified web/browser checks; test BFF changes too.
2. After explicit commit/push approval, freeze the exact pushed client SHA.
   Build the verified web export and final signed physical-phone ARM64 APK
   from that SHA. Final APK creation/signing retains its existing approval.
   `web.mjs` writes `web-build-receipt.json`; `build-pilot-apk.ps1` requires it
   before Gradle and records the same source in `<apk>.config.json`.
3. Verify the pair before either publication or upload. From `expo-app`:

   ```powershell
   node scripts/web.mjs export
   # Run the separately approved final APK build after web verification.
   node scripts/client-release.mjs verify --apk <final.apk> --web-root dist-web --output <batch.json>
   ```

   Use a new APK artifact name; retain the last accepted APK/web pair. The
   verifier checks source SHA/tree, clean source, exact APK bytes/hash, ARM64,
   actual web asset hashes, pilot mode and shared LIVE feature modes. Mock,
   dirty, unstamped, edited or mismatched artifacts are refused. `PREPARED`
   means neither a publication approval nor a completed release.
4. Obtain explicit owner approval covering **both** Android delivery and web
   publication before either starts. One message can explicitly cover both.
   A request for only one surface is prepared as a coordinated pair and cannot
   proceed with the companion delivery unapproved. A policy change, a cutover
   command or an artifact manifest grants no Git, signing, distribution,
   Cloudflare/Firebase/SAP or production permission.

## Coordinated delivery

Delivery to an installed phone and publication on a server cannot be one atomic
transaction. Use this bounded sequence and report any interrupted batch as
**INCOMPLETE**, with the exact remaining action and recovery status:

1. Verify APK signature/ABI and the paired manifest. Upload to the existing
   owner-only Drive folder under the standing private-upload instruction;
   verify remote bytes/size and record the exact source/hash. Have the owner
   install that exact APK and record the installation evidence. No new app
   build or upload is authorized by this document alone.
   `scripts/deliver-apk-drive.ps1 -ApkPath <final.apk> -Confirm DELIVER-APK`
   does the upload for either agent through the owner-authorized rclone
   `drive.file` remote (private "BTB APK" folder): signature/ABI, no
   overwrite, owner-only permissions, authenticated download and SHA-256
   readback, then the private link and `<apk>.drive-delivery.json`. It never
   creates a sharing link.
2. Save a secret-free Android delivery receipt with actual observed facts:

   ```json
   {
     "schemaVersion": 1,
     "batchId": "<batch.json batchId>",
     "sourceSha": "<full committed source SHA>",
     "apkSha256": "<verified uppercase SHA-256>",
     "bytes": 0,
     "installedApkSha256": "<same verified APK SHA-256>",
     "privateOwnerOnly": true,
     "remoteReadbackVerified": true,
     "signatureVerified": true,
     "abiVerified": true,
     "installedVerified": true,
     "evidence": "<actual private delivery/readback and owner installation receipt>"
   }
   ```

   Replace every placeholder and byte count with real measurements. These
   fields record evidence and do not approve an action. Never set an unobserved
   fact to true or relabel the old installed APK as the new batch.
3. Run the web publisher dry run with `-ApkPath` and
   `-AndroidDeliveryReceipt`; publish under the already explicit `PUBLISH-WEB`
   approval. It verifies the matching pair/delivery before switching the runtime:

   ```powershell
   # From the workspace root; repeat with -Confirm PUBLISH-WEB only when approved.
   zbet-cap/scripts/publish-web-client.ps1 -ApkPath <final.apk> -AndroidDeliveryReceipt <android-delivery.json>
   ```

   Web manifests/receipts record the common batch ID and both hashes. A
   published web response still reports `releaseComplete=false` pending the
   client smoke evidence. There is no web-only dirty-source escape hatch.
   The publisher replaces only a verified BFF process and succeeds only after
   every file of the release's `web-build-receipt.json` is read back from the
   running BFF (`servedAssets`). When the release and its settings are already
   persisted but the BFF still serves the previous one, `-Recover` with
   `RECOVER-WEB` replaces the BFF and writes a receipt beside the releases
   instead of publishing again.
4. Verify the installed Android app and the published web app with actual
   owner data. Record `batchId`, `sourceSha`, `apkSha256`, `webTreeSha256`,
   `androidSmokePassed`, `webSmokePassed` and an actual evidence reference in
   a secret-free owner acceptance receipt. Complete the batch only with:

   ```powershell
   node scripts/client-release.mjs complete --apk <final.apk> --web-root <published-root> --delivery <android-delivery.json> --publication <publish-receipt.json> --acceptance <owner-smoke.json> --output <completed-batch.json>
   ```

   `--publication` is the publish or recovery receipt; completion refuses one
   without matching `servedAssets` byte proof, because routing probes also pass
   for a BFF still serving the previous release.
   Both receipts, hashes, source and smokes must match. If either smoke fails,
   keep the batch incomplete and stop further delivery. Recover both surfaces
   to their previous accepted pair or finish the same frozen batch under the
   applicable approvals. Web rollback also requires its corresponding APK's
   delivery/installation receipt; an old web folder alone is not a paired rollback.

## Current transition and durable status

The first coordinated batch completed on 2026-10-16:
`client-3e9ffe9241bac12262f559f2267496f50db94da3-8757EFEA9837-06AF4EA3CA00`,
source `3e9ffe9`, APK `8757EFEA983796F26E5371577E6D8956BC3E85106869FCCDCED9177B7544D38A`,
web tree `06AF4EA3CA001B5AA790307ABFF09E3B86F7A4BC0DD06A7D13F2E5B61922FFE0`,
published release `20261016T195008Z-3e9ffe9`, status **COMPLETE** after both owner
smokes. Receipts: `btb-codex/docs/evidence/client-release-3e9ffe9-2026-10-16.json`.

The pair before it (web release `20261015T210155Z-6911f84` and the 14 October APK
`1168EA805A14870AC707204A63F4F1B38316D0CFE038C879D739266E9F828117`) predates this
rule and has no shared source/batch receipt; its alignment stays **UNVERIFIED**.
Preserve that historical acceptance without rewriting hashes or creating
retrospective receipts. A web rollback to it would still need its APK delivery
receipt, so recovery prefers a new coordinated batch.

Record source SHA, both artifact hashes, batch status, approval/delivery/smoke
receipts, previous pair and any platform exceptions in `CURRENT_HANDOFF.md`.
Closed milestones and prior evidence stay closed/historical. No model or SAP
deployment is required solely by adopting this client release rule.
