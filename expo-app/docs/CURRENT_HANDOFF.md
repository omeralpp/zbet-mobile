# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-09-06

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

## 2026-09-06 — Codex closing checkpoint; continuation in Claude

Owner requested safe closure to continue in Claude. Compact entry point:
[CLAUDE_HANDOFF_2026-09-06.md](CLAUDE_HANDOFF_2026-09-06.md).
All local changes are preserved, including untracked files; nothing is committed
or pushed. M11 remains ACTIVE and runtime OBSERVATION, no open cutover. No
retention source removal occurred. Temporary test services are stopped; the
accepted phone APK and owner runtime were not changed by closure. Continue with
the personal-use plan and reviewed cleanup, not the superseded external pilot.

## 2026-09-06 — M11 refocused on personal Mobile use

Owner does not plan to invite users and approved refocusing M11 on personal-use
quality. M11 is now **Personal Mobile Reliability / Daily Workflow**,
`ACTIVE / OWNER_ONLY_PREPARATION`. The authority and roadmap mirror now use
owner-phone workflow, notification/return behavior, quality/security and owner
acceptance criteria; no user-growth, retention or monetization target remains.
Active plan: [M11_PERSONAL_USE_PLAN.md](M11_PERSONAL_USE_PLAN.md).

Keep TASK-0058's compatible dependency updates, reproducible Doctor and Android
validation tooling. TASK-0057's audience planning and TASK-0059's retention
feature are historical work, not reasons to continue external-pilot development.
The exact retention cleanup candidates are reviewed in the active plan; **no
source has been removed**. Retention remains off by default and only exists in
the uncommitted local candidate, not the accepted owner-phone APK. Next: resolve
that bounded cleanup while preserving maintenance, then address TASK-0060's
owner-relevant dependency advisories. No new analytics work is due.

TASK-0057/0058/0059 remain DONE as historical implementation records; M11 itself
is not complete. Core owner-phone/notification acceptance of the eventual
changed candidate is still pending. Model/Super/Toto work and BTB-owned
TASK-0011 retain their separate ownership and gates.

This turn changed only scope/docs/M11 records. Mobile runtime stays OBSERVATION,
no open cutover, last verified CAP `91cbc25` at `https://api.surklase.com`.
Accepted owner APK SHA-256 remains
`53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
No new build, runtime/device recheck, source deletion, external configuration,
commit/push or deployment. Earlier external-pilot next steps below are superseded.

## 2026-09-05 — M11 opt-in local retention rehearsal verified

`TASK-0059` is `DONE`. **Daha Fazla → Yerel kullanım ölçümü** now offers
explicit consent, stop/retain, inspect a local JSON export and confirmed
deletion. Strict event fields, foreground/focused real-data eligibility,
session deduplication and an offline roster-based D1/D7 report are implemented.
Preview and owner journals cannot enter invited-pilot totals; no collector,
automatic upload, new users or real retention results were introduced.
Evidence/usage: [M11_RETENTION_REHEARSAL.md](M11_RETENTION_REHEARSAL.md).

Final checks: 581/581 Mobile tests (19 new retention cases), 7/7 tooling tests,
type/lint/brand, Doctor and Android production JS export pass. Android 15 x86_64
preview controls, sample exclusion, export timestamps, stop/restart and deletion
pass on the reused debug shell. App logs contain zero fatal/JS errors or matches
for the 12 sensitive environment values checked. Temporary test journals were
deleted; Metro and the read-only emulator were stopped. No new native/phone APK.

Coverage is deliberately conservative: restarts stop collection and long gaps
invalidate evidence. This is NOT a complete longitudinal real-user collector.
External pilot review still needs cohort identity/auth, exact build metadata,
longitudinal coverage handling, phone validation and separate release approvals.
Next bounded local task: `TASK-0060`, remaining dependency advisories before
distribution (14 moderate, zero high/critical at TASK-0058; no new dependency delta).

M11 remains `ACTIVE / LOCAL_PREPARATION`; runtime remains owner-only `OBSERVATION`
with no open cutover. Last verified CAP `91cbc25`, `https://api.surklase.com`,
and owner APK SHA-256
`53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`
are unchanged. All M11 changes remain local/uncommitted in Mobile plus bounded
Tooling/Logs records. CAP is untouched; no external configuration, deployment,
distribution, commit or push occurred. Older checkpoints below are historical.

## 2026-09-05 — M11 local dependency baseline verified

`TASK-0058` is `DONE`: compatible SDK 57 patches, reproducible explicit-profile
Doctor and an x86_64 option in the canonical Mobile build adapter are verified.
Type/lint/tests/brand, seven Doctor-wrapper regressions, preview Doctor,
configured-pilot Doctor (20/20), Android JS export, clean staged install and
x86_64 native compilation pass. Android 15 emulator launch/navigation passes
in mock preview mode, with no fatal/JavaScript errors in the app log. The
temporary preview server and read-only emulator were stopped after testing.
Evidence and artifact hashes: [M11_DEPENDENCY_BASELINE.md](M11_DEPENDENCY_BASELINE.md).

Audit is now 14 moderate / 0 high / 0 critical (still exit 1); `TASK-0060` is
`OPEN` for the remaining URL-parser/tooling advisory review and remediation
before external distribution. This is a local baseline, not release acceptance.
Next: `TASK-0059` / `OPEN`, opt-in local retention measurement and rehearsal.
No real users or retention results exist yet; the cohort remains provisional.

M11 remains `ACTIVE / LOCAL_PREPARATION`; the owner runtime remains `OBSERVATION`
with no open cutover. Last verified runtime is still CAP `91cbc25` at
`https://api.surklase.com`. The accepted owner APK remains
`btb-mobile-next-arm64-team-form-live-b75b4cd.apk`, SHA-256
`53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
The separate x86_64 debug artifact does not replace it. No physical-phone or
live BFF/SAP/auth/push revalidation, owner-pilot restart, external-system change,
release distribution, commit or push occurred. Changes remain local in Mobile
and the bounded Mobile adapter/M11 records in Tooling and Logs; CAP is untouched.
Entry commits are recorded in [M11_PILOT_PLAN.md](M11_PILOT_PLAN.md).

## 2026-09-05 — M11 preparation entry (superseded by the dependency checkpoint above)

Owner started M11 after the proposal to define pilot scope, assess build
readiness and specify retention measurement. M11 is `ACTIVE / LOCAL_PREPARATION`;
the existing owner-only runtime remains `OBSERVATION`, with no open cutover run.
Preparation task: `TASK-0057` is `DONE`; `TASK-0058` (dependency readiness) and
`TASK-0059` (local retention rehearsal) are `OPEN`. Canonical plan and next steps:
[M11_PILOT_PLAN.md](M11_PILOT_PLAN.md). This section supersedes older statements
that there is no Mobile roadmap work; it does not reopen resolved observations.

Fresh local evidence: existing accepted APK hash and 54,259,061-byte size match;
Expo Doctor completes at 19/20 with 16 package mismatches under explicit temporary
preview settings; npm audit reports 21 affected package entries (15 moderate,
6 high). An initial Doctor config error returned a misleading wrapper exit 0
and was not treated as a pass. Shared pilot auth identifies every request as
one subject; no retention instrumentation was found in the targeted source review.

The initial cohort proposal is 3–5 invited testers, pending owner choice; real
enrollment and retention measurement have not started. Next: dependency readiness
and a local opt-in retention rehearsal. Real-user distribution, external auth,
signing and deployment keep their separate approvals. Model output must not be
presented as calibrated while M14 is open; Jinx/Match Path remain synthetic.

Last verified runtime remains CAP `91cbc25` at `https://api.surklase.com`.
APK remains `btb-mobile-next-arm64-team-form-live-b75b4cd.apk`, SHA-256
`53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99`.
No fresh runtime/SAP/device check, code/package edit, build, restart, external
configuration, distribution, commit or push occurred. Only Mobile planning/docs
and the bounded M11 roadmap/task records are updated locally.

## 2026-09-03 — Team Form physically accepted; NXT-OBS-142/145/147 closed

After the approved pilot update and refresh instructions, the owner confirmed:
"I checked it works fine." This is physical acceptance of the corrected Team
Form/last-five display, not another automated device test. Close NXT-OBS-147 and
the linked real Team Form / ordered-results acceptance items NXT-OBS-142/145.
The verified Motherwell result is B M M M G / 1G1B3M / PPG 0.80 / GA 2.20.

No further APK, code change or restart is needed for this fix. Last verified
runtime is CAP `91cbc25`, PID 3092, public route `https://api.surklase.com`;
existing LIVE-Team-Form APK/hash below remains the accepted candidate. No fresh
runtime check was necessary for this owner-confirmation-only update. Match Path
and Jinx remain synthetic; their real engines and unrelated observations are not
accepted by this confirmation. Mobile remains OBSERVATION, no open cutover run.
Owner subsequently requested "commit and push all"; this documentation checkpoint
records the approved rollout and physical acceptance. No further code, runtime or
external-system action is included. Earlier uncommitted/phone-pending statements
below are historical checkpoints, superseded by this confirmation and commit.

## 2026-09-02 23:55 TRT — NXT-OBS-147 pilot rollout verified; phone confirmation next

Owner explicitly approved restarting the owner-only pilot after commit/push.
Clean, pushed CAP `91cbc259a2ae5d72f0c6a6f1203060560ac71f1e` was verified before
the one restart through the canonical runtime gate. PID `6552 -> 3092`, bound to
`127.0.0.1:4004`; public route remains `https://api.surklase.com`. No flags,
Cloudflare/Firebase/SAP configuration, scheduled tasks or APK were changed.

Local/public health and real Team Form responses pass the actual Mobile schema.
Motherwell now returns B M M M G / 1G1B3M / PPG 0.80 / GF 1.40 / GA 2.20;
Dundee stays G M M M B / PPG 0.80 / GF 1.00 / GA 2.20. Both venue PPG values
remain 1.40. Public dashboard, match list and Super Log pass their Mobile schemas;
unauthenticated Team Form is rejected with 401. Runtime logs were read using
shared access: six configured secret values and private-key markers have zero
matches; no fatal-process markers. Watchdog remains Ready, last result 0 at
23:30, next scheduled run 00:00; no schedule mutation or extra restart.

Next: owner pulls down from the top of the match screen to refresh (the handler
explicitly refetches Team Form despite its five-minute cache), then confirms the
corrected values. The existing LIVE-Team-Form APK/hash below remains sufficient;
Match Path/Jinx remain synthetic. NXT-OBS-147 is READY with API rollout complete,
physical acceptance still pending; do not close NXT-OBS-142/145 data acceptance.
Mobile remains OBSERVATION with no open cutover run. CAP is clean/pushed at
`91cbc25`, Mobile's prior documentation commit is `7651aae`; this runtime follow-up
is a local documentation update, not another commit/push. Earlier "pilot unchanged"
and restart-pending statements below describe superseded checkpoints.

## 2026-09-02 — NXT-OBS-147 committed; pilot rollout and physical acceptance pending

Owner tested the candidate and supplied Motherwell / Dundee Utd. comparisons.
Sample cards are acceptable; Jinx icon/chips are visible. Real Team Form data
acceptance is withheld: the running BFF skips Stenhousemuir 1-0 Motherwell on
16 August because its secondary Ot scores differ, replacing it with an older draw.
Owner then approved the bounded local correction with "let's do it". The adapter
now retains a differing-secondary-score row only when the displayed score and
own-team result corroborate the valid main score. Malformed/contradictory score,
identity, date and duplicate guards remain. No ABAP/model or Mobile source change.

Verified: the new Motherwell regression failed before the fix, then all 51 Team
Form tests and the full BFF tests/production build passed. Real SAP match +
statistics reads through the fixed local HTTP route and actual Mobile schema
return B M M M G / 1G1B3M / PPG 0.80 / GA 2.20; Dundee and both venue windows
are unchanged. Direct bridge evidence, not SAP MCP source inspection. The public
pilot was separately rechecked and still returns old B M M G B / 1.00 / 2.00.

Owner separately approved commit/push. CAP fix/tests are committed and pushed as
`91cbc259a2ae5d72f0c6a6f1203060560ac71f1e` (`91cbc25`); the four Mobile
handoff/observation/integration/archive documents accompany this approved checkpoint.
Next: separate owner-only pilot restart approval for that CAP SHA and public
read-back; finally owner refresh/reopen and physical data acceptance. No new APK
is needed. No flags, persistent service, SAP or device data were changed. Remain
OBSERVATION, no open cutover run; NXT-OBS-147 is READY, not deployed or physically
accepted. Details: OBSERVATION_LOG.md. Release evidence
and artifact below remain historical; schema/shape checks alone did not prove selection.

## 2026-09-02 23:17 TRT — LIVE Team Form pilot APK built; physical test pending

This checkpoint supersedes older "flag off / fix uncommitted / APK pending"
statements below. Owner asked to continue Claude's enable-Team-Form/build-APK
work, then said "Let's continue" in response to the owner-only pilot dependency
warning exception. No production release, SAP change or new commit/push approval.
M15 remains `CLOSED`; Mobile remains `OBSERVATION`, with no open cutover run.

```text
Artifact : .codex-artifacts/btb-mobile-next-arm64-team-form-live-b75b4cd.apk
Bytes    : 54,259,061 (51.75 MiB)
SHA-256  : 53B366747517A8E5B9211AB85EE72D3ABF8D8173E16324736E59BFA9E2D20D99
Package  : com.btb.mobile.next / 0.1.0 (1) / arm64-v8a only
Signing  : v2 PASS; existing Android Debug pilot certificate
Cert SHA : fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config   : API=https://api.surklase.com; authMode=pilot; useMocks=false
           teamFormIntelligence=LIVE; mobileIntelligence=SYNTHETIC
Source   : Mobile b75b4cd (application unchanged; only handoff documents dirty)
Status   : OWNER_ONLY_PILOT_CANDIDATE / PHYSICAL_ACCEPTANCE_PENDING
```

The exact packaged config, seven UI/contract markers, Jinx artwork resource,
Work Zone base URL and signature were verified from inside the APK. Known
server-secret/private-key scan: 1,321 ZIP entries, seven configured secret-value
variants, zero matches. The established extractable owner pilot key is expected
client configuration, never a production credential; no secret values were logged.

Real Team Form is already enabled in persistent BFF configuration. CAP `86bf79e`
runs at `127.0.0.1:4004`, PID `6552`; local/public health returned 200 at 23:17.
Codex did not restart it or change its flags. Public dashboard/Super/matches also
passed. Actual Mobile schema + mixed-origin wrapper passed both populated sides
on Motherwell / Dundee Utd., Dundee / ST Johnstone and Millwall / Wrexham, including
five-result sequences matching W/D/L totals. Match Path/Jinx remain synthetic.
This is public BFF evidence, not SAP MCP source inspection.

Build recovered from Claude's Windows JVM quota failure using process-local
ActiveProcessorCount=2, two Gradle workers, parallel=false and in-process Kotlin.
Canonical build succeeded in 5m57s (1,077 tasks); its staging directory was cleaned.
No application/native source, package versions or persistent build settings changed.

**Limits:** Doctor remains 19/20 (16 patch-version mismatches), carried forward
only for this owner pilot. Automatic npm-ci audit reported 21 findings (15 moderate,
6 high), not triaged/fixed here. Production gates are NOT all green. Prior 562 Mobile
tests, BFF 409 tests/build and native UI checks are reused for unchanged source.

Metro preview was blocked by execution policy. Direct APK install succeeded on
the Android 15 emulator, but launch failed: SoLoader searches `lib/x86_64` in the
ARM64-only APK. The previous b9ca7ae ARM64 APK reproduces the same failure, and its
ARM64 libreactnative.so is byte-identical to the new one. This emulator cannot
provide this candidate's live UI acceptance. The existing x86_64 debug APK was
restored without uninstall/data clearing, its process started successfully, then
was stopped and the pre-existing emulator returned home. Physical Xiaomi test
is still required; do not claim a new device-smoke pass.

Next: owner copies this APK to the phone and installs over the current app (same
package/certificate). Open a current match: Team Form should use real history,
without the sample-data badge; G/B/M chips run newest to oldest. Check the Jinx
heading icon. Match Path/Jinx commentary must still show sample-data labels.
Unavailable history must remain unavailable, never synthetic fallback. Record
physical acceptance for NXT-OBS-142/145/146 only after owner confirmation.

Only the final phone APK remains alongside preserved brand-source/reference
folders. Previous b9ca7ae APK, batch02 temporary evidence and the resume verification
helpers were moved to the Recycle Bin (recoverable). Source/docs were not recycled.
Mobile handoff/integration/observation documents and batch-02 archive are locally
modified, uncommitted. CAP and all other repos remain unchanged. No data/log intake.
Entry heads: tooling 3025790, Logs 156a7e4, ABAP 48774d6; no fetch was performed.

## 2026-09-02 — Team Form kimlik düzeltmesi: gerçek veri uçtan uca çalışıyor

Mod: `OBSERVATION`. Sahip "commit the docs and fix the team form id" dedi;
belgeler commit edildi (`zbet-mobile 08d10e2`) ve kimlik kusuru giderildi.

**Gerçek kusur Codex'in ilk teşhisiydi.** `deriveSide`, SAP event participant
kimliğinin geçmiş satırlarında bulunmasını şart koşuyordu; o satırlar statistics
takım kimliği kullandığı için join her gerçek payload'da başarısız oluyor ve her
maç `UNAVAILABLE` dönüyordu.

