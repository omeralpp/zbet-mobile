# Active market, numeric clock and chart feedback delivery

Status: APPROVED / PREPARING. Owner replied **Approve** on 24 October 2026 to
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

Phone installation and both final smoke results are currently unobserved; no
receipt may assert them yet. Retain the prior pair until completion. Evidence
and exact SHAs/hashes will be added as the approved steps finish.
