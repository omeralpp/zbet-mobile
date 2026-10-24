# Active market, numeric clock and chart feedback delivery

Status: **COMPLETE** after both owner smokes on 24 October 2026. Client source
`a5dca4a936ee3b36b3738f2e8265bdec38447e21`, BFF `12c3b92`, DEV SAP `cd63dca`.
Web `20261024T123643Z-a5dca4a`; APK SHA256 `26A03241F010…`, paired web tree
`153D5C2103CC…`. [Full receipts](evidence/ACTIVE_MARKET_CLOCK_RELEASE_2026-10-24.json).
Owner confirmed exact APK installation/Overview/Live, then refreshed-web
Overview/Live. `client-release.mjs complete` passed. TASK-0184 DONE; TASK-0185
holds the next real added-time source observation without reopening delivery.

All six steps below completed. Owner replied **Approve** on 24 October 2026 to
the reviewed local result and its pending SAP activation, BFF update and
coordinated Android/web release. This covers the bounded commit/push and final
APK signing/private delivery/web publication sequence for the current batch.
The earlier uncommitted chart-feedback source and evidence are included.

Scope: [active-market/clock batch](ACTIVE_MARKET_CLOCK_BATCH_2026-10-24.md)
and [chart feedback](CHART_FEEDBACK_BATCH_2026-10-24.md). Accepted recovery pair
remains `26f491c`, BFF `35ed90c8`. No model tuning, data import, production,
transport release, access-policy change or unrelated repository work.

Execution order:

1. Native guarded SAP preflight of `ZBET_CL_RB_RUNTIME` main/test source;
   preserve the baseline, confirm active readback, syntax, harmless Unit and ATC.
2. Freeze clean pushed bounded Mobile/BFF source and the SAP class changes.
   Align SAP to the exact validated pushed source with the canonical deploy tool.
3. Restart the owner-only pilot BFF once from its pushed source; verify old
   clients and selection-display v2 without changing its sealed model identities.
4. Rebuild verified edge web and final signed ARM64 APK from one clean pushed
   client commit. Verify the pair, signature, ABI and exact hashes.
5. Privately deliver the verified APK to the owner's existing Drive folder and
   verify downloaded bytes. Record actual installation and phone smoke evidence.
6. Only after installation, dry-run and publish the matching web; verify served
   assets and obtain its actual smoke evidence. Complete the paired gate only
   when both receipts match.

Delivery used the connected Google Drive plugin because rclone had no remote.
Folder/file permissions were owner-only; authenticated download matched all
50,489,473 bytes and the full APK hash. The exact installed APK passed the
owner's basic Android smoke. Web was published afterward, with unchanged
Cloudflare Access, positive local/deep-link checks and an exact served JS hash.
Owner then confirmed its basic smoke; paired completion is recorded above.

Native syntax/readback and all 21 runtime + 17 state tests passed. Canonical ATC
has no new P1 and one inherited P2 warning. No model identity/reseal or transport
release. Source cadence and the next actual 45+/90+ capture remain observation
items. Retain the previous accepted 26f491c, b501352 and 43d2e7d recovery APKs.
Obsolete APKs/generated exports were sent to the Recycle Bin; source, tests,
historical evidence and accepted receipts were preserved.