**Aynı gün verdiğim iki ara teşhis yanlıştı ve geri alındı.** (1) "Kapsam
engeli": o tarama bridge'i `stats_id` ile çağırıyordu; `team-form.js` zaten
`fetchMatchStatistics(identity.id)` kullanıyor, yani boşluk sondanın
özelliğiydi, sağlayıcının değil. (2) "Adaptör yanlış anahtar gönderiyor":
adaptör hiçbir zaman `stats_id` göndermedi; `id` 8/8 - `stats_id` 0/8
karşılaştırması gerçek ama sondayı tarif ediyor, ürünü değil.

**Düzeltme.** Participant join kaldırıldı. Taraf zaten
`homeTeamForms`/`awayTeamForms` ayrımıyla yapısal olarak belli; grubun takımı
ise bütün satırlarındaki `{homeTeamId, awayTeamId}` kesişiminden tekil olarak
türetiliyor ve venue bu kimlikle hesaplanıyor. Tek satırlık grup belirsizdir,
null'a düşer; açıkça boş grup sıfır-örneklem anlamını korur.

**Canlı doğrulama:** altı güncel maçın beşinde iki taraf da dolu
(`Baltika - K. Sovetov` ev 2G1B2M `WDLWL`, deplasman 2G1B2M `DWLLW`;
`Orenburg - R. Kazan` ev 1G4B0M). Altıncı maç yalnız maç rotasındaki önceden
var olan `MATCH_NOT_FOUND` nedeniyle düştü.

**Kapılar:** BFF testleri **409/409** (team-form süiti 23 -> 30), CAP production
build geçti. Mobile tarafı değişmedi, bu yüzden Mobile kapıları yeniden
çalıştırılmadı.

`NXT-OBS-142` artık `READY`. Kalan iş mühendislik değil operasyonel karardır:
`BTB_MOBILE_TEAM_FORM_ENABLED` hâlâ **kapalı**, rollout ve yeni APK ayrı onaya
tabidir. Telefondaki `b9ca7ae` APK'sı bu düzeltmeyi içermez ve Takım Formu
orada hâlâ örnek veridir.

`zbet-cap` değişikliği commit edilmedi; onay bekliyor.

## 2026-09-02 — Yeni pilot APK üretildi; NXT-OBS-142 engeli düzeltildi

Sahip onayıyla temiz pushed `b9ca7ae` kaynağından tek ARM64 pilot artefaktı
üretildi ve APK'nın içinden doğrulandı.

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-pilot-b9ca7ae.apk
Package : com.btb.mobile.next · 0.1.0 · minSdk 24 · targetSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 54.259.057 bytes
SHA-256 : 058D81FABDA642AEAF869363F0A3E90525F0E1C1FBDB0F67C937D58E146223FE
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
          mobileIntelligence=SYNTHETIC
Source  : b9ca7ae
Status  : FINAL_PILOT_CANDIDATE · fiziksel Xiaomi kabulü bekliyor
```

İmza sertifikası öncekiyle aynı; telefonda kaldırmadan üzerine kurulabilir.
Gömülü `app.config` `mobileIntelligence=SYNTHETIC` taşıyor. Hermes bundle'ında
batch 01 metinleri **ve** batch 02 eklemeleri (`En yeni → eski` başlığı, G/B/M
erişilebilirlik sözcükleri, üç sözleşme sürümü) UTF-16 aramasıyla doğrulandı;
12 kontrolün 12'si mevcut. Gizli anahtar taraması temiz — tek `client_secret`
eşleşmesi Hermes string tablosunda bitişik duran bir tanımlayıcıdır, değer
değildir. Önceki `1fc47bc` APK'sı Geri Dönüşüm Kutusu'na taşındı (geri
alınabilir); `.codex-artifacts` yalnız yeni artefaktı tutuyor.

Bu APK'da üç zekâ yüzeyi de **örnek veri** ile çalışır ve rozetle işaretlidir.
Gerçek olan her şey (canlı maçlar, Super, Toto, maç detayı) pilot BFF'ten
gelir. Pilot servise dokunulmadı; runtime yeniden başlatılmadı.

### NXT-OBS-142 düzeltmesi — engel yanlış anahtar

Sahibin paylaştığı `match-card/3094620/statistics` bağlantısı aynı gün verilen
"kapsam engeli" teşhisini çürüttü. `3094620` o maçın SAP **`id`** alanıdır;
`stats_id` ise `72343988`. Sekiz güncel maçta karşılaştırma: **SAP `id` ile
8/8 dolu, `stats_id` ile 0/8.** Bilyoner match-card statistics ucu Bilyoner maç
kimliğiyle anahtarlanıyor; BTB ise BetRadar olay kimliği olan `stats_id`
gönderiyordu. Uç hata vermeyip HTTP 200 ve boş grup döndürdüğü için bu sessizce
"geçmiş yok" gibi göründü.

Kimlik türetimi doğru anahtarla sekiz maçın sekizinde, iki tarafta da çalıştı.
Yani kalan iş bir Mobile BFF değişikliğidir ve SAP yazımı gerektirmez:
statistics çağrısında `stats_id` yerine SAP `id` kullanmak ve normalizer'ın
participant kimliği yerine gruptan türetilen statistics kimliğini kullanması.
Bu turda uygulanmadı; `BTB_MOBILE_TEAM_FORM_ENABLED` kapalı kalıyor.

Daha önce kaydedilen "8 haneli aile için geçmiş yayınlanmıyor" sonucu
**yanlıştı** ve geri alındı; `BTB - Aktif`'e devredilecek bir iş yoktur.

## 2026-09-02 — M15 kapatıldı; NXT-OBS-142 engeli yeniden tanımlandı

Mod: `OBSERVATION`. Cutover batch **açılmadı**: bu tur denetim, salt-okunur
inceleme ve yol haritası mutabakatından ibaretti; kod değişmedi. Commit/push,
runtime, APK ve release onayı alınmadı ve varsayılmadı.

### M15 `NOT_STARTED` -> `CLOSED`

Kendi beş tamamlanma kriterine karşı tek tek denetlendi; alt görevlerin `DONE`
olması kanıt değil, kanıta işaretçi sayıldı. Kriter 4 çalışma ağacında yeniden
doğrulandı: `npm run check` çıkış 0, **562/562** test. Karar kaydı
`btb-codex/ROADMAP_AMENDMENT_2026-09-02.md`.

Durum hem otorite (`btb-codex/config/agent-roadmap.config.json`) hem ayna
(`BTB Logs/BTB_ROADMAP.md`, satır 35 tablo hücresi) üzerinde birlikte
güncellendi; `btb roadmap` artık `M15 CLOSED / COMPLETE`, sapma yok, ilerleme
`8/15 (%53,3)` diyor. Ayna prose değil **tablo hücresinden** okunuyor; yalnız
paragrafı düzeltmek `STATUS_MISMATCH` bırakıyordu.

Kapanış yalnız sentetik temeli kapsar. Gerçek analitik iddia edilmez;
`NXT-OBS-145`/`146` görselleri teslim edilmedi; `NXT-OBS-142` çözülmedi;
`TASK-0044`/M9 ve `TASK-0011`/M11 dokunulmadan kalır.

### NXT-OBS-142: kimlik çözüldü, engel kapsama kaydı

Salt-okunur inceleme kayıtlı engeli kısmen çürüttü.

- **Crosswalk gerekmiyor.** Yanıt zaten `homeTeamForms`/`awayTeamForms` olarak
  ayrık geliyor, yani taraf yapısal olarak belli. Takımın statistics kimliği de
  grubun bütün satırlarındaki `{homeTeamId, awayTeamId}` kesişiminden tekil
  olarak türetiliyor. Doğrulandı: `3190638` -> `187`/`273` (kayıtta engel diye
  geçen kimlikler), `3089897` -> `126`/`2`. İki olayda da iki taraf ayrı çıktı;
  takım adları yalnız çapraz kontrol için okundu, türetimde kullanılmadı.
- **Asıl engel kapsam.** Güncel fikstürdeki 35 satırın tamamı 8 haneli
  `stats_id` taşıyor; örneklenen 15 güncel olayın 15'inde takım geçmişi boş
  döndü. Geçmiş yayınlanan tek aile 7 haneli eski olaylar. Kimlik türetimi tek
  başına uygulansa bile gerçek Takım Formu bugünkü maçların hepsinde
  `UNAVAILABLE` kalır ve zorunlu populated uçtan uca smoke geçemez.
- Bu yüzden kimlik türetimi **bilerek uygulanmadı**: doğrulanamayacak bir
  değişiklik yazmak yerine engel doğru tanımlandı. Sıradaki prerequisite,
  güncel olay kimliği ailesi için sağlayıcıda geçmişin neden yayınlanmadığıdır
  ve `BTB - Aktif` sahipliğindedir. Gerçek Takım Formu kapalı kalır.

Ayrıntı: `docs/TEAM_FORM_INTEGRATION.md` ve `OBSERVATION_LOG.md` `NXT-OBS-142`.

### Üç sonucun ayrımı

1. **M15 temeli** — tamam, kapandı, fiziksel kabul alınmış sentetik prototip.
2. **Yeni görseller** (`NXT-OBS-145` G/B/M çipleri, `NXT-OBS-146` Jinx ikonu) —
   `READY`, telefonda **yok**, yeni APK gerekir. Renk paleti sahip tarafından
   2026-09-02'de onaylandı: galibiyet yeşil, beraberlik sarı, mağlubiyet
   kırmızı; kod değişikliği gerekmedi. Açık kalan tek kapı yeni APK üretimi ve
   fiziksel kabuldür.
3. **Gerçek veri** — `NXT-OBS-142` kapsam engeli, `TASK-0044`/M9,
   `TASK-0011`/M11. M15 bunlara bağlı değildir ve bunları kapsamaz.

### Bağımlılık uyarısı — gizlenmiyor

Expo Doctor 16 pakette önceden var olan patch-sürüm sapmasında hâlâ başarısız.
Hiçbir paket yükseltilmedi, hiçbir uyarı bastırılmadı. M15 kriter 4'ün listesi
tip/lint/unit/erişilebilirlik/tema/dar ekrandır; Doctor bu listede yok, bu
yüzden M15'i engellemez. Release kapısını ise engeller ve `ARCHITECTURE.md`
içindeki `npm audit` transitive `uuid` maddesiyle aynı yerde durur: önerilen
otomatik düzeltme Expo'yu uyumsuz eski majora düşürdüğü için uygulanmıyor.

### Checkpoint

Kod değişmedi. Bu turda değişen dosyalar yalnız kayıt/yol haritası:
`btb-codex` otorite + yeni karar kaydı, `BTB Logs` ayna, Mobile
`OBSERVATION_LOG.md` / `TEAM_FORM_INTEGRATION.md` / bu devir.

```text
zbet-mobile  master · f794dda · dirty (batch 02 + bu tur belgeleri)
zbet-cap     main   · b92c6c7 · dirty (Team Form yolu, deploy edilmedi)
btb-codex   main   · 6611602 · dirty (task kabulü + M15 CLOSED + karar kaydı)
BTB Logs    main   · 3344ebe · dirty (ayna M15 satırı)
zbet-abap    main   · 48774d6 · temiz, dokunulmadı
```

Not: bu bölüm yazıldığında telefondaki artefakt `1fc47bc` idi. Sonrasında
sahip onayıyla `b9ca7ae` APK'sı üretildi; güncel artefakt yukarıdaki bölümde.

Pilot servis dokunulmadı: `https://api.surklase.com`, PID `25412`. Bu turda
runtime yeniden başlatılmadı.

## 2026-09-02 — Codex closure / continue with Claude


Owner asked to finish safely and continue with Claude in the same workspace.
Mod: `OBSERVATION`; no open cutover run. This is a local, uncommitted handoff,
not a release, commit/push approval or a newly opened implementation batch.

Start with `AGENTS.md` and this handoff. Then read
`docs/TEAM_FORM_INTEGRATION.md` and
`docs/observation_archive/cutover_2026-09-02-02.md`. The latest three Austria
Wien / WSG Tirol screenshots are recorded at the top of `docs/OBSERVATION_LOG.md`;
they match partial synthetic fixtures, not acceptance of the unreleased changes.
Use the canonical `btb` entrypoint and the matching BTB workflow skill.

Recommended next task: investigate NXT-OBS-142 **read-only**. Find an
authoritative event/participant-to-statistics-team identity link, verify it for
several matches and both sides, and report the smallest required fix. The
crosswalk has NOT been found; do not infer it from names or hard-code observed
IDs. Diagnosis can stay in Mobile; any SAP implementation belongs to BTB - Aktif
and its separate write/activation gates. Keep real Team Form disabled until a
populated end-to-end smoke succeeds. The owner's last request was closure;
no new investigation, code fix or rollout was started during closure.

Closure verification (no fetch; compared to locally recorded upstream refs):

| Repository | Branch / HEAD | Local changes |
| --- | --- | --- |
| zbet-mobile | master / f794dda | 21 paths: batch-02 source/tests/contracts and current docs |
| zbet-cap | main / b92c6c7 | 10 paths: Team Form route/service/normalizer/bridge/tests/startup flag |
| btb-codex | main / 6611602 | state/task-registry.json only; prior physical acceptance for three prototype tasks |
| zbet-abap | main / 48774d6 | clean; untouched |
| BTB Logs | main / 3344ebe | clean; untouched |

All five have zero ahead/behind against those recorded refs. Nothing staged,
committed or pushed. Preserve all dirty/untracked work; source-file groups and
completed checks are in the batch archive. Reuse checks for unchanged code.
No daily exports or Model Lab data were processed in this Mobile work.

At closure: local/public `/health` HTTP 200, BFF PID 25412 unchanged;
8081/8082 have no listener; no emulator process remains. The verified APK hash
below is unchanged and does not contain batch 02. No further cleanup, runtime
restart, environment change, artifact deletion or release was performed.

## 2026-09-02 — Mobile batch 02 local checkpoint

Mod: `OBSERVATION`

The local batch is finished with deferred items, not released. NXT-OBS-145/146
are READY for a later approved physical test: ordered G/B/M form-header chips
and the original static Jinx heading icon. Preview colours are green/yellow/red;
loss-colour clarification is still pending before a new APK.

NXT-OBS-142 is DEFERRED despite the new local route/adapter/switch. Direct
read-only SAP HTTP/OData revealed different identity namespaces: event 3190638
uses SAP participant IDs 216/349 but form-history team IDs 187/273. The adapter
fails closed as LIVE/UNAVAILABLE; it has NOT passed a populated real-data smoke.
Verify an authoritative crosswalk next; keep the BFF feature flag off. No SAP
or model object changed. See `docs/TEAM_FORM_INTEGRATION.md`.

Checks: Mobile type/lint/562 tests/brand, full BFF tests/build, Android JS export
and 360 dp dark/light/130% text smoke pass. Existing Expo Doctor patch-version
drift remains; the release gate is not all-green. Prior acceptance/task-register
edits are preserved. NXT-OBS-141 still awaits the explicit owner retry result.

Runtime remains https://api.surklase.com, BFF PID 25412 at b92c6c7, local/public
health 200. Existing ARM64 APK `btb-mobile-next-arm64-pilot-1fc47bc.apk` is
unchanged, still synthetic; SHA-256
`61B64220B4B3507A2272595FBC98BA01162601697F5C607C4A1A8372E4E470DC`.
Mobile f794dda, CAP b92c6c7 and tooling 6611602 remain the committed baselines.
This checkpoint is dirty/uncommitted; nothing staged or pushed, no runtime
restart, new APK or distribution. Separate approvals remain mandatory.
Full changed-file groups, evidence and deferred work:
`docs/observation_archive/cutover_2026-09-02-02.md`.

## 2026-09-02 — Fiziksel M15 kabulü ve yeni observation kapsamı

Historical intake below; batch 02 above supersedes its next-step/status notes.

Sahip, fiziksel Xiaomi testinin başarılı olduğunu doğruladı. Böylece sentetik
M15 prototiplerinin görsel/davranış kabulü tamamlandı: `NXT-OBS-138`–`140`
kapsamındaki `TASK-0040`, `TASK-0045` ve `TASK-0046` `DONE` durumuna alındı.
Bu kabul gerçek veri entegrasyonu anlamına gelmez.

Örnek verinin nedeni kesin: pilot APK
`EXPO_PUBLIC_MOBILE_INTELLIGENCE=SYNTHETIC` ile derlendi ve üç yeni okuma
yerleşik fixture'lardan geliyor. Bu bir telefon önbelleği veya runtime hatası
değildir. Bu intake anında `LIVE` modu bütün üç rotayı BFF'e yöneltiyordu ve
üç runtime endpoint henüz yoktu; batch 02 yerel Team Form rotasını ekledi,
ancak kimlik eşleme engeli nedeniyle gerçek veri yayını kapalı kaldı.

Yeni observation kayıtları:

- `NXT-OBS-142` (`OBSERVED`): mevcut yerel `FORM_CTX_V1` temelini gerçek Mobile
  BFF `team-form` rotasına bağlama; canlı SAP MCP kanıtı henüz alınmadı.
- `NXT-OBS-143` (`DEFERRED`): Match Path gerçek motoru; `TASK-0044` / M9'a
  bağlı.
- `NXT-OBS-144` (`DEFERRED`): gerçek Jinx maç analisti; `TASK-0011` / M11'e
  bağlı.
