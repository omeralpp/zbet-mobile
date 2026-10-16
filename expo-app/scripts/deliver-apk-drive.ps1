[CmdletBinding()]
param(
  # A final pilot APK produced by build-pilot-apk.ps1; its <apk>.config.json
  # evidence must sit next to it.
  [Parameter(Mandatory)]
  [string]$ApkPath,

  # Uploading is a delivery: pass DELIVER-APK. Without it the script verifies
  # the APK and prints the plan only.
  [string]$Confirm,

  # rclone remote authorized by the owner with the drive.file scope, and the
  # private folder it created (rclone can see only the files it created).
  [string]$Remote = 'btbdrive',
  [string]$Folder = 'BTB APK',

  # Secret-free receipt (default: <apk>.drive-delivery.json).
  [string]$Output
)

<#
  Delivers a final pilot APK to the owner's private Google Drive folder and
  proves the copy: signature and ABI checks, upload without overwriting,
  owner-only permissions, an authenticated download and a byte-for-byte
  SHA-256 readback. Prints the private Drive link the owner opens on the phone.

  It never creates a sharing link (`rclone link` would make the file public)
  and never writes the OAuth token anywhere but rclone's own config. The
  receipt feeds the Android delivery receipt of COORDINATED_CLIENT_RELEASE.md;
  installation evidence is still the owner's to give.
#>

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Windows PowerShell 5.1 turns a redirected native stderr line into a
# terminating error under 'Stop'; apksigner and rclone write harmless notices
# there. Run them under 'Continue' and keep stdout and stderr apart.
function Invoke-Native {
  param([string]$FilePath, [string[]]$Arguments)
  $previous = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $all = & $FilePath @Arguments 2>&1
    $code = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previous
  }
  return [pscustomobject]@{
    code = $code
    stdout = @($all | Where-Object { $_ -isnot [Management.Automation.ErrorRecord] } | ForEach-Object { [string]$_ })
    stderr = @($all | Where-Object { $_ -is [Management.Automation.ErrorRecord] } | ForEach-Object { $_.ToString() })
  }
}

