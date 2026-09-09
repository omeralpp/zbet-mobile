[CmdletBinding()]
param(
  [ValidateSet('arm64-v8a', 'x86_64')]
  [string]$Architecture = 'arm64-v8a',

  [ValidatePattern('^[a-z0-9][a-z0-9._-]*\.apk$')]
  [string]$ArtifactName = 'btb-mobile-next-arm64-pilot.apk'
)

$ErrorActionPreference = 'Stop'

function Invoke-Checked {
  param(
    [Parameter(Mandatory)]
    [string]$Command,
    [Parameter(Mandatory)]
    [string[]]$Arguments,
    [Parameter(Mandatory)]
    [string]$Phase
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Phase failed with exit code $LASTEXITCODE."
  }
}

$appRoot = Split-Path -Parent $PSScriptRoot
$pilotFeatureConfigScript = Join-Path $PSScriptRoot 'pilot-feature-config.mjs'
$stageRoot = "C:\btb-mobile-pilot-$PID"
$resolvedStageRoot = [IO.Path]::GetFullPath($stageRoot)

if (-not (Test-Path -LiteralPath $pilotFeatureConfigScript -PathType Leaf)) {
  throw "Pilot feature configuration verifier not found: $pilotFeatureConfigScript"
}

if ($resolvedStageRoot -notmatch '^C:\\btb-mobile-pilot-\d+$') {
  throw "Unsafe pilot build staging path: $resolvedStageRoot"
}
if (Test-Path -LiteralPath $resolvedStageRoot) {
  throw "Pilot build staging path already exists: $resolvedStageRoot"
}

$requiredEnvironment = @(
  'BTB_GOOGLE_SERVICES_FILE',
  'EXPO_PUBLIC_MOBILE_API_URL',
  'EXPO_PUBLIC_MOBILE_AUTH_MODE',
  'EXPO_PUBLIC_MOBILE_PILOT_KEY',
  'EXPO_PUBLIC_USE_MOCKS',
  'EXPO_PUBLIC_MATCH_PATH_INTELLIGENCE',
  'EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE',
  'EXPO_PUBLIC_MOBILE_INTELLIGENCE'
)
foreach ($name in $requiredEnvironment) {
  $currentValue = [Environment]::GetEnvironmentVariable($name, 'Process')
  if ([string]::IsNullOrWhiteSpace($currentValue)) {
    $userValue = [Environment]::GetEnvironmentVariable($name, 'User')
    if (-not [string]::IsNullOrWhiteSpace($userValue)) {
      [Environment]::SetEnvironmentVariable($name, $userValue, 'Process')
    }
  }
}
$missingEnvironment = @(
  $requiredEnvironment | Where-Object {
    [string]::IsNullOrWhiteSpace(
      [Environment]::GetEnvironmentVariable($_, 'Process')
    )
  }
)
if ($missingEnvironment.Count -gt 0) {
  throw "Pilot build configuration is incomplete: $($missingEnvironment -join ', ')"
}
if ($env:EXPO_PUBLIC_USE_MOCKS.ToLowerInvariant() -ne 'false') {
  throw 'Pilot APK must be built with EXPO_PUBLIC_USE_MOCKS=false.'
}
if ($env:EXPO_PUBLIC_MOBILE_AUTH_MODE.ToLowerInvariant() -ne 'pilot') {
  throw 'Pilot APK must be built with EXPO_PUBLIC_MOBILE_AUTH_MODE=pilot.'
}
if ($env:EXPO_PUBLIC_MOBILE_API_URL -ne 'https://api.surklase.com') {
  throw 'Pilot APK must target https://api.surklase.com.'
}
if (
  $env:EXPO_PUBLIC_MOBILE_PILOT_KEY.Length -lt 32 -or
  $env:EXPO_PUBLIC_MOBILE_PILOT_KEY -match '[\r\n]'
) {
  throw 'Pilot APK access key is invalid.'
}

# These three settings are intentionally independent. The shared Mobile setting
# is the Jinx outlook mode; Match Journey and Team Form each have their own
# override. A pilot build must name all three so a fresh shell cannot silently
# inherit OFF when .env is excluded from staging.
$featureModeOutput = & node.exe $pilotFeatureConfigScript 'validate-env'
if ($LASTEXITCODE -ne 0) {
  throw 'Pilot APK feature-mode validation failed.'
}
try {
  $featureModes = ($featureModeOutput -join [Environment]::NewLine) |
    ConvertFrom-Json
} catch {
  throw 'Pilot APK feature-mode verifier returned invalid JSON.'
}

# EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL is public runtime config (the Work Zone
# entry point URL, not a secret), kept in the local .env rather than the
# User-scope secret store used above. .env itself is excluded from the
# staged build below, so it must be promoted into the process environment
# here or the staged build silently compiles with an empty Work Zone URL.
if ([string]::IsNullOrWhiteSpace($env:EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL)) {
  $envFilePath = Join-Path $appRoot '.env'
  if (Test-Path -LiteralPath $envFilePath) {
    $envLine = Get-Content -LiteralPath $envFilePath |
      Where-Object { $_ -match '^EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL=' } |
      Select-Object -First 1
    if ($envLine) {
      $value = ($envLine -replace '^EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL=', '').Trim()
      if ($value.StartsWith('"') -and $value.EndsWith('"')) {
        $value = $value.Substring(1, $value.Length - 2)
      }
      if ($value) {
        $env:EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL = $value
      }
    }
  }
}
if ([string]::IsNullOrWhiteSpace($env:EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL)) {
  throw 'Pilot APK must be built with EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL set (Work Zone entry point).'
}
if ($env:EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL -match '188b143btrial') {
  throw 'Pilot APK Work Zone URL references the retired old-tenant host.'
}
if ($env:EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL -match '#') {
  throw 'Pilot APK Work Zone base URL must not carry a fragment (e.g. #Shell-home) — it is a deep-link base, not a navigation target.'
}