- `NXT-OBS-145` (`OBSERVED`): takım başlığında sıralı son beş W/D/L şeridi.
  Mevcut sözleşme yalnız toplamları taşıdığı için DTO/ABAP türetim uzatması
  gerekir. Öneri W=yeşil, D=sarı/bronze, L=kırmızı; mağlubiyet rengi owner
  netleştirmesi bekler.
- `NXT-OBS-146` (`OBSERVED`): Jinx başlığına mevcut özgün Jinx varlığıyla küçük
  sabit ikon; ambient/yüzen maskot geri gelmez.

Mod `OBSERVATION` olarak kalır. Bu kayıtlar kod değişikliği, commit/push, yeni
APK, runtime restart veya deploy başlatmaz. Yerel uygulanabilir kapsam sonraki
`btb next cutover start` komutunda dondurulacaktır.

## 2026-09-02 — `NXT-OBS-141`: Super ve Özet sekmelerinde 502, çözüldü

Sahip yeni APK'yı kurduktan sonra `Karar günlüğü` ve `Bugünün merkezi`
ekranlarında `Mobil servis hatası (502)` bildirdi; `Maç Detayı` ile iki yeni M15
yüzeyi normal çalışıyordu.

Bu `NXT-OBS-137` süreç ölümü değildi: BFF ayaktaydı, watchdog `18:00:01` sonuç
`0` ile geçmişti ve `/health` iki uçta da `200` idi. Arıza rota bazlıydı —
`/v1/super/logs`, `/v1/super/kpis` ve `/v1/dashboard` `502`, matches ve Toto
`200`. Yerel istek de `502` döndüğü için sorun BFF'in kendisindeydi.

Kök neden: bugün sonuçlanan iki Super kararı `result_text = "Unresolved"`
taşıyor. `mapSuperResult` bu değeri tanımıyordu ve satırlar liste yanıtı içinde
map edildiği için iki satır üç rotayı birden düşürdü. SAP alanları durumu
açıkça tanımlıyor: `settled_text=Settled`, `unres_reason=
REQUIRED_SCOPE_UNAVAILABLE`, `result_profit=0`, `model_eval=EXCLUDE`. Sahip
kararıyla bu durum mevcut `VOID` üyesine eşlendi; bilinmeyen yeni değerler hâlâ
hata fırlatıyor. Hata işleyicisi artık `cause` alanını da yazıyor — alan adı
daha önce log'da hiç görünmüyordu.

Düzeltme `zbet-cap b92c6c7`. BFF testleri `378/378`, CAP production build geçti.
Pilot runtime temiz pushed kaynaktan `PID 23320 -> 25412` ile bir kez yeniden
başlatıldı; altı uç hem local hem public `200`. Public read-back listenin 200
satırının tamamını döndürdü (`WON 72 · LOST 119 · VOID 7 · OPEN 2`), ham SAP
sayımıyla birebir eşleşti ve iki `Yunnan` kararı `VOID` olarak geldi.

Yeni APK gerekmez; düzeltme sunucu tarafındadır ve telefondaki mevcut
`1fc47bc` kurulumu `Tekrar dene` ile düzelir.

Repository checkpoint güncellemesi: `zbet-cap main · b92c6c7 == origin/main`.

## 2026-09-02 — M15 birinci batch kapandı, observation moduna dönüldü

`btb next cutover start` ile M15 Mobile Intelligence Foundation paralel
şeridinin ilk batch'i çalıştırıldı, doğrulandı ve sahip onayıyla commit/push,
fiziksel telefon APK'sı ve kapanış adımlarıyla tamamlandı. Dondurulan üç madde
(`NXT-OBS-138`, `139`, `140`) uygulandı ve `OBSERVED` -> `READY` durumuna
alındı. Açık `OBSERVED` satırı kalmadı.

Kod kapsamı yalnız `zbet-mobile/expo-app` oldu; `zbet-cap` hiç değişmedi.

- Üç sağlayıcı-bağımsız sözleşme: `team-form.v1`, `match-path.v1`,
  `jinx-match-outlook.v1`. Üçü de `origin: LIVE | SYNTHETIC` taşır ve `.catch`
  düşüşü `SYNTHETIC`'tir — ayrıştırılamayan köken kanıt iddia edemez. Kartlar
  sentetik veriyi görünür `Örnek veri · gerçek maç bilgisi değil` rozetiyle
  söyler.
- `NXT-OBS-139` grafiği sahibin isteğiyle Codex tasarım oturumundaki mockup ile
  karşılaştırıldı ve o yapıya göre yeniden yazıldı: `stateNormality` sürekli
  çizgi, `eventSurprise` bu çizgi üzerinde ayrık işaret, kohort ise eksen
  altında ikincil sayı satırı. Codex'ten alınmayan tek şey kırmızı renkti; bu
  uygulamada kırmızı kaybeden karar demek, sürpriz ise kayıp değil. Kohort
  daralması hiçbir yerde sürprize dönüştürülmüyor.
- `NXT-OBS-140` yüzeyi sorulmadan hiçbir istek üretmiyor; istemci tarafı dil
  kapısı tavsiye, kesinlik ve model/Super/rating sözlüğünü reddediyor.
- Açık temada gerçek bir kusur bulunup düzeltildi: sürpriz metresi
  `semantic.warning` kullanıyordu, fakat açık palette gold `#8A6410` ile bronze
  `#8A5F2B` neredeyse aynı. Anlam katmanına `semantic.surprise` rolü eklendi.

Yüzeyler `EXPO_PUBLIC_MOBILE_INTELLIGENCE` moduna bağlı: `OFF`, `SYNTHETIC`,
`LIVE`. Pilot APK bu batch'te `SYNTHETIC` ile üretildi; üç M15 rotası yerleşik
fixture'lardan karşılanıyor, diğer her rota gerçek pilot API'yi kullanmaya devam
ediyor ve sentetik değerler rozetle işaretli. Mod derleme zamanında bildirilir;
"404 olursa fixture'a düş" davranışı kasıtlı olarak yoktur.

Doğrulama: `npm run check` temiz (typecheck + ESLint + **554/554** test + marka
kapısı); Android production bundle hem preview hem pilot profilinde geçti;
Expo Doctor'ın tek başarısız kontrolü önceden bilinen patch-sürüm sapmasıdır.
Android 15 `x86_64` emülatöründe üç yüzey de populated ve unavailable
durumlarında, koyu ve açık temada render edildi; erişilebilirlik etiketleri UI
hiyerarşisi dökümünden doğrulandı.

Ortam notu: kabukta `EXPO_PUBLIC_MOBILE_PILOT_KEY` tanımlı ama
`EXPO_PUBLIC_MOBILE_AUTH_MODE` tanımsız olduğu için `auth-mode.ts:69` muhafızı
config çözümlemesini reddediyor. Önceden var olan ortam durumu; kapılar açık
profil değişkeniyle çalıştırıldı.

Deploy adımı yok: `zbet-cap` değişmediği için rollout edilecek BFF değişikliği
ve yeniden başlatılacak runtime bulunmuyor. BTP Work Zone deploy'u bu akışın
dışındadır.

Ayrıntı: `docs/observation_archive/cutover_2026-09-02.md`.

Repository checkpoint:

```text
zbet-mobile  master · 1fc47bc == origin/master · clean
zbet-cap     main   · b92c6c7 == origin/main   · clean (NXT-OBS-141 düzeltmesi)
btb-codex   main   · 0c12834 == origin/main   · clean
BTB Logs    main   · 3344ebe == origin/main   · clean
```

Final ARM64 pilot APK temiz pushed `1fc47bc` kaynağından üretildi:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-pilot-1fc47bc.apk
Package : com.btb.mobile.next
Version : 0.1.0 · minSdk 24 · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 54.257.117 bytes
SHA-256 : 61B64220B4B3507A2272595FBC98BA01162601697F5C607C4A1A8372E4E470DC
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
          mobileIntelligence=SYNTHETIC
Source  : 1fc47bc
Status  : FINAL_PILOT_CANDIDATE · dağıtılmadı · fiziksel Xiaomi kabul edildi
```

İmza sertifikası önceki pilot APK'larla aynı; telefonda kaldırmadan üzerine
kurulabilir. Gömülü `app.config` `mobileIntelligence=SYNTHETIC` taşıyor,
`libreact_codegen_rnsvg.so` pakette ve Hermes bundle'ında M15 arayüz metinleri
UTF-16 aramasıyla doğrulandı. Gizli anahtar taraması temiz. Önceki
`btb-mobile-next-arm64-pilot-8be2daf.apk` Geri Dönüşüm Kutusu'na taşındı.

Pilot route `https://api.surklase.com`; bu batch sırasında runtime restart veya
canlı health doğrulaması yapılmadı.

Mod: `OBSERVATION`. M15 sentetik yüzeylerinin fiziksel Xiaomi kabulü tamamlandı;
gerçek veri entegrasyonu ayrı observation kapsamıdır.

## 2026-09-02 — Mobile Intelligence Foundation paralel şerit devri



Sahip, M7 kritik yolu sürerken Mobile intelligence hazırlığını erkene almak için
`M15 — Mobile Intelligence Foundation` paralel şeridini onayladı. M15 henüz
başlatılmadı; yeni Mobile thread'i `btb next cutover start` komutuyla yalnız
yerel batch'i açacaktır.

Dondurulacak observation kapsamı:

- `NXT-OBS-138` / `TASK-0040`: statistics API takım-formu karşılaştırma kartı.
- `NXT-OBS-139` / `TASK-0045`: sentetik sözleşmeyle Match Path normality grafiği.
- `NXT-OBS-140` / `TASK-0046`: sentetik sözleşmeyle yalnız bilgilendirici
  `Ask Jinx` maç görünümü.

Üst bağımlılıklar ayrı kalır: gerçek Similar Match Journey hesaplaması
`TASK-0044` / M9, gerçek merkezi Jinx maç analisti `TASK-0011` / M11 altındadır.
Bu şerit yalnız sağlayıcı-bağımsız DTO, sentetik fixture, yerel Mobile UI ve
orantılı testleri kapsar. SAP/kalıcılık, model/Super/rating kullanımı, gerçek
Jinx analizi, BFF runtime rollout, commit/push, APK, deploy ve release ayrıca
onaylanmadı. Sentetik değerler gerçek veri gibi gösterilmez.

Yeni thread ilk olarak bu dosya, `AGENTS.md`, `docs/NEXT_CUTOVER_PROCEDURE.md`
ve `docs/OBSERVATION_LOG.md` içindeki `NXT-OBS-138`–`140` satırlarını okur.
Mevcut kod/runtime/APK bu devir sırasında değiştirilmedi.

Devir anındaki repository checkpoint'i:

```text
zbet-mobile  master · b97a81e == origin/master · yalnız bu handoff ve
             OBSERVATION_LOG.md değişikliği dirty
zbet-cap     main   · c63b729 == origin/main   · clean
btb-codex   main   · cdfc29d == origin/main   · M15 roadmap/test/task kayıtları dirty
BTB Logs    main   · e41d2c1 == origin/main   · BTB_ROADMAP.md dirty;
             önceden var olan M6 kapanış düzenlemesi korundu, M15 üstüne eklendi
```

Yeni APK üretilmedi. Mevcut fiziksel-pilot geri dönüş artefaktı önceki
checkpoint'teki `btb-mobile-next-arm64-pilot-8be2daf.apk`, SHA-256
`BD41746BDBF7839A8F921D523D04FD6476B9FE2173064F0C588BB9C87E6B9936` olarak
değişmeden kalır. Pilot route `https://api.surklase.com`; bu devir sırasında
runtime restart veya yeniden canlı health doğrulaması yapılmadı.

Mod: `OBSERVATION` — sekizinci `btb next cutover start` batch'i 2026-08-29'da
commit/push, pilot runtime aktivasyonu ve fiziksel Xiaomi kabulüyle tamamlandı.
`NXT-OBS-136` `CLOSED`; açık ürün doğrulama kapısı kalmadı.

2026-08-30 olayı (`NXT-OBS-137`): pilot Mobile BFF süreci
`2026-08-29T19:58:59Z` civarında iz bırakmadan durdu; `cloudflared` ayakta
kaldığı için tünel `https://api.surklase.com` üzerinden her isteğe **HTTP 502**
döndürdü. Zamanlanmış görevde tekrar aralığı olmadığından hiçbir şey servisi
geri getirmiyordu. Servis geri alındı ve göreve kendi başına duran 30 dakikalık
tekrarlı tetikleyici eklendi (`zbet-cap 203a4c2`); watchdog hem kontrollü
testte (`00:05:52` durdurma -> `00:10:12` kurtarma) hem de aynı gece istenmeden
gerçekleşen ikinci bir ölümde (`00:51:08`) servisi kendiliğinden toparladı.
BFF'in neden durduğu teşhis edilmedi ve `TASK-0032` olarak açık kayıtlıdır.
Model, Super, Toto, SAP ve Mobile sözleşme davranışı değişmedi.

- Mobile BFF current-match ve insight listelerinin bounded SAP penceresi 50'den
  200'e çıkarıldı. Oran, tek-maç, Super ve Toto limitleri değiştirilmedi.
- Elli parked satırdan sonraki aktif yaklaşan fikstürü koruyan regresyon geçti;
  resmî BFF test ve production build kapıları yeşil.
- Değişmiş kaynaktan izole canlı SAP replay'i, başlangıç saatinden önce 29 aktif
  maç, 22 canlı, 5 devre arası ve 2 yaklaşan fikstür döndürdü. BFF düzeltmesi
  `zbet-cap 42f4873` olarak push edildi ve pilot runtime `PID 27556 -> 36028`
  ile bir kez yeniden başlatıldı.
- Restart sonrası local/public feed birebir aynı 28 aktif maç döndürdü:
  `22 LIVE`, `6 HALF_TIME`, key farkı `0`; stderr boş ve iki health HTTP 200.
  Önceden yaklaşan iki 22:30 fikstürü read-back saatinde başlamış olduğundan
  güncel `NOT_STARTED=0` doğru zaman geçişidir. Pre-kickoff replay ve 51. satır
  regresyonu yaklaşan fikstürün artık pencere dışında kalmadığını kanıtlar.
- Sahibin fiziksel Xiaomi ekran kanıtında `Canlı 28 maç` kartlarıyla birlikte
  render edildi; aynı anda `Fikstür 0 maç` / `Yaklaşan maç yok` görünümü API'nin
  güncel sıfır yaklaşan sonucuyla eşleşti. Sahip ardından uygulamanın artık
  çalıştığını açıkça doğruladı; P0 akış düzeltmesi fiziksel kabul aldı.

Yedinci batch'te `NXT-OBS-134` ve `NXT-OBS-135` uygulanmış; runtime ve fiziksel
Xiaomi/sahip kabulü tamamlanarak `CLOSED` olmuştu. `NXT-OBS-133`'ün
en-yüksek-model-skoru kabul hedefi supersede edilmiştir.

- `Canlı maçlar` kartı ve `Canlı Maç Detayı` artık aynı temsilci karar
  sözleşmesini kullanır: void olmayan Super kararları arasında önce daha yüksek
  `rating`/BTB yıldızı, yalnız rating eşitse daha yeni `created_at` kazanır.
  Kalan deterministik sıra dakika, market ve karar nedenidir.
- Model skoru artık seçim sırası veya uygunluk filtresi değildir. Seçim, rating,
  karar dakikası, neden, model skoru, güven ve seçim oranı tek Super Log
  satırından atomik taşınır; güncel oran seçilen marketten okunur.
- Maç akışındaki soldaki ayrık rating yıldızı kaldırıldı. Merkezdeki konturlu
  düğüm yatay genişliyor ve kararın 1–5 yıldızının tamamını tek göstergede,
  `BTB rating n/5` erişilebilirlik anlamıyla gösteriyor. Tarihsel sıra,
  navigasyon ve model/Super üretim davranışı değişmedi.

Doğrulama: Mobile BFF testleri ve production build geçti. Mobile typecheck,
ESLint ve unit testleri geçti; Expo Doctor'ın yalnız önceden bilinen patch-sürüm
önerisi izole edildi ve kalan kontroller geçti; Android production JavaScript
export/bundle geçti. Android 15 x86_64 emülatöründe uygulama Metro üzerinden
açıldı, pilot canlı liste ve Match Detail timeline render edildi; merkez yıldız
düğümünün genişlediği ve soldaki ayrık yıldızın kalktığı görsel olarak
doğrulandı. Emülatördeki mevcut örnek kararlar 1 yıldızlı olduğundan 2–5 yıldız
sayımı kaynak unit testiyle doğrulandı; fiziksel Xiaomi kabulü bekleniyor.

Sahip onayıyla BFF değişikliği `zbet-cap 108f98a`, Mobile işlevsel değişikliği
`zbet-mobile 8be2daf` ve kapanış kanıtı `cd3e686` olarak commit/push edildi.
Sahip final APK'yı fiziksel telefona kurduğunu bildirdi ve pilot BFF mevcut
`-Port 4004 -AuthMode pilot` yapılandırmasıyla temiz pushed `108f98a`
kaynağından bir kez yeniden başlatıldı (`PID 6484 -> 27556`). Local/public
health HTTP 200, stderr boş ve rating-first read-back yeşil. SAP/Firebase/
Cloudflare yapılandırması değişmedi.

Checkpoint:

