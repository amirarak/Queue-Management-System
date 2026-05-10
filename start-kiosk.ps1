$ErrorActionPreference = 'Stop'

$skipBrowser = $false
$frontendUrl = 'http://127.0.0.1:3000/index.html#/kiosk'

foreach ($arg in $args) {
  switch ($arg) {
    '-SkipBrowser' { $skipBrowser = $true }
    default {
      if ($arg -like 'http://*' -or $arg -like 'https://*') {
        $frontendUrl = $arg
      }
    }
  }
}

$repoRoot = $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
$frontendDir = Join-Path $repoRoot 'frontend'
$backendCmd = "Set-Location '$backendDir'; npm run dev"
$frontendCmd = "Set-Location '$frontendDir'; npm run dev:kiosk"

function Test-PortListening([int]$Port) {
  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Test-HttpServing([string]$Url) {
  try {
    Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 3 | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Stop-PortProcess([int]$Port) {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $conns) {
    try {
      Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    } catch {
    }
  }
}

if (-not (Test-PortListening 3001) -or -not (Test-HttpServing 'http://127.0.0.1:3001/api/users/departments')) {
  Stop-PortProcess 3001
  Start-Process powershell.exe -ArgumentList @('-NoExit', '-Command', $backendCmd) | Out-Null
}

if (-not (Test-PortListening 3000) -or -not (Test-HttpServing 'http://127.0.0.1:3000/')) {
  Stop-PortProcess 3000
  Start-Process powershell.exe -ArgumentList @('-NoExit', '-Command', $frontendCmd) | Out-Null
}

if (-not $skipBrowser) {
  $browser = $null
  $browserCandidates = @(
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:LocalAppData\Microsoft\Edge\Application\msedge.exe"
  )

  foreach ($candidate in $browserCandidates) {
    if ($candidate -and (Test-Path $candidate)) {
      $browser = $candidate
      break
    }
  }

  if (-not $browser) {
    throw 'Chrome not found. Install Chrome or open the site manually with --kiosk-printing.'
  }

  $isChrome = $browser -like '*Google\Chrome\Application\chrome.exe'
  $browserArgs = @()
  $browserProfile = $null

  if ($isChrome) {
    $browserProfile = Join-Path $env:TEMP 'queue-kiosk-chrome-profile'

    Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
      Where-Object { $_.CommandLine -like "*$browserProfile*" } |
      ForEach-Object {
        try {
          Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        } catch {
        }
      }

    $browserArgs = @(
      '--kiosk',
      '--kiosk-printing',
      '--disable-print-preview',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-session-crashed-bubble',
      "--user-data-dir=$browserProfile",
      $frontendUrl
    )
  } else {
    $browserArgs = @(
      '--kiosk',
      $frontendUrl,
      '--edge-kiosk-type=fullscreen',
      '--kiosk-printing',
      '--no-first-run'
    )
  }

  Start-Process $browser -ArgumentList $browserArgs | Out-Null
}
