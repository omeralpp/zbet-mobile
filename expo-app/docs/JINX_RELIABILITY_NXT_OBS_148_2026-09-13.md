# NXT-OBS-148 / TASK-0011 — measured Jinx reliability

Owner-authorized continued M10 exception, three-repo commits/pushes and existing
pilot BFF restart. No production. Provider remains Gemini `gemini-3.5-flash-lite`;
credentials remain in the environment. No Mobile application source change.

## Measurements before correction

Read-only existing OData readers plus real Gemini calls, sequential and uncached,
on match `2026-09-13:3125516:10:30:00`. The match had finished 2-2 by this run;
this is live API evidence, not a recreation of the owner's 55-minute snapshot.
Percentiles use nearest rank; the median averages the middle pair. Provider
latency covers request start through the complete JSON body, not just headers.
The diagnostic baseline permits a 30s observation ceiling so the old 6s cutoff
does not censor the latency tail. This does not alter the pilot listener.

| Paced baseline, first 20 consecutive calls | Result |
| --- | --- |
| Provider HTTP 200 | 20/20 |
| Visible validated readings | 12/20 (60%) |
| Provider min / median / p90 / p99 | 1194 / 1325.5 / 1449 / 1484 ms |
| Provider timeout / over-old-6s rate | 0/20 / 0/20 |
| Source phase min / median / p90 / p99 | 99 / 105.5 / 128 / 902 ms |
| End-to-end min / median / p90 / p99 | 1306 / 1434.5 / 1561 / 2249 ms |
| Median prompt size | 6266 characters |

Sampling continued to 26 calls to obtain ten actual rejected texts. Calls were
spaced at least 6s apart. Seven readers already use `Promise.all`; no serial
seven-times-five-second phase existed. A barrier regression test proves all
seven enter before any one returns, and per-source start/duration measurements
confirm the parallel reads.

An initial unpaced attempt is explicitly excluded from latency calibration:
its first 20 calls produced 7 visible readings, 8 wording refusals and 5 responses
without usable candidate text. Further fast failures yielded no rejected text.
This looked like a rate-limit pattern, but the detailed status rows were
overwritten when restarting the baseline, so quota attribution is not proven.
The measurement runner now paces calls, stops on authentication/quota failures
and refuses to overwrite an existing run. Explicit quota failures are not recorded as
fast successful generations. The complete paced run is the calibration sample.

The earlier 6s AbortError is real but did not recur in the paced baseline. These
measurements do not prove that prompt size caused the earlier timeout; provider
or network variation remains possible. Raising a timeout alone does not address
the measured 40% wording refusal rate.

## Correction and budget

The validator is **unchanged**. Ten real texts below demonstrate six collisions
with `isabetli` (the verdict filter also catches factual shots-on-target wording)
and four with the `oyna` prefix (also catches factual past-tense football prose).
The model is now instructed to use `isabet`, `topa sahip olma`, `%` and completed
past tense, while avoiding the protected roots. Advice, forecasts, correctness
verdicts, event surprise and unprovided numbers remain refused. Shot counts are
not presented as measured pressure.

The commentary projection retains all seven source families, football facts and
freshness flags. It omits response/capture timestamps, repeated explanation
strings, base-probability context and unrelated market rows; it retains the top
three score-distribution rows and the selected market row. Full thresholds,
per-source caveats, null/empty distinctions and confidence calculation stay on
the server. Numeric validation uses only the projection actually sent to Gemini.

Provider phase budget = ceil-to-10ms(earlier censored timeout boundary **6000ms**
+ measured baseline p90 **1449ms**) = **7450ms**. This is an operational reserve
beyond an observed timeout boundary, not a claim that p99 is 7450ms. Budget:
**5000ms parallel sources + 7450ms shared provider phase + 2550ms transport and
scheduling allowance = 15000ms Mobile deadline**.

At most one fresh generation can follow a wording rejection. It receives the
same facts plus a short corrective instruction, never the rejected text. Both
attempts share the 7450ms budget; the second receives only the remaining time.
Attempt spacing and the existing 60 generations/process/hour limit are retained.
Timeout, HTTP/quota failure or invalid JSON does not trigger a wording retry.
Two invalid outputs still return UNAVAILABLE. Failed content is never softened
into an accepted answer, cached as valid, or fed into decisions or Super logs.

## Candidate acceptance before rollout

Twenty sequential **fresh, uncached** real analyses: **20/20 visible (100%)**,
all DEGRADED, no HIGH confidence. One wording rejection was recovered by the
single allowed fresh generation, so this series made **21 provider invocations**.
It is not a cherry-picked successful call or 20 hits against one cached result.

| Candidate first 20 analyses | Result |
| --- | --- |
| Provider phase min / median / p90 / p99, including repair | 973 / 1142 / 1298 / 2359 ms |
| Individual provider invocation min / median / p90 / p99 | 907 / 1137 / 1298 / 1449 ms |
| Source phase min / median / p90 / p99 | 95 / 105 / 113 / 398 ms |
| End-to-end min / median / p90 / p99 | 1082 / 1245 / 1402 / 2757 ms |
| Timeouts | 0/20 |
| Median prompt size | 4201 characters (about 33% smaller) |