```text
zbet-cap    203a4c2 · clean pushed source · BFF davranışı hâlâ 42f4873
zbet-mobile closing evidence commit · functional/APK source 8be2daf
runtime     PID 20660 · local/public HTTP 200 · watchdog 30 dk · task result 0
artifact    btb-mobile-next-arm64-pilot-8be2daf.apk · fiziksel telefona kuruldu
acceptance  NXT-OBS-137 CLOSED · sahip 2026-08-30'da telefonda doğruladı
```

Final ARM64 pilot APK temiz pushed `8be2daf` kaynağından üretildi:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-pilot-8be2daf.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1) · minSdk 24 · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 54.075.313 bytes
SHA-256 : BD41746BDBF7839A8F921D523D04FD6476B9FE2173064F0C588BB9C87E6B9936
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
Source  : 8be2daf
Status  : FINAL_PILOT_CANDIDATE · dağıtılmadı · fiziksel Xiaomi kabulü bekliyor
```

APK'nın 1321 girdilik açılmış secret taramasında private-key/service-account,
client-secret, SAP session ve BFF Gemini anahtarı/host/model izleri bulunmadı;
beklenen API hostu ve yeni rating erişilebilirlik metni bulundu. Önceki
`btb-mobile-next-arm64-pilot-b7c1158.apk` ve geçici `android-export` Geri
Dönüşüm Kutusu'na taşındı; geri alınabilir. Kaynak, test, belgeler ve brand
asset'leri korunuyor.

Canlı read-back'te tarihsel kararı olan yedi maçın tamamında temsilci seçim ile
Live/Detail alanları rating-first kuralla eşleşti. Bounded local/public örnekler:
üç adaylı maçta tek en-yüksek rating `2★ Ms1X 68'`; iki eşit-rating adaylı
maçta en yeni karar `1★ Ms1 75'`. İki örnekte de local/public Live kartı ve
Match Detail aynı karar/dakika/model skoru alanlarını taşıdı.

Sahip final APK'yı fiziksel cihazda kontrol etti ve uygulamanın bütünüyle doğru
çalıştığını onayladı. `NXT-OBS-134` ve `NXT-OBS-135` için açık ürün/doğrulama
kapısı kalmadı. Runtime ve fiziksel kabul kanıtı bu kapanış commit'ine dahildir.
Batch ayrıntısı:
`docs/observation_archive/cutover_2026-08-29-02.md`. Önceki en-yüksek-skor
batch'i: `docs/observation_archive/cutover_2026-08-29.md`.

## Önceki batch — 2026-08-26

Beşinci `mobile cutover start` batch'i 2026-08-26'da
kapandı ve profil observation'a döndü. `NXT-OBS-129`, `130`, `131` ve `132`
uygulandı ve fiziksel Xiaomi/sahip kabulini bekleyen `READY` durumuna alındı.
Açık `OBSERVED` satırı kalmadı. Önceki batch'lerin `READY` satırları değişmedi.

- Canlı switch'i kapalıyken chip artık `Fikstür` ve o kapsamın kendi maç
  sayısını yazar; erişilebilirlik metni de aynı kapsamı söyler. Yeni BFF/SAP
  alanı, sorgu veya sözleşme değişikliği gerekmedi.
- Karar günlüğünde açık filtre `Açık` olarak kısaldı; filtre davranışı ve
  sayım değişmedi.
- Super karar detayında `SONUÇ` oku, bölüm başlığından çıkarılıp gerçekten
  dokunulabilir olan skor hücresine taşındı. İlk yerleşim (eyebrow yanı) sahip
  tarafından reddedildi ve düzeltildi.
- Jinx balonu, BFF arkasındaki doğrulanmış bir dil modeli yolundan metin
  alabiliyor. Model karar vermez, yalnız ifade kurar: uzunluk, tek satır,
  yasaklı tavsiye/tahmin ifadesi, harfle yazılmış sayı ve verilmemiş rakam
  reddedilir; kural eşleştirmesi diakritikten bağımsızdır. Anahtar yokken
  özellik kapalıdır ve uygulama deterministik davranışını sürdürür.

Resmî Mobile ve Mobile BFF kalite kapıları geçti. Canlı üretim `POSITIVE`,
`NEGATIVE` ve `EVEN` için doğrulanmış metin döndürdü ve cache'ten tekrarlandı;
`EMPTY` reddedilip deterministik repertuvara düştü — amaçlanan fallback. BFF,
logon task'ın kendi argümanlarıyla kontrollü biçimde yeniden başlatıldı; local
ve public health yeşil, auth modu/port/notification davranışı değişmedi. SAP,
Firebase, Cloudflare ve dış sistem değişmedi; ayrı bir DEV runtime deploy hedefi
yoktu.

Commit/push: `zbet-cap` `04d2e26`, `zbet-mobile` `b7c1158` ve `2536efb`,
`btb-codex` `dcd2a89`.

```text
Artifact : btb-mobile-next-arm64-pilot-b7c1158.apk
ABI      : arm64-v8a (yalnız)
Size     : 54.074.885 bytes
SHA-256  : 539200C91C93996BE4375283DD6F7C585ACA3C809BDDD82F6850F5D8ED14E618
Signing  : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config   : authMode=pilot · useMocks=false · API=https://api.surklase.com
Source   : b7c1158
Status   : INSTALLED — master'ın gerisinde, `2536efb` ok düzeltmesi bu APK'da yok
```

Bu APK telefonda kurulu ve geri dönüş noktasıdır, fakat `2536efb`'den önce
üretildi: `NXT-OBS-131` ok düzeltmesi içinde **yoktur**. Sonraki build `2536efb`
veya sonrasından alınmalıdır. `.codex-artifacts` yalnız bu APK'yı tutar; önceki
APK'lar ve geçici ekran kanıtları Geri Dönüşüm Kutusu'ndadır.

Ayrıntı:
`docs/observation_archive/cutover_2026-08-26.md`.

Önceki 2026-08-24 dördüncü batch'i: `NXT-OBS-123`, `125`, `126`, `127` ve `128`
uygulandı ve `READY` durumuna alındı; `NXT-OBS-124` de `READY` kalıyor. Ayrıntı:
`docs/observation_archive/cutover_2026-08-24-04.md`.

Önceki 2026-08-24 ikinci batch kod değişikliği olmadan kapandı. Dondurulan
`NXT-OBS-117`, aktif M4 rating dondurması nedeniyle `DEFERRED` oldu; Mobile,
BFF, SAP, runtime ve APK değişmedi. Ayrıntı:
`docs/observation_archive/cutover_2026-08-24-02.md`.

Önceki 2026-08-24 batch'inde dondurulan Mobile-local kapsam
`NXT-OBS-108`, `120`, `121`, `122` idi; dördü de uygulandı ve fiziksel
telefon/sahip kabulini bekleyen `READY` durumuna alındı.

- `NXT-OBS-120`: Beş ana ekran native Expo Router top-tab pager'a taşındı;
  alt bar sabit ve sahneler eager. Canlı `Canlı/Fikstür/Yıldız`, Super
  `Tümü/Yıldız` yüzeyleri native yerel pager kullanıyor. Eski ortak main/local
  pan kaldırıldı; detail edge-back korundu. Reduced-motion'da swipe kapalı,
  dokunarak seçim anlık.
- `NXT-OBS-108`: Yalnız `RESULTED` + pozitif güvenilir `theoreticalPrize`
  programlarında küçük semantik-pozitif `₺` ikonu ve erişilebilirlik metni var.
- `NXT-OBS-121`: Fiori WebView üstündeki opsiyonel `BTB WEB` kapsülü tamamen
  kaldırıldı; hata yüzeyi ve güvenlik guard'ları değişmedi.
- `NXT-OBS-122`: Ayrı güncel-maç açma butonu kaldırıldı; SONUÇ bandının
  skor/durum hücresi erişilebilir Pressable olarak aynı `/match/[key]` route'una
  gider.

Doğrulama: `npm run check` temiz (typecheck + ESLint + **413/413** test +
brand); Expo Android export geçti; ARM64 debug compile geçti; Android 15
x86_64 debug compile, kurulum ve canlı API smoke geçti. Emülatör kaydında ana
swipe ara karesi iki komşu sahneyi birlikte gösterirken alt bar sabit kaldı;
`Canlı -> Fikstür -> Yıldız` ve `Super Tümü -> Yıldız` jestleri yerleşti.
Gerçek Toto verisinde Program 350/349/348 `₺` ikonları görüldü; Fiori login
yüzeyinde eski rozet yok; Super SONUÇ alanına dokunma `Maç Detayı`nı açtı.
Expo Doctor **19/20**; tek kalan uyarı önceden var olan on Expo paketindeki
patch-sürüm farklarıdır. Yeni pager bağımlılıkları Doctor tarafından kabul
edildi.

`NXT-OBS-117` M4 rating dondurması korunarak uygulanmadı; BFF/SAP/model/rating
kaynağına dokunulmadı ve ayrı karar/canlı SAP kanıtı bekliyor. `zbet-cap`, SAP,
Firebase ve Cloudflare değişmedi. Bu nedenle bu Mobile-only batch için sunucu
deploy hedefi yoktur.

