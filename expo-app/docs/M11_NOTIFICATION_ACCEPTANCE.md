# M11 criterion 3 — notification and return-to-app acceptance

Owner-run checklist. Criterion 3 of the amended M11 asks that owner-configured
notification and return-to-app behaviour is verified for foreground, background
and restart on the intended phone, with device limitations stated.

Scope discipline, from the amendment: **a delivery check is not a model-quality
check.** Nothing here says a Super or Toto decision was correct. It says a
notification arrived, was filtered as configured, and landed you on the right
screen. Record what you observe, including failures — an honest failure closes
this criterion better than a tidy pass.

Candidate under test: `btb-mobile-next-arm64-m11-deps-0037328.apk`,
SHA-256 `4518BD58CD29FB82F643B7229BC6605C055866D2ABDAE5D996BA01E7954E8E79`.
This build carries `expo-notifications 57.0.9 -> 57.0.17`, which is the single
biggest reason this criterion is worth re-running rather than reusing prior
acceptance.

## 0. Preconditions

- [ ] The accepted candidate above is the build installed. Same certificate as
      the previous APK, so it installs over it; `versionCode` is still `1`, so
      the SHA-256 is the only reliable way to confirm which build is on the phone.
- [ ] Network reachable and signed in; API is `https://api.surklase.com`.
- [ ] Record the phone model and Android version in the results table. Behaviour
      below genuinely differs by OEM, so an unrecorded device makes the result
      unrepeatable.

## A. Owner preferences

Settings live under **Daha Fazla**.

- [ ] **A1 Enable notifications.** Run the enable flow and let the registration
      state machine finish. Expect it to end at connected, not stalled on a
      "hazırlanıyor" / "kontrol ediliyor" state. If it times out, record which
      stage it stopped at — the failure messages distinguish channel setup,
      permission check, permission prompt, connection and registration.
- [ ] **A2 Permission actually granted at OS level.** Android 13+ requires the
      runtime notification permission. Confirm in Android Settings, not only
      in-app.
- [ ] **A3 Super minimum rating filter.** Options are 1–5, default 1; an invalid
      stored value falls back to 1. Set it to **5**, then wait for or trigger a
      Super below 5 stars and confirm **no** notification is presented. Set it
      back to **1** and confirm one is. This is the only preference that
      suppresses delivery, so it is the one worth proving in both directions.
- [ ] **A4 Preference survives restart.** Set a non-default value, force-stop the
      app, reopen, and confirm the setting is still what you chose.

## B. Delivery in three app states

Each state exercises a different code path. Test all three; passing one does not
imply the others.

- [ ] **B1 Foreground.** App open and on screen. Expect the notification to be
      presented, and expect the app **not** to navigate on its own — foreground
      receipt refreshes widget data only. Auto-navigation here would be a defect.
- [ ] **B2 Background.** App still running but not on screen. Expect the
      notification in the tray.
- [ ] **B3 Killed / restart.** Swipe the app away from recents so it is not
      running, then deliver a notification. Expect it in the tray, and expect the
      tap to launch the app and land on the right screen — this is handled by a
      separate cold-start path than B1/B2, and it is the one that most often
      regresses silently.
- [ ] **B4 After a device reboot.** Reboot the phone, do not open the app, then
      deliver a notification. Some OEMs suppress background registration until
      first launch; if that happens, record it as a device limitation rather than
      an app defect.

## C. Tap-through routing

Routing is decided by payload precedence, in this order. The first rule that
matches wins, so a payload carrying both a match key and a `route` must go to the
match — worth checking explicitly, because precedence regressions are invisible
until you look for them.

| # | Payload carries | Should land on |
| --- | --- | --- |
| 1 | `match_key` / `matchKey`, or `match_id` + `match_date` + `match_time` | Match detail |
| 2 | `toto_program_gc_no` + `toto_program_version` (or `gc_no` + `version_no`) | That Toto program |
| 3 | `route` / `target` / `screen` = `super`, `superlog`, `super-log`, `sclear` | Super |
| 3 | `route` = `toto`, `sportoto`, `spor-toto` | Toto |
| 3 | `route` = `btb`, `main`, `live` | Canlı / matches |
| 4 | none of the above | Dashboard |

- [ ] **C1 Super notification tap** → lands on the Super decision, not the
      dashboard.
- [ ] **C2 Match notification tap** → lands on that specific match, and it is the
      right match. Composite keys are built as `YYYY-MM-DD:<id>:HH:MM:SS`, and
      compact forms (`20260906`, `183000`) are normalised, so a wrong-match
      landing points at the key, not at the tap.
- [ ] **C3 Toto notification tap** → lands on that program and version.
- [ ] **C4 Tap from the killed state** (repeat C1 or C2 after force-stopping)
      → same destination as when running. A dashboard landing here, when the
      running case worked, is the classic cold-start defect.
- [ ] **C5 Back behaviour after a tap.** From the notification destination, press
      back and confirm you reach a sensible screen rather than exiting instantly
      or being trapped.

## D. Device restrictions to record

These are recorded, not fixed. State them plainly so a future failure is not
misread as a code defect.

- [ ] Battery optimisation setting for the app (unrestricted / optimised /
      restricted). Aggressive OEM battery management is the most common cause of
      missed or delayed background notifications.
- [ ] Any OEM-specific autostart or background-activity permission.
- [ ] Doze / adaptive battery active during the test window.
- [ ] Per-channel notification settings, if any channel was silenced separately.
- [ ] Observed delivery latency, if a notification was notably late rather than
      missing. Late and missing are different findings.

## E. Results

Fill in as you go. An entry left blank reads as untested, which is correct and
better than an assumed pass.

| Phone / Android | Item | Result | Notes |
| --- | --- | --- | --- |
|  | A1 enable flow |  |  |
|  | A2 OS permission |  |  |
|  | A3 rating filter both ways |  |  |
|  | A4 preference survives restart |  |  |
|  | B1 foreground |  |  |
|  | B2 background |  |  |
|  | B3 killed / restart |  |  |
|  | B4 after reboot |  |  |
|  | C1 Super tap |  |  |
|  | C2 Match tap |  |  |
|  | C3 Toto tap |  |  |
|  | C4 tap from killed |  |  |
|  | C5 back behaviour |  |  |
|  | D battery / OEM restrictions |  |  |

## What this does not establish

Not model quality, Super selection correctness, Toto prediction quality, or ROI.
Not readiness for anyone other than the owner: distribution beyond this device
stays separately approved, and the accepted `decode-uri-component` advisory in
`TASK-0060` is unchanged by anything here. Passing every row closes M11
criterion 3 only.
