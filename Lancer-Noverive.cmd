@echo off
setlocal
cd /d "%~dp0"
set "NOVERIVE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NOVERIVE_NODE%" set "NOVERIVE_NODE=node"
powershell -NoProfile -Command "try { $r=Invoke-WebRequest 'http://localhost:4173/' -UseBasicParsing -TimeoutSec 2; if($r.Content -match 'Noverive'){exit 0} } catch {}; exit 1" >nul 2>nul
if not errorlevel 1 (
  start "" http://localhost:4173
  exit /b
)
start "" http://localhost:4173
"%NOVERIVE_NODE%" server.mjs
pause