Final fiziksel-telefon ARM64 pilot adayı üretildi ve doğrulandı:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-07.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1) · minSdk 24 · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 54.050.973 bytes
SHA-256 : 2F3955EF517273E39D2E247DAC87918770CF3AB8D42941C8137C5EE8C591504C
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
Source  : 428757a
Durum   : FINAL_PILOT_CANDIDATE — fiziksel Xiaomi kabulü bekliyor
```

APK içeriğinde legacy FCM server key, PEM/RSA private key, `private_key`,
`client_secret`, service-account ve `JSESSIONID` eşleşmesi yoktur. Önceki
`cutover-06` APK'sı ile bu batch'in geçici x86_64 ekran/export kanıtları Geri
Dönüşüm Kutusu'na taşındı; marka kaynakları korundu. APK henüz dağıtılmadı.
Fonksiyonel kaynak commit'i `428757a`; kapanış kanıtı takip eden dokümantasyon
commit'indedir.
Ayrıntı: `docs/observation_archive/cutover_2026-08-24.md`.

Önceki batch: 2026-08-23 ikinci `mobile cutover start`. `NXT-OBS-094` denetimde
zaten uygulanmış bulundu; eksik reduced-motion desteği `Screen.tsx`'e eklenip
otomatik doğrulandı. Yeni APK üretilmedi. Ayrıntı:
`docs/observation_archive/cutover_2026-08-23-02.md`.

Önceki batch (06): `NXT-OBS-109` ve `NXT-OBS-120` `RESOLVED`; `NXT-OBS-117`
ayrı source-of-truth/rating kararı gerektirdiği için `OBSERVED` kaldı.

`NXT-OBS-109`: Web `Match Odds > Odd` kaynağı yerel CDS/OData metadata'sında
`zbet_cds_001x`, `type='01'` olarak doğrulandı. BFF aynı kanonik marketin
yayınlanan maç önü alanını nullable `kickoffRate` ile taşır. Mobile canlı oranı
önceliklendirir; Kick-Off aşamasında canlı yoksa `Kick-off oranı`, sonraki
aşamalarda canlı kapanmışsa `Canlı kapalı · KO` etiketi gösterir. Kaynakta
olmayan `Ms1X`, `MsX2`, `Ms05u` marketlerine oran türetilmez; yüzde olan
`zbet_cds_006-kick_off` fiyat gibi kullanılmaz.

`NXT-OBS-120`: ana/yerel sekme ve detay edge-back sürüklemesi
`PanResponder`/JS thread'den Expo-uyumlu Gesture Handler + Reanimated worklet
zincirine taşındı. Resmî Mobile type/lint/test, bounded Doctor, Android
production bundle ve staged `arm64` debug compile geçti. Android 15 `x86_64`
release smoke'unda `Özet -> Canlı`, yerel `Canlı -> Fikstür`, sınırda
`-> Super`, ters yön, detay edge-back ve Kick-Off fallback görünümü geçti.
Resmî BFF test + production build kapısı da geçti.

Sahibin `APK'ya kadar devam et` onayıyla tek final ARM64 pilot artefaktı
üretildi ve doğrulandı:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-06.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1) · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 53.961.661 bytes
SHA-256 : 839A2408740CE6DC3305EEC93CA78CD8B6A8A5B3D72D5C551A080918A85C2179
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
Durum   : FINAL_PILOT_ARTIFACT — BFF public read-back geçti
```

APK içinde `gesture-handler`, `reanimated` ve `worklets` ARM64 native
kütüphaneleri mevcut; server/private-key/session kalıp taraması temiz. Eski
ARM64 baseline, debug APK ve geçici Android bundle Geri Dönüşüm Kutusu'na
taşındı; `.codex-artifacts` altında yalnız bu APK tutuluyor. Üretim imzası veya
dağıtım yapılmadı. Public BFF temiz pushed `de91b2e` kaynağından bir kez yeniden
başlatıldı; local/public health `ok`. Aynı maç için iki yüzey de 9 market
satırının 9'unda `kickoffRate` alanını ve 7 gerçek kickoff fiyatını döndürdü.

Fonksiyonel commit'ler push edildi: `zbet-cap de91b2e` ve
`zbet-mobile 6ed7b7b`. BFF önce rollout edildi; local/public read-back geçtikten
sonra final Mobile APK teslim kapısına alındı. Kullanıcıya ait önceden var olan
untracked `cutover_2026-08-21-02.md` kapsam dışı korunuyor. SAP
yazısı/aktivasyonu yoktur. ADT MCP portu sonradan açılmış olsa da bu task'ın
tool listesine `sap-adt` araçları gelmedi; canlı MCP nesne okuması iddia
edilmez. Ayrıntı:
`docs/observation_archive/cutover_2026-08-23.md`.

Önceki (05) batch: 2026-08-22 `mobile cutover start`.
Freeze edilen `NXT-OBS-117`–`120` maddesinden ikisi (`118` Mobile UI yarısı,
`119`) `RESOLVED`; ikisi (`117`, `120`) kök nedeni doğru teşhis edilmiş ama
kapsamı Mobile-local bir düzeltmeyi aşan, ayrı scoping/onay gerektiren blocker
olarak `OBSERVED` kaldı. `FIXTURE` sekmesi artık kickoff'tan 90 dakikadan
fazla geçmiş `NOT_STARTED` maçları listeden düşürüyor (erteleme/iptal
uydurmadan); skor ilerlediği halde olay akışı gerçekten boşsa `Bu maçta henüz
gol veya kırmızı kart yok.` yerine `Skor ilerledi ama olay detayı henüz
gelmedi.` gösteriliyor. `NXT-OBS-117` (current-match/SuperLog atomik olmayan
anlık görüntüsü) ve `NXT-OBS-120` (ana sekme sürüklemesi hâlâ
`react-native-gesture-handler`/`reanimated` değil, eski `PanResponder`
üzerinden — kurulum/altyapı eksik) bu batch'e alınmadı.

Mobile `npm run check`: TypeScript/ESLint/**415** unit/marka kapısı temiz
geçti. Fiziksel veya emülatör cihaz doğrulaması yapılmadı — batch yalnız
süzme mantığı ve metin/koşul değişikliği içeriyor, yeni APK üretilmedi;
`zbet-cap` bu batch'te değiştirilmedi. Sahip commit/push'u sohbette açıkça
onayladı; beş dosya tek tek adlarıyla stage edilip commit `1fc45ca` ile
`origin/master`'a push edildi (`d603e1a..1fc45ca`). Deploy, SAP/Firebase/
Cloudflare değişikliği, release imzalama, APK dağıtımı veya Cordova cutover
yapılmadı. Ayrıntı: `docs/observation_archive/cutover_2026-08-22-02.md`.

Önceki (04) batch: `NXT-OBS-111`–`116` sınıflandırıldı; altısı da yerel
kanıtları geçip sahip tarafından kabul edilerek `RESOLVED` oldu (ana sekme
tam-genişlik eş zamanlı geçiş, Super kararları zaman akışına eklendi, `Açık`
bağımsız switch, `Tümü`→`Fikstür` yalnız `NOT_STARTED`, Super geçmişi 200,
Jinx halo kaldırıldı). Mobile+BFF kapıları ve 200-satır provider fixture
sözleşmesi geçti; fiziksel Xiaomi doğrulaması yapılmadı, sahip mevcut kanıtı
kabul etti. Kapanış sonrası sahip isteğiyle final ARM64 APK
(`btb-mobile-next-arm64-cutover-04.apk`, `53.347.881` bayt) üretildi. Commit
`7585aaa` (+ BFF `0832b16`, telemetry `19aa8f8`). Ayrıntı:
`docs/observation_archive/cutover_2026-08-22.md`.

Önceki (03) batch: `NXT-OBS-105`–`110` sınıflandırıldı; `105`, `106`, `107`
ve `110` fiziksel Xiaomi kabulüyle `RESOLVED`, gerçek Toto ödeme alanı olmayan
`108` ile doğrulanmış kickoff fiyatı olmayan `109` `DEFERRED` oldu.

Önceki (02) batch: sekiz eski `OBSERVED` satır sınıflandırıldı; `095` fiziksel
canlı maç kanıtıyla çözüldü, `096` superseded oldu, `099` tarihsel çözüm olarak
korundu; upstream/owner/gerçek-olay bekleyen `073`, `074`, `086`, `089` ve
`100` `DEFERRED` oldu.

Yeni `NXT-OBS-104`, SAP bridge SICF dayanıklılığını izler. Owner'ın `detail`
düğümünü yeniden oluşturmasından hemen sonra salt-okunur 401/200 ve BFF
`availability=OK` kanıtı alındı; kapanış kontrolünde uç yeniden 404'e döndü.
SAP yazma veya aktivasyon yapılmadı. Yerel `zbet-cap` checkpoint'i ek upstream
isteği üretmeyen pasif `/health.liveContextTelemetry` görünürlüğü ekler; hedefli
testler `34/34`, resmi BFF test ve production build kalite kapısı geçti. Mobile
kaynak değişmedi, yeni APK üretilmedi. Commit/push, deploy ve SAP kalıcı çözümü
ayrı açık onay bekliyor.

BTB ROADMAP MILESTONE 2/11 — LOGO / BRAND ASSET KAPALI, FİZİKSEL OLARAK
DOĞRULANDI. Sahip Xiaomi doğrulamasını tamamladı ve yeni BTB Intelligence
Noir marka entegrasyonunu kabul etti. Üretilen varlık doğrulandı,
deterministik olarak normalize edildi, iki kanonik role türetildi ve entegre
edildi. Kare zemin kaynağından kaldırıldı; açılış ekranındaki telafi de aynı
değişiklikte gitti.

Roadmap: **2/11 KAPALI = %18,2** · Şu anki milestone: **3/11 — Decision
Safety Implementation** (`BTB - Aktif` sahipliğinde; şartnamesi
`zbet-abap/docs/DECISION_SAFETY.md`). Milestone 2 yeniden açılmaz.

Durum:

```text
MILESTONE_1_CLOSED_PHYSICALLY_VALIDATED     (owner Xiaomi)
MILESTONE_2_CLOSED                          (logo / brand asset)
PHYSICALLY_VALIDATED                        (owner Xiaomi, 2026-08-19)
ROADMAP_2_OF_11 = %18,2
MILESTONE_3_CURRENT                         (Decision Safety — zbet-abap sahipliğinde)
BRAND_ASSET_INTEGRATED                      (şeffaf 1024² master + adaptive foreground)
BRAND_VALIDATOR_GREEN                       (npm run check:brand, iki rol de PASS)
LAUNCH_COMPENSATION_REMOVED                 (borderRadius: 30 kaldırıldı)
MOBILE_GATE_GREEN                           (TypeScript + ESLint + 398/398 + check:brand)
DARK_LIGHT_EMULATOR_VALIDATED               (360dp, Android 15)
SMALL_SIZE_VALIDATED                        (132/68/40/24/18 dp — siluet 18 dp'de korunuyor)
MOBILE_NEXT_BASELINE_VERIFIED               (Live Context v2 APK, geri dönüş noktası)
LIVE_CONTEXT_V2_ACCEPTED
REAL_GOAL_PHYSICAL_PASS
RED_CARD_OWNER_ACCEPTED
PROSPECTIVE_PILOT_RUNNING                   (300 sn, zbet-cap — değiştirilmedi)
BILYONER_LIVE_CONTEXT_RUNTIME = ENABLED_VIA_SAP_BRIDGE
```

Live Context runtime hâlâ `SAP_BRIDGE` upstream'i ile açıktır. Aktif runtime
yalnız `api.surklase.com` arkasındaki yerel standalone BFF/notification
servisidir. Public Cloudflare origin yapılandırması, Firebase/SAP dış
değişikliği, APK dağıtımı ve release signing yapılmadı; her biri ayrıca açık
onay gerektirir. Legacy Cordova RETIRED.

## Milestone 2 — Logo / Brand Asset

`zbet-mobile` bu milestone'da dört commit ilerledi. `zbet-cap`, `zbet-abap` ve
`btb-codex` **hiç** değiştirilmedi; `btb-assets` yalnız okundu.

```text
f3d628d  Ertelenen Xiaomi etiketi: `güncel baskı farkı` -> `baskı farkı`
69a1417  Widget modülünün Gradle çıktısı .gitignore'a alındı
361a080  Marka varlığı sözleşmesi, üç rol, doğrulayıcı ve üretim brief'i
a8ba66b  Intelligence Noir varlığı entegre edildi, telafi kaldırıldı
```

### Gelen varlık ve yapılan tek işlem

Sahibin ürettiği aday:

```text
1536x1024 · PNG · 8-bit RGBA
tam saydam piksel  879.133 (%55,9) · dört köşe α=0
yarı saydam        %3 — tamamı kendi kenarı ve glow'u
beyaz saçak        yok (yarı saydam bandın ortalama RGB luması 55)
görünür içerik     1136x1017, tuvalin üstünden 3 px, altından 4 px uzakta
```

Yani gerçekten şeffaf, beyaz zemin kalıntısı yok ve BTB kimliği yerinde:
kalkan, saha şeması, yükselen sütunlar, düğümlü çizgi + ok, top, çift sinyal
yayı, bronz yapı. Tek uyumsuzluk **paketlemeydi**: tuval kare değildi ve
optik pay yoktu.

Bu yüzden sanat eserine dokunulmadı. `scripts/derive-brand-exports.py` yalnız
üç şey yapar — görünür içeriğe kırp, küçült, saydam kare tuvale ortala:

```text
assets/brand/btb-mark.png                1024x1024 · içerik %92 (942x843)
assets/brand/btb-adaptive-foreground.png 1024x1024 · içerik %62 (635x568)
```

Renk değiştirilmedi, yeniden çizilmedi, **büyütülmedi** (araç büyütmeyi
reddeder). İki dosya aynı çizimin iki geometrisidir.

### Kanıt

`npm run check:brand` iki rol için de PASS: kare tuval, ≥1024px, gerçek
saydamlık, köşeler α=0, role göre içerik oranı, optik merkez (0.500, 0.500) ve
yarı saydam oran (%3,0 / %1,3).

`expo prebuild` sonrası Android türevleri — kök nedenin kapandığının ölçülmüş
kanıtı:

```text
                        önce                     sonra
ic_launcher_foreground  0 saydam piksel          %79 saydam
köşe alfa               221 (opak lacivert)      0
sonuç                   #04101E arka plan hiç    arka plan görünür,
                        görünmüyor               maske markanın kenarını kırpmıyor
```

### Doğrulayıcıda düzeltilen şey

`check-brand-assets.mjs` "opak" için tam `255` istiyordu. Bu master gövdesi
boyunca bir tık altında kalıyor (ham dosyada tepe 254), bu yüzden doğrulayıcı
%45 hale bildiriyordu — varlığın gerçek yarı saydam payı %3 ve tamamı kendi
kenarında. Eşik `>= 250` oldu; kontrolün baştan beri söylemek istediği buydu.
Varlık zayıflatılmadı, ölçüt düzeltildi.

### Küçük boy doğrulaması (xxhdpi, 3x gerçek piksel)

| dp | piksel | sonuç |
| --- | --- | --- |
| 132 | 396 | tam okunur |
| 68 | 204 | tüm unsurlar okunur |
| 40 | 120 | kalkan, top, yaylar, sütunlar okunur |
| 24 | 72 | siluet ve top net; sütunlar dokuya iner |
| 18 | 54 | **siluet korunuyor** — kalkan konturu, top, çift yay, yükselen çizgi |

18 dp'de detay sadeleşiyor ama kimlik kayboluyor değil; eski markla yan yana
konduğunda yeni varlık daha okunur ve açık temada kutusu yok.
`SMALL_SIZE_ASSET_REFINEMENT_REQUIRED` **gerekmedi**.

### Emülatör görsel doğrulaması (Android 15, 1080x2400 @ 480dpi = 360dp)

| Yüzey | Koyu | Açık | Sonuç |
| --- | --- | --- | --- |
| Özet hero | ✓ | ✓ | kare **yok**; marka doğrudan kartın üstünde |
| Canlı liste arma fallback | ✓ | ✓ | dairenin içinde şeffaf marka; kare yok |
| Canlı kart alt satırı | ✓ | ✓ | `baskı farkı` tek satır, taşma yok |
| Açılış ekranı | ✓ | — | release APK'da: **kare yok, yuvarlatma yok, köşe kırpılması yok**; glow gradyana karışıyor |
| Launcher ikonu | ✓ | — | release APK kurulu; daire maskede kalkan **tam**, arkasında `#04101E` görünüyor |

### APK

```text
btb-mobile-next-arm64-brand-asset.apk           (aday, fiziksel doğrulama bekliyor)
SHA-256  522F904E9EB047E072F0C25F98210B98F343DBBD8ED2848D6214E7D50E9A721D
imza     fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c  (v2 şeması)
paket    com.btb.mobile.next · versionName 0.1.0 · native-code arm64-v8a
```

İmza parmak izi mevcut kurulumla aynı, bu yüzden APK kaldırmadan üzerine
kurulur. `btb-mobile-next-arm64-design-v2-feedback.apk` bu aday fiziksel
doğrulamayı geçene kadar geri dönüşüme alınmaz.

**Denetim.** APK içindeki launcher katmanları ölçüldü: `ic_launcher_foreground`
432x432 **%79,2 saydam**, köşe alfası **0**; 324/216/162/108 türevleri aynı.
Yani opak kare artefaktın kendisinden gitmiştir. Sır taraması temiz: legacy FCM
server key deseni, PEM private key, `private_key` / `client_secret` alanı ve
service-account işaretçisi **yok**.

Emülatör doğrulaması için ayrıca `x86_64` paketi derlendi
(SHA-256 `E4FDA8A990F01CFB9E631C29C8ED11C7EBF010AFCCF4637AAFCD94F3B9856032`) —
emülatör x86_64 olduğu için arm64 APK kurulamıyor. Cutover prosedürü adım 8
uyarınca doğrulama sonrası silindi; `.codex-artifacts` yalnız `arm64`
artefaktları tutar.

**Release runtime smoke (emülatör, x86_64 paketi).** Pilot kapısı açıldı, canlı
API'ye bağlanıldı ve gerçek canlı maç listelendi (`BREZILYA SERIE B`, 50').
Koyu ve açık temada Özet, Canlı listesi ve açılış ekranı doğrulandı.

### Kapanış

Sahip Xiaomi fiziksel doğrulamasını **2026-08-19'da tamamladı** ve marka
entegrasyonunu kabul etti. Milestone 2 `CLOSED / PHYSICALLY_VALIDATED`.
Aşağıdaki kontrol listesi tarihsel kayıt olarak korunur. APK, denetim ve
emülatör kanıtları değişmeden durur.

### Sıradaki adım

1. Milestone 3 — Decision Safety. Bu Mobile task'ının kapsamı **dışındadır**;
   `BTB - Aktif` sahipliğindedir. Şartname: `zbet-abap/docs/DECISION_SAFETY.md`.
3. Milestone 3 (Decision Safety) mutasyonu ondan önce başlamaz — ayrıca
   **girdisi de eksik**: `R1–R11` gereksinimleri ve adli sonuç bu çalışma
   alanında hiçbir dosyada yok (tarandı). Yol haritasının kanonik kaydı ve
   Milestone 3'ün salt-okunur envanteri `BTB Logs/BTB_ROADMAP.md` içindedir.
   O madde `BTB - Aktif` task'ının sahipliğindedir.

### Xiaomi fiziksel doğrulama kontrol listesi — marka varlığı

Kurulum yolu: yeni APK mevcut kurulumla aynı imza parmak izini taşır, bu yüzden
kaldırmadan üzerine kurulur.

| # | Alan | Beklenen |
| --- | --- | --- |
| 1 | Launcher ikonu | Kalkan maskenin içinde tam duruyor; kenarları kırpılmıyor, arkasında koyu lacivert zemin görünüyor |
| 2 | Launcher — yuvarlak tema | Daire maskede de kalkan kırpılmıyor |
| 3 | Açılış ekranı | Marka açılış gradyanının üstünde; **kare veya yuvarlak kare zemin yok**, köşe kırpılması yok |
| 4 | Özet hero | Marka kartın üstünde; kutu yok, hale yok |
| 5 | Canlı liste — arma yok | BTB marka dairesi içinde okunur; 24 dp'de bulanık değil |
| 6 | Açık tema | Aynı yüzeyler açık temada; koyu kutu veya gri saçak yok |
| 7 | Küçük boy okunurluğu | Liste satırlarında marka kalkan olarak tanınıyor |
| 8 | Bildirim küçük ikonu | Gerçek FCM bildiriminde vektör ikon; dolu kare **değil** |
| 9 | Canlı kart baskı etiketi | `baskı farkı` tek satır, taşma yok |
| 10 | Genel regresyon | Özet, Canlı, Super, Toto, Daha Fazla, Work Zone deep-link ve bildirim dönüşü bozulmadı |

Bulgular `docs/OBSERVATION_LOG.md` içine yazılır.

## Milestone 1 arşivi — Design V2 fiziksel geri bildirim + Bibi pass (KAPALI)

Milestone 1 kapandı ve sahibin Xiaomi cihazında fiziksel olarak doğrulandı.
Aşağısı tarihsel kayıttır: ne yapıldığını ve neden öyle yapıldığını saklar.
Çelişkili runtime kanıtı çıkmadıkça yeniden açılmaz.

### Tamamlanan

```text
6fd3346  Phase B  Super model özeti semantik düzeltmesi
d881ac2  Phase C  Gol / kırmızı kart takım atfı (HOME/AWAY)
```

Kapı (her iki phase sonrası): TypeScript temiz, ESLint temiz, **342/342** test
geçti, `git diff --check` temiz. `zbet-mobile` HEAD = `d881ac2`.

**Phase B — kanıtlanmış semantik, yeniden yorumlanmayacak.**
`superProbability`, `super_current_rate` alanından gelir ve ABAP içinde
`(rate_won_super / rate_total) * 100` olarak hesaplanır; yani temel olasılıkla
aynı türde bir büyüklüktür, ikinci bağımsız bir model çıktısı değildir. Bu yüzden
`temel → Super olasılığı` "lift" gösterimi kaldırıldı ve yerine yeni bir olasılık
**uydurulmadı**. Gerçek skor formülü ağırlıklı ve sabit terimlidir:

```text
final_score = intercept
            + edge          * w_edge
            + pressure      * w_pressure
            + state         * w_state
            + compatibility * w_compat
            + alignment     * w_align
            + redPenalty    * w_red
```

Temel olasılık bu formülde bir terim **değildir**; ağırlıklar markete göre
değişir; UI'ın hiç göstermediği bir intercept ve bir red-market penalty terimi
vardır; ayrıca skoru EV üzerinden üreten ikinci bir kod yolu mevcuttur. Bu
nedenle `MODEL GİRDİLERİ` bölümü değerlerin toplamının model skorunu vermediğini
açıkça yazar. Kurallar `src/utils/model-summary.ts` içinde **test edilen veri**
olarak durur. Bu semantik yeniden açılmaz veya yeniden yorumlanmaz.

**Phase C.** Taraf bilgisi zaten sözleşmede vardı; hiçbir şey türetilmedi.
Deplasman satırları içeri girintilenir ve rayı içeri kayar, `EV` / `DEP` çipi
tarafı kulüp adı olmayan sözcüklerle söyler, nötr ray satırın taraf kenarını
işaretler, dakika kolonu sabit kalır. Renk bilinçli olarak kullanılmadı: ev/deplasman
bu palette semantik durum değildir ve sözleşmede güvenilir takım rengi yoktur.

### Milestone 1'de tamamlanan (tamamı commit edildi: `5fa1910..d7672ea`)

Kapı, her adımdan sonra: TypeScript temiz, ESLint temiz, `git diff --check`
temiz. Test sayısı **342 → 387** (45 yeni test). `zbet-cap`, `zbet-abap`,
`btb-codex` bu thread'de de hiç değiştirilmedi.

**1. Phase D — açılır/kapanır paneller + kalıcılık. TAMAM.**

`liveDetail` (9 modül) ve `superDetail` (4 modül) modülleri panel oldu. Gerçek
kayıt `src/layout/module-registry.ts` üzerinden okundu; handoff'taki örnek
listeler kullanılmadı. `overview` kapsam dışı bırakıldı — handoff yalnız iki
analitik yüzeyi adlandırıyor.

- Yeni: `module-collapse.ts` (saf kural), `module-collapse-store.ts` (kalıcılık),
  `CollapsibleModule.tsx` (panel), `module-collapse.test.ts` (17 test).
- Kalıcılık `surface + kanonik modül id` ile anahtarlanır; görünen metin
  saklanmaz. Depo anahtarı sıralamanınkinden **ayrıdır**.
- Saklanan değer **kapalı** kümedir. Depoda olmayan modül açıktır: bu yüzden
  panelleri ilk gören kurulumda her şey **OPEN** gelir ve sonradan yayınlanan
  her modül de açık gelir. Açık kümeyi saklamak ikisini de tersine çevirirdi.
- `ORDER` ve `EXPANDED/COLLAPSED` bağımsızdır; `reconcileModuleOrder` davranışı
  değişmedi (mevcut testleri aynen geçiyor). Bağımsızlık ayrıca test edildi.
- Hero yapısal olarak korunur: her iki ekranda da hero `ReorderableModuleList`in
  **dışında** render edilir, yani kapatılması mümkün değildir.
- Başlığa dokunma yalnız gerçek bir dokunuşsa çalışır: hareket reorder slop'u
  içinde ve süre reorder hold eşiğinin altında. Yatay sekme kaydırması, dikey
  scroll ve reorder'a dönüşmüş basış paneli açmaz/kapatmaz.
- Gövde yükseklik animasyonu **yok** — modüllerde WebView, canlı timeline ve
  grafikler var. Durum değişimini chevron taşır; reduced-motion onu da sıfırlar.
