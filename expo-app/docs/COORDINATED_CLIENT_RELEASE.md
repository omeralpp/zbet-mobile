# Coordinated Android and web releases

Owner rule, 2026-10-16. BTB Mobile Next releases Android and desktop web together.
Every release, including a platform-only change, uses one clean pushed
`zbet-mobile` commit and one batch identity. Platform exceptions describe the
intended UX difference; they never excuse omitting the companion artifact.
Shared client behavior and the Mobile BFF contract must remain compatible.

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
4. Verify the installed Android app and the published web app with actual
   owner data. Record `batchId`, `sourceSha`, `apkSha256`, `webTreeSha256`,
   `androidSmokePassed`, `webSmokePassed` and an actual evidence reference in
   a secret-free owner acceptance receipt. Complete the batch only with:

   ```powershell
   node scripts/client-release.mjs complete --apk <final.apk> --web-root <published-root> --delivery <android-delivery.json> --publication <publish-receipt.json> --acceptance <owner-smoke.json> --output <completed-batch.json>
   ```

   Both receipts, hashes, source and smokes must match. If either smoke fails,
   keep the batch incomplete and stop further delivery. Recover both surfaces
   to their previous accepted pair or finish the same frozen batch under the
   applicable approvals. Web rollback also requires its corresponding APK's
   delivery/installation receipt; an old web folder alone is not a paired rollback.

## Current transition and durable status

The recorded web release `20261015T210155Z-6911f84` predates this rule. The last
accepted Android APK is `1168EA805A14870AC707204A63F4F1B38316D0CFE038C879D739266E9F828117`
from 14 October. No matching source/batch receipt exists for this historical
pair; its alignment is **UNVERIFIED**, not complete. Preserve the historical
acceptance without rewriting hashes or creating retrospective build receipts.
The next approved release must replace both from the same frozen source.
TASK-0135 owns the outstanding replacement APK qualification; TASK-0143's
existing web publisher maintenance remains separate and open.

Record source SHA, both artifact hashes, batch status, approval/delivery/smoke
receipts, previous pair and any platform exceptions in `CURRENT_HANDOFF.md`.
Closed milestones and prior evidence stay closed/historical. No model or SAP
deployment is required solely by adopting this client release rule.
