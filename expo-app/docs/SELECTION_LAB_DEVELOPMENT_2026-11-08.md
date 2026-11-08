# Selection Lab — local development checkpoint

TASK-0230, Mobile Next; model/research owner TASK-0229, BTB.

The shared match-detail client now contains Current BTB, Form + live and Form +
price cards, with a separate exposure-arm comparison. Both surfaces share the
read-only `selection-comparison.v1` contract, schema and implementation. Cards
stack below desktop widths and align side by side on desktop. Explanations,
abstention/stopped/unavailable, retry, score/card/clock/key changes, request errors
and local expiry are handled without client selection logic. A reference quote
is explicitly a comparison quote; native decision accounting remains separate.

No live challenger exists yet. Mock mode returns explicit unavailable outputs;
the populated contract fixture is never silently served as a real proposal.
Trial/validation IDs are references to independently reviewed BTB evidence, not
approval created by a DTO. Real publications retain RB1's 15-second quote bound.

Local quality passed: TypeScript, ESLint, unit/tooling/brand checks, Expo Doctor,
Android JS bundle and verified edge web export/secret scan. Browser mock smoke
covers320/390/768/1365/1600px, actual dark/light preferences, explanation and
exposure controls, no horizontal overflow or page errors. These are browser
layout checks, not Android device or live-publication acceptance. ADB reports no
connected device. Evidence lives in BTB Logs active cutover's
`observations/selection_programme_20261108/`.

The owner explicitly approved this batch's scoped commit/push through the
Turkish pop-up on 8 November. That approval covers versioning, not delivery.

Delivery remains incomplete. The accepted 5f26c70 Android/web pair and running
BFF d8d652f remain current. Do not sign/distribute/publish this batch until BTB's
real producer/input/protocol gates are met and runtime/release approvals are obtained,
and both client releases are prepared from the same clean pushed Mobile commit.
Verified private APK delivery/installation precedes web publication; both smokes
are required. No platform exception and no production permission.