- `TutorialTarget` panelin **dışında** kalır (`match-standings`), böylece modül
  kapalıyken de rehber hedefi ölçülebilir durumda durur.
- `Daha Fazla > düzeni sıfırla` artık sıralamayı **ve** kapalı panelleri geri
  alır; tek çıkış yolu olduğu için yalnız birini geri almak tuzak olurdu.
- Yan düzeltme: reorder'a dönüşüp hiç hareket etmeden bırakılan basış modülü
  havada bırakıp scroll'u kilitliyordu. Başlıklar artık dokunulabilir olduğu
  için bu nadir jest sıradanlaştı; `ReorderableModuleList` dokunuş bitişinde
  askıda kalan drag'i kapatıyor.

**2. Xiaomi canlı kart düzeni. TAMAM.**

Kart yeniden tasarlanmadı. `deriveLiveCardFooter` (saf, test edilmiş) kuralı:
karar verilmiş kart market ve baskı bloklarını **her zaman** gösterir
(`market kapalı` ve `güncel veri bekleniyor` gerçek cevaplardır); karar
verilmemiş kart yalnız gerçek değeri olan bloğu gösterir. Böylece
`Aday bekleniyor` + `oran bekleniyor` + `güncel veri bekleniyor` üçlüsü tek
dürüst ifadeye iner. Savunma: `flexWrap`, `minWidth: 0`, `flexShrink` ve seçim
metninde `numberOfLines`. `SuperLogCard` aynı desen için tarandı ve aynı savunma
eklendi. Layout-stress fixture kusuru doğrudan koda bağlar: hiçbir durum birden
fazla `bekleniyor` etiketi üretemez.

**3. Phase E — kanonik logo izi. KODDA KAPATILAMAZ.**

Kare zemin raster'ın **içine gömülü**: `assets/icon.png` 192x192 RGBA, tam
saydam piksel **0**, köşeler `(0, 8, 27, α=221)`. APK'ya giren
`ic_launcher_foreground.webp` de kenardan kenara opak; bildirilen
`#04101E` adaptive arka plan hiç görünmüyor. Container kaynaklı olmadığı için
kodda düzeltilecek bir şey yok. `ASSET_GENERATION_DEPENDENCY` kanıtlarıyla
`docs/OBSERVATION_LOG.md` (`NXT-OBS-101`) içinde kayıtlı. Placeholder,
zemini silinmiş veya rengi kaydırılmış varlık **üretilmedi**. App icon ile
uygulama içi logo aynı dosyayı paylaşıyor (ortak kaynak kanıtlandı), yani varlık
geldiğinde tek değişiklik iki yüzeyi birden düzeltir. Takım armalarına
dokunulmadı. Kodda yapılan tek şey: `AppLaunchScreen` içindeki
`borderRadius: 30`ın bir stil değil gömülü kareyi gizleyen telafi olduğu ve
gerçek varlıkla birlikte kaldırılması gerektiği işaretlendi.

**4. Phase F/G — Bibi motion + feature discovery. TAMAM.**

- Yeni: `feature-discovery.ts` (saf motor, 17 test), `DiscoveryProvider.tsx`,
  `bubble-position.ts` (+ 6 test).
- Dört ipucu, hepsi bugün var olan ve görünür affordance'ı olmayan yetenekler
  için: özet modül sıralama, detay panelleri, Super yıldız süzgeci, düzen
  sıfırlama.
- Pacing: 4 saat cooldown, günde en fazla 2, aynı ipucu asla iki kez.
  İpucu **gösterildiği anda** emekliye ayrılır.
- Tutorial ve discovery ayrı depo, ayrı hız, ayrı anahtar. `QUIET` yalnız
  discovery'i susturur; rehber çalışmaya devam eder. Kontrol:
  `Daha Fazla > Bibi ipuçları: Normal / Sessiz`.
- Rehber adımı, presence veya pace tarafından bastırılan ipucu **slot
  harcamaz**.
- Route-presence regresyonu yok: `bibi-presence.ts` hiç değiştirilmedi ve motor
  kuralı route yazımına değil `bibiPresence`e karşı doğrular. Match Detail ve
  Super Decision Detail'de ambient Bibi yok.
- Motion: ipucu geldiğinde **tek seferlik** kısa mikro animasyon, sonra
  hareketsizlik. İkinci sürekli döngü eklenmedi; `LiveDot` ürünün tek sürekli
  ambient animasyonu olarak kaldı. Reduced-motion animasyonu düşürür, ipucunu
  korur.
- Discovery tamamen yereldir; hiçbir backend bağımlılığı eklenmedi.

**5. Super gün kapsamı varsayılanı — `Bugün`. TAMAM (sahip isteği).**

Yalnız sunum/varsayılan durum değişikliği. Kapsam route parametresinde tutulur;
kalıcı bir kullanıcı tercihi **yoktur** (denetlendi), bu yüzden ezilen bir tercih
de yok. `resolveSuperDayScope` artık parametre yokken `LATEST_DAY` döndürür.
`Tüm günler` açık bir `scope=ALL` değeri taşır — eskiden parametreyi temizleyerek
ifade ediliyordu ve yeni varsayılanla bu seçim ulaşılamaz hâle gelirdi.
`Bugün`ün anlamı değişmedi: yüklenen kararlardaki **en yeni maç günü**, cihazın
takvim günü değil. Backend sorgu semantiği, Super karar mantığı ve geçmiş veri
değişmedi; süzme zaten istemci tarafındadır. Özet ekranındaki `LATEST_DAY` derin
bağlantısı aynı kapsamı açar. Kullanılmayan `getSuperDayScopeAction` kaldırıldı;
hiçbir ekran onu okumuyordu ve eski `null` sözlüğünü pinliyordu — varsayılanın
sessizce kaymasına açık bırakan tam olarak buydu. Regresyon testi varsayılanı,
etiketleri ve iki yönlü eşleşmeyi pinler.

### Milestone 1 kapanışı

Tüm maddeler commit edildi, ARM64 pilot APK derlendi ve sahibin Xiaomi
cihazında fiziksel olarak kullanıldı. Design V2 yönü ve bu pass'in maddeleri
kabul edildi. Fiziksel kullanımdan tek erteleme çıktı — `güncel baskı farkı`
etiketinin uzunluğu — ve o da Milestone 2'de kapatıldı (`f3d628d`).
Phase E kodda kapatılamaz olduğu için Milestone 2'ye devredildi.

### Korunacaklar (kanıtlanmış Design V2 davranışı)

Intelligence Noir koyu tema ve premium açık yorum; semantik palet; canlı teal
kimliği; bronz yapısal aksan; jade pozitif; crimson negatif; tipografi ölçeği ve
11pt taban; materyal/derinlik grameri ve kart kenarı okunabilirliği; dürüst
durum sözlüğü (yalnız `OFFLINE` alarm eder); temporal bütünlük (`KARAR ANI` /
`SONUÇ` mimari ayrımı); Bibi `GUIDE_ONLY` kuralları; alt gezinme; güvenli
alanlar; sekme kaydırma; modül sıralama ve kalıcılığı; logo fallback; derin
bağlantılar; bildirimler; Work Zone; Game Pulse kompakt boyutlandırma;
Live Context v2 (yalnız gol + kırmızı kart).

### Değişmeyenler

`zbet-cap`, `zbet-abap`, `btb-codex` bu milestone'da **hiç** değiştirilmedi.
Prospective collector değiştirilmedi. Tahmin/model/backend semantiği
değiştirilmedi; yalnız okundu.

### APK durumu

Yeni kanonik ARM64 pilot APK derlendi:

```text
.codex-artifacts/btb-mobile-next-arm64-design-v2-feedback.apk
SHA-256 D7B5B5364D8C9E5A9CF8AC44E76147D426D958CCBFF4021B12FADB877CFF684A
imza    fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
```

`btb-mobile-next-arm64-live-context-v2.apk` ve
`btb-mobile-next-arm64-design-v2.apk` bu APK fiziksel doğrulamayı geçene kadar
**geri dönüşüme alınmaz**. Üç APK de aynı imza parmak izini taşır, bu yüzden
yeni APK mevcut kurulumun üzerine kaldırmadan kurulur.

## Xiaomi fiziksel doğrulama kontrol listesi — Design V2 geri bildirim pass

Artefakt: `.codex-artifacts/btb-mobile-next-arm64-design-v2-feedback.apk`
SHA-256 `D7B5B5364D8C9E5A9CF8AC44E76147D426D958CCBFF4021B12FADB877CFF684A`.

**Kurulum yolu önemlidir.** Yeni APK, cihazdaki mevcut APK ile **aynı imza
parmak iziyle** imzalıdır (`fac61745...`), bu yüzden kaldırmadan üzerine kurulur.
Panellerin "mevcut kurulum yükseltmede her şeyi açık bulur" göçünü yalnız bu
yol gerçekten sınar. Önce üzerine yükselterek doğrula; istersen ardından temiz
kurulumla tekrar bak.

| # | Alan | Beklenen |
| --- | --- | --- |
| 1 | Soğuk açılış / auth | Splash → pilot oturum açılır, hata/boş ekran yok |
| 2 | Özet | Modüller görünür, sayılar dolu, sıralama korunmuş |
| 3 | Canlı liste | Maçlar listelenir, canlı nabız çalışır |
| 4 | Aday üretilmemiş kart | Alt satır tek dürüst ifade: `İzleniyor` + `Aday bekleniyor`; ikinci/üçüncü `bekleniyor` etiketi **yok** |
| 5 | Taşma / kırpılma | Hiçbir kartta yatay taşma, kesik Türkçe etiket veya kart kenarını aşan metin yok |
| 6 | Maç Detayı | Hero (kimlik, skor, `BTB SEÇİMİ`) her zaman görünür |
| 7 | Gol / kırmızı kart atfı | Ev/deplasman doğru tarafta, girinti ve `EV`/`DEP` çipi tutarlı |
| 8 | Açılır paneller | Başlığa dokunma modülü açar/kapatır, chevron döner |
| 9 | Kapanma kalıcılığı | Kapatılan modül ekrandan çıkıp dönünce ve uygulama yeniden başlayınca kapalı kalır |
| 10 | Yükseltme göçü | Yükseltme sonrası **tüm** paneller açık gelir; hiçbir modül gizli değil |
| 11 | Sıralama bağımsızlığı | Modül taşıma hâlâ çalışır; taşımak paneli açmaz/kapatmaz, kapatmak modülü taşımaz |
| 12 | Kazara açılma | Yatay sekme kaydırması ve dikey scroll sırasında panel kendiliğinden açılıp kapanmaz |
| 13 | Game Pulse | Widget yüklenir; kimlik yoksa dürüst boş durum |
| 14 | Super Detayı | Hero'da kimlik, `KARAR ANI`, seçim, sinyal ve `SONUÇ` görünür |
| 15 | Düzeltilmiş model özeti | `MODEL GİRDİLERİ` uydurma "lift" olasılığı göstermez; terimlerin toplamı skor değildir notu okunur |
| 16 | Super panelleri | Dört modül de açılır/kapanır ve kalıcıdır |
| 17 | Super varsayılan gün | Karar günlüğü ilk açılışta `Bugün`; `Tüm günler` seçilebilir ve seçim korunur |
| 18 | Bugün verisi yokken | Veri yoksa dürüst boş durum; hata gibi görünmez |
| 19 | Bibi normal mod | Bir yüzeye yerleşince en fazla bir ipucu, tek kısa animasyonla |
| 20 | Bibi cooldown | Aynı ipucu tekrar etmez; kapatınca hemen ikincisi gelmez |
| 21 | Bibi sessiz mod | `Daha Fazla > Bibi ipuçları: Sessiz` sonrası ipucu gelmez |
| 22 | Rehber hâlâ çalışır | Sessiz moddayken bile Bibi rehberi baştan başlatılabilir ve adımlar görünür |
| 23 | Analitik yüzeyler | Maç ve Super detayında ambient Bibi **yok**; yalnız rehber adımı |
| 24 | Azaltılmış hareket | Sistem "animasyonları azalt" açıkken ipucu görünür ama animasyon yok; `LiveDot` dışında sürekli döngü yok |
| 25 | Toto | Program, tahmin ve kupon ekranları bozulmadan çalışır |
| 26 | Daha Fazla | Düzeni sıfırla hem sırayı hem kapalı panelleri geri alır |
| 27 | Work Zone / deep link | Better Than Bet, BTB Toto ve Super Log doğru açılır; `Illegal new hash` yok |
| 28 | Bildirimler | Gerçek FCM bildirimi gelir ve doğru ekrana götürür |
| 29 | Koyu / açık tema | Her iki temada palet, kontrast ve panel başlıkları okunur |
| 30 | Sekme kaydırma | Sekmeler arası yatay geçiş akıcı; beyaz flaş yok |
| 31 | Scroll performansı | Uzun listelerde ve panelli detaylarda takılma yok |

Bulgular `docs/OBSERVATION_LOG.md` içine yazılır; observation sırasında kod
değiştirilmez.

## Product Design V2 — tamamlandı (2026-08-18)

Mobile SHA: `21a1f57` (`origin/master` ile aynı). Baseline: `b57625e`.

```text
ff50051  Design System v2 token temeli
8de1936  Canlı kimliği + Bibi yoğun yüzeylerden çekildi
912b093  Özet + Canlı listesi: Intelligence Noir yüzey dili
7a22fe5  Maç Detayı skor tahtası yerine BTB kararı etrafında kuruldu
2e56530  Super kararında karar anı ile sonuç ayrıldı
6ff7e2c  Üç durum yerine ürünün gerçek sekiz durumu
3880da2  Her iki tema Intelligence Noir paletine taşındı
a6bdea2  Toto ortak sisteme alındı
21a1f57  İkincil yüzeyler + canlı nabız
```

Tasarım kuralları tek kaynakta: `docs/UI_INTERACTION_STANDARD.md`.

Kalite kapısı: TypeScript, ESLint ve `321/321` test temiz; `git diff --check`
temiz. Emülatör doğrulaması koyu ve açık temada yapıldı. Fiziksel Xiaomi
doğrulaması **yapılmadı** — kontrol listesi aşağıdadır.

Owner kararları: düşen oran renk konvansiyonu bu milestone'da değiştirilmedi
(ayrı ürün kararı olarak kaydedildi); Super model etiketleri kullanıcı yüzünde
Türkçe kalır.

Yeni task önce yalnız `C:\dev\btb-cdoex\AGENTS.md` ve bu dosyayı tamamen okur.
Observation tespitleri `docs/OBSERVATION_LOG.md` içindedir. Yeni toplu kod
batch'i yalnız `btb next cutover start` ile başlar.

## Live Context v2 gerçek olay yolu — kapatıldı (2026-08-18)

Sağlayıcıya **SAP'ın halihazırda çalışan HTTP istemcisi** üzerinden erişilir.
Bilyoner genel olarak erişilemez değildir; ayrım istemci istek profilindedir:

```text
SAP gömülü HTTP istemcisi  -> çalışıyor
curl, aynı makine          -> 400 users-api login kapısı
Node fetch / node:https    -> 400 users-api login kapısı
```

`curl` düz `curl/` user-agent gönderirken de reddedildiği için fark header
kaynaklı olamaz. Çözüm çalışan istemciyi ödünç almaktır; TLS parmak izi taklidi,
çerez/oturum/giriş otomasyonu yapılmadı ve kapsam dışıdır.

**SAP köprüsü** (`ZBET_CL_PROVIDER_BRIDGE` + `/sap/bc/zbet/provider/detail` +
TVARVC): salt okunur, kalıcılık yok, DDIC yok. Çağıran URL seçemez — yalnız
sayısal event id derleme zamanı sabitine yerleştirilir. Taşıma
`zbet_cl_main=>get_instance( )->get_rss( )`, değiştirilmeden kullanıldı. Köprü
alan katmanı değildir; sağlayıcının baytlarını olduğu gibi iletir, normalizasyon
BFF'te kalır.

Uçtan uca doğrulandı: canlı route `HTTP 200`, `btb.live-context.v2`, 3 gerçek
gol, `lineups` yok; aynı payload'daki 4 sarı + 12 değişiklik + 2 bölüm
işaretçisi `diagnostics.excludedByScope` ile dışlandı. Cache `MISS -> HIT`, TTL
penceresi başına tek upstream isteği.

```text
BTB_LIVE_CONTEXT_ENABLED       true
BTB_LIVE_CONTEXT_UPSTREAM      SAP_BRIDGE   (DIRECT açılmadı, açılmayacak)
BTB_LIVE_CONTEXT_BRIDGE_TOKEN  ayarlı (yazdırılmaz)
cache TTL                      LIVE 30s · HALF_TIME 60s · FINISHED 5dk
akış                           Mobile -> BFF -> cache/single-flight -> SAP_BRIDGE
                               -> zbet_cl_main->get_rss -> Bilyoner
```

Kabul:

```text
REAL_GOAL_VALIDATION     = PHYSICAL_PASS
REAL_RED_CARD_VALIDATION = OWNER_ACCEPTED_PENDING_NATURAL_OBSERVATION
```

