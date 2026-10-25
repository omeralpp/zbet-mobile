# Maçın yolu pilot delivery — 25 October 2026

Status: **INCOMPLETE — awaiting the owner's published-web smoke**.
Android installation and basic acceptance are confirmed; web publication and
technical verification passed. This is an owner-only DEV/pilot release.

- Shared clean pushed client source: `3f3b5fd6af931e6f285ea82f50a55bce72e1915b`.
- APK: `btb-mobile-next-3f3b5fd-arm64-pilot.apk`, 50,491,257 bytes.
- APK SHA-256: `4C452CEDF278CC48334D1843ABC2C4FAF8C5B96C71FA0D69E25FC6EC85A06A0B`.
- Paired web tree: `73932E41809960240EA6776F6AD4A528C9F361E35683CDD487D6B962CE196AB8`.
- Published release: `20261025T073559Z-3f3b5fd` at `app.surklase.com`.
- Batch: `client-3f3b5fd6af931e6f285ea82f50a55bce72e1915b-4C452CEDF278-73932E418099`.

The owner approved the design and all named commit/push, signing/private delivery
and paired web publication steps. The final ARM64 APK passed pilot certificate,
ABI, embedded configuration, exact bytes and common-source verification. Connected
Google Drive uploaded to the existing private BTB APK folder; owner-only metadata
and the complete authenticated download's SHA-256/size matched the local APK.
The exact private link is in the Android delivery receipt.

The owner's reply to that APK and installation/basic-smoke request was
"Onaylıyorum web I yayınla APK sorunsuz". Installation and basic Android smoke
are recorded from that reply, before web publication. This does not establish
broader native TalkBack or performance acceptance.

The publisher's dry run passed with the installed-APK receipt. Publication used
the same frozen source and artifact hashes, retained the previous pair, and
performed one runtime restart. Shell/deep link/CSP, anonymous API401, public
Cloudflare Access302 and unchanged health configuration passed. The served entry
JavaScript matches the published file: SHA-256
`A97468A694B90DEBE14650D0C8D9CE1804E22F84048FB7D0057ED58AD968DDBF`.
No BFF code rollout, access-policy change, SAP/model write or production release.

Durable receipts in `docs/evidence/` have prefix `MATCH_JOURNEY_UX_` and date
`2026-10-25`: `PAIR`, `ANDROID_DELIVERY`, `WEB_PUBLICATION`, `SERVED_WEB`, and
`OWNER_ACCEPTANCE`. The pair's original PREPARED and publisher's pending-smoke
statuses are retained as historical verification records. The current owner
acceptance has Android=true, web=false; no completed-batch receipt is claimed.

Next: refresh the published web app and obtain the owner's actual usability
confirmation. Record that result, then run `scripts/client-release.mjs complete`
with the receipts, published root and explicit `--source-sha` above. Later
documentation-only commits do not change this delivered artifact source.
Previous accepted `3f53834` APK/web release `20261024T193040Z-3f53834` remains
retained for coordinated recovery. [Implementation](MATCH_JOURNEY_UX_2026-10-25.md).
