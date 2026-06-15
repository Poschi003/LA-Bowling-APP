$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if (-not (Test-Path -LiteralPath ".env.local")) {
  Copy-Item -LiteralPath ".env.local.example" -Destination ".env.local"
  Write-Host ""
  Write-Host ".env.local wurde neu angelegt." -ForegroundColor Yellow
  Write-Host "Bitte dort zuerst SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY eintragen." -ForegroundColor Yellow
  Write-Host "Danach dieses Fenster schliessen und lokal-starten.cmd nochmal starten." -ForegroundColor Yellow
  Write-Host ""
  notepad ".env.local"
  return
}

Write-Host ""
Write-Host "Dienstplan lokal starten..." -ForegroundColor Green
Write-Host "App:      http://localhost:3000/" -ForegroundColor Cyan
Write-Host "Terminal: http://localhost:3000/?terminal=1" -ForegroundColor Cyan
Write-Host "Kunde:    http://localhost:3000/?kunde=1" -ForegroundColor Cyan
Write-Host ""

Start-Process "http://localhost:3000/"
$bundledNode = "C:\Users\Poschi stinkt\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if (Test-Path -LiteralPath $bundledNode) {
  & $bundledNode ".\scripts\local-dev-server.cjs"
} else {
  node ".\scripts\local-dev-server.cjs"
}
