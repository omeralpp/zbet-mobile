# TASK-0102 phone data outage and storage cleanup — 2026-10-10

## NXT-OBS-BFF-20261010 — resolved runtime incident

The owner reported installation of the delivered TASK-0102 APK and supplied a
phone screenshot showing `Mobil servis hatasi (502)` on the dashboard. Using
the actual APK's embedded pilot key, read-only diagnosis confirmed valid
authentication and health 200, but authenticated local and public data reads
returned 502. Local responses identified `SAP_UPSTREAM_ERROR`; the configured
SAP HTTP loopback origin did not answer. Docker enumeration hung and its UI
was blank. WSL subsequently confirmed the Docker distro was stopped while
its Windows processes remained running.

The owner explicitly approved closing/restarting Docker and restoring the
containers. The supported normal restart timed out stopping the stuck
processes. `docker desktop stop --force --timeout 30` succeeded; startup then
completed despite its CLI wait timing out. All three existing containers were
running afterward: `a4h`, `surklase-local-wordpress-wordpress-1` and
`surklase-local-wordpress-db-1`. No container, volume, SAP source or model was
deleted or changed; the BFF retained PID 20716 and CAP code `626ef1d`.

Post-recovery authenticated local and public dashboard, matches, Super KPI and
Toto program reads all returned 200. Public responses parsed through the exact
Mobile schemas: 75 matches and 12 Toto programs. This is Docker/transport/BFF
evidence, not a live SAP MCP object read. Physical-phone acceptance after
refresh, including TASK-0102 goal detail, remains pending for 2026-10-12 review.

## Owner-authorized disk cleanup

The owner separately requested removal of unnecessary BTB files. Fourteen
verified generated paths were removed: two abandoned September pilot staging
directories, retired Cordova `platforms`/`plugins`, Android C++/Kotlin build
cache, generated CAP `gen`, npm/Gradle caches and logs, and the superseded Jinx
APK/config receipt. No Gradle process was active. Absolute paths and ignored
workspace outputs were verified before deletion. Future builds regenerate the
removed caches; current installed dependencies were retained.

Measured host free space increased by 9.08 GiB to 18.35 GiB. Sources, Git
history, Android SDK/signing/configuration, original data/reports, SAP/Docker
containers and volumes, and `a4h_backup_0729` were preserved. The unused SAP
backup image contains about 50.87 GB of unique recovery layers and was not
classified as disposable build output.

TASK-0102 and TASK-0109 rollback APKs were retained. TASK-0102 SHA-256 remains
`FD60A83A7B3249DD623BB50D131D3D12B4F6DC7F3156DFA45700881FE64886EE`.
Git status confirmed no source change or tracked deletion in Mobile, CAP,
ABAP or tooling. Private ignored receipts and diagnostics are in the Expo
app's `.codex-artifacts/`; no credentials were printed or committed.