function Find-Rclone {
  $fromEnvironment = [Environment]::GetEnvironmentVariable('BTB_RCLONE_EXE', 'User')
  if ($fromEnvironment -and (Test-Path -LiteralPath $fromEnvironment)) { return $fromEnvironment }
  $onPath = Get-Command rclone.exe -ErrorAction SilentlyContinue
  if ($onPath) { return $onPath.Source }
  $packaged = Get-ChildItem (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages') -Recurse -Filter rclone.exe -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($packaged) { return $packaged.FullName }
  throw 'rclone is not installed. Install it with: winget install --id Rclone.Rclone --exact --source winget'
}

function Find-ApkSigner {
  $sdk = [Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')
  if (-not $sdk) { $sdk = $env:ANDROID_HOME }
  if (-not $sdk) { $sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
  $tools = Get-ChildItem (Join-Path $sdk 'build-tools') -Directory -ErrorAction SilentlyContinue |
    Sort-Object { $parsed = $null; if ([version]::TryParse($_.Name, [ref]$parsed)) { $parsed } else { [version]'0.0' } } -Descending
  foreach ($tool in $tools) {
    $candidate = Join-Path $tool.FullName 'apksigner.bat'
    if (Test-Path -LiteralPath $candidate) { return $candidate }
  }
  throw 'apksigner was not found in the Android SDK build-tools.'
}

function Get-Sha256([string]$Path) {
  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToUpperInvariant()
}

$ApkPath = [IO.Path]::GetFullPath($ApkPath)
if (-not (Test-Path -LiteralPath $ApkPath -PathType Leaf)) { throw "APK not found: $ApkPath" }
$evidencePath = "$ApkPath.config.json"
if (-not (Test-Path -LiteralPath $evidencePath -PathType Leaf)) {
  throw 'The APK has no build evidence (<apk>.config.json); deliver only APKs built by build-pilot-apk.ps1.'
}
$evidence = Get-Content -LiteralPath $evidencePath -Raw | ConvertFrom-Json
$apkItem = Get-Item -LiteralPath $ApkPath
$apkName = $apkItem.Name
$sha256 = Get-Sha256 $ApkPath
if ($evidence.sha256.ToUpperInvariant() -ne $sha256 -or [int64]$evidence.bytes -ne $apkItem.Length) {
  throw 'The APK bytes do not match their build evidence; rebuild instead of delivering an edited file.'
}
if (-not $Output) { $Output = "$ApkPath.drive-delivery.json" }

# Signature and ABI, checked on the exact bytes that will be uploaded.
$apkSigner = Find-ApkSigner
$signer = Invoke-Native $apkSigner @('verify', '--print-certs', $ApkPath)
if ($signer.code -ne 0) { throw "apksigner rejected the APK signature: $($signer.stderr -join ' ')" }
$certificate = ([regex]::Match(($signer.stdout -join "`n"), 'certificate SHA-256 digest:\s*([0-9a-fA-F:]+)')).Groups[1].Value.Replace(':', '').ToUpperInvariant()
$expectedCertificate = ([string][Environment]::GetEnvironmentVariable('BTB_ANDROID_CERT_SHA256', 'User') -replace '[^0-9a-fA-F]', '').ToUpperInvariant()
if (-not $expectedCertificate) { throw 'BTB_ANDROID_CERT_SHA256 is not set; the pilot signing certificate cannot be confirmed.' }
$signatureVerified = $certificate -eq $expectedCertificate
if (-not $signatureVerified) { throw 'The APK is not signed with the pilot certificate.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($ApkPath)
try {
  $abis = @($archive.Entries | Where-Object { $_.FullName -like 'lib/*/*' } | ForEach-Object { ($_.FullName -split '/')[1] } | Sort-Object -Unique)
} finally {
  $archive.Dispose()
}
$abiVerified = ($abis.Count -eq 1 -and $abis[0] -eq [string]$evidence.architecture)
if (-not $abiVerified) { throw "The APK native libraries ($($abis -join ', ')) do not match its declared architecture." }

$rclone = Find-Rclone
$remotes = (Invoke-Native $rclone @('listremotes')).stdout
if ($remotes -notcontains "${Remote}:") {
  throw "rclone remote '$Remote' is not configured. The owner authorizes it once: rclone config create $Remote drive scope=drive.file"
}
$remoteDirectory = "${Remote}:$Folder"
$remoteFile = "$remoteDirectory/$apkName"

if ($Confirm -ne 'DELIVER-APK') {
  [pscustomobject]@{
    dryRun = $true; apk = $apkName; bytes = $apkItem.Length; sha256 = $sha256
    sourceSha = $evidence.sourceSha; architecture = $evidence.architecture
    signatureVerified = $signatureVerified; abiVerified = $abiVerified
    destination = $remoteFile; receipt = $Output
  } | ConvertTo-Json -Compress
  return
}

# Upload without overwriting: a different file under the same name is refused.
$step = Invoke-Native $rclone @('mkdir', $remoteDirectory)
if ($step.code -ne 0) { throw "Could not create or open the private Drive folder: $($step.stderr -join ' ')" }
$step = Invoke-Native $rclone @('copyto', $ApkPath, $remoteFile, '--immutable')
if ($step.code -ne 0) { throw "Upload failed or a different file already has this name: $($step.stderr -join ' ')" }

$listing = Invoke-Native $rclone @('lsjson', $remoteFile, '--stat', '--metadata', '--drive-metadata-permissions', 'read')
if ($listing.code -ne 0) { throw "Could not read the uploaded file metadata: $($listing.stderr -join ' ')" }
$entry = ($listing.stdout -join "`n") | ConvertFrom-Json
$fileId = [string]$entry.ID
if (-not $fileId) { throw 'Drive did not report a file id for the upload.' }

# Owner-only: no link, domain or other-user grant may exist on the file.
$permissions = @()
if ($entry.Metadata -and $entry.Metadata.permissions) {
  $permissions = @(([string]$entry.Metadata.permissions) | ConvertFrom-Json)
}
$foreign = @($permissions | Where-Object { $_.type -ne 'user' -or $_.role -ne 'owner' })
$privateOwnerOnly = ($permissions.Count -ge 1 -and $foreign.Count -eq 0)
if (-not $privateOwnerOnly) {
  throw 'The uploaded file is not owner-only (or its permissions could not be read); check it in Drive before delivery.'
}

# Authenticated download of the remote copy and a byte-for-byte readback.
$readbackRoot = Join-Path ([IO.Path]::GetTempPath()) ("btb-apk-readback-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $readbackRoot | Out-Null
try {
  $readbackPath = Join-Path $readbackRoot $apkName
  $step = Invoke-Native $rclone @('copyto', $remoteFile, $readbackPath)
  if ($step.code -ne 0) { throw "Could not download the remote copy for readback: $($step.stderr -join ' ')" }
  $readbackBytes = (Get-Item -LiteralPath $readbackPath).Length
  $readbackSha256 = Get-Sha256 $readbackPath
} finally {
  Remove-Item -LiteralPath $readbackRoot -Recurse -Force -ErrorAction SilentlyContinue
}
$remoteReadbackVerified = ($readbackSha256 -eq $sha256 -and $readbackBytes -eq $apkItem.Length)
if (-not $remoteReadbackVerified) { throw 'The Drive copy does not match the APK byte for byte.' }

$receipt = [ordered]@{
  schemaVersion = 1
  deliveredAtUtc = [DateTime]::UtcNow.ToString('o')
  apk = $apkName
  bytes = $apkItem.Length
  sha256 = $sha256
  sourceSha = $evidence.sourceSha
  architecture = $evidence.architecture
  certificateSha256 = $certificate
  signatureVerified = $signatureVerified
  abiVerified = $abiVerified
  drive = [ordered]@{
    remote = $Remote; folder = $Folder; fileId = $fileId
    url = "https://drive.google.com/file/d/$fileId/view?usp=drivesdk"
    permissions = @($permissions | ForEach-Object { [ordered]@{ type = $_.type; role = $_.role } })
  }
  privateOwnerOnly = $privateOwnerOnly
  remoteReadbackVerified = $remoteReadbackVerified
  readbackBytes = $readbackBytes
  readbackSha256 = $readbackSha256
}
[IO.File]::WriteAllText($Output, ($receipt | ConvertTo-Json -Depth 6) + "`n", [Text.UTF8Encoding]::new($false))
$receipt | ConvertTo-Json -Depth 6 -Compress
