$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$parent = Split-Path -Parent $projectRoot
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$zipPath = Join-Path $parent "dienstplan-update-$stamp.zip"

$excludeNames = @("node_modules", ".vercel", ".env.local")
$temp = Join-Path $env:TEMP "dienstplan-pack-$stamp"
if (Test-Path -LiteralPath $temp) {
  Remove-Item -LiteralPath $temp -Recurse -Force
}
New-Item -ItemType Directory -Path $temp | Out-Null

Get-ChildItem -LiteralPath $projectRoot -Force | Where-Object {
  $excludeNames -notcontains $_.Name
} | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $temp -Recurse -Force
}

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}
Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $zipPath -Force
Remove-Item -LiteralPath $temp -Recurse -Force

Write-Host "ZIP erstellt:" -ForegroundColor Green
Write-Host $zipPath -ForegroundColor Cyan