Gerçek GOAL olayları fiziksel Xiaomi doğrulamasında görüldü. Kırmızı kart
uygulaması doğrulanmış sözleşme, normalizer semantiği ve otomatik testler
temelinde sahip tarafından kabul edildi; **gerçek bir kırmızı kartın fiziksel
olarak gözlendiği iddia edilmemektedir.** Bugüne dek hiçbir gerçek sağlayıcı
yanıtında kırmızı kart görülmedi (tek gerçek payload: 4 sarı, 0 kırmızı), bu
yüzden `DIRECT_RED`/`SECOND_YELLOW_RED` ve dismissal-without-subtype sözlüğü
gerçek veriyle hâlâ doğrulanmadı. Doğal bir kırmızı kart yalnız gözlemsel
doğrulamadır, release engeli değildir; sorun çıkarsa yeni defect açılır.

Yeni besleme **üretim model girdisi değildir**: Super/Toto skorlaması, eşikler ve
gol/kırmızı kart mantığı değiştirilmedi; `eventSummary` betimleyicidir.

Kanıt: `docs/observation_archive/cutover_2026-08-18.md`.

## Live Context ürün kapsamı daraltıldı — v2 (2026-08-17, sahip kararı)

Yayınlanan sözleşme artık **yalnız gol ve kırmızı kart** taşır. BTB sağlayıcının
maç anlatımını çoğaltmaz; bunlar BTB karar mantığına doğrudan etki eden ve
kullanıcı için en yüksek değerli iki olay sınıfıdır.

Maç Detayı'ndaki tek Live Context modülü `Goller ve kırmızı kartlar`. Satır
düzeni BTB'ye özgüdür ve sağlayıcı timeline'ını taklit etmez: dakika, işaret,
üstte takım, altında oyuncu, gollerde sağda güncel skor.

Kapsam dışı bırakılanlar: sıradan sarı kartlar, oyuncu değişiklikleri, bölüm
işaretçileri ve muhtelif anlatım. `İlk 11 ve dizilişler` modülü **tamamen
kaldırıldı** — bileşen, ekran bağlantısı, sözleşme alanları ve varsayılan
düzen kaydı dahil. Mevcut kurulumlarda ayrı bir göç gerekmez: düzen uzlaştırma
kanonik olmayan id'yi ilk okumada düşürür, kullanıcının sıraladığı diğer
modüller yerinde kalır.

Kart yalnız sağlayıcı ihraç olduğunu **olumlu biçimde kanıtlarsa** yayımlanır:

```text
bilinen düz kırmızı            -> RED_CARD / DIRECT_RED
bilinen ikinci sarıdan kırmızı -> RED_CARD / SECOND_YELLOW_RED
ihraç kanıtlı, alt tip yok     -> RED_CARD / UNKNOWN
sıradan sarı                   -> yayımlanmaz (YELLOW_CARD)
diğer her kart değeri          -> yayımlanmaz (UNCLASSIFIED_CARD)
```

Tanınmayan genel bir kart değeri ihraç kanıtı **değildir** ve kırmızı kart
olarak yayımlanmaz; BTB kırmızı kartı yüksek değerli bağlam saydığı için
yanlış-pozitif kırmızı bu modülün yapabileceği en kötü hatadır. İhraç; oyuncu
metninden, renkten, eksik alt tipten veya olayın yalnızca kart olmasından
**çıkarılmaz**. `UNCLASSIFIED_CARD` bilinçli olarak `YELLOW_CARD`'dan ayrı
tutulur: biri BTB'nin burada önemsiz olduğunu bildiği için, diğeri BTB'nin ne
olduğunu bilmediği için dışlanır. Sınıflandırılamayan kartın ham sağlayıcı
değeri `diagnostics.unclassifiedCardValues` içinde saklanır.

Kırmızıda ayrım korunur ve erişilebilirlik etiketinde okunur (renge bağımlı
değildir). Kendi kalesine gol yalnız sağlayıcı açıkça belirtirse korunur;
addan veya metinden **çıkarım yapılmaz**.

Kapsam dışı sınıflar sessizce atılmaz: `diagnostics.excludedByScope` sınıf
bazında sayar, `diagnostics.unknownFeedTypes` yalnız BTB'nin anlamadığı feed
tipleri için ayrılmıştır. İkisini birleştirmek, sağlayıcı tarafındaki bir
değişikliği BTB ürün kararından ayırt edilemez hâle getirirdi.

`timeline === null` (alınamadı) ile `timeline === []` (alındı, maçta gol/kırmızı
yok) asla aynı duruma çözülmez. `stale` ve `refreshFailed` ayrı kullanıcı
sinyalleridir. Hiçbir kullanıcı metni sağlayıcı adı, durum kodu veya uygulama
terimi içermez. Oyuncu adları yalnız görüntü verisidir; `comparisonForm` render
çıktısına ulaşmaz ve kimlik olarak kullanılmaz.

`eventSummary` (goalCount, redCardCount, latestGoalMinute, latestRedCardMinute,
scoreProgression[], redCards[]) yalnız yayımlanan timeline'dan türetilir ve
ileride prospective kanıtın karar bağlamını yeniden türetmeden saklayabilmesi
içindir. **Betimleyicidir**: üretim Super skorlaması onu okumaz ve bu besleme
bir model girdisi değildir. Model girdisi olup olmayacağı, mevcut üretim olay
sinyalleriyle karşılaştırıldıktan sonra verilecek ayrı bir karardır.

Mobile yalnız `GET /v1/btb/matches/:key/live-context` ucunu tüketir ve hiçbir
zaman doğrudan sağlayıcı çağırmaz; sağlayıcı JSON'u sunucu tarafındaki adaptörde
biter. Sağlayıcı runtime devre dışı olduğu için modül dürüst
"Gol ve kırmızı kart bilgisi şu anda kullanılamıyor." durumunu gösterir; meşru
erişim açıldığında yalnız `BTB_LIVE_CONTEXT_ENABLED=true` yeterlidir.

Şema `btb.live-context.v2`. Sözleşme: `zbet-cap/docs/mobile-live-context.md`.

Önceki v1 batch'inin kanıtı: `docs/observation_archive/cutover_2026-08-17-02.md`
(ana sekme kaydırma düzeltmesi ve mevcut kurulum modül göçü orada kayıtlıdır ve
yürürlüktedir).

## Work Zone deep-link double-hash regresyonu — kapandı (2026-08-17)

2026-08-16 Work Zone migration'ı `EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL` değerini
sonunda `#Shell-home` ile ayarladı; `src/legacy/routes.ts` bu değeri ham
temel URL kabul edip kendi `#btb-manage` / `#SporToto-manage` /
`#SuperLog-display` fragment'ını üzerine ekliyordu. Fiziksel Xiaomi
kullanımı Better Than Bet / BTB Toto / Super Log açılışlarında `Illegal new
hash - cannot be parsed: 'Shell-home#btb-manage?...'` hatasını gösterdi;
Work Zone sitesinin kendisi doğru açılıyordu.

Düzeltme: `routes.ts` içinde merkezi `normalizeWorkZoneBaseUrl()` /
`buildWorkZoneHomeUrl()`; dört URL üreticisi de (Home + 3 intent) kullanmadan
önce temel URL'yi normalize eder. `fiori-target.ts` hedefsiz geri dönüşü
artık `buildWorkZoneHomeUrl()` kullanır. `build-pilot-apk.ps1` yapılandırılan
tabanda `#` varsa build-time'da artık hata verir. Yerel `.env` fragment'sız
temel URL'ye güncellendi. 14 yeni regression testi (180 → 194).

Mobile `npm run check`: TypeScript/ESLint/test hepsi temiz. Yeni ARM64 pilot
APK derlendi, unzip edilip `assets/app.config` içindeki `legacyLaunchpadUrl`
fragment'sız olduğu ve hiçbir dosyada eski tenant referansı olmadığı
doğrulandı. **Fiziksel Xiaomi doğrulaması PASSED**: Work Zone ana sayfa,
üç Fiori uygulamasının deep link'i, eski tenant yönlendirmesi yok, normal
navigasyon ve bildirim akışı sağlıklı. Ayrıntı:
`docs/observation_archive/cutover_2026-08-17.md`.

`zbet-mobile` commit `7484502` (+ bu handoff güncellemesi). Sabit sınırlar
korundu: BTP deploy, Work Zone içeriği, NPL, Cloud Connector, SAP, Fiori
uygulamaları, retired Cordova ve Super/Toto iş mantığına dokunulmadı.

## UX / Etkileşim Milestone — tamamlandı (2026-08-16)

Konsolide Mobile UX batch'i: Super kimlik düzeni, ana navigasyon jesti, Bibi
idle davranışı, Bilyoner Game Pulse ve üç yüzeyde paylaşılan yeniden
sıralanabilir modül mimarisi.

**Super crest/takım eşleşmesi.** Karar kartlarında iki arma birlikte, birleşik
etiketin önünde duruyordu. Artık her arma kendi takımının yanında. Çözümleyici
önce sözleşmedeki `homeTeam`/`awayTeam` alanlarını kullanır; yalnız sınır
belirsiz değilse birleşik etiketi böler. SAP ayırıcıyı tutarlı doldurmuyor
(`Fluminense -Palmeiras`, `Osijek- L. Zagreb` gerçek örnekler), bu yüzden tire
ancak en az bir tarafında boşluk varsa sınır sayılır — `Saint-Étienne` ve
`Inter Turku-2` bölünmez.

**BetRadar zinciri (SAP yazımı gerekmedi).** `zbet_cl_main` canlı beslemeden
`BRDID` değerini `zbet_t_matches-stats_id` alanına yazıyor ve `zbet_cds_005`
bunu zaten projekte ediyor. BFF `$select`'ine `stats_id` eklendi ve yalnız maç
detayında `betRadarId` olarak yayınlanıyor. Public API doğrulandı:
`betRadarId=72440606` (First Vienna - Liefering) gibi gerçek değerler geliyor.

**Game Pulse.** `https://content.bilyoner.com/statics/canli-anlatim-v2/` URL'si
doğrulanmış kimlikten merkezî olarak kurulur; kimlik yoksa modül dürüst boş
durum gösterir ve ekranın kalanı çalışır. WebView tek origin'e sabitlenmiş,
dışarı gezinme reddediliyor, cookie paylaşımı kapalı, hiçbir BTB/pilot/SAP
değeri frame'e verilmiyor. Kaynak kimliği yalnız event id'ye bağlı olduğundan
canlı polling WebView'i yeniden yüklemiyor.

**Paylaşılan modül düzeni.** `src/layout/` altında tek mimari: uzun basış
modülü kaldırır, native-driver transform ile parmağı izler, komşular yer açar;
kenar auto-scroll yalnız parmak kenar bölgesindeyken tikler. Her yüzeyin kendi
kalıcı anahtarı var (`overview` / `liveDetail` / `superDetail`). Uzlaştırma
bilinmeyen id'leri atar, tekrarları onarır, bozuk depoyu varsayılana düşürür ve
yeni yayınlanan modülleri ekler — eski tercih yeni modülü asla gizleyemez.
Ekranlar yalnız verisi olan modülleri render eder; iki görünür modül arasındaki
sürükleme saklı sıraya eşlenir, gizli modüller yerinde kalır.

**Super Detay.** Yalnız sunum: model kanıtı, saha baskısı, havuz/lig bağlamı ve
puan durumu artık dört eşdeğer modül. Puan Durumu, benzerlik kartının içine
gömülü olmaktan çıkıp bağımsız iki-takım karşılaştırma modülü oldu; eksik sıra
gerçek olmayan bir sıralama ima etmemek için nötr tire gösterir.

**Bibi.** Sürekli float döngüsü kaldırıldı. Uzun sessiz aralıktan sonra tek
kısa davranış oynar (blink / çift blink / etrafa bakış / hafif zıplama / göz
kırpma), önceki davranışı asla tekrarlamaz; menü, rehber, sürükleme ve
reduce-motion durumlarında tamamen susar.

**Navigasyon.** Ana sekme jesti navigator sarmalayıcısından `Screen` içine
taşındı; içerik parmağı anında izler, sınırlı bir peek'e yumuşar, komşusu
olmayan sekme direnir. Bırakışta sekme hemen değişir ve giden içerik navigator
animasyonunun altında yerine oturur. Sekme çubuğu sabit kalır ve listelerin
üstünde artık capture responder yok.

Doğrulama: Mobile typecheck + lint temiz, `173/173` test; BFF `78/78` test.
Android API 35 x86_64 emülatöründe pilot modda canlı API ile tam UX review
yapıldı; gerçek `betRadarId` ile Game Pulse yüklendi.

## Notification Registration Hotfix — tamamlandı (2026-08-16)

`more.tsx`'teki "Cihaz kaydediliyor…" sonsuz askı hatası çözüldü. Kök neden:
`registerPushDevice()` içinde `getDevicePushTokenAsync()` dışındaki dört native
çağrı (ilk ve koşulsuz çalışan `ensureNotificationChannels()`,
`getPermissionsAsync()`, `requestPermissionsAsync()`,
`subscribeToTopicAsync()`) sınırsızdı; ayrıca `AppProviders.tsx` açılışta
manuel kayıttan bağımsız `restorePushRegistration()` çalıştırıyor ve
`addPushTokenListener` üçüncü, bağımsız bir `syncPushToken()` tetikleyicisiydi
— üç yol birbiriyle yarışabiliyordu.

