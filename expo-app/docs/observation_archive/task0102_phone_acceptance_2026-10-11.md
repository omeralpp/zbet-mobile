# TASK-0102 phone acceptance — 2026-10-11

The owner supplied three physical-phone screenshots and explicitly answered
"Confirm it works". This accepts the main Match Path phone smoke check after
the October 10 runtime recovery. No code or runtime change was made.

## Observed screen evidence

- FC Supra Du Quebec–Vancouver Langley FC is marked completed at 2–2.
- The Match Path chart, grouped event markers, pressure strip, navigation and
  frozen second-half pool render on the phone.
- The selected 90′ goal at 2–2 displays 31 compatible outcomes before the
  transition, 22 eliminated and 9 remaining (31 − 22 = 9).
- The leader text displays 2–1 before and 2–2 after; all 11 examples of the
  preceding leader are eliminated. It explicitly describes a score-transition
  effect rather than event surprise or goal probability.
- The fixed reference pool displays 74 matches after a 1–0 half-time score,
  with top scorelines 1–1 (15), 2–1 (11) and 3–0 (10). These reference counts
  and the goal's compatible-subset counts describe different populations.
- The latest pool analysis displays normality 8%, four similar matches and
  an insufficient-sample message. No probability or model-performance
  acceptance follows from these screens.

## Evidence limits and owner closure

The prior APK installation remains owner-reported against the delivered
SHA-256 FD60A83A7B3249DD623BB50D131D3D12B4F6DC7F3156DFA45700881FE64886EE.
The screenshots show the delivered goal-effect UI, but do not independently
measure the installed APK hash, backend payload or event chronology.
They show a single leader and a nonzero effect. They do not exercise multiple
tied leaders, measured zero, or unavailable arithmetic on the phone. Those
behaviors passed the previously recorded local/runtime checks.

After receiving the three remaining check descriptions, the owner explicitly
asked to close them for now and said any future defect would be reported for a
new task. The delivered descriptive goal-effect feature is accepted and
TASK-0102 is DONE within that bounded scope. The physical tied-leader, zero and
unavailable checks are waived by owner decision, not retrospectively marked
passed. The October 12 phone evidence gate is removed. Event probability remains
unmeasured and is outside this closure; TASK-0101 is unchanged. No model change,
new deployment, commit or push is approved by this closure.

## Screenshot provenance

Original workspace attachment directory:
`.codex-remote-attachments/01a126d5-242c-7f90-8294-7e069ab02cd8/a4809a39-00cb-405e-910b-970bfe400165/`.
The images are retained there; they were not copied into source or committed.

| File | SHA-256 |
| --- | --- |
| 1-1000139901.jpg | 386429F8F57BB28B881CF7FDC3373779ED1A35E267AF154597364031E68DA892 |
| 2-1000139900.jpg | 288BD5532AB2A0802ECA7FB6D7E2903397870F24A40F72BD65B8765532705649 |
| 3-1000139899.jpg | D0CDFFC79552B1A1D3ACB42258ED23F76F4154F98980A906F67683A0EAC05E83 |
