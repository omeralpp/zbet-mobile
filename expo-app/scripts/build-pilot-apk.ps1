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
$stageRoot = "C:\btb-mobile-pilot-$PID"
$resolvedStageRoot = [IO.Path]::GetFullPath($stageRoot)

if ($resolvedStageRoot -notmatch '^C:\\btb-mobile-pilot-\d+$') {
  throw "Unsafe pilot build staging path: $resolvedStageRoot"
}
if (Test-Path -LiteralPath $resolvedStageRoot) {
  throw "Pilot build staging path already exists: $resolvedStageRoot"
}

$requiredEnvironment = @(
  'BTB_GOOGLE_SERVICES_FILE',
  'EXPO_PUBLIC_MOBILE_API_URL',
  'EXPO_PUBLIC_MOBILE_PILOT_KEY',
  'EXPO_PUBLIC_USE_MOCKS'
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
if ($env:EXPO_PUBLIC_MOBILE_API_URL -ne 'https://api.surklase.com') {
  throw 'Pilot APK must target https://api.surklase.com.'
}
if (
  $env:EXPO_PUBLIC_MOBILE_PILOT_KEY.Length -lt 32 -or
  $env:EXPO_PUBLIC_MOBILE_PILOT_KEY -match '[\r\n]'
) {
  throw 'Pilot APK access key is invalid.'
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
    Copy-Item -Force -LiteralPath $apkPath -Destination $artifactPath
    Write-Host "Pilot APK: $artifactPath"
  } finally {
    Pop-Location
  }
} finally {
  if (Test-Path -LiteralPath $resolvedStageRoot) {
    $cleanupError = $null
    for ($attempt = 1; $attempt -le 6; $attempt++) {
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
        if ($attempt -lt 6) {
          Start-Sleep -Seconds 2
        }
      }
    }
    if ($cleanupError) {
      throw $cleanupError
    }
  }
}