Çözüm: `src/notifications/registration-machine.ts` — tek sahipli, saf/DI'lı bir
state machine (`idle/channels/permission_check/permission_request/push_token/
device_registration/complete/failed`; transaction-token ile tek-uçuş guard ve
eski sonucun yeni state'i ezmesini engelleyen koruma; izin isteği zaman
aşımından sonra recheck kurtarma; outer watchdog=30s; dinleyici hatası
transaction'ı asla bloklamaz). `register.ts` tek bir controller singleton'ına
sahip; `registerPushDevice()` manuel çağrıyı her zaman önceliklendirir,
`restorePushRegistration()` controller aktifken erken çıkar ve kendi
`getPermissionsAsync()`/token çağrıları da sınırlıdır. `more.tsx`
`useRegistrationState()` ile reaktif stage/hata koduna dayalı Türkçe alt metin
gösterir; artık hiçbir yol UI'ı süresiz "Cihaz kaydediliyor…" durumunda
bırakamaz. Merkezi zaman aşımı sabitleri `src/notifications/async-timeout.ts`
içinde (eski `push-token-timeout.ts` silindi) —
channels/permissionCheck/legacyTopic=8s, permissionRequest=20s,
deviceRegistration=25s, watchdog=30s, pushToken=15s (değişmedi).

Doğrulama: `registration-machine.test.ts` (~22 deterministic senaryo:
her stage için timeout/failure kodu, izin-recheck kurtarma, outer watchdog,
dinleyici hatası izolasyonu, stale-transaction koruması, single-flight)
+ `async-timeout.test.ts`; Mobile `npm run check` (typecheck + lint +
133/133 test) yeşil. Android API 35 x86_64 emülatöründe pilot modda smoke
edildi: manuel kayıt anında tamamlanıyor ("Bildirimler hazır" alert'i),
alt metin varsayılana dönüyor, hızlı çift dokunuşta ikinci alert
istiflenmiyor, logcat'te ilgili crash/fatal yok. Fiziksel cihaz bu task
kapsamında test edilmedi (yalnız emülatör onayı istendi).

Sabit sınırlar korundu: ARM64 build yapılmadı, thread-optimizer'a
dönülmedi, SAP/participant-ID/TeamLogo/Super-Toto/credentials/Firebase'e
dokunulmadı.

## Legacy Cordova Emekliye Ayrıldı — tamamlandı (2026-08-16)

Owner kararı: **legacy Cordova mobil uygulaması artık aktif bir runtime hedefi
değil — RETIRED / NO LONGER SUPPORTED.** Tek desteklenen mobil runtime
`zbet-mobile/expo-app` (Mobile Next / Expo).

Bağlam: BTP Work Zone yeni trial'a taşınırken (`BTB Logs/btp_workzone_migration/
MIGRATION_NOTES.md`) legacy Cordova kaynağında (`zbet-mobile/www/js/index.js`
`launchpadBaseUrl`, `zbet-mobile/www/index.html` CSP, `zbet-mobile/config.xml`
`allow-navigation`) eski (artık geçersiz) trial Work Zone host'u hardcoded
bulundu, override mekanizması yok. Owner kararı bu değerleri yeni tenant'a
taşımamak — Cordova'yı emekliye ayırmak.

Doğrulanan kanıt:
- Hiçbir CI/workflow, `btb-codex` tool'u (`btb-codex/tools/catalog.json`) veya
  build script'i Cordova build/publish etmiyor; tek build/deploy hedefi
  `zbet-mobile/expo-app/scripts/build-pilot-apk.ps1`.
- `zbet-mobile/www/`, `config.xml`, `platforms/`, `plugins/` kaynak olarak
  saklanıyor (silinmedi) — bu task kapsamında silme/arşivleme yapılmadı, henüz
  onaylı bir arşivleme prosedürü yok.

Eski trial referansları (`188b143btrial...`) bu üç Cordova dosyasında
**kasıtlı olarak PATCH EDİLMEDİ** ve READ-ONLY reclassify edildi:
`RETIRED_CODE / HISTORICAL_RUNTIME_REFERENCE` — artık build/ship edilmedikleri
için aktif runtime riski taşımıyorlar.

Mobile Next / Expo tarafında ayrı, onaylı bir düzeltme yapıldı:
`app.config.ts`'teki `legacyLaunchpadUrl` fallback'i eski tenant URL'sini
içeriyordu, artık `""` — yeni Work Zone sitesi yayınlandığında
`EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL` ile ayarlanacak. `tsc` temiz, lint temiz,
180/180 test yeşil.

Sabit sınırlar: Cordova kaynağı silinmedi, yeniden build/publish edilmedi,
migration başlatılmadı.

## Product Design V2 aday APK — fiziksel doğrulama bekliyor

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-design-v2.apk
Kaynak  : 21a1f57 (Product Design V2)
Package : com.btb.mobile.next
Version : 0.1.0 (1) · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız; APK içinde tek lib dizini)
Size    : 48.271.941 bayt
SHA-256 : 8EB20F8F5774FB40FCE060E76DACC848F83C1928A19C27C3716DA4D60062AEEF
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot, useMocks=false, mobileApiUrl=https://api.surklase.com,
          legacyLaunchpadUrl=https://34dfc21ftrial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f
Durum   : PENDING_PHYSICAL_VALIDATION
```

İmza sertifikası doğrulanmış baseline ile **aynıdır**; üstüne kurulum ve App Link
davranışı korunur.

İçerik taraması (1.258 giriş, açılmış ağaç taramadan sonra silindi). Tarama önce
beklenen işaretlerle doğrulandı, çünkü yalnız sıfır dönen bir tarama bozuk
taramadan ayırt edilemez:

```text
beklenen var  : api.surklase.com 1 · 34dfc21ftrial 1 · com.btb.mobile.next 17
yasak         : 188b143btrial 0 (UTF-8 ve UTF-16LE) · match-card/event 0
                BEGIN PRIVATE KEY 0 · private_key 0 · JSESSIONID 0
Hermes tuzağı : UTF-16LE tespiti kanıtlandı (Türkçe sabit UTF-16LE olarak bulundu)
```

Pilot erişim anahtarı beklendiği gibi gömülüdür (doğrulanmış baseline ile aynı
profil). Değeri hiçbir log, rapor veya commit'e yazılmadı.

Doğrulanmış baseline `btb-mobile-next-arm64-live-context-v2.apk` **silinmedi**;
Design V2 APK'sı fiziksel doğrulamayı geçene kadar geri dönüş noktasıdır.

## Xiaomi fiziksel doğrulama kontrol listesi — Product Design V2

Yeni Design V2 APK'sı için. Geçene kadar `btb-mobile-next-arm64-live-context-v2.apk`
geri dönüş noktasıdır ve silinmez.

| # | Kontrol | Beklenen |
| --- | --- | --- |
| 1 | Soğuk açılış | Beyaz parlama yok; açılış ekranından Özet'e temiz geçiş |
| 2 | Kimlik doğrulama | Pilot oturum açılır; mevcut kurulumun üstüne yükseltme oturumu bozmaz |
| 3 | Özet | Hero kompakt, metrik kartlarında iz (trace) var, canlı sayaç teal |
| 4 | Canlı | Canlı pill'leri teal ve nabız atıyor; biten maç nötr `MS` |
| 5 | Yatay sekme kaydırma | Özet ↔ Canlı ↔ Super ↔ Toto ↔ Daha Fazla; ilk/son sekmede wrap yok |
| 6 | Maç Detayı | Skor bandı + BTB SEÇİMİ bandı; sinyal ölçer; oran hareketi yönü |
| 7 | Game Pulse | Kendi yüksekliğini bildiriyor; kompakt yükseklik davranışı bozulmadı |
| 8 | Gol / kırmızı kart zaman çizelgesi | Yalnız gol ve kırmızı kart; tazelik uyarısı doğru |
| 9 | Modül sıralama | Uzun bas-sürükle çalışıyor; sıra cihazda kalıcı |
| 10 | Super listesi | Açık karar iz taşıyor, sonuçlanan kararlar geri çekiliyor |
| 11 | Super karar detayı | `KARAR ANI` ile `SONUÇ` bantları bronz dikişle ayrık |
| 12 | Toto | Program durumu doğru tonda; kapasite çubuğu analitik mavi |
| 13 | Toto detayı | Bronz `KUPON` başlığı; sonuç renkleri doğru |
| 14 | Daha Fazla | Bronz bölüm etiketleri; satır metni okunur |
| 15 | Work Zone / derin bağlantı | Çift hash regresyonu yok; Fiori açılıyor |
| 16 | Bildirimler | Kayıt ve teslim; bildirimden doğru ekrana dönüş |
| 17 | Koyu tema | Derin mürekkep zemin; kart kenarları kaybolmuyor |
| 18 | Açık tema | Sıcak zemin, serin kart; metin lacivert ve okunur |
| 19 | Bibi kuralları | Maç Detayı ve Super karar detayında ambient Bibi **yok**; rehber adımı hâlâ çalışıyor |
| 20 | Beyaz parlama | Sekme geçişlerinde ve detay dönüşlerinde yok |
| 21 | Kırpma / taşma | Uzun Türkçe kulüp adları, yüksek skor, yüksek oran, 90+ dakika |
| 22 | Güvenli alanlar | Durum çubuğu ve gezinme çubuğu çakışması yok; alt sekme erişilebilir |

Bulgular `docs/OBSERVATION_LOG.md` içine yazılır; kod değişikliği yalnız
`btb next cutover start` ile açılır.

## Son checkpoint

- Maç ve Super detay hero kartlarındaki alt metrikler ortak üç kolon ritmine
  alındı: canlıda seçim / seçim oranı / güncel oran; Super'de seçim / seçim oranı / kâr.
- Karar Günlüğü yıldız menüsü artık `Varsayılan`, yıldız yüksekten düşüğe ve
  düşükten yükseğe sıralamayı da içerir. Varsayılan provider sırasını aynen korur.
  Android'de menü gerçek modal katmandadır; alttaki kartlar dokunmayı çalmaz.
- Ana `(tabs)` ekranları `Özet -> Canlı -> Super -> Toto -> Daha Fazla` sırasında
  yatay kaydırmayla değişir; detay ekranları ve ilk/son sekme wrap davranışı dışarıdadır.
- Toto detayında güvenilir kaynak `updatedAt` değeri yerel tarih/saatle gösterilir.
  Sonuçlanan fikstürlerde SAP `home_score` / `away_score` alanlarından biten skor;
  payout hazır ve pozitifse SAP `theo_prize` alanından `Teorik ikramiye` gösterilir.
- BFF Toto read-only seçimi/mapper'ı `payout_ready`, `payout_desc`, `theo_prize`,
  `home_score` ve `away_score` alanlarını nullable DTO olarak taşır. Eski public BFF
  bu alanları henüz yayınlamadığı için Mobile şeması staged deploy sırasında geriye
  uyumlu null fallback kullanır.
- `last_pressure_diff` / `last_total_pressure` alanlarının güncel maç değil son
  tarihsel Super karar değerleri olduğu yerel CDS kanıtıyla doğrulandı. BFF bunları
  artık güncel baskı gibi yayınlamaz; Mobile liste ve detay `Güncel veri bekleniyor`
  gösterir. Gerçek current-match alanı gelmeden sahte değer üretilmez.

## Repo durumu

```text
zbet-abap
  branch/upstream : main / origin/main
  HEAD            : 702c05f  (origin ile aynı, temiz)
  state           : handler sınıfı yerelde mevcut; live SICF kapanışta yeniden
                    404, SICF nesnesi sürüm kontrollü değil

zbet-cap
  branch/upstream : main / origin/main
  HEAD            : 19aa8f8  (origin ile aynı, temiz)
                    0832b16  Raise Mobile Super history limit
                    19aa8f8  Expose passive Live Context telemetry
  state           : mevcut yerel pilot runtime clean 19aa8f8 kaynağından
                    yeniden başladı; public health/read-back geçti

zbet-mobile
  branch/upstream : master / origin/master
  functional SHA  : 7585aaa  Complete Mobile observation UX batch
  state           : functional source origin/master'da; bu kapanış belgeleri
                    de current HEAD ile push edilir. Yalnız daha önce var olan
                    untracked `cutover_2026-08-21-02.md` kapsam dışı korunur
```

Kullanıcıya ait kapsam dışı dosya korundu. `btb-codex` içindeki bağımsız dirty
dosyalara dokunulmadı. Mevcut batch'in APK, commit/push, pilot runtime ve
dokümantasyon kapanışında bekleyen işlem yoktur.

## Doğrulama

- Mobile `npm run check`: TypeScript, ESLint, 414 test, OpenAPI ve brand geçti.
- Resmi Mobile BFF kapısı: tüm testler ve production build geçti; gerçek 200
  fixture sıralama, kayıpsız map, bounded URL ve `$top=200` sözleşmesini geçti.
- Android 15 x86_64 compile/install/launch ve hedefli UI smoke geçti.
- Final ARM64 pilot release APK build, ABI, package, v2 imza, SHA-256 ve
  server/private-key/session taraması geçti.
- Clean CAP `19aa8f8` runtime restart sonrası local/public health hazır;
  `liveContextTelemetry` her iki yüzeyde mevcut ve authenticated public
  `/v1/super/logs` read-back'i tam 200 satır döndürdü.
- Fiziksel Xiaomi bu son batch için bağlı değildi; sahip Android 15 görsel ve
  teknik/public read-back kanıtını observation kapanışı için kabul etti.

## Doğrulanmış baseline APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-04.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1) · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 53.347.881 bytes
SHA-256 : 5D0ECB8C19514BCCF75EF8CDC574F7F7760EA3018896A989CEE2355265B77217
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
Source  : 7585aaa + CAP public runtime 19aa8f8
Durum   : FINAL_PILOT_ARTIFACT — owner'a paylaşıldı
```

İmza sertifikası önceki baseline ile aynıdır; üstüne kurulum ve App Link
davranışı korunur. Bellek içi APK taramasında legacy FCM server key, PEM/private
key, `private_key`, `client_secret`, service-account ve `JSESSIONID` eşleşmesi
**0** bulundu; değerler hiçbir log veya belgeye yazılmadı.

Cutover prosedürü adım 8 uyarınca `.codex-artifacts` yalnız bu doğrulanmış
`arm64` APK'yı tutar. Önceki APK'lar ve geçici ekran kanıtları Geri Dönüşüm
Kutusu'na taşındı.

Kanıt: `docs/observation_archive/cutover_2026-08-22.md`.

## Bilyoner takım logo eşlemesi

- `htpi` = home participant id; `atpi` = away participant id.
- Logo kalıbı:
  `https://content.bilyoner.com/assets/participant/{participantId}.png`
- PSG `htpi=954`:
  `https://content.bilyoner.com/assets/participant/954.png`
- Aston Villa `atpi=227`:
  `https://content.bilyoner.com/assets/participant/227.png`
- Bu, Bilyoner'in public/dokümante edilmiş resmi logo API'si değildir; web
  uygulamasında kullanılan CDN pattern'inin gözlemlenmesiyle tespit edilmiştir.
  Bu nedenle tek merkezi resolver/config ve broken-image göstermeyen fallback
  zorunludur; URL component'lere veya DB'ye dağınık yazılmaz.
- **CDN, bilinmeyen participant id için 404 değil HTTP 200 döner** ve tek bir
  sağlayıcı markalı placeholder görseli sunar. İstek başarılı olduğu için
  `onError` hiçbir zaman tetiklenmez; yalnız hata yoluna dayanan bir fallback
  bu placeholder'ı takım armasıymış gibi kullanıcıya geçirir.
- Placeholder yalnız intrinsic boyutundan ayırt edilir (React Native `onLoad`
  ile bildirir): ölçüm 2026-08-17, sekiz participant id üzerinde — gerçek
  armalar PNG ve yükseklik 64 (64 ve 49 genişlik görüldü), placeholder ise tam
  `128x128` WEBP, 1304 bayt ve her seferinde bayt-aynı. Kural bilinçli olarak
  dardır: başka her geometri gerçek arma sayılır. Sağlayıcı ileride gerçek
  armaları 128x128 yayınlarsa bu kural yeniden gözden geçirilmelidir.
- Eksik, geçersiz, hatalı ve placeholder armaların tamamı BTB markasına düşer
  (paket içi `assets/icon.png`), böylece fallback ağ isteği yapmaz ve döngüye
  giremez. Sağlayıcının kendi placeholder'ı BTB fallback'i olarak gösterilmez.
- Yerel Mobile OpenAPI/Zod, BFF `$select`/mapper ve ABAP snapshot'ında `htpi/atpi`
  bulunmadı. Doğru alan zinciri upstream SAP/DDIC/OData'da ayrı yazma/aktivasyon
  onayıyla sağlanmadan takım adından tahmin veya runtime scraping yapılmaz.

## Açık observation / blokajlar

- `NXT-OBS-111`–`116` tamamı `RESOLVED`; bu batch'ten açık `OBSERVED` veya
  `READY` ve kapanış işlemi kalmadı.
- Freeze edilen sekiz maddeden açık `OBSERVED` kalmadı. `NXT-OBS-073`, `074`,
  `086`, `089` ve `100` doğru sahip/kanıt gelene kadar `DEFERRED`.
- `NXT-OBS-104`: `/sap/bc/zbet/provider/detail` live SICF düğümü owner'ın yeniden
  oluşturmasından sonra kısa süre çalışıp yeniden 404'e döndü. Kalıcı çözüm,
  ayrı SAP onayıyla SICF nesnesini sürümlemek, hedefte aktive etmek ve restart/
  session sınırından sonra read-back yapmaktır.
- `NXT-OBS-092`: Mobile/BFF tarihsel baskıyı artık güncel diye göstermez; gerçek
  current-match pressure alanı SAP/OData'da yayınlanana kadar veri bekleme fallback'i
  kullanılır.
- Toto skor/teorik ikramiye alanları CAP DEV deploy ve public response ile
  doğrulandı; fiziksel cihazdaki görünüm observation sırasında izlenecek.
- Fiziksel ARM64 telefonda filtre/Toto sonuç görünümünün madde bazlı doğrulaması
  observation'da izlenecek (2026-08-17 fiziksel turu genel navigasyonu sağlıklı
  buldu ama bu maddeleri tek tek hedeflemedi).
- ~~Fiziksel Xiaomi bildirim kaydı ve teslimi~~ — KAPALI, bkz. yukarıdaki
  "Bildirim incidenti — KAPALI (2026-08-16)".
- ~~Work Zone deep-link double-hash regresyonu~~ — KAPALI, bkz. yukarıdaki
  "Work Zone deep-link double-hash regresyonu — kapandı (2026-08-17)".

## Sıradaki milestone

Observation modunda kal. Sonraki teknik kapı, `NXT-OBS-104` için SAP SICF
kalıcılığının ayrı operasyonel onayla çözülmesidir. Final Mobile pilot APK
paylaşıldı; current batch'in commit/push/runtime kapanışı tamamlandı.
FULL_INTERNAL ve Champion/Challenger başlatılmadı.

## Exact next steps

1. Mevcut batch için APK, commit, push, runtime restart/read-back veya belge
   kapanışı beklemiyor; observation modunda yeni fiziksel bulguları kaydet.
2. Ayrı SAP yazma/aktivasyon onayı verilirse `detail` SICF nesnesini abapGit
   kapsamına al, doğru hedefte aktive et ve restart/session sınırından sonra
   tokensız 401 + tokenlı 200 + BFF OK read-back kanıtı al.
3. Doğal bir kırmızı kart geldiğinde alt tip ayrımını yalnız gözlemsel doğrula;
   bu release engeli değildir.
4. `DECISION SAFETY / EVENT-TRANSITION CONFLICT REVIEW` başka bir BTB
   thread'inde tamamlandı. Sonuçları o thread'in kanonik kayıtlarındadır ve
   buradan yeniden yorumlanmaz; aşağıdaki bölüm yalnız tarihsel kapsam kaydıdır.
5. FULL_INTERNAL ve Champion/Challenger başlatılmadı; ayrı karar gerektirir.
6. Yeni observation batch'i yalnız `btb next cutover start` ile açılır;
   commit/push ve dış deploy kapıları açık onayla işletilir.

## DECISION SAFETY / EVENT-TRANSITION CONFLICT REVIEW — başka thread'de kapandı

Bu bölüm kapsamın tarihsel kaydıdır. Sonuçlar ve kararlar o thread'in kanonik
kayıtlarında tutulur; Mobile Product Design V2 bunları değiştirmedi.

Amaç: `MODEL_WRONG` ile `INCOHERENT_SNAPSHOT / EVENT_TRANSITION_UNSAFE` ayrımını
yapmak ve geçiş anında bozulmuş gözlemlerin ileride ROI/kalibrasyon/
Champion-Challenger veri setlerini kirletmesini önlemek. Kapsam: VAR geçişleri,
penaltılar, ani oran sıçramaları, skor/oran çelişkisi, market askı/yeniden
açılışı, gol çevresinde bayat skor, kırmızı kart sonrası yeniden fiyatlama.

Adli vakalar:

```text
1) Jong Utrecht - Vitesse   52'  BTB snapshot 1-1, Live Context golü -> 1-2
                                 Ms1X @ 3.36, ODDS_CHANGED
                                 final 1-3, karar LOST
2) Pachuca - Puebla         90'  şüpheli Ms1X @ 9.53
                                 Live Context 90+ golü -> 2-3
```

Bu milestone Super/Toto model mantığını değiştirme yetkisi taşımaz; önce teşhis.


Cutover kanıtı: `docs/observation_archive/cutover_2026-08-17-02.md`.
2026-08-15 stabilizasyon kanıtı: `docs/observation_archive/cutover_2026-08-15.md`.
2026-08-17 Work Zone deep-link kapanış kanıtı: `docs/observation_archive/cutover_2026-08-17.md`.