try {
  New-Item -ItemType Directory -Path $resolvedStageRoot | Out-Null
  $excludedNames = @(
    'node_modules',
    'android',
    'ios',
    '.expo',
    '.codex-artifacts',
    'dist',
    'coverage',
    '.env',
    '.env.local'
  )
  Get-ChildItem -Force -LiteralPath $appRoot |
    Where-Object { $_.Name -notin $excludedNames } |
    Copy-Item -Destination $resolvedStageRoot -Recurse -Force
  Copy-Item `
    -LiteralPath $env:BTB_GOOGLE_SERVICES_FILE `
    -Destination (Join-Path $resolvedStageRoot 'google-services.json')
  $env:BTB_GOOGLE_SERVICES_FILE = './google-services.json'

  Push-Location $resolvedStageRoot
  try {
    $env:NODE_ENV = 'production'
    Invoke-Checked `
      -Command 'npm.cmd' `
      -Arguments @('ci') `
      -Phase 'Pilot dependency install'
    Invoke-Checked `
      -Command 'npx.cmd' `
      -Arguments @(
        'expo',
        'prebuild',
        '--platform',
        'android',
        '--no-install'
      ) `
      -Phase 'Pilot Android native project generation'

    $androidRoot = Join-Path $resolvedStageRoot 'android'
    $gradleWrapper = Join-Path $androidRoot 'gradlew.bat'
    Invoke-Checked `
      -Command $gradleWrapper `
      -Arguments @(
        '-p',
        $androidRoot,
        'assembleRelease',
        "-PreactNativeArchitectures=$Architecture",
        '--no-daemon'
      ) `
      -Phase "Pilot $Architecture release APK compile"

    $apkPath = Join-Path $androidRoot `
      'app\build\outputs\apk\release\app-release.apk'
    if (-not (Test-Path -LiteralPath $apkPath -PathType Leaf)) {
      throw "Pilot release APK not found: $apkPath"
    }

    $artifactRoot = Join-Path $appRoot '.codex-artifacts'
    New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null
    $artifactPath = Join-Path $artifactRoot $ArtifactName

    # Verify the effective configuration from the artifact itself. The embedded
    # config also contains the pilot access key, so it is read locally and only
    # the allowlisted, public settings below are written to evidence.
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::OpenRead($apkPath)
    $embeddedConfigPath = Join-Path $resolvedStageRoot 'embedded-app.config.json'
    try {
      $configEntry = @(
        $archive.Entries | Where-Object {
          ($_.FullName -replace '\\', '/') -eq 'assets/app.config'
        }
      ) | Select-Object -First 1
      if ($null -eq $configEntry) {
        throw 'Pilot APK does not contain assets/app.config.'
      }
      $stream = $configEntry.Open()
      $reader = [IO.StreamReader]::new($stream)
      try {
        $embeddedConfig = $reader.ReadToEnd()
      } finally {
        $reader.Dispose()
        $stream.Dispose()
      }
      [IO.File]::WriteAllText(
        $embeddedConfigPath,
        $embeddedConfig,
        [Text.UTF8Encoding]::new($false)
      )
    } finally {
      $archive.Dispose()
    }

    $artifactConfigOutput = & node.exe `
      $pilotFeatureConfigScript `
      'verify-config' `
      $embeddedConfigPath
    if ($LASTEXITCODE -ne 0) {
      throw 'Pilot APK embedded feature-mode verification failed.'
    }
    try {
      $artifactConfig = ($artifactConfigOutput -join [Environment]::NewLine) |
        ConvertFrom-Json
    } catch {
      throw 'Pilot APK embedded feature-mode verifier returned invalid JSON.'
    }

    # Publish the artifact only after its embedded settings match the requested
    # modes, so a failed readback cannot overwrite a previously valid APK.
    Copy-Item -Force -LiteralPath $apkPath -Destination $artifactPath
    $artifactItem = Get-Item -LiteralPath $artifactPath
    $artifactEvidence = [ordered]@{
      schemaVersion = 1
      artifact = $artifactItem.Name
      bytes = $artifactItem.Length
      sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $artifactPath).Hash
      architecture = $Architecture
      effectiveSettings = $artifactConfig.effectiveSettings
    }
    $evidencePath = "$artifactPath.config.json"
    [IO.File]::WriteAllText(
      $evidencePath,
      ($artifactEvidence | ConvertTo-Json -Depth 5),
      [Text.UTF8Encoding]::new($false)
    )
    Write-Host "Pilot APK: $artifactPath"
    Write-Host "Pilot APK config evidence: $evidencePath"
    Write-Host (
      'Pilot feature modes: Match Journey={0}; Team Form={1}; Jinx={2}' -f
        $featureModes.matchJourney,
        $featureModes.teamForm,
        $featureModes.jinx
    )
  } finally {
    Pop-Location
  }
} finally {
  if (Test-Path -LiteralPath $resolvedStageRoot) {
    $cleanupError = $null
    # Gradle lint workers may retain a cache JAR briefly after a successful
    # release build. Keep the staging cleanup bounded, but allow enough time
    # for Windows to release that handle before treating cleanup as failed.
    for ($attempt = 1; $attempt -le 30; $attempt++) {
      try {
        Remove-Item `
          -LiteralPath $resolvedStageRoot `
          -Recurse `
          -Force `
          -ErrorAction Stop
        $cleanupError = $null
        break
      } catch {
        $cleanupError = $_
        if ($attempt -lt 30) {
          Start-Sleep -Seconds 2
        }
      }
    }
    if ($cleanupError) {
      throw $cleanupError
    }
  }
}