The windows are sequential rather than randomized; the prompt-size and latency
changes do not establish a causal performance law. These 20 calls establish
measured availability for this sample, not an uptime guarantee. A final minimum
1s retry-spacing guard was added after this candidate series; regression checks
and the separate post-restart public series cover the final code.

## Deterministic fallback decision

Not added. The existing Mobile contract distinguishes LIVE from SYNTHETIC data,
not LLM commentary from a deterministic summary. Returning either current origin
for a fallback would blur its provenance. The factual form/path/pressure panels
already remain available when Jinx fails. This batch fixes measured generation
failures without silently replacing the requested commentary or changing the
Mobile contract. A remaining generation failure stays honestly UNAVAILABLE.

## Checks and artifact

Mobile type/lint/tests/tooling/brand and BFF tests/build passed. Thirty focused
analyst tests cover parallel entry, shrinking retry budget, timeout/no-retry,
quota/no-retry, refusal privacy, supplied-number validation, source independence
and the existing tiny-pool/HIGH guard. Doctor was rerun and **FAILED 19/20** with
16 Expo patch mismatches; no exclusion or pass is claimed.

Mobile application source is unchanged, so the existing verified
`btb-mobile-next-arm64-jinx-round2.apk` is reused. Its SHA-256 is
`67325109CF9C864A34E4EB6CBC1A5C3677DDF49A2E102A4A824E42D7352BD6F7`.
Documentation is not bundled into the APK. No new phone acceptance is claimed.
Final pushed SHA, PID, public series and secret/log review are recorded in
CURRENT_HANDOFF.md after rollout.

## Ten actual rejected outputs (baseline; not accepted commentary)

The original safe diagnostic texts below are retained as evidence, not as
statements endorsed by Jinx. Runtime logs still contain only refusal codes.

| Attempt | Actual rejected body | Trigger and interpretation |
| --- | --- | --- |
| 5 | İlk yarıyı 2-0 önde kapatan ev sahibi takım, deplasman ekibinin 14 şut ve 4 isabetli atak ürettiği baskısına direnemedi. 94. dakikada gelen golle mücadele 2-2 beraberlikle bitti. | certainty: isabetli; factual shot wording, not a correctness verdict |
| 8 | İlk yarıyı ev sahibi 2-0 önde kapatsa da, deplasman ekibi 14 şutla yüklenerek durumu 2-2'ye getirdi. Ev sahibi 10 şutta kaldı ve yüzde 52 topla oynama oranını galibiyete taşıyamadı. Maç sonu 2-2 bitti. | forbidden: oyna prefix; factual football wording, not playing advice |
| 9 | İlk yarıyı 2-0 önde kapatan ev sahibi ekip, deplasman takımının 14 şut ve 4 isabetli atağına karşı skoru tutamadı. Mücadele 2-2 bitti. | certainty: isabetli; factual shot wording, not a correctness verdict |
| 10 | İlk yarıyı 2-0 önde kapatan ev sahibi takım, 10 şut ve 5 isabetle oynadı. Deplasman ekibi ise 14 şut bularak son dakikalarda skoru 2-2'ye getirdi ve maç beraberlikle bitti. | forbidden: oyna prefix; factual football wording, not playing advice |
| 11 | İlk yarıyı ev sahibi 2-0 önde kapatsa da, deplasman ekibi 14 şut atarak beraberliği kurtardı. Ev sahibi 10 şutta 5 isabet bulurken, konuk takım 4 isabetli şutla skoru 2-2'ye getirdi. | certainty: isabetli; factual shot wording, not a correctness verdict |
| 13 | İlk yarıyı 2-0 önde kapatan ev sahibi takım, deplasman ekibinin 14 şut ve 4 isabetli şutluk baskısı karşısında skoru koruyamadı. 94. dakikada gelen golle karşılaşma 2-2 bitti. | certainty: isabetli; factual shot wording, not a correctness verdict |
| 18 | İlk yarıyı 2-0 önde kapatan ev sahibi takım, 10 şut ve 5 isabetle oynarken; deplasman ekibi 14 şut ve 4 isabet buldu. 74 ve 94. dakikalarda gelen gollerle maç 2-2 bitti. | forbidden: oyna prefix; factual football wording, not playing advice |
| 20 | Ev sahibi ekip ilk yarıyı 2-0 önde kapatsa da, deplasman takımı 14 şut çekerek maç sonunda skoru 2-2'ye getirdi. Ev sahibi 10 şutta kaleyi 5 kez bulurken, deplasman ekibi 4 isabetli şutla beraberliği yakaladı. | certainty: isabetli; factual shot wording, not a correctness verdict |
| 21 | İlk yarıyı 2-0 önde kapatan ev sahibi takım, deplasman ekibinin 14 şut ve 4 isabetli şutluk baskısına karşı skoru koruyamadı. Maç 2-2 bitti. | certainty: isabetli; factual shot wording, not a correctness verdict |
| 26 | İlk yarıyı 2-0 önde kapatan ev sahibi, 14 şut atan rakibinin ikinci yarıdaki gollerine engel olamadı ve mücadele 2-2 bitti. Deplasman ekibi 48 topla oynama oranıyla skoru eşitledi. | forbidden: oyna prefix; factual football wording, not playing advice |
