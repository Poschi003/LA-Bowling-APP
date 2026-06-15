@echo off
cd /d "%~dp0"
powershell -NoExit -ExecutionPolicy Bypass -File ".\scripts\start-local.ps1"
