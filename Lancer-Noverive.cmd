@echo off
setlocal
cd /d "%~dp0"
set "NOVERIVE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NOVERIVE_NODE%" set "NOVERIVE_NODE=node"
start "" http://localhost:4173
"%NOVERIVE_NODE%" server.mjs
pause
